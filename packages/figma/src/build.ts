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
import { frameOf, gridTracks, iconOf, overlayOf, ringOf, textOf } from "./realize.js";
import { Registry, resolve, substituted, type CellProps, type Context } from "./resolve.js";

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
  const printed: Record<string, string> = {};
  for (const [slot, spec] of Object.entries(realization.slots)) {
    if (spec.holds === "icon") {
      if (input.icons) slots[slot] = icon;
    } else if (spec.option) printed[spec.option] = spec.sample;
    else slots[slot] = input.iconChildren ? icon : spec.sample;
  }
  return { contract: realization.contract, signature: realization.signature, options: { ...realization.given, ...printed, ...input.options }, slots };
}

/**
 * The emitted markup with each icon placeholder mounted: the vanilla layer swaps the placeholder
 * for an element carrying the icon contract's root part, and that element is what the sheet sizes.
 */
function mounted(markup: string, iconContract: ComponentContract): string {
  const attr = (iconContract.options.name as { attr: string }).attr;
  const root = iconContract.parts.root;
  // The placeholder's own size (`data-sk-icon-size`) becomes the mounted box's `data-size`, as the
  // vanilla mount writes it: a template's fixed icon (BackToTop's chevron) is sized that way.
  return markup.replace(new RegExp(`<span[^>]*\\b${attr}="[^"]*"[^>]*></span>`, "g"), (span) => {
    const size = /data-sk-icon-size="([^"]*)"/.exec(span)?.[1];
    return `<svg class="${root}"${size ? ` data-size="${size}"` : ""}></svg>`;
  });
}

/* ── the compiler ───────────────────────────────────────────────────────────────────────────── */

/** What every realization in one manifest shares: the token graph, its variables, the styles table. */
type Shared = {
  corpus: ReturnType<typeof parseTokens>;
  registry: Registry;
  styles: Styles;
  diagnostics: Diagnostic[];
  iconContract: ComponentContract;
};

/** One realization's component sets, and what the manifest's report says about them. */
type Compiled = {
  sets: ComponentSet[];
  /** The axes its component variables are named along, outermost first. */
  axisOrder: string[];
  options: { visual: string[]; nonVisual: string[]; excluded: string[] };
  naive: { allOptions: number; visualOptions: number };
};

/**
 * The manifest for every realization at once: one token graph and one set of variables they all
 * bind, one Icon set, and each contract's component sets after the last. Then every token of the
 * catalogue Figma can hold, whether a component reached it or not.
 */
