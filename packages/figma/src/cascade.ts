/*
 * THE CASCADE, simulated for one static element: which declarations of a component's stylesheets
 * win on it, with their var() chains intact.
 *
 * A styling hook has one name and a different value per selector (`--sk-button-bg` is re-declared
 * by every emphasis, tone, appearance and state), so "the bg of a soft danger button" is a cascade
 * question, not a token lookup. The browser answers it with literals and loses the aliases; this
 * answers it with the AUTHORED values, so a Figma layer can still bind to the token the hook points at.
 *
 * Scope, stated rather than approximated:
 *   - jsdom never matches :hover, :active or :focus-visible. The interaction states a realization
 *     asks for are simulated: their pseudo-class is rewritten to a marker attribute (same
 *     specificity) and the host is marked. Any other interaction pseudo-class never matches, and
 *     `:not(:active)` correctly does.
 *   - Only the media conditions the caller says hold are read (a hover-capable pointer). Every other
 *     @media / @supports block is skipped and COUNTED, so the report can say what was left out.
 *   - Pseudo-elements are cascaded separately, onto the element that generates them.
 *   - Left-to-right. Nothing here is direction-aware beyond `:dir()`, which jsdom evaluates.
 */

import Specificity from "@bramus/specificity";
import { JSDOM } from "jsdom";
import postcss, { type ChildNode, type Container } from "postcss";

export type Sheet = { name: string; css: string };

export type StyleRule = {
  sheet: string;
  /** The selector to match, with any pseudo-element taken off (it lives in `pseudo`). */
  selector: string;
  pseudo: "before" | "after" | "placeholder" | undefined;
  specificity: readonly [number, number, number];
  order: number;
  decls: readonly (readonly [string, string])[];
};

export type SkippedBlock = { sheet: string; condition: string; rules: number };

export type RuleSet = { rules: StyleRule[]; skipped: SkippedBlock[] };

/** Declared values per element: custom properties and the longhands this module expands. */
export type Computed = Map<string, string>;

/** Properties that inherit into descendants (the ones a Figma layer reads off a child). */
const INHERITED = new Set(["color", "font-family", "font-size", "font-weight", "line-height", "text-align", "white-space"]);

/** The attribute that stands in for an interaction pseudo-class: `:hover` → `data-figma-hover`. */
export const markerOf = (pseudo: string) => `data-figma-${pseudo.replace(/^:/, "")}`;

/**
 * Every style rule of the sheets, in source order. `@layer` blocks are read through; a media block
 * whose condition is in `holds` is too; every other at-rule is skipped and counted. Each pseudo-class
 * in `simulate` is rewritten to its marker attribute.
 */
export function readRules(sheets: readonly Sheet[], holds: readonly string[] = [], simulate: readonly string[] = []): RuleSet {
  const rules: StyleRule[] = [];
  const skipped = new Map<string, SkippedBlock>();
  let order = 0;

  const visit = (sheet: string, container: Container<ChildNode>) => {
    for (const node of container.nodes ?? []) {
      if (node.type === "atrule") {
        if (node.name === "layer" || (node.name === "media" && holds.includes(node.params.trim()))) {
          visit(sheet, node as Container<ChildNode>);
          continue;
        }
        const condition = `@${node.name} ${node.params}`;
        const key = `${sheet}\u0000${condition}`;
        let count = 0;
        node.walkRules(() => void count++);
        const prior = skipped.get(key);
        skipped.set(key, { sheet, condition, rules: (prior?.rules ?? 0) + count });
        continue;
      }
      if (node.type !== "rule") continue;
      const decls = expand(
        node.nodes.filter((d) => d.type === "decl").map((d) => [d.prop, d.value.replace(/\s+/g, " ").trim()] as const),
      );
      for (const authored of node.selectors) {
        let selector = authored;
        for (const pseudo of simulate) selector = selector.replace(new RegExp(`${pseudo}(?![\\w-])`, "g"), `[${markerOf(pseudo)}]`);
        const element = /::(before|after|placeholder)$/.exec(selector);
        if (element) selector = selector.slice(0, element.index);
        const [spec] = Specificity.calculate(authored);
        const { a, b, c } = spec.value;
        rules.push({ sheet, selector, pseudo: element?.[1] as StyleRule["pseudo"], specificity: [a, b, c], order: order++, decls });
      }
    }
  };

  for (const sheet of sheets) visit(sheet.name, postcss.parse(sheet.css));
  const skippedList = [...skipped.values()].sort((x, y) =>
    x.sheet === y.sheet ? x.condition.localeCompare(y.condition) : x.sheet.localeCompare(y.sheet),
  );
  return { rules, skipped: skippedList };
}

