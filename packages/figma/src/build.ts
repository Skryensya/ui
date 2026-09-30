/*
 * THE COMPILER: one Contract plus the stylesheets and tokens it reaches, to a Figma manifest.
 *
 * Reads Core, never Figma. Every axis, value and default comes from the contract; every paint and
 * dimension from the cascade over the contract's own stylesheets; every variable from the token
 * graph `parseTokens()` reads. The Figma realization adds only what those cannot say.
 */

import { createHash } from "node:crypto";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { canonical } from "@skryensya/ai-compiler/manifest";
import { sheetsForTree } from "@skryensya/ai-compiler/sheets-for-tree";
import { surfaceHash } from "@skryensya/ai-compiler/surface";
import type { ComponentContract, ContractOption } from "@skryensya/core/contract";
import { parseTokens } from "@skryensya/core/parse";
import { getContract } from "@skryensya/core/registry";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { computeTree, elementFrom, markerOf, readRules, type Computed, type RuleSet } from "./cascade.js";
import { Unsupported } from "./evaluate.js";
import {
  SCHEMA_VERSION,
  type Cell,
  type ComponentProperty,
  type IconSet,
  type ComponentSet,
  type Diagnostic,
  type FigmaManifest,
  type Layer,
  type Bound,
  type Rgba,
  type Stage,
  type Styles,
} from "./manifest-types.js";
import type { Realization } from "./realization.js";
import { frameOf, iconOf, overlayOf, ringOf, textOf } from "./realize.js";
import { Registry, resolve, type CellProps, type Context } from "./resolve.js";

const hash = (value: unknown) => createHash("sha256").update(canonical(value)).digest("hex").slice(0, 16);

/*
 * ONE PAGE for everything. A Starter (free) Figma file holds a single page, and the icon set, the
 * component sets fit on one as stacked frames.
 */
const PAGE = { id: "skryensya", name: "Skryensya" };

/*
 * ONE MODE per collection. A Starter file holds one, so the collections declare `light` only and the
 * plugin never asks for more. Every variable still carries its dark value, evaluated from the same
 * light-dark() the CSS ships: adding `dark` here is the whole change for a file that can hold it.
 */
const FILE_MODES = ["light"] as const;

/** The vocabulary's own name for a stand-in glyph: what an icon slot shows before anyone picks one. */
const DEFAULT_ICON = "placeholder";

/** What the evaluation assumed, beyond what the token graph itself declares. */
/** Media conditions the evaluation holds true: a desktop pointer, which is what hover needs. */
const MEDIA_HOLDS = ["(any-hover: hover)"];

const CONTEXT_OVERRIDES: Record<string, string> = {
  // The frosted material is on: backdrop-filter supported and no reduced-transparency preference.
  "--frost-on": "",
};

type Axis = { name: string; values: string[] };

/* ── options ─────────────────────────────────────────────────────────────────────────────────── */

/** How many distinct states an option can be in: an enum's values, a boolean's two or three. */
function stateCount(option: ContractOption): number {
  if (option.type === "enum") return option.values?.length ?? 1;
  if (option.type === "boolean") return option.default === undefined && "falseValue" in option ? 3 : 2;
  return 1;
}

function defaultsOf(contract: ComponentContract, names: readonly string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const name of names) {
    const option = contract.options[name];
    if (option.type === "enum" && option.default !== undefined) out[name] = String(option.default);
    if (option.type === "boolean" && option.default !== undefined) out[name] = Boolean(option.default);
  }
  return out;
}

/* ── the cell's markup, as the vanilla binding would author and mount it ───────────────────────── */

type CellInput = { options: Record<string, string | boolean>; icons: boolean; iconChildren: boolean };

function treeFor(realization: Realization, input: CellInput, iconName: string): UsageTree {
  const icon: UsageTree = { contract: "icon", signature: "Icon", options: { name: iconName } };
  const slots: Record<string, UsageTree | string> = {};
  for (const [slot, spec] of Object.entries(realization.slots)) {
    if (spec.holds === "icon") {
      if (input.icons) slots[slot] = icon;
    } else slots[slot] = input.iconChildren ? icon : spec.sample;
  }
  return { contract: realization.contract, signature: realization.signature, options: input.options, slots };
}