export async function buildFigmaManifest(input: Realization | readonly Realization[]): Promise<FigmaManifest> {
  const realizations: readonly Realization[] = Array.isArray(input) ? input : [input as Realization];
  const [first] = realizations;
  if (!first) throw new Error("no realization to build");
  const iconContract = getContract("icon");
  if (!iconContract) throw new Error("unknown contract icon");

  const corpus = parseTokens();
  const root = new Map<string, string>();
  const tierOf = new Map<string, "primitive" | "semantic">();
  for (const token of corpus.tokens) {
    if (token.tier === "component") continue;
    root.set(token.name, token.value);
    tierOf.set(token.name, token.tier);
  }
  for (const [name, value] of Object.entries(CONTEXT_OVERRIDES)) root.set(name, value);

  const registry = new Registry(root, (name) => tierOf.get(name));
  const shared: Shared = { corpus, registry, styles: { boxes: {}, surfaces: {}, layers: {} }, diagnostics: [], iconContract };
  const stage = stageOf(first, corpus.files, registry);

  const compiled: Compiled[] = [];
  for (const realization of realizations) compiled.push(await compileRealization(realization, shared));
  const sets = compiled.flatMap((c) => c.sets);
  const icon = await iconSetOf(first, iconContract);

  // What the components reach, counted before the rest of the catalogue is added.
  const reached = new Set(registry.reached);
  const reachedVariables = new Set(registry.variables.keys());
  const catalogue = { added: 0, notAVariable: [] as string[] };
  for (const name of [...tierOf.keys()].sort()) {
    if (registry.variables.has(name)) continue;
    const kind = registry.kindOf(name);
    if (kind && registry.token(name, kind)) catalogue.added++;
    else catalogue.notAVariable.push(name);
  }
  if (catalogue.notAVariable.length) {
    shared.diagnostics.push({
      severity: "info",
      code: "TOKEN_NOT_A_VARIABLE",
      subject: `${catalogue.notAVariable.length} tokens`,
      message: `no Figma variable type holds them (shadows, easings, percentages, keywords): ${catalogue.notAVariable.join(", ")}`,
    });
  }

  // Component variables are named per contract; a contract drawn by several signatures names them
  // along all of its axes.
  const axisOrders: Record<string, string[]> = {};
  realizations.forEach((r, i) => {
    axisOrders[r.contract] = [...new Set([...(axisOrders[r.contract] ?? []), ...compiled[i].axisOrder])];
  });
  registry.finalize(axisOrders);
  // A field bound to a component variable that failed to evaluate would point at nothing.
  const dead = [...registry.diagnostics].filter((d) => d.code === "DERIVED_UNSUPPORTED");
  if (dead.length) throw new Error(`component variables failed to evaluate:\n${dead.map((d) => d.message).join("\n")}`);

  const variables = [...registry.variables.values()].sort((a, b) =>
    a.collection === b.collection ? a.name.localeCompare(b.name) : a.collection.localeCompare(b.collection),
  );
  const allDiagnostics = [...registry.diagnostics, ...shared.diagnostics].sort((a, b) =>
    a.code === b.code ? a.subject.localeCompare(b.subject) || a.message.localeCompare(b.message) : a.code.localeCompare(b.code),
  );

  const bySource = { alias: 0, literal: 0, evaluated: 0 };
  for (const v of variables) for (const s of Object.values(v.source)) bySource[s]++;
  // A realization's key in the report: its contract, or contract and signature when one contract has several.
  const keyOf = (r: Realization) => r.id ?? (realizations.filter((x) => x.contract === r.contract && !x.id).length > 1 ? `${r.contract}:${r.signature}` : r.contract);
  const report = {
    options: Object.fromEntries(realizations.map((r, i) => [keyOf(r), compiled[i].options])),
    variants: {
      naiveAllOptions: Object.fromEntries(realizations.map((r, i) => [keyOf(r), compiled[i].naive.allOptions])),
      naiveVisualOptions: Object.fromEntries(realizations.map((r, i) => [keyOf(r), compiled[i].naive.visualOptions])),
      componentSets: sets.length,
      variantsPerSet: sets.map((s) => ({ set: s.id, variants: s.cells.length })),
      variantsTotal: sets.reduce((n, s) => n + s.cells.length, 0),
      components: sets.length + 1,
    },
    tokens: {
      reached: reached.size,
      reachedAsVariables: [...reachedVariables].filter((id) => variables.some((v) => v.id === id && v.collection !== "component")).length,
      catalogueAdded: catalogue.added,
      variables: variables.filter((v) => v.collection !== "component").length,
      componentVariables: variables.filter((v) => v.collection === "component").length,
      unsupported: allDiagnostics.filter((d) => d.code === "TOKEN_UNSUPPORTED").length,
      modeValuesBySource: bySource,
      reachedButNotVariables: [...reached].filter((n) => !registry.variables.has(n)).sort(),
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
      state: "rest, plus the interaction states each realization draws (:hover, :focus-visible), simulated; :active never",
      direction: "ltr",
      conditions: "(any-hover: hover) holds; no other @media or @supports block does",
    },
    collections: [
      { id: "primitives" as const, name: "Skryensya / Primitives", modes: FILE_MODES },
      { id: "semantic" as const, name: "Skryensya / Semantic", modes: FILE_MODES },
      { id: "component" as const, name: "Skryensya / Components", modes: FILE_MODES },
    ],
    variables,
    pages: [PAGE],
    stage,
    components: [icon, ...sets],
    styles: shared.styles,
    diagnostics: allDiagnostics,
    report,
  };
  return { ...body, sourceHash: hash(body) } as FigmaManifest;
}

