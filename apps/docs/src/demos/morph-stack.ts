import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * MORPH STACK DEMOS. Three subjects, because the effect is only worth judging against pictures that really have layers:
 * a metrics card over its data, a map over its ground, and a screen over its structure. Each plate is drawn with the
 * kit's own Box and tokens, so the picture is made of the system and not of loose paint, and every plate is a square of
 * the same size: a plate in a stack is a picture, not a flow.
 */

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options,
  children,
});

const stack = (gap: string, ...children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap },
  children,
});

/**
 * A bare shape for the bars, columns and frames a picture is made of: a still Placeholder block, which is what the kit
 * already has for "the shape of something". `style` repaints it (a colour, a dashed edge) without a new element.
 */
const shape = (style: string, size: { width?: string; height?: string } = {}): UsageTree => ({
  contract: "placeholder",
  signature: "Placeholder.block",
  options: { ...size, shimmer: false },
  attrs: { style: `border-radius: 0.25rem; ${style}` },
});

/** The hooks an example sets, as the inline style the stack carries. */
const hooks = (values: Record<string, string>): string =>
  Object.entries(values)
    .map(([name, value]) => `--sk-morph-stack-${name}: ${value};`)
    .join(" ");

/*
 * Every example is the same small size: a square of 11rem in a stack of 16rem. The depth hooks are lengths, not shares of
 * the plate, so a smaller plate means smaller distances and a closer perspective, and they are set together here.
 */
const SQUARE = "inline-size: 11rem; box-sizing: border-box; aspect-ratio: 1;";
const COMPACT_DEPTH = { size: "16rem", gap: "2.5rem", "slide-x": "-0.5rem", "slide-y": "0.5rem" };
const COMPACT = { ...COMPACT_DEPTH, perspective: "40rem" };
const compact = (extra: Record<string, string> = {}): string => hooks({ ...COMPACT, ...extra });

/** What lifts a plate off the one under it: a soft shadow cast downward. */
const LIFT = "box-shadow: 0 0.75rem 1.25rem -0.75rem var(--shadow-md);";

/** A plate: a square slab of the picture. `hidden` for the ones that only decorate. */
const plate = (options: Record<string, string | boolean>, style: string, children: UsageTree | UsageTree[], hidden = true): UsageTree => ({
  contract: "box",
  signature: "Box",
  options,
  attrs: { ...(hidden ? { "aria-hidden": "true" } : {}), style: `${SQUARE} ${style}` },
  children,
});

/**
 * The front plate: a see-through layer with the footprint of the others and one small piece placed on it. A layer is a
 * whole plane, so it lies exactly over the middle plate at rest and its piece sits where it was put, not in the centre.
 */
const layer = (placeContent: string, piece: UsageTree): UsageTree =>
  plate({ padding: "sm", radius: "surface" }, `display: grid; place-content: ${placeContent};`, piece);

/** The small piece a front layer carries: a chip with a lift under it. */
const chip = (style: string, children: UsageTree): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "xs", radius: "control" },
  attrs: { style: `text-align: center; box-shadow: 0 0.5rem 0.75rem -0.375rem var(--shadow-md); ${style}` },
  children,
});

const bar = (width: string): UsageTree => shape("border-radius: 999px;", { width, height: "0.5rem" });

type Plates = { deepest?: UsageTree; back: UsageTree; middle: UsageTree; front: UsageTree; nearest?: UsageTree };

const stackOf = (state: string | undefined, turn: string | undefined, rootStyle: string, slots: Plates, perspective?: string): UsageTree => ({
  contract: "morph-stack",
  signature: "MorphStack",
  ...(state || turn || perspective ? { options: { ...(state ? { state } : {}), ...(turn ? { turn } : {}), ...(perspective ? { perspective } : {}) } } : {}),
  attrs: { style: rootStyle },
  slots,
});

/* ---- 1. A metrics card over its data ---------------------------------------------------------------------------- */

