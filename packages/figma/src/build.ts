/*
 * THE COMPILER: one Contract plus the stylesheets and tokens it reaches, to a Figma manifest.
 *
 * Reads Core, never Figma. Every axis, value and default comes from the contract; every paint and
 * dimension from the cascade over the contract's own stylesheets; every variable from the token
 * graph `parseTokens()` reads. The Figma realization adds only what those cannot say.
 */

import { createHash } from "node:crypto";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { canonical } from "@skryensya/ai-compiler/manifest";
import { sheetsForTree } from "@skryensya/ai-compiler/sheets-for-tree";
import { surfaceHash } from "@skryensya/ai-compiler/surface";
import { walkUsageTree } from "@skryensya/ai-compiler/usage-walk";
import type { ComponentContract, ContractOption } from "@skryensya/core/contract";
import { parseTokens } from "@skryensya/core/parse";
import { getContract } from "@skryensya/core/registry";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { computeTree, elementFrom, readRules, type Computed, type RuleSet } from "./cascade.js";
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
  type SpecimenEntry,
  type Stage,
  type Styles,
} from "./manifest-types.js";
import type { Realization } from "./realization.js";
import { frameOf, iconOf, textOf } from "./realize.js";
import { Registry, resolve, type CellProps, type Context } from "./resolve.js";

const hash = (value: unknown) => createHash("sha256").update(canonical(value)).digest("hex").slice(0, 16);

/*
 * ONE PAGE for everything. A Starter (free) Figma file holds a single page, and the icon set, the
 * component sets and the specimen fit on one as stacked frames.
 */
const PAGE = { id: "skryensya", name: "Skryensya" };

/** The vocabulary's own name for a stand-in glyph: what an icon slot shows before anyone picks one. */
const DEFAULT_ICON = "placeholder";

/** What the evaluation assumed, beyond what the token graph itself declares. */
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

export async function buildFigmaManifest(repoRoot: string, realization: Realization): Promise<FigmaManifest> {
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
  const rules: RuleSet = readRules(sheets);
  const unmatchable = new Set<string>();

  const computeCell = (input: CellInput) => {
    const markup = mounted(emitMarkup(treeFor(realization, input, iconName), { fillDefaults: true }), iconContract);
    const host = elementFrom(markup);
    return { host, styles: computeTree(host, rules, unmatchable) };
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
  const stateAxis: Axis = { name: realization.state.axis, values: [realization.state.rest, ...stateOptions] };
  // The state reads best between the enums and the remaining booleans.
  const firstBoolean = axes.findIndex((a) => contract.options[a.name].type === "boolean");
  axes.splice(firstBoolean < 0 ? axes.length : firstBoolean, 0, stateAxis);

  const iconWhen = Object.values(realization.slots).find((s) => s.holds === "text")?.iconWhen;
  const registry = new Registry(root, (name) => tierOf.get(name), realization.contract);
  const hookPrefix = `--sk-${realization.contract}-`;
  const diagnostics: Diagnostic[] = [];

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
      const { host, styles: cascaded } = computeCell({ options, icons: true, iconChildren });
      const cellProps: CellProps = { [realization.splitBy]: splitValue, ...props };
      const ctx = (el: Element): Context => ({ computed: cascaded.get(el)!, registry, cell: cellProps, hookPrefix });

      try {
        const layers: Layer[] = [];
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
        const { strokes, fills, effects, ...box } = frameOf(ctx(host));
        const key = Object.entries(props).map(([k, v]) => `${k}=${v}`).join(", ");
        const body = { key, props, box: intern(styles.boxes, box), surface: intern(styles.surfaces, { strokes, fills, effects }), layers: intern(styles.layers, layers) };
        cells.push({ ...body, hash: hash(body) });
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
      showcase,
      properties,
      cells,
      contractHash: surfaceHash(contract),
      visualHash: hash({ axes: setAxes, grid, defaultCell, showcase, properties, cells: cells.map((c) => c.hash) }),
    });
  }



  const icon = await iconSetOf(realization, iconContract);
  const stage = stageOf(realization, corpus.files, registry);
  registry.finalize([realization.splitBy, ...axes.map((a) => a.name)]);
  // A field bound to a component variable that failed to evaluate would point at nothing.
  const dead = [...registry.diagnostics].filter((d) => d.code === "DERIVED_UNSUPPORTED");
  if (dead.length) throw new Error(`component variables failed to evaluate:\n${dead.map((d) => d.message).join("\n")}`);

  const specimen = await specimenOf(repoRoot, realization, contract, sets, stateAxis, diagnostics);

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
      state: "rest: no :hover, :active or :focus",
      direction: "ltr",
      conditions: "no @media or @supports block holds",
    },
    collections: [
      { id: "primitives" as const, name: "Skryensya / Primitives", modes: ["light", "dark"] as const },
      { id: "semantic" as const, name: "Skryensya / Semantic", modes: ["light", "dark"] as const },
      { id: "component" as const, name: `Skryensya / ${sets[0].name.split(" / ")[0]}`, modes: ["light", "dark"] as const },
    ],
    variables,
    pages: [PAGE],
    stage,
    components: [icon, ...sets],
    styles,
    specimenPage: PAGE.id,
    specimen,
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
  const computed = computeTree(root, readRules([{ name: rel, css: file.css }]), new Set()).get(root)!;
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
    return { name, svg, hash: hash(svg) };
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