/**
 * The emitted markup with each icon placeholder mounted: the vanilla layer swaps the placeholder
 * for an element carrying the icon contract's root part, and that element is what the sheet sizes.
 */
function mounted(markup: string, iconContract: ComponentContract): string {
  const attr = (iconContract.options.name as { attr: string }).attr;
  const root = iconContract.parts.root;
  return markup.replace(new RegExp(`<span[^>]*\\b${attr}="[^"]*"[^>]*></span>`, "g"), `<svg class="${root}"></svg>`);
}

/* ── the compiler ───────────────────────────────────────────────────────────────────────────── */

export async function buildFigmaManifest(realization: Realization): Promise<FigmaManifest> {
  const contract = getContract(realization.contract);
  const iconContract = getContract("icon");
  if (!contract || !iconContract) throw new Error(`unknown contract ${realization.contract}`);
  const signature = contract.signatures[realization.signature];
  if (!signature) throw new Error(`unknown signature ${realization.signature}`);
  const iconName = (iconContract.options.name as { values: readonly string[] }).values[0];

  const corpus = parseTokens();
  const root = new Map<string, string>();
  const tierOf = new Map<string, "primitive" | "semantic">();
  for (const token of corpus.tokens) {
    if (token.tier === "component") continue;
    root.set(token.name, token.value);
    tierOf.set(token.name, token.tier);
  }
  for (const [name, value] of Object.entries(CONTEXT_OVERRIDES)) root.set(name, value);

  // The contract's own sheets, as the tree emitter says a Button needs them; the base bundle first.
  const sample = treeFor(realization, { options: {}, icons: true, iconChildren: false }, iconName);
  const own = contract.css;
  const sheetNames = [...sheetsForTree(sample).sheets].sort((a, b) => Number(a === own) - Number(b === own));
  const sheets = sheetNames.map((name) => {
    const rel = name.replace("@skryensya/core/", "");
    const file = corpus.files.find((f) => f.rel === rel);
    if (!file) throw new Error(`sheet ${name} not in the token corpus`);
    return { name: rel, css: file.css };
  });
  // A class the tree uses that none of those sheets defines comes from the base bundle
  // (`sk-interactive` is the state layer's): find the sheet that does, and read it first.
  for (const cls of sheetsForTree(sample).classes) {
    // The sheet that declares the class on its own (`.sk-interactive {`), not one that restyles it.
    const defines = new RegExp(`(^|[{};,]\\s*)\\.${cls}\\s*\\{`, "m");
    if (sheets.some((sheet) => defines.test(sheet.css))) continue;
    const file = corpus.files.find((f) => f.tier === "component" && defines.test(f.css));
    if (file) sheets.unshift({ name: file.rel, css: file.css });
  }
  const interactions = realization.state.interactions;
  const rules: RuleSet = readRules(sheets, MEDIA_HOLDS, interactions.map((i) => i.pseudo));
  const unmatchable = new Set<string>();

  const computeCell = (input: CellInput, simulated: readonly string[] = []) => {
    const markup = mounted(emitMarkup(treeFor(realization, input, iconName), { fillDefaults: true }), iconContract);
    const host = elementFrom(markup);
    for (const pseudo of simulated) host.setAttribute(markerOf(pseudo), "");
    const tree = computeTree(host, rules, unmatchable);
    return { host, styles: tree.styles, pseudo: tree.pseudo };
  };
  const fingerprint = (tree: Map<Element, Computed>) => canonical([...tree.values()].map((c) => Object.fromEntries(c)));

  /* Which options are VISUAL: changing one changes what the cascade declares. Derived, never listed. */
  const candidates = signature.options.filter((name) => !realization.exclude.includes(name));
  const defaults = defaultsOf(contract, candidates);
  const base = fingerprint(computeCell({ options: defaults, icons: true, iconChildren: false }).styles);
  const visual = candidates.filter((name) => {
    const option = contract.options[name];
    const alternatives: (string | boolean)[] =
      option.type === "enum" ? [...(option.values ?? [])] : option.type === "boolean" ? [true, false] : [];
    return alternatives.some(
      (value) => fingerprint(computeCell({ options: { ...defaults, [name]: value }, icons: true, iconChildren: false }).styles) !== base,
    );
  });
  const nonVisual = candidates.filter((name) => !visual.includes(name));

  /* The axes: enums as they are, the state booleans folded into one, the rest as true/false. */
  const split = contract.options[realization.splitBy];
  if (split?.type !== "enum") throw new Error(`splitBy ${realization.splitBy} is not an enum option`);
  const stateOptions = realization.state.options.filter((name) => visual.includes(name));
  const axes: Axis[] = [];
  for (const name of visual) {
    if (name === realization.splitBy || stateOptions.includes(name)) continue;
    const option = contract.options[name];
    if (option.type === "enum") axes.push({ name, values: [...(option.values ?? [])] });
    else if (option.type === "boolean") axes.push({ name, values: ["false", "true"] });
  }
  const stateAxis: Axis = {
    name: realization.state.axis,
    values: [realization.state.rest, ...interactions.map((i) => i.name), ...stateOptions],
  };
  // The state reads best between the enums and the remaining booleans.
  const firstBoolean = axes.findIndex((a) => contract.options[a.name].type === "boolean");
  axes.splice(firstBoolean < 0 ? axes.length : firstBoolean, 0, stateAxis);

  const iconWhen = Object.values(realization.slots).find((s) => s.holds === "text")?.iconWhen;
  const registry = new Registry(root, (name) => tierOf.get(name), realization.contract);
  const hookPrefix = `--sk-${realization.contract}-`;
  const diagnostics: Diagnostic[] = [];
  const stage = stageOf(realization, corpus.files, registry);

  /* Every cell of every set. */
  const combos = (list: Axis[]): CellProps[] =>
    list.reduce<CellProps[]>((acc, axis) => acc.flatMap((c) => axis.values.map((v) => ({ ...c, [axis.name]: v }))), [{}]);

  // The glyph a slot shows by default, checked against the vocabulary rather than trusted.
  const vocabulary = (iconContract.options.name as { values: readonly string[] }).values;
  const iconDefault = (slot: string) => {
    const name = realization.slots[slot]?.icon ?? DEFAULT_ICON;
    if (!vocabulary.includes(name)) throw new Error(`slot ${slot}: ${name} is not a stable icon name`);
    return name;
  };
  // Beside each row: its button at rest, with each optional icon slot switched on in turn.
  const showcase = {
    base: {
      [realization.state.axis]: realization.state.rest,
      ...(iconWhen ? { [iconWhen]: "false" } : {}),
    },
    columns: Object.entries(realization.slots)
      .filter(([slot, spec]) => spec.holds === "icon" && !signature.slots[slot]?.required)
      .map(([slot]) => ({ slot, properties: { [slot]: true } })),
  };

  // Where each slot lands, read off the part template: `pre`, the label, `post`.
  const slotOrder: string[] = [];
  const walkTemplate = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { slot?: string; children?: unknown[] };
    if (n.slot && realization.slots[n.slot] && !slotOrder.includes(n.slot)) slotOrder.push(n.slot);
    for (const child of n.children ?? []) walkTemplate(child);
  };
  walkTemplate(signature.template);
  const unplaced = Object.keys(realization.slots).filter((slot) => !slotOrder.includes(slot));
  if (unplaced.length) throw new Error(`slots the template never places: ${unplaced.join(", ")}`);

  const sets: ComponentSet[] = [];
  const styles: Styles = { boxes: {}, surfaces: {}, layers: {} };
  const intern = <T>(table: Record<string, T>, value: T) => {
    const id = hash(value);
    table[id] = value;
    return id;
  };
  for (const splitValue of split.values ?? []) {
    const cells: Cell[] = [];
    for (const props of combos(axes)) {
      const options: Record<string, string | boolean> = { ...defaults, [realization.splitBy]: splitValue };
      for (const axis of axes) {
        if (axis === stateAxis) continue;
        const option = contract.options[axis.name];
        options[axis.name] = option.type === "boolean" ? props[axis.name] === "true" : props[axis.name];
      }
      for (const name of stateOptions) {
        if (props[stateAxis.name] === name) options[name] = true;
        else if (contract.options[name].default === undefined) delete options[name];
        else options[name] = false;
      }
      const iconChildren = iconWhen !== undefined && options[iconWhen] === true;
      const interaction = interactions.find((i) => i.name === props[stateAxis.name]);
      const { host, styles: cascaded, pseudo } = computeCell({ options, icons: true, iconChildren }, interaction ? [interaction.pseudo] : []);
      const cellProps: CellProps = { [realization.splitBy]: splitValue, ...props };
      const ctxOf = (computed: Computed): Context => ({ computed, registry, cell: cellProps, hookPrefix });
      const ctx = (el: Element): Context => ctxOf(cascaded.get(el)!);

      try {
        const layers: Layer[] = [];
        // Pseudo-elements that paint go under the content, first.
        for (const [which, name] of Object.entries(realization.overlays) as ["before" | "after", string][]) {
          const box = pseudo.get(host)?.[which];
          const fills = box && overlayOf(ctxOf(box));
          if (fills?.length) layers.push({ kind: "overlay", slot: name, fills });
        }
        // Slots in the order the contract's template places them, never the realization's key order.
        for (const [slot, spec] of slotOrder.map((slot) => [slot, realization.slots[slot]] as const)) {
          const part = contract.parts[slot];
          const holder = part ? host.querySelector(`.${part}`) : host;
          const optional = !signature.slots[slot]?.required;
          if (spec.holds === "icon" || iconChildren) {
            const glyph = holder?.querySelector(`.${iconContract.parts.root}`);
            if (!glyph) throw new Unsupported(`no icon in slot ${slot}`);
            layers.push({
              kind: "icon",
              slot,
              ...(optional ? { visibleProperty: slot } : {}),
              default: iconDefault(slot),
              icon: iconOf(ctx(glyph)),
            });
          } else {
            layers.push({ kind: "text", slot, textProperty: slot, text: textOf(ctx(host)) });
          }
        }
        // An outline draws over everything, last.
        const ring = ringOf(ctx(host));
        if (ring) layers.push({ kind: "ring", slot: realization.ring, ...ring });
        const { strokes, fills, effects, ...box } = frameOf(ctx(host));
        const key = Object.entries(props).map(([k, v]) => `${k}=${v}`).join(", ");
        const body = { key, props, box: intern(styles.boxes, box), surface: intern(styles.surfaces, { strokes, fills, effects }), layers: intern(styles.layers, layers) };
        // The id is not hashed: it says WHICH cell this is, the hash says whether it is current.
        cells.push({ id: cellId(`${realization.contract}/${splitValue}`, props), ...body, hash: hash(body) });
      } catch (error) {
        if (!(error instanceof Unsupported)) throw error;
        diagnostics.push({ severity: "warning", code: "CELL_UNSUPPORTED", subject: `${splitValue}: ${JSON.stringify(props)}`, message: error.message });
      }
    }

    const properties: ComponentProperty[] = [];
    for (const [slot, spec] of Object.entries(realization.slots)) {
      if (spec.holds === "text") properties.push({ name: slot, type: "TEXT", default: spec.sample });
      if (!signature.slots[slot]?.required) properties.push({ name: slot, type: "BOOLEAN", default: false });
    }
    const setAxes = axes.map((a) => ({ name: a.name, values: a.values }));
    const defaultOf = (axis: Axis) =>
      axis === stateAxis ? realization.state.rest : String(defaults[axis.name] ?? axis.values[0]);
    // The contract's own order, largest first for the axes the realization reads that way.
    const drawn = (name: string) => {
      const axis = axes.find((a) => a.name === name);
      if (!axis) throw new Error(`grid axis ${name} is not an axis`);
      return { name, values: realization.grid.descending.includes(name) ? [...axis.values].reverse() : [...axis.values] };
    };
    const grid = { columns: realization.grid.columns.map(drawn), rows: realization.grid.rows.map(drawn) };
    const defaultCell = axes.map((a) => `${a.name}=${defaultOf(a)}`).join(", ");
    sets.push({
      kind: "component-set",
      id: `${realization.contract}/${splitValue}`,
      name: `${titleOf(contract.id)} / ${splitValue}`,
      page: PAGE.id,
      axes: setAxes,
      grid,
      defaultCell,
      interactions: interactions.flatMap((i) =>
        i.trigger ? [{ axis: stateAxis.name, from: realization.state.rest, to: i.name, trigger: i.trigger }] : [],
      ),
      showcase,
      properties,
      cells,
      contractHash: surfaceHash(contract),
      visualHash: hash({ axes: setAxes, grid, defaultCell, showcase, properties, cells: cells.map((c) => c.hash) }),
    });
  }



  const icon = await iconSetOf(realization, iconContract);
  registry.finalize([realization.splitBy, ...axes.map((a) => a.name)]);
  // A field bound to a component variable that failed to evaluate would point at nothing.
  const dead = [...registry.diagnostics].filter((d) => d.code === "DERIVED_UNSUPPORTED");
  if (dead.length) throw new Error(`component variables failed to evaluate:\n${dead.map((d) => d.message).join("\n")}`);


  const variables = [...registry.variables.values()].sort((a, b) =>
    a.collection === b.collection ? a.name.localeCompare(b.name) : a.collection.localeCompare(b.collection),
  );
  for (const selector of [...unmatchable].sort()) {
    diagnostics.push({ severity: "info", code: "SELECTOR_UNMATCHABLE", subject: selector, message: "jsdom cannot evaluate it; treated as not matching" });
  }
  for (const block of rules.skipped) {
    diagnostics.push({ severity: "info", code: "CONDITION_SKIPPED", subject: `${block.sheet} ${block.condition}`, message: `${block.rules} rule(s) under a condition the evaluation context does not hold` });
  }
  const allDiagnostics = [...registry.diagnostics, ...diagnostics].sort((a, b) =>
    a.code === b.code ? a.subject.localeCompare(b.subject) || a.message.localeCompare(b.message) : a.code.localeCompare(b.code),
  );

  const naiveAll = signature.options.reduce((n, name) => n * stateCount(contract.options[name]), 1);
  const naiveVisual = visual.reduce((n, name) => n * stateCount(contract.options[name]), 1);
  const bySource = { alias: 0, literal: 0, evaluated: 0 };
  for (const v of variables) for (const s of Object.values(v.source)) bySource[s]++;
  const report = {
    options: { visual, nonVisual, excluded: [...realization.exclude] },
    variants: {
      naiveAllOptions: naiveAll,
      naiveVisualOptions: naiveVisual,
      componentSets: sets.length,
      variantsPerSet: sets.map((s) => ({ set: s.id, variants: s.cells.length })),
      variantsTotal: sets.reduce((n, s) => n + s.cells.length, 0),
      components: sets.length + 1,
    },
    tokens: {
      reached: registry.reached.size,
      variables: variables.filter((v) => v.collection !== "component").length,
      componentVariables: variables.filter((v) => v.collection === "component").length,
      unsupported: allDiagnostics.filter((d) => d.code === "TOKEN_UNSUPPORTED").length,
      modeValuesBySource: bySource,
      reachedButNotVariables: [...registry.reached].filter((n) => !registry.variables.has(n)).sort(),
    },
  };

  const body = {
    schemaVersion: SCHEMA_VERSION,
    evaluationContext: {
      modes: "light-dark() first branch is `light`, second is `dark`",
      "--sk-density": root.get("--sk-density") ?? "",
      "--radius-multiplier": root.get("--radius-multiplier") ?? "",
      "--frost-on": "on (empty): backdrop-filter supported, no reduced-transparency preference",
      rootFontSize: "16px",
      state: "rest, plus the interaction states the realization draws (:hover, :focus-visible), simulated; :active never",
      direction: "ltr",
      conditions: "(any-hover: hover) holds; no other @media or @supports block does",
    },
    collections: [
      { id: "primitives" as const, name: "Skryensya / Primitives", modes: FILE_MODES },
      { id: "semantic" as const, name: "Skryensya / Semantic", modes: FILE_MODES },
      { id: "component" as const, name: `Skryensya / ${sets[0].name.split(" / ")[0]}`, modes: FILE_MODES },
    ],
    variables,
    pages: [PAGE],
    stage,
    components: [icon, ...sets],
    styles,
    diagnostics: allDiagnostics,
    report,
  };
  return { ...body, sourceHash: hash(body) } as FigmaManifest;
}