const metricsBack = (t: Translate): UsageTree =>
  plate(
    { surface: "sunken", border: "default", padding: "sm", radius: "surface" },
    "display: grid; align-content: space-between;",
    [
      stack("xs", ...[0.9, 0.7, 0.8, 0.5, 0.65].map((w) => bar(`${w * 100}%`))),
      text(t("demo.morphStack.metrics.back"), { textRole: "eyebrow" }),
    ],
  );

const metricsMiddle = (t: Translate): UsageTree =>
  plate(
    { surface: "raised", border: "default", padding: "sm", radius: "surface" },
    `display: grid; align-content: space-between; ${LIFT}`,
    [
      stack("xs", text(t("demo.morphStack.metrics.eyebrow"), { textRole: "eyebrow" }), text("12.480", { weight: "emphasis", size: "lg" }), text(t("demo.morphStack.metrics.note"), { size: "sm", tone: "secondary" })),
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "xs" },
        attrs: { "aria-hidden": "true", style: "align-items: end; flex-wrap: nowrap; block-size: 2.5rem;" },
        children: [0.35, 0.5, 0.4, 0.65, 0.55, 0.9].map((h, i) => shape(`flex: 1; background: ${i === 5 ? "var(--color-border-accent)" : "var(--color-bg-accent-subtle)"};`, { height: `${h * 100}%` })),
      },
    ],
    false,
  );

const metricsFront = (t: Translate): UsageTree =>
  layer("start end", chip("background: var(--color-bg-success-subtle); border: 1px solid var(--color-border-success);", text(t("demo.morphStack.metrics.front"), { weight: "label", size: "sm" })));

/** 1. A metrics card over its data. Left to the pointer. */
export const morphStackTree = (t: Translate): UsageTree =>
  stackOf(undefined, undefined, compact(), { back: metricsBack(t), middle: metricsMiddle(t), front: metricsFront(t) });

/* ---- 2. A map over its ground, turning the other way ------------------------------------------------------------ */

const mapBack = (t: Translate): UsageTree =>
  plate(
    { padding: "sm", radius: "surface" },
    "display: grid; align-content: end; background: var(--color-bg-success-subtle); border: 1px solid var(--color-border-success); background-image: radial-gradient(circle at 30% 70%, var(--color-bg-info-subtle) 0 22%, transparent 23%);",
    text(t("demo.morphStack.map.back"), { textRole: "eyebrow" }),
  );

const mapMiddle = (t: Translate): UsageTree =>
  plate(
    { padding: "sm", radius: "surface" },
    /* Streets as a grid, and one avenue cutting across it: the route the front plate points at. */
    `display: grid; align-content: end; overflow: clip; border: 1px solid var(--color-border-default); background-color: var(--color-bg-surface); background-image: linear-gradient(135deg, transparent 0 46%, var(--color-bg-accent-subtle) 46% 54%, transparent 54%), repeating-linear-gradient(0deg, transparent 0 1.5rem, var(--color-border-subtle) 1.5rem 1.625rem), repeating-linear-gradient(90deg, transparent 0 1.5rem, var(--color-border-subtle) 1.5rem 1.625rem); ${LIFT}`,
    text(t("demo.morphStack.map.label"), { textRole: "eyebrow" }),
    false,
  );

const mapFront = (t: Translate): UsageTree =>
  layer("center", chip("background: var(--color-bg-accent-subtle); border: 1px solid var(--color-border-accent);", text(t("demo.morphStack.map.front"), { weight: "label", size: "sm" })));

/** 2. A map over its ground, written open and turning the other way. */
export const morphStackTurnTree = (t: Translate): UsageTree =>
  stackOf("expanded", "end", compact(), { back: mapBack(t), middle: mapMiddle(t), front: mapFront(t) });

/* ---- 3. A screen over its structure, tuned ---------------------------------------------------------------------- */