/* ── specimen: the docs previews, as instances ──────────────────────────────────────────────────── */

async function specimenOf(
  repoRoot: string,
  realization: Realization,
  contract: ComponentContract,
  sets: ComponentSet[],
  stateAxis: Axis,
  diagnostics: Diagnostic[],
): Promise<SpecimenEntry[]> {
  const demos = (await import(pathToFileURL(join(repoRoot, realization.specimen.module)).href)) as Record<string, (t: (k: string) => string) => UsageTree>;
  const { ui } = (await import(pathToFileURL(join(repoRoot, "apps/docs/src/i18n/ui.ts")).href)) as { ui: { en: Record<string, string> } };
  const t = (key: string) => ui.en[key] ?? key;
  const out: SpecimenEntry[] = [];

  for (const source of realization.specimen.exports) {
    const build = demos[source];
    if (typeof build !== "function") throw new Error(`${realization.specimen.module} has no export ${source}`);
    let index = 0;
    walkUsageTree(build(t), (node) => {
      if (node.contract !== realization.contract) return;
      const id = `${source}#${index++}`;
      if (node.signature !== realization.signature) {
        diagnostics.push({ severity: "info", code: "SPECIMEN_SKIPPED", subject: id, message: `${node.signature} is not realized` });
        return;
      }
      const given = { ...defaultsOf(contract, Object.keys(contract.options)), ...(node.options ?? {}) } as Record<string, unknown>;
      const set = sets.find((s) => s.id === `${realization.contract}/${given[realization.splitBy]}`);
      if (!set) return;
      const props: Record<string, string> = {};
      for (const axis of set.axes) {
        if (axis.name === stateAxis.name) {
          props[axis.name] = stateAxis.values.find((v) => given[v] === true) ?? stateAxis.values[0];
        } else props[axis.name] = String(given[axis.name] ?? false);
      }
      const key = Object.entries(props).map(([k, v]) => `${k}=${v}`).join(", ");
      if (!set.cells.some((c) => c.key === key)) {
        diagnostics.push({ severity: "info", code: "SPECIMEN_SKIPPED", subject: id, message: `no cell ${key}` });
        return;
      }
      const slots = { ...(node.slots ?? {}), ...(node.children !== undefined ? { children: node.children } : {}) } as Record<string, unknown>;
      const properties: Record<string, string | boolean> = {};
      const icons: Record<string, string> = {};
      const iconName = (content: unknown) =>
        typeof content === "object" && content !== null && (content as UsageTree).contract === "icon"
          ? String((content as UsageTree).options?.name ?? "")
          : undefined;
      for (const [slot, spec] of Object.entries(realization.slots)) {
        const content = slots[slot];
        if (spec.holds === "text" && typeof content === "string") properties[slot] = content;
        if (spec.holds === "icon") properties[slot] = content !== undefined;
        const name = iconName(content);
        if (name) icons[slot] = name;
      }
      out.push({ id, source, set: set.id, cell: key, properties, icons });
    });
  }
  return out;
}