const titleOf = (id: string) => id.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

/* ── the stage: a contract's own background, resolved through its cascade ──────────────────────── */

function stageOf(realization: Realization, files: readonly { rel: string; css: string }[], registry: Registry): Stage {
  const contract = getContract(realization.stage.contract);
  if (!contract) throw new Error(`unknown contract ${realization.stage.contract}`);
  const rel = contract.css.replace("@skryensya/core/", "");
  const file = files.find((f) => f.rel === rel);
  if (!file) throw new Error(`sheet ${contract.css} not in the token corpus`);
  const root = elementFrom(`<div class="${contract.parts.root}"></div>`);
  const computed = computeTree(root, readRules([{ name: rel, css: file.css }]), new Set()).styles.get(root)!;
  const ctx: Context = { computed, registry, cell: {}, hookPrefix: `--sk-${contract.id}-` };
  const background = resolve(`var(${realization.stage.hook})`, "color", ctx, "stage");
  const token = (name: string, kind: "color" | "number" | "string") => {
    const id = registry.token(name, kind);
    if (!id) throw new Error(`stage token ${name} is not a ${kind}`);
    return { variable: id };
  };
  if (!background) throw new Error(`${realization.stage.hook} does not resolve to a colour`);
  const { label } = realization.stage;
  return {
    background: background as Bound<Rgba>,
    label: {
      color: token(label.color, "color"),
      fontFamily: token(label.fontFamily, "string"),
      fontSize: token(label.fontSize, "number"),
      fontWeight: token(label.fontWeight, "number"),
    },
    divider: token(realization.stage.divider, "color"),
  };
}