/*
 * THE ORDER SCREEN, as four layers that each say a different thing about the SAME order. Every layer lays its rows on
 * one grid (the same padding, the same row height), so the rows line up from the data at the bottom to the screen on
 * top: you can follow "Camiseta, 24 €" down through the frame that holds it to the record it came from.
 *
 *   data       what is stored: three records, in the font of code
 *   structure  where each thing goes: a dashed frame per row
 *   screen     what the person reads: the order, in words and prices
 *   action     what they can do: the button
 *   notice     what the page tells them back: a toast
 */
const ROW = "1.25rem";

/** One row of the grid. Every layer's rows are this tall, which is what makes them line up. */
const row = (left: UsageTree, right?: UsageTree): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "xs" },
  attrs: { "aria-hidden": "true", style: `justify-content: space-between; align-items: center; flex-wrap: nowrap; block-size: ${ROW};` },
  children: right ? [left, right] : [left],
});

const mono = (children: string, tone?: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "sm", ...(tone ? { tone } : {}) },
  attrs: { style: "font-family: var(--font-family-code);" },
  children,
});

const frame = (width: string, accent = false): UsageTree =>
  shape(`${DASHED(accent)} margin-block: 0;`, { width, height: ROW });

const DASHED = (accent: boolean): string =>
  `background: transparent; border: 1px dashed ${accent ? "var(--color-border-accent)" : "var(--color-border-default)"}; border-radius: 0.375rem;`;

/** The records, under everything: the plate nobody sees until the stack opens. */
const dataPlate = (t: Translate): UsageTree =>
  plate(
    { surface: "sunken", border: "default", radius: "surface", padding: "sm" },
    "display: grid; align-content: space-between;",
    [
      stack("xs", row(mono("order", "secondary"), mono("#1042", "secondary")), row(mono("shirt"), mono("24")), row(mono("hat"), mono("12")), row(mono("total"), mono("36"))),
      text(t("demo.morphStack.layers.data"), { textRole: "eyebrow" }),
    ],
  );

/** Where each row goes: a frame per row, the same four rows as the screen, the last one picked out. */
const screenBack = (t: Translate): UsageTree =>
  plate(
    { surface: "sunken", radius: "surface", padding: "sm" },
    "border: 1px dashed var(--color-border-default); display: grid; align-content: space-between;",
    [
      stack("xs", frame("65%"), frame("100%"), frame("100%"), frame("100%", true)),
      text(t("demo.morphStack.screen.back"), { textRole: "eyebrow" }),
    ],
  );

/** What the person reads: the order, with each row where the frame behind it is. */
const screenMiddle = (t: Translate): UsageTree =>
  plate(
    { surface: "raised", border: "default", radius: "surface", padding: "sm" },
    `display: grid; align-content: start; ${LIFT}`,
    stack(
      "xs",
      row(text(t("demo.morphStack.screen.title"), { weight: "emphasis", size: "sm" })),
      row(text(t("demo.morphStack.screen.item1"), { size: "sm" }), text(t("demo.morphStack.screen.price1"), { size: "sm" })),
      row(text(t("demo.morphStack.screen.item2"), { size: "sm" }), text(t("demo.morphStack.screen.price2"), { size: "sm" })),
      row(text(t("demo.morphStack.screen.total"), { size: "sm", weight: "emphasis" }), text(t("demo.morphStack.screen.price3"), { size: "sm", weight: "emphasis" })),
    ),
    false,
  );

/** What they can do: one button, at the corner where the eye ends. */
const screenFront = (t: Translate): UsageTree =>
  layer("end end", chip("background: var(--color-border-accent); color: var(--color-text-on-accent);", text(t("demo.morphStack.screen.front"), { weight: "label", size: "sm" })));

/** 3. A screen over its structure, tuned with hooks only. */
export const morphStackTunedTree = (t: Translate): UsageTree =>
  stackOf(
    "expanded",
    undefined,
    /* The lens is the typed option, so it is left out of the hooks here: one way to say it per example. */
    hooks({ ...COMPACT_DEPTH, "rotate-x": "48deg", "rotate-z": "-30deg", gap: "2rem", "slide-x": "0rem", stagger: "0" }),
    { back: screenBack(t), middle: screenMiddle(t), front: screenFront(t) },
    "28rem",
  );