/* ── shorthands ────────────────────────────────────────────────────────────────────────────────── */

const BORDER_STYLES = new Set(["none", "hidden", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"]);

function topLevelSpaces(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === " " && depth === 0) {
      if (cur) out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * The shorthands a component sheet uses on its host, to the longhands a Figma layer reads. Logical
 * properties resolve left-to-right. Anything not listed passes through under its own name.
 */
const SIDES: Record<string, string> = {
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  "block-start": "top",
  "block-end": "bottom",
  "inline-start": "left",
  "inline-end": "right",
};

/** Logical corners as physical ones, in horizontal-tb, left to right. */
const CORNERS: Record<string, string> = {
  "border-start-start-radius": "border-top-left-radius",
  "border-start-end-radius": "border-top-right-radius",
  "border-end-start-radius": "border-bottom-left-radius",
  "border-end-end-radius": "border-bottom-right-radius",
};

function expand(decls: readonly (readonly [string, string])[]): (readonly [string, string])[] {
  const out: (readonly [string, string])[] = [];
  for (const [prop, value] of decls) {
    const parts = topLevelSpaces(value);
    switch (prop) {
      case "flex": {
        // `flex: 1`, `flex: 1 1 0`, `flex: none`: only the grow factor is read.
        const grow = value.trim() === "none" ? "0" : value.trim() === "auto" ? "1" : parts[0];
        out.push(["flex-grow", grow]);
        break;
      }
      case "place-items":
        out.push(["align-items", parts[0]], ["justify-items", parts[1] ?? parts[0]]);
        break;
      case "padding": {
        // One to four values, as CSS reads them: top, right, bottom, left, each side falling back.
        const [top, right = top, bottom = top, left = right] = parts;
        out.push(["padding-top", top], ["padding-right", right], ["padding-bottom", bottom], ["padding-left", left]);
        break;
      }
      case "padding-inline":
        out.push(["padding-left", parts[0]], ["padding-right", parts[1] ?? parts[0]]);
        break;
      case "padding-inline-start":
      case "padding-inline-end":
      case "padding-block-start":
      case "padding-block-end":
        // One logical side, as its physical longhand in horizontal-tb.
        out.push([`padding-${SIDES[prop.replace("padding-", "")]}`, value]);
        break;
      case "padding-block":
        out.push(["padding-top", parts[0]], ["padding-bottom", parts[1] ?? parts[0]]);
        break;
      case "inline-size":
        out.push(["width", value]);
        break;
      case "block-size":
        out.push(["height", value]);
        break;
      case "min-block-size":
        out.push(["min-height", value]);
        break;
      case "min-inline-size":
        out.push(["min-width", value]);
        break;
      case "max-inline-size":
        out.push(["max-width", value]);
        break;
      case "outline": {
        const style = parts.find((p) => BORDER_STYLES.has(p));
        const rest = parts.filter((p) => p !== style);
        out.push(["outline-style", style ?? "none"]);
        if (rest.length === 2) out.push(["outline-width", rest[0]], ["outline-color", rest[1]]);
        break;
      }
      case "border": {
        // `border: 0` or `border: none` clears it: no style, no width (the dot drops the label's hairline).
        if (parts.length === 1 && (parts[0] === "0" || parts[0] === "none")) {
          out.push(["border-style", "none"], ["border-width", "0"]);
          break;
        }
        const style = parts.find((p) => BORDER_STYLES.has(p));
        const rest = parts.filter((p) => p !== style);
        if (style) out.push(["border-style", style]);
        if (rest.length === 2) out.push(["border-width", rest[0]], ["border-color", rest[1]]);
        else out.push(["border", value]);
        break;
      }
      case "border-top":
      case "border-right":
      case "border-bottom":
      case "border-left":
      case "border-block-start":
      case "border-block-end":
      case "border-inline-start":
      case "border-inline-end": {
        // One side's border (a Separator's rule), as that side's longhands, in horizontal-tb.
        const side = SIDES[prop.replace("border-", "")];
        const style = parts.find((p) => BORDER_STYLES.has(p));
        const rest = parts.filter((p) => p !== style);
        if (style) out.push([`border-${side}-style`, style]);
        if (rest.length === 2) out.push([`border-${side}-width`, rest[0]], [`border-${side}-color`, rest[1]]);
        else if (!style) out.push([prop, value]);
        break;
      }
      case "border-radius": {
        // Each corner too, so a later corner of its own (a tab's rounded top) overrides just that one.
        out.push([prop, value]);
        if (value.includes("/")) break;
        const [tl, tr = tl, br = tl, bl = tr] = parts;
        out.push(["border-top-left-radius", tl], ["border-top-right-radius", tr], ["border-bottom-right-radius", br], ["border-bottom-left-radius", bl]);
        break;
      }
      case "border-start-start-radius":
      case "border-start-end-radius":
      case "border-end-start-radius":
      case "border-end-end-radius":
        out.push([CORNERS[prop], value]);
        break;
      case "inset":
      case "inset-inline":
      case "inset-block":
      case "inset-inline-start":
      case "inset-inline-end":
      case "inset-block-start":
      case "inset-block-end": {
        // As the physical sides too, so a bar pinned to one edge (a tab's indicator) can be read.
        if (prop === "inset") out.push([prop, value]);
        const [a, b = a, c = a, d = b] = parts;
        const sides: Record<string, [string, string][]> = {
          inset: [["top", a], ["right", b], ["bottom", c], ["left", d]],
          "inset-inline": [["left", a], ["right", b]],
          "inset-block": [["top", a], ["bottom", b]],
          "inset-inline-start": [["left", a]],
          "inset-inline-end": [["right", a]],
          "inset-block-start": [["top", a]],
          "inset-block-end": [["bottom", a]],
        };
        for (const [side, v] of sides[prop]) out.push([side, v]);
        break;
      }
      case "font": {
        // `weight size / line-height family…`, the one order a component sheet writes it in.
        const slash = value.split(" / ");
        const left = topLevelSpaces(slash[0]);
        const right = slash[1] === undefined ? [] : topLevelSpaces(slash[1]);
        if (left.length === 2 && right.length >= 2) {
          out.push(
            ["font-weight", left[0]],
            ["font-size", left[1]],
            ["line-height", right[0]],
            ["font-family", right.slice(1).join(" ")],
          );
        } else out.push(["font", value]);
        break;
      }
      default:
        out.push([prop, value]);
    }
  }
  return out;
}

/* ── matching ──────────────────────────────────────────────────────────────────────────────────── */

const bySpecificityThenOrder = (x: StyleRule, y: StyleRule) => {
  for (let i = 0; i < 3; i++) if (x.specificity[i] !== y.specificity[i]) return x.specificity[i] - y.specificity[i];
  return x.order - y.order;
};

function inherit(parent: Computed | undefined): Computed {
  const computed: Computed = new Map();
  if (parent) {
    for (const [prop, value] of parent) {
      if (prop.startsWith("--") || INHERITED.has(prop)) computed.set(prop, value);
    }
  }
  return computed;
}

/** The pseudo-elements an element generates, each cascaded onto what it inherits from the element. */
export type Pseudo = Partial<Record<"before" | "after" | "placeholder", Computed>>;

export type Tree = { styles: Map<Element, Computed>; pseudo: Map<Element, Pseudo> };

/**
 * The declared values on `element` and every descendant, custom properties inherited the way CSS
 * inherits them, and the same for each pseudo-element they generate.
 */
/**
 * WHAT THE BROWSER'S STYLESHEET GIVES an element before any of ours applies, for the few a component
 * leans on: Strong is a `<strong>`, bold because the user agent says so, with no rule of its own.
 */
const USER_AGENT: Record<string, readonly (readonly [string, string])[]> = {
  strong: [["font-weight", "700"]],
  b: [["font-weight", "700"]],
  // A single-line field centres its text in its height.
  input: [["align-items", "center"]],
  // Headings are bold where no sheet says otherwise: an EmptyState's h2 title.
  ...Object.fromEntries(["h1", "h2", "h3", "h4", "h5", "h6"].map((h) => [h, [["font-weight", "700"]] as const])),
};

/** `style="a: b; c: d"` as expanded declarations. */
function inlineStyle(el: Element): (readonly [string, string])[] {
  const text = el.getAttribute("style");
  if (!text) return [];
  const decls = text
    .split(";")
    .map((decl) => [decl.slice(0, decl.indexOf(":")).trim(), decl.slice(decl.indexOf(":") + 1).replace(/\s+/g, " ").trim()] as const)
    .filter(([prop, value]) => prop && value && text.includes(":"));
  return expand(decls);
}

export function computeTree(element: Element, rules: RuleSet, unmatchable: Set<string>): Tree {
  const styles = new Map<Element, Computed>();
  const pseudo = new Map<Element, Pseudo>();

  const visit = (el: Element, parent: Computed | undefined) => {
    const matched = rules.rules.filter((rule) => {
      try {
        return el.matches(rule.selector);
      } catch {
        unmatchable.add(rule.selector);
        return false;
      }
    }).sort(bySpecificityThenOrder);
    const computed = inherit(parent);
    // The browser's own sheet, first, for the few elements whose look comes from it alone.
    for (const [prop, value] of USER_AGENT[el.localName] ?? []) computed.set(prop, value);
    for (const rule of matched) if (!rule.pseudo) for (const [prop, value] of rule.decls) computed.set(prop, value);
    // The element's own style attribute last, over every rule: a Progress's `--sk-progress-fill`.
    for (const [prop, value] of inlineStyle(el)) computed.set(prop, value);
    // `inherit` is the parent's computed value, whatever the property (an accordion trigger's colour).
    for (const [prop, value] of computed) {
      if (value !== "inherit") continue;
      const from = parent?.get(prop);
      if (from === undefined) computed.delete(prop);
      else computed.set(prop, from);
    }
    styles.set(el, computed);

    const generated: Pseudo = {};
    for (const rule of matched) {
      if (!rule.pseudo) continue;
      const box = (generated[rule.pseudo] ??= inherit(computed));
      for (const [prop, value] of rule.decls) box.set(prop, value);
    }
    // A generated box inherits from its element, `inherit` included (a radio's circle takes its corners).
    for (const box of Object.values(generated)) {
      for (const [prop, value] of box) {
        if (value !== "inherit") continue;
        if (computed.has(prop)) box.set(prop, computed.get(prop)!);
        else box.delete(prop);
      }
    }
    pseudo.set(el, generated);
    for (const child of Array.from(el.children)) visit(child, computed);
  };

  visit(element, undefined);
  return { styles, pseudo };
}

/* One document for every cell: a fresh jsdom per element costs more than the whole cascade does. */
let document: Document | undefined;

/** One authored fragment as a live element jsdom can match selectors against. */
export function elementFrom(markup: string): Element {
  document ??= new JSDOM("<!doctype html><html><body></body></html>").window.document;
  const holder = document.createElement("div");
  holder.innerHTML = markup.trim();
  const root = holder.firstElementChild;
  if (!root) throw new Error(`no element in ${markup}`);
  return root;
}