async function compileRealization(realization: Realization, shared: Shared): Promise<Compiled> {
  const { corpus, registry, styles, diagnostics, iconContract } = shared;
  const contract = getContract(realization.contract);
  if (!contract) throw new Error(`unknown contract ${realization.contract}`);
  const signature = contract.signatures[realization.signature];
  if (!signature) throw new Error(`unknown signature ${realization.signature}`);
  // Whether a text or icon must be given: a slot the signature requires, or an option it requires.
  const requiredSlot = (slot: string) => {
    const spec = realization.slots[slot];
    const option = spec?.holds === "text" ? spec.option : undefined;
    return option ? ((signature.requires ?? []) as readonly string[]).includes(option) : !!signature.slots[slot]?.required;
  };
  const iconName = (iconContract.options.name as { values: readonly string[] }).values[0];

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
  // A template's own icon (a part, not a slot) is in no tree, so its box's sheet is asked for here.
  const iconClass = realization.parts && Object.keys(realization.parts).length ? [iconContract.parts.root] : [];
  for (const cls of [...sheetsForTree(sample).classes, ...iconClass]) {
    // The sheet that declares the class on its own (`.sk-interactive {`), not one that restyles it.
    const defines = new RegExp(`(^|[{};,]\\s*)\\.${cls}\\s*\\{`, "m");
    if (sheets.some((sheet) => defines.test(sheet.css))) continue;
    const file = corpus.files.find((f) => f.tier === "component" && defines.test(f.css));
    if (file) sheets.unshift({ name: file.rel, css: file.css });
  }
  const interactions = realization.state.interactions;
  const held = realization.simulate ?? [];
  const rules: RuleSet = readRules(sheets, MEDIA_HOLDS, [...interactions.map((i) => i.pseudo), ...held]);
  const unmatchable = new Set<string>();

  const computeCell = (input: CellInput, simulated: readonly string[] = []) => {
    const markup = mounted(emitMarkup(treeFor(realization, input, iconName), { fillDefaults: true }), iconContract);
    const host = elementFrom(markup);
    for (const [part, style] of Object.entries(realization.mounted ?? {})) {
      const el = host.classList.contains(contract.parts[part]) ? host : host.querySelector(`.${contract.parts[part]}`);
      if (!el) throw new Error(`mounted: no part ${part} in the markup`);
      el.setAttribute("style", `${el.getAttribute("style") ?? ""}; ${style}`.replace(/^; /, ""));
    }
    for (const pseudo of [...held, ...simulated]) host.setAttribute(markerOf(pseudo), "");
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
  const split = realization.splitBy ? contract.options[realization.splitBy] : undefined;
  if (realization.splitBy && split?.type !== "enum") throw new Error(`splitBy ${realization.splitBy} is not an enum option`);
  // One set per value of the split, or one set for the whole signature when nothing splits it.
  const splitValues: (string | undefined)[] = split ? [...(split.values ?? [])] : [undefined];
  const setBase = realization.id ?? realization.contract;
  const word = signatureWord(contract.id, realization.signature);
  // Unsplit and named after its own signature (Heading), the set is just that name.
  const alone = !realization.splitBy && word === setBase;
  const setIdOf = (splitValue: string | undefined) => (alone ? setBase : `${setBase}/${splitValue ?? word}`);
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
  // A component with no states (a Badge is never pressed) gets no state axis: `state=rest` alone
  // would be a variant property with nothing to pick.
  const hasStates = stateAxis.values.length > 1;
  // The state reads best between the enums and the remaining booleans.
  const firstBoolean = axes.findIndex((a) => contract.options[a.name].type === "boolean");
  if (hasStates) axes.splice(firstBoolean < 0 ? axes.length : firstBoolean, 0, stateAxis);

  const iconWhen = Object.values(realization.slots).find((s) => s.holds === "text")?.iconWhen;
  const hookPrefix = `--sk-${realization.contract}-`;

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
  // Beside each row: its variant at rest, with each optional icon slot switched on in turn, or, for a
  // realization that names samples, holding each sample text.
  const samples = realization.samples;
  if (samples && realization.slots[samples.slot]?.holds !== "text") throw new Error(`samples: ${samples.slot} is not a text slot`);
  const showcase: ComponentSet["showcase"] = {
    base: {
      ...(hasStates ? { [realization.state.axis]: realization.state.rest } : {}),
      ...(iconWhen ? { [iconWhen]: "false" } : {}),
    },
    ...(samples ? { title: samples.title } : {}),
    columns: [
      ...Object.entries(realization.slots)
        .filter(([slot, spec]) => spec.holds === "icon" && !requiredSlot(slot))
        .map(([slot]) => ({ slot, properties: { [slot]: true } })),
      ...(samples?.values ?? []).map((value) => ({ slot: `${samples!.slot}=${value}`, label: value, properties: { [samples!.slot]: value } })),
    ],
  };

  // Where each slot lands, read off the part template: `pre`, the label, `post`.
  const slotOrder: string[] = [];
  // And the icon parts, in the same walk, so each layer lands where the template puts it.
  const drawnParts = realization.parts ?? {};
  const layerOrder: { kind: "slot" | "part"; name: string }[] = [];
  // Which part holds each slot, read off the template: the text is styled by that element.
  const slotPart: Record<string, string> = {};
  const walkTemplate = (node: unknown, holder?: string) => {
    if (!node || typeof node !== "object") return;
    const raw = node as { slot?: string; part?: string; textFromOption?: string; children?: unknown[] };
    // A text the template prints from an option is placed as the slot that names that option.
    const printedBy = raw.textFromOption
      ? Object.entries(realization.slots).find(([, spec]) => spec.holds === "text" && spec.option === raw.textFromOption)?.[0]
      : undefined;
    const n = printedBy ? { ...raw, slot: printedBy } : raw;
    if (n.slot && (n.part ?? holder)) slotPart[n.slot] = (n.part ?? holder)!;
    if (n.part && drawnParts[n.part] && !layerOrder.some((l) => l.kind === "part" && l.name === n.part)) layerOrder.push({ kind: "part", name: n.part });
    if (n.slot && realization.slots[n.slot] && !slotOrder.includes(n.slot)) {
      slotOrder.push(n.slot);
      layerOrder.push({ kind: "slot", name: n.slot });
    }
    for (const child of n.children ?? []) walkTemplate(child, n.part ?? holder);
  };
  walkTemplate(signature.template);
  const unplaced = Object.keys(realization.slots).filter((slot) => !slotOrder.includes(slot));
  if (unplaced.length) throw new Error(`slots the template never places: ${unplaced.join(", ")}`);

  const sets: ComponentSet[] = [];
  const intern = <T>(table: Record<string, T>, value: T) => {
    const id = hash(value);
    table[id] = value;
    return id;
  };
  for (const splitValue of splitValues) {
    const cells: Cell[] = [];
    for (const props of combos(axes)) {
      const options: Record<string, string | boolean> = { ...defaults, ...(realization.splitBy && splitValue ? { [realization.splitBy]: splitValue } : {}) };
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
      const cellProps: CellProps = { ...(realization.splitBy && splitValue ? { [realization.splitBy]: splitValue } : {}), ...props };
      const inherited = {
        "font-family": `var(${realization.stage.label.fontFamily})`,
        ...Object.fromEntries(Object.entries(realization.stage.inherit ?? {}).map(([name, token]) => [name, `var(${token})`])),
      };
      const ctxOf = (computed: Computed): Context => ({ computed, registry, cell: cellProps, hookPrefix, component: realization.contract, inherited });
      const ctx = (el: Element): Context => ctxOf(cascaded.get(el)!);

      /*
       * THE NESTED DRAWING: the element's own children, in document order. A text run is its slot's
       * layer (known by the sample it was emitted with), a mounted icon an icon layer, an element that
       * lays out or paints a frame holding its own layers, and a wrapper that does neither is looked
       * through. What is clipped to an accessible name only is not drawn.
       */
      const partOf = (el: Element) => {
        for (const [part, cls] of Object.entries(contract.parts)) if (el.classList.contains(cls)) return part;
        return undefined;
      };
      const slotOfText = (text: string) =>
        Object.entries(realization.slots).find(([, spec]) => spec.holds === "text" && spec.sample === text)?.[0];
      const slotOfPart = (part: string | undefined) => (part ? Object.entries(slotPart).find(([, p]) => p === part)?.[0] : undefined);
      const clipped = (el: Element) => {
        const c = cascaded.get(el)!;
        return /^(1px|0)$/.test(c.get("width") ?? "") && /^(1px|0)$/.test(c.get("height") ?? "") && /hidden|clip/.test(c.get("overflow") ?? c.get("clip-path") ?? "");
      };
      const paints = (el: Context) => {
        const { strokes, fills, effects, ...box } = frameOf(el);
        const zero = (b: Bound<number> | undefined) => !b || ("value" in b && b.value === 0);
        return (
          strokes.length > 0 || fills.length > 0 || effects.length > 0 || box.width !== undefined || box.height !== undefined ||
          box.grow === true || !zero(box.padding.top) || !zero(box.padding.left) || !zero(box.padding.bottom) || !zero(box.padding.right)
        );
      };
      /** A length as the pixels it comes to, when it is plain ones (a padding token is); else undefined. */
      const pixels = (el: Element, name: string): number | undefined => {
        const match = /^(-?\d*\.?\d+)(px)?$/.exec(substituted(cascaded.get(el)!.get(name) ?? "0", ctx(el)));
        return match ? Number(match[1]) : undefined;
      };
      /** A width or height given as a percentage (`inline-size: var(--sk-progress-fill)`), as that number. */
      const percent = (el: Element, name: string): number | undefined => {
        const raw = cascaded.get(el)!.get(name);
        const match = raw ? /^(-?\d*\.?\d+)%$/.exec(substituted(raw, ctx(el))) : null;
        return match ? Number(match[1]) : undefined;
      };
      /** The room inside an element `outer` wide, when its side padding is plain pixels. */
      const innerOf = (el: Element, outer: number | undefined) => {
        const left = pixels(el, "padding-left");
        const right = pixels(el, "padding-right");
        return outer === undefined || left === undefined || right === undefined ? undefined : outer - left - right;
      };

      /**
       * A child's declarations as its frame reads them. A percentage is of the parent's width: pixels
       * when that is known, the whole of it (a stretch) at 100%, hug otherwise; a full height across a
       * row stretches it too. `inherit` takes the parent's value (a Progress bar's corners).
       */
      const sizing = (child: Element, inner: number | undefined, downward: boolean) => {
        const sized = new Map(cascaded.get(child)!);
        const parent = child.parentElement ? cascaded.get(child.parentElement) : undefined;
        for (const [name, value] of sized) if (value === "inherit" && parent?.get(name) !== undefined) sized.set(name, parent.get(name)!);
        const widthPercent = percent(child, "width");
        const heightPercent = percent(child, "height");
        const across = widthPercent !== undefined && widthPercent !== 100 && inner !== undefined ? (inner * widthPercent) / 100 : undefined;
        if (widthPercent !== undefined) {
          if (across !== undefined) sized.set("width", `${across}px`);
          else sized.delete("width");
        }
        if (heightPercent !== undefined) sized.delete("height");
        const stretch = (heightPercent === 100 && !downward) || (widthPercent === 100 && downward);
        return { computed: sized, across, stretch };
      };

      /**
       * `inner`: the width inside `el`, when it is known (the realization's drawing width, carried down
       * through fixed widths and spanning blocks), for children sized as a percentage of it.
       */
      const nestedLayers = (el: Element, inner?: number): Layer[] => {
        const out: Layer[] = [];
        // In a grid laid across, a child in an `fr` column fills the row, as flex-grow does.
        const tracks = gridTracks(ctx(el));
        let column = 0;
        const computed = ctx(el).computed;
        const display = computed.get("display") ?? "";
        const crossAlign = /grid/.test(display) ? computed.get("justify-items") : computed.get("align-items");
        // Children laid down a column (a flex column, a grid of one track); stacking when it stretches them.
        const downward = (/flex/.test(display) && /column/.test(computed.get("flex-direction") ?? "")) || (/grid/.test(display) && tracks.length <= 1);
        const stacking = downward && (crossAlign === undefined || crossAlign === "normal" || crossAlign === "stretch");
        // Siblings of one part (LabelledSeparator's two rules) are told apart by number: `rule`, `rule 2`.
        const seen = new Map<string, number>();
        const unique = (slot: string) => {
          const n = (seen.get(slot) ?? 0) + 1;
          seen.set(slot, n);
          return n === 1 ? slot : `${slot} ${n}`;
        };
        for (const node of Array.from(el.childNodes)) {
          if (node.nodeType === 3) {
            const text = (node.textContent ?? "").trim();
            if (!text) continue;
            const slot = slotOfText(text) ?? slotOfPart(partOf(el)) ?? "text";
            const spec = realization.slots[slot];
            if (spec?.holds === "text" && spec.hidden) continue;
            const optional = spec ? !requiredSlot(slot) : false;
            // Drawn at a width, running text wraps inside its block unless it is told not to.
            const wraps = realization.width && computed.get("white-space") !== "nowrap";
            out.push({
              kind: "text",
              slot,
              textProperty: slot,
              ...(optional ? { visibleProperty: `show ${slot}` } : {}),
              ...(wraps ? { fill: true as const } : {}),
              text: textOf(ctx(el)),
            });
            continue;
          }
          if (node.nodeType !== 1) continue;
          const child = node as Element;
          if (child.classList.contains(iconContract.parts.root)) {
            const part = partOf(el);
            const slot = slotOfPart(part) ?? part ?? "icon";
            const named = realization.slots[slot]?.icon ?? (part ? drawnParts[part]?.icon : undefined) ?? DEFAULT_ICON;
            if (!vocabulary.includes(named)) throw new Error(`icon ${slot}: ${named} is not a stable icon name`);
            const optional = realization.slots[slot] ? !requiredSlot(slot) : false;
            out.push({ kind: "icon", slot, ...(optional ? { visibleProperty: slot } : {}), default: named, icon: iconOf(ctx(child)) });
            continue;
          }
          if (clipped(child)) continue;
          const { computed: sized, across, stretch } = sizing(child, inner, downward);
          const onlyText = child.children.length === 0;
          if (onlyText && !paints(ctxOf(sized))) {
            out.push(...nestedLayers(child, inner));
            continue;
          }
          const { strokes, fills, effects, ...measured } = frameOf(ctxOf(sized));
          const frameBox = stretch ? { ...measured, stretch: true as const } : measured;
          const track = tracks.length > 1 ? tracks[column++] : undefined;
          const box = track && /fr\b/.test(track) ? { ...frameBox, grow: true as const } : frameBox;
          const slot = unique(partOf(child) ?? child.localName);
          // Drawn at a width, a block down a column spans it, as CSS stretches it by default.
          const spans = realization.width && stacking && !box.width;
          out.push({
            kind: "frame",
            slot,
            box: intern(styles.boxes, spans ? { ...box, stretch: true as const } : box),
            surface: intern(styles.surfaces, { strokes, fills, effects }),
            layers: nestedLayers(child, innerOf(child, across ?? (spans || frameBox.stretch ? inner : undefined))),
          });
        }
        // Only a text alone in its block, or down a column, has the block's width to fill: beside
        // others in a row (an attribution and its source) each keeps its own. Down a column that
        // centres its items (an EmptyState), a line still wraps at the column's width, and its
        // centring is the text's own alignment.
        if (!downward && out.length > 1) return out.map((layer) => (layer.kind === "text" && layer.fill ? { ...layer, fill: undefined } : layer));
        return out;
      };

      try {
        const layers: Layer[] = [];
        // Pseudo-elements that paint go under the content, first.
        for (const [which, name] of Object.entries(realization.overlays) as ["before" | "after", string][]) {
          const box = pseudo.get(host)?.[which];
          const fills = box && overlayOf(ctxOf(box));
          if (fills?.length) layers.push({ kind: "overlay", slot: name, fills });
        }
        if (realization.nested) layers.push(...nestedLayers(host, innerOf(host, realization.width)));
        // Slots in the order the contract's template places them, never the realization's key order.
        else for (const entry of layerOrder) {
          if (entry.kind === "part") {
            // A fixed icon of the template's own: always shown, showing what the realization names.
            const holder = host.querySelector(`.${contract.parts[entry.name]}`);
            const glyph = holder?.querySelector(`.${iconContract.parts.root}`);
            if (!glyph) throw new Unsupported(`no icon in part ${entry.name}`);
            const name = drawnParts[entry.name].icon;
            if (!vocabulary.includes(name)) throw new Error(`part ${entry.name}: ${name} is not a stable icon name`);
            layers.push({ kind: "icon", slot: entry.name, default: name, icon: iconOf(ctx(glyph)) });
            continue;
          }
          const slot = entry.name;
          const spec = realization.slots[slot];
          if (spec.holds === "text" && spec.hidden) continue;
          const part = contract.parts[slot];
          const holder = part ? host.querySelector(`.${part}`) : host;
          const optional = !requiredSlot(slot);
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
            // Styled by the element that holds the text: a label part when there is one, else the host.
            const holderPart = slotPart[slot] && slotPart[slot] !== "root" ? contract.parts[slotPart[slot]] : undefined;
            const textHolder = (holderPart && host.querySelector(`.${holderPart}`)) || host;
            layers.push({ kind: "text", slot, textProperty: slot, ...(optional ? { visibleProperty: `show ${slot}` } : {}), text: textOf(ctx(textHolder)) });
          }
        }
        // An outline draws over everything, last.
        const ring = ringOf(ctx(host));
        if (ring) layers.push({ kind: "ring", slot: realization.ring, ...ring });
        const { strokes, fills, effects, ...hostBox } = frameOf(ctx(host));
        const box = realization.width && !hostBox.width ? { ...hostBox, width: { value: realization.width, expression: `${realization.width}px` } } : hostBox;
        const key = Object.entries(props).map(([k, v]) => `${k}=${v}`).join(", ");
        const body = { key, props, box: intern(styles.boxes, box), surface: intern(styles.surfaces, { strokes, fills, effects }), layers: intern(styles.layers, layers) };
        // The id is not hashed: it says WHICH cell this is, the hash says whether it is current.
        cells.push({ id: cellId(setIdOf(splitValue), props), ...body, hash: hash(body) });
      } catch (error) {
        if (!(error instanceof Unsupported)) throw error;
        diagnostics.push({ severity: "warning", code: "CELL_UNSUPPORTED", subject: `${setIdOf(splitValue)}: ${JSON.stringify(props)}`, message: error.message });
      }
    }

    const properties: ComponentProperty[] = [];
    for (const [slot, spec] of Object.entries(realization.slots)) {
      if (spec.holds === "text" && spec.hidden) continue;
      if (spec.holds === "text") properties.push({ name: slot, type: "TEXT", default: spec.sample });
      // An optional icon slot starts off (Button's pre/post); an optional text starts shown, under
      // its own name so it does not collide with the text property beside it.
      if (!requiredSlot(slot)) {
        properties.push(spec.holds === "text" ? { name: `show ${slot}`, type: "BOOLEAN", default: true } : { name: slot, type: "BOOLEAN", default: false });
      }
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
      id: setIdOf(splitValue),
      name: alone ? titleOf(setBase) : `${titleOf(setBase)} / ${splitValue ?? titleOf(word)}`,
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



  for (const selector of [...unmatchable].sort()) {
    diagnostics.push({ severity: "info", code: "SELECTOR_UNMATCHABLE", subject: `${realization.contract}: ${selector}`, message: "jsdom cannot evaluate it; treated as not matching" });
  }
  for (const block of rules.skipped) {
    diagnostics.push({ severity: "info", code: "CONDITION_SKIPPED", subject: `${block.sheet} ${block.condition}`, message: `${block.rules} rule(s) under a condition the evaluation context does not hold` });
  }
  return {
    sets,
    axisOrder: [...(realization.splitBy ? [realization.splitBy] : []), ...axes.map((a) => a.name)],
    options: { visual, nonVisual, excluded: [...realization.exclude] },
    naive: {
      allOptions: signature.options.reduce((n, name) => n * stateCount(contract.options[name]), 1),
      visualOptions: visual.reduce((n, name) => n * stateCount(contract.options[name]), 1),
    },
  };
}

const titleOf = (id: string) => id.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

/** What a signature adds to its contract's name, as a word: `BadgeDot` of `badge` is `dot`. */
function signatureWord(contractId: string, signature: string): string {
  const base = titleOf(contractId).replaceAll(" ", "");
  const rest = signature.startsWith(base) && signature.length > base.length ? signature.slice(base.length) : signature;
  return rest.replace(/\./g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/* ── the stage: a contract's own background, resolved through its cascade ──────────────────────── */

function stageOf(realization: Realization, files: readonly { rel: string; css: string }[], registry: Registry): Stage {
  const contract = getContract(realization.stage.contract);
  if (!contract) throw new Error(`unknown contract ${realization.stage.contract}`);
  const rel = contract.css.replace("@skryensya/core/", "");
  const file = files.find((f) => f.rel === rel);
  if (!file) throw new Error(`sheet ${contract.css} not in the token corpus`);
  const root = elementFrom(`<div class="${contract.parts.root}"></div>`);
  const computed = computeTree(root, readRules([{ name: rel, css: file.css }]), new Set()).styles.get(root)!;
  const ctx: Context = { computed, registry, cell: {}, hookPrefix: `--sk-${contract.id}-`, component: contract.id };
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
