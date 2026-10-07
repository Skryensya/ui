/*
 * FROM A CASCADED VALUE TO A FIGMA BINDING.
 *
 * A layer's fill is `var(--sk-button-bg)`. On a soft danger button that hook is
 * `color-mix(in oklab, var(--sk-button-accent) 14%, var(--color-bg-surface))`, and `--sk-button-accent`
 * is `var(--color-action-danger)`. The resolver follows that chain as far as it stays a single var():
 *
 *   - it ends on a TOKEN (a :root declaration)  → bind the token's variable. The alias survives.
 *   - it ends on a hook whose value is a formula → a COMPONENT variable for that formula, named after
 *     the hook, with every other hook inlined and every token kept as var(), so the variable's own
 *     values are evaluated per mode and it still says which tokens it mixes.
 *   - it never touched a var                     → a literal, with the CSS it came from.
 *
 * Tokens become variables here, on first use by a component, and then the rest of the catalogue that
 * Figma can hold (`catalogue`): a file carries every token, not only the ones its components reach.
 */

import { createHash } from "node:crypto";
import {
  evalColor,
  evalQuantity,
  parseVar,
  pickMode,
  splitSpaces,
  substitute,
  Unsupported,
  type Lookup,
} from "./evaluate.js";
import type { Bound, CollectionId, Diagnostic, Mode, Rgba, ValueSource, Variable, VariableValue } from "./manifest-types.js";
import { MODES } from "./manifest-types.js";
import type { Computed } from "./cascade.js";

export type Kind = "color" | "number" | "string";

const TYPE_OF: Record<Kind, Variable["type"]> = { color: "COLOR", number: "FLOAT", string: "STRING" };

const SINGLE_VAR = /^var\(([\s\S]*)\)$/;

/** Only a var() spanning the whole value, not `var(--a) var(--b)`. */
function singleVar(text: string): { name: string; fallback: string | undefined } | null {
  const m = SINGLE_VAR.exec(text.trim());
  if (!m) return null;
  let depth = 0;
  for (const ch of m[1]) {
    if (ch === "(") depth++;
    else if (ch === ")" && --depth < 0) return null;
  }
  return parseVar(m[1]);
}