/**
 * A cell's deterministic id: its set, then every axis with its value in alphabetical order. The same
 * props always give the same id, whatever order the realization lists its axes in.
 */
export function cellId(setId: string, props: Record<string, string>): string {
  const pairs = Object.keys(props)
    .sort()
    .map((axis) => `${axis}=${props[axis]}`);
  return `${setId}/${pairs.join(",")}`;
}

/* ── the Icon contract, drawn by the chosen set ─────────────────────────────────────────────────── */

async function iconSetOf(realization: Realization, iconContract: ComponentContract): Promise<IconSet> {
  const option = iconContract.options.name as { values: readonly string[] };
  const module = (await import(realization.icons.module)) as Record<string, Record<string, { body: string; viewBox: string; attrs?: Record<string, string> }>>;
  const set = module[realization.icons.export];
  if (!set) throw new Error(`${realization.icons.module} has no export ${realization.icons.export}`);
  if (!option.values.includes(DEFAULT_ICON)) throw new Error(`the icon vocabulary has no ${DEFAULT_ICON}`);

  const first = set[option.values[0]];
  const attrs = first.attrs ?? {};
  const paint = attrs.stroke && attrs.stroke !== "none" ? "stroke" : "fill";
  const [, , width, height] = first.viewBox.split(/\s+/).map(Number);

  const icons = option.values.map((name) => {
    const data = set[name];
    if (!data) throw new Error(`${realization.icons.export} does not draw ${name}`);
    // The set's own presentation attributes, with `currentColor` made concrete: Figma has no inheritance.
    const presentation = Object.entries(data.attrs ?? {})
      .map(([k, v]) => `${k}="${v === "currentColor" ? "#000000" : v}"`)
      .join(" ");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${data.viewBox}" width="${width}" height="${height}" ${presentation}>${data.body.replaceAll("currentColor", "#000000")}</svg>`;
    return { id: `${iconContract.id}/${name}`, name, svg, hash: hash(svg) };
  });

  const body = {
    kind: "icon-set" as const,
    id: iconContract.id,
    name: titleOf(iconContract.id),
    page: PAGE.id,
    axis: "name",
    source: realization.icons.module,
    default: DEFAULT_ICON,
    paint: paint as IconSet["paint"],
    strokeWidth: Number(attrs["stroke-width"] ?? 0),
    size: width,
    icons,
  };
  return { ...body, hash: hash(body) };
}