/** 4. The other way round: open at rest, one piece while the pointer or focus is on it. */
export const morphStackInverseTree = (t: Translate): UsageTree =>
  stackOf("auto-inverse", undefined, compact({ size: "17rem" }), { back: screenBack(t), middle: screenMiddle(t), front: screenFront(t), nearest: nearestPlate(t) });

/* ---- 5. The property playgrounds: turn, perspective and how many plates ---------------------------------------------- */

/** The screen stack, written open: the one subject every playground varies a single property of. */
const screenStack = (t: Translate, options: { turn?: string; perspective?: string; extra?: Record<string, string> } = {}): UsageTree =>
  stackOf("expanded", options.turn, hooks({ ...COMPACT_DEPTH, ...(options.perspective ? {} : { perspective: COMPACT.perspective }), ...options.extra }), { back: screenBack(t), middle: screenMiddle(t), front: screenFront(t) }, options.perspective);

/** `turn`, a real option: `UsagePreview` writes it into the root and redraws. */
export const morphStackTurnPlaygroundTree = (t: Translate): UsageTree => screenStack(t);

/** `perspective`, a free-form length and so not an enum: one tree per lens, which the playground switches between. */
export const morphStackPerspectiveVariants = (t: Translate): Record<"close" | "default" | "far" | "flat", UsageTree> => ({
  close: screenStack(t, { perspective: "18rem" }),
  default: screenStack(t, { perspective: "40rem" }),
  far: screenStack(t, { perspective: "120rem" }),
  flat: screenStack(t, { perspective: "none" }),
});

/** The two plates that go beyond three: the records under everything and a notice over everything. */
const deepestPlate = (t: Translate): UsageTree => dataPlate(t);
const nearestPlate = (t: Translate): UsageTree =>
  layer("end start", chip("background: var(--color-bg-success-subtle); border: 1px solid var(--color-border-success);", text(t("demo.morphStack.layers.toast"), { weight: "label", size: "sm" })));

/** A stack of three, four or five plates: the screen, its structure and the pay button, and then one or both extra ends. */
export const morphStackLayersTree = (t: Translate, count: 3 | 4 | 5 = 5, state = "auto"): UsageTree => {
  const plates: Plates = { back: screenBack(t), middle: screenMiddle(t), front: screenFront(t) };
  if (count >= 4) plates.nearest = nearestPlate(t);
  if (count === 5) plates.deepest = deepestPlate(t);
  /* Five plates spread twice as far, so the whole stack is given a little more room and a gentler step. */
  return stackOf(state, undefined, hooks({ ...COMPACT, size: count === 5 ? "19rem" : "17rem", gap: count === 5 ? "2rem" : "2.25rem", ...(count === 5 ? { scale: "1" } : {}) }), plates);
};

export const morphStackLayersVariants = (t: Translate): Record<"3" | "4" | "5", UsageTree> => ({
  "3": morphStackLayersTree(t, 3),
  "4": morphStackLayersTree(t, 4),
  "5": morphStackLayersTree(t, 5),
});

/*
 * THE ANATOMY'S SPECIMEN: the stack written open, so that every part is somewhere you can point at. A closed stack has
 * its back plate invisible, and a label cannot point at nothing.
 */
export const morphStackAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}
`;

export const morphStackAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("morphStackPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: morphStackLayersTree(t, 5, "expanded"),
    items: [
      namePart(".sk-morph-stack", "block-start", { mark: "bracket" }),
      namePart(".sk-morph-stack__stage", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-morph-stack__deepest", "inline-start"),
      namePart(".sk-morph-stack__back", "inline-start"),
      namePart(".sk-morph-stack__middle", "inline-end"),
      namePart(".sk-morph-stack__front", "inline-end"),
      namePart(".sk-morph-stack__nearest", "block-end"),
    ],
  },
});