/** The first family of a font stack, unquoted: the one Figma can load. */
function firstFamily(stack: string): string {
  const first = stack.split(",")[0].trim();
  return first.replace(/^["']|["']$/g, "");
}

/** Evaluate an expression with no var() left in it, for one mode, to the kind a field needs. */
export function evaluateAs(kind: Kind, text: string, mode: Mode): number | string | Rgba {
  const picked = pickMode(text, mode).trim();
  if (kind === "color") return evalColor(picked);
  if (kind === "string") return firstFamily(picked);
  const q = evalQuantity(picked);
  if (q.unit === "%") throw new Unsupported(`a percentage has no Figma number: ${text}`);
  return Math.round(q.value * 1000) / 1000;
}

const isLiteralText = (kind: Kind, text: string) =>
  kind === "color"
    ? /^(oklch\([^()]*\)|transparent|white|black)$/i.test(text.trim())
    : kind === "number"
      ? /^-?\d*\.?\d+(px)?$/.test(text.trim())
      : /^["'][^"']*["'](\s*,.*)?$/.test(text.trim());

/** A cell's identity, for naming the component variables it produces. */
export type CellProps = Record<string, string>;

type Derived = { component: string; base: string; expression: string; kind: Kind; hook: string | undefined; cells: CellProps[] };

export class Registry {
  readonly variables = new Map<string, Variable>();
  readonly reached = new Set<string>();
  readonly diagnostics: Diagnostic[] = [];
  private readonly derived = new Map<string, Derived>();

  constructor(
    /** What :root declares: the token graph. */
    readonly root: ReadonlyMap<string, string>,
    readonly tierOf: (name: string) => "primitive" | "semantic" | undefined,
  ) {}

  /** :root lookup that remembers every token the component reached, bound or inlined. */
  readonly rootLookup: Lookup = (name) => {
    const value = this.root.get(name);
    if (value !== undefined) this.reached.add(name);
    return value;
  };

  diagnose(d: Diagnostic) {
    if (!this.diagnostics.some((x) => x.code === d.code && x.subject === d.subject && x.message === d.message)) this.diagnostics.push(d);
  }

  /** The variable for a token, created (with its aliases) on first use. `undefined` when Figma cannot hold it. */
  token(name: string, kind: Kind): string | undefined {
    const existing = this.variables.get(name);
    if (existing) return existing.type === TYPE_OF[kind] ? name : undefined;
    const raw = this.rootLookup(name);
    const tier = this.tierOf(name);
    if (raw === undefined || tier === undefined) return undefined;

    const values = {} as Record<Mode, VariableValue>;
    const source = {} as Record<Mode, ValueSource>;
    try {
      for (const mode of MODES) {
        const branch = pickMode(raw, mode).trim();
        const alias = singleVar(branch);
        if (alias && this.root.has(alias.name) && this.token(alias.name, kind)) {
          values[mode] = { kind: "alias", variable: alias.name };
          source[mode] = "alias";
          continue;
        }
        const text = substitute(branch, this.rootLookup);
        values[mode] = { kind: "literal", value: evaluateAs(kind, text, mode) };
        source[mode] = isLiteralText(kind, branch) ? "literal" : "evaluated";
      }
    } catch (error) {
      if (!(error instanceof Unsupported)) throw error;
      this.diagnose({ severity: "warning", code: "TOKEN_UNSUPPORTED", subject: name, message: `${raw} → ${error.message}` });
      return undefined;
    }

    const collection: CollectionId = tier === "primitive" ? "primitives" : "semantic";
    const [group, ...rest] = name.slice(2).split("-");
    this.variables.set(name, {
      id: name,
      name: rest.length ? `${group}/${rest.join("-")}` : group,
      collection,
      type: TYPE_OF[kind],
      values,
      source,
      expression: raw,
      codeSyntax: `var(${name})`,
    });
    return name;
  }

  /**
   * The kind a token is as a Figma variable, or `undefined` when it is none of them (a shadow list, an
   * easing curve, a percentage): its light value, fully substituted, read as a colour, then a number.
   * A font stack is a string. Reads :root without counting the token as reached by a component.
   */
  kindOf(name: string): Kind | undefined {
    const raw = this.root.get(name);
    if (raw === undefined) return undefined;
    if (/font-family/.test(name)) return "string";
    try {
      const text = substitute(pickMode(raw, "light").trim(), (n) => this.root.get(n));
      for (const kind of ["color", "number"] as const) {
        try {
          evaluateAs(kind, text, "light");
          return kind;
        } catch {
          // Not this kind: try the next.
        }
      }
    } catch {
      // A value that does not even substitute (a reference to a component hook) is no variable.
    }
    return undefined;
  }

  /** A component variable for a formula a hook holds; named once every cell has been seen. */
  derive(component: string, base: string, expression: string, kind: Kind, cell: CellProps, hook: string | undefined): string {
    // Short and stable: the formula decides the identity, and the variable carries it in full.
    const id = `${component}:${base}:${createHash("sha256").update(expression).digest("hex").slice(0, 10)}`;
    const entry = this.derived.get(id) ?? { component, base, expression, kind, hook, cells: [] };
    entry.cells.push(cell);
    this.derived.set(id, entry);
    return id;
  }

  /**
   * Evaluate and name every component variable. The name is the component, the hook, and the cell
   * values every cell holding that value agrees on: `button/bg/soft/danger/rest`, not an index
   * nobody can read. Each component names its cells along its own axes.
   */
  finalize(axisOrders: Readonly<Record<string, readonly string[]>>) {
    const taken = new Set<string>();
    for (const [id, entry] of [...this.derived].sort(([a], [b]) => a.localeCompare(b))) {
      const values = {} as Record<Mode, VariableValue>;
      const source = {} as Record<Mode, ValueSource>;
      try {
        for (const mode of MODES) {
          const text = substitute(entry.expression, this.rootLookup);
          values[mode] = { kind: "literal", value: evaluateAs(entry.kind, text, mode) };
          source[mode] = isLiteralText(entry.kind, entry.expression) ? "literal" : "evaluated";
        }
      } catch (error) {
        if (!(error instanceof Unsupported)) throw error;
        this.diagnose({ severity: "warning", code: "DERIVED_UNSUPPORTED", subject: entry.base, message: `${entry.expression} → ${error.message}` });
        continue;
      }
      const shared = (axisOrders[entry.component] ?? []).filter((axis) => {
        const first = entry.cells[0][axis];
        return first !== undefined && entry.cells.every((c) => c[axis] === first);
      });
      // A boolean axis reads as its name (`iconOnly`), not as a bare `true`.
      const word = (axis: string, value: string) => (value === "true" ? axis : value === "false" ? `no-${axis}` : value);
      const tail = shared.map((axis) => word(axis, entry.cells[0][axis])).join("/");
      const stem = `${entry.component}/${entry.base}`;
      let name = tail ? `${stem}/${tail}` : stem;
      for (let n = 2; taken.has(name); n++) name = `${tail ? `${stem}/${tail}` : stem}-${n}`;
      taken.add(name);
      this.variables.set(id, {
        id,
        name,
        collection: "component",
        type: TYPE_OF[entry.kind],
        values,
        source,
        expression: entry.expression,
        codeSyntax: entry.hook ? `var(${entry.hook})` : "",
      });
    }
    return this;
  }

  /** Derived ids that failed to evaluate; a field bound to one must fall back. */
  isDead(id: string) {
    return this.derived.has(id) && !this.variables.has(id);
  }
}

/** One element's view of the cascade: its own declarations, and the :root behind them. */
export type Context = {
  computed: Computed;
  registry: Registry;
  cell: CellProps;
  /** Strips the component's hook prefix for naming: `--sk-button-bg` → `bg`. */
  hookPrefix: string;
  /** The contract whose component variables this element's formulas become. */
  component: string;
  /**
   * What an inherited property is when the component's own sheets never set it: the page's, which
   * the realization's stage names (a Badge takes its font from the page it sits on).
   */
  inherited?: Readonly<Record<string, string>>;
};

const lookupIn = (ctx: Context): Lookup => (name) => ctx.computed.get(name) ?? ctx.registry.rootLookup(name);

/** A property's value with every var() substituted, in `light` mode: for a field Figma holds as a plain value. */
export const substituted = (text: string, ctx: Context): string => pickMode(substitute(text, lookupIn(ctx)), "light").trim();

/** Replace `currentColor` with the element's own `color`, as the browser's used value does. */
function withCurrentColor(text: string, ctx: Context): string {
  if (!/currentcolor/i.test(text)) return text;
  // Not set by the component's sheets, it is the page's (the stage's inherited colour).
  // `color: currentColor` is the inherited colour, and replacing it with itself would never end.
  const own = ctx.computed.get("color");
  const loops = (value: string) => {
    if (/currentcolor/i.test(value)) return true;
    try {
      return /currentcolor/i.test(substitute(value, lookupIn(ctx)));
    } catch {
      return false;
    }
  };
  const color = own !== undefined && !loops(own) ? own : ctx.inherited?.color;
  if (color === undefined) throw new Unsupported(`currentColor with no color on the element`);
  return text.replace(/currentcolor/gi, color);
}

const hookBase = (name: string, ctx: Context) =>
  name.startsWith(ctx.hookPrefix) ? name.slice(ctx.hookPrefix.length) : name.replace(/^--/, "");

/** Is this custom property, fully substituted, a single colour or number (so worth binding)? */
export function isScalar(name: string, ctx: Context): boolean {
  try {
    const text = pickMode(substitute(withCurrentColor(`var(${name})`, ctx), lookupIn(ctx)), "light").trim();
    if (!text || splitSpaces(text).length !== 1) return false;
    try {
      evalColor(text);
      return true;
    } catch {
      evalQuantity(text);
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Inline every var() whose value is a list rather than a scalar (a shadow list, a gradient, `none`),
 * keeping the scalar ones as var() so their pieces can still bind. For composite properties:
 * `background`, `box-shadow`, `backdrop-filter`.
 */
export function expandComposite(text: string, ctx: Context, depth = 0): string {
  if (depth > 16) throw new Unsupported(`composite too deep: ${text}`);
  const withColor = withCurrentColor(text, ctx);
  const once = substitute(withColor, lookupIn(ctx), (name) => isScalar(name, ctx));
  return once === withColor ? once : expandComposite(once, ctx, depth + 1);
}

/**
 * The binding for one field. `role` names the component variable when no hook does (a shadow's
 * colour inside a composite): `shadow-color`, `fill`.
 */
export function resolve(text: string, kind: Kind, ctx: Context, role: string): Bound<number | string | Rgba> | undefined {
  let current = text.trim();
  let hook: string | undefined;

  for (let guard = 0; guard < 32; guard++) {
    if (/^currentcolor$/i.test(current)) {
      const color = ctx.computed.get("color");
      if (color === undefined) return undefined;
      current = color.trim();
      continue;
    }
    const ref = singleVar(current);
    if (!ref) break;
    const local = ctx.computed.get(ref.name);
    if (local !== undefined && local.trim() !== "initial") {
      hook = ref.name;
      current = local.trim();
      continue;
    }
    if (local === undefined && ctx.registry.root.has(ref.name)) {
      const id = ctx.registry.token(ref.name, kind);
      if (id) return { variable: id };
      // A token Figma cannot hold as this kind: evaluate it in place instead.
      current = ctx.registry.rootLookup(ref.name)!.trim();
      continue;
    }
    if (ref.fallback === undefined) return undefined;
    current = ref.fallback.trim();
  }

  // No number to bind: auto, none, and the content-sized widths (Figma's hug, which a frame already is).
  // `100%` too: a Callout fills whatever holds it, and a component drawn alone has nothing to fill,
  // so it hugs until an instance is stretched.
  if (/^(auto|none|normal|fit-content|max-content|min-content|100%)$/.test(current)) return undefined;
  // The same for a bound that mixes a length with a percentage (`min(8rem, 40%)`): the percentage is of
  // the containing block, which a component drawn alone does not have, so there is no one number to draw.
  if (/%/.test(current) && /\b(min|max|clamp)\(/.test(current)) return undefined;

  try {
    const touchesVars = /var\(|light-dark\(|currentcolor/i.test(current);
    if (touchesVars || hook) {
      // Inline the component's own hooks; keep tokens as var() so the formula still names them. A
      // token that IS `currentColor` (the state layer's colour) means this element's colour, so it
      // is inlined too, and resolved against the element rather than :root.
      const keepToken = (name: string) =>
        !ctx.computed.has(name) && ctx.registry.root.has(name) && !/currentcolor/i.test(ctx.registry.root.get(name) ?? "");
      const lookup = (name: string) => ctx.computed.get(name) ?? ctx.registry.rootLookup(name);
      // Substituting can surface a new `currentColor` (from that token), so repeat until none is left.
      let expression = current;
      for (let pass = 0; pass < 4; pass++) {
        expression = substitute(withCurrentColor(expression, ctx), lookup, keepToken).trim();
        if (!/currentcolor/i.test(expression)) break;
      }
      const base = hook ? hookBase(hook, ctx) : role;
      // Validate now, so a field never points at a variable that will not exist.
      for (const mode of MODES) evaluateAs(kind, substitute(expression, ctx.registry.rootLookup), mode);
      return { variable: ctx.registry.derive(ctx.component, base, expression, kind, ctx.cell, hook) };
    }
    return { value: evaluateAs(kind, current, "light"), expression: current };
  } catch (error) {
    if (!(error instanceof Unsupported)) throw error;
    ctx.registry.diagnose({ severity: "warning", code: "FIELD_UNSUPPORTED", subject: role, message: `${current} → ${error.message}` });
    return undefined;
  }
}
