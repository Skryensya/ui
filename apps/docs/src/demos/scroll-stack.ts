import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

/*
 * SCROLL STACK DEMOS. Every example is a whole story in a box of its own: a scroll box of fixed height that is a size
 * container (the two things a stack needs of whatever scrolls it), holding the stack. The box is part of the
 * tree, so the same example fits the docs card and both Storybooks, in either binding, without a wrapper of each one's own.
 *
 * FOUR DIFFERENT STORIES, because the effect is only worth judging against content that is not always a cover and some
 * prose: a cover and a chapter, a product and what it brings, a summary and two cards that land over it, and a page
 * under a bar that is already fixed. Each back layer has a colour of its own, taken from the status surfaces so that
 * its text keeps its contrast in both schemes: a back layer that is distinctive is one the eye can follow as it recedes.
 */

const heading = (children: string, size: string): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: size, flush: true },
  children,
});

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

/** The hooks an example sets, as the inline style the stack carries. */
const hooks = (values: Record<string, string>): string =>
  Object.entries(values)
    .map(([name, value]) => `--sk-scroll-stack-${name}: ${value};`)
    .join(" ");

/* A layer is the box less the held line: where a floating bar owns a band, a layer that ignored it would run past the point where the stack docks. */
const FIT = "box-sizing: border-box; min-block-size: calc(100cqh - var(--sk-scroll-stack-offset, 0px));";

/** A back layer: a full-box slab in a colour of its own, its words centred. */
const back = (tint: string, ...children: UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "lg" },
  attrs: { style: `${FIT} display: grid; place-content: center; text-align: center; background: var(${tint});` },
  children: stack("sm", ...children),
});

/**
 * The scroll box every example lives in. Two boxes, not one: the OUTER one owns the border and the rounded corners and
 * clips, the inner one only scrolls. With both on a single element a classic scrollbar keeps its square track and pokes
 * out past the curve at the top and bottom corners; clipped by an ancestor with the radius, the track is cut cleanly
 * along the same curve as the border.
 */
const scroller = (label: string, content: UsageTree, extra = ""): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "default", radius: "surface" },
  attrs: { style: "inline-size: 100%; overflow: hidden;" },
  children: {
    contract: "box",
    signature: "Box",
    /* A Box needs one option off its default; `surface` is the one that changes nothing here (the card behind is the same). */
    options: { surface: "surface" },
    attrs: {
      role: "region",
      tabindex: "0",
      "aria-label": label,
      style: `isolation: isolate; inline-size: 100%; block-size: 26rem; overflow: auto; container-type: size; ${extra}`,
    },
    children: content,
  },
});

const stackOf = (rootStyle: string | undefined, backLayer: UsageTree, front: UsageTree | UsageTree[]): UsageTree => ({
  contract: "scroll-stack",
  signature: "ScrollStack",
  ...(rootStyle ? { attrs: { style: rootStyle } } : {}),
  slots: { back: backLayer, front },
});

/** The padding and the space between a prose front layer's children, as hooks: the children are direct children of the content, so each one arrives on its own. */
const PROSE = "--sk-scroll-stack-content-padding: var(--space-inset-lg); --sk-scroll-stack-content-gap: var(--space-stack-md);";

/** A front layer of prose: opaque, as tall as the box (the layer sees to that), its children a heading and what follows it. */
const prose = (...children: UsageTree[]): UsageTree[] => children;

/** 1. A cover, and a chapter that rises over it. */
export const scrollStackTree = (t: Translate): UsageTree =>
  scroller(
    t("demo.scrollStack.cover.label"),
    stackOf(
      PROSE,
      back("--color-bg-accent-subtle", text(t("demo.scrollStack.cover.eyebrow"), { textRole: "eyebrow" }), heading(t("demo.scrollStack.cover.title"), "h2"), text(t("demo.scrollStack.cover.body"), { tone: "secondary" })),
      prose(heading(t("demo.scrollStack.cover.frontTitle"), "h3"), text(t("demo.scrollStack.cover.p1")), text(t("demo.scrollStack.cover.p2"))),
    ),
  );

const feature = (title: UIKey, body: UIKey, t: Translate): UsageTree => stack("xs", text(t(title), { weight: "emphasis" }), text(t(body), { tone: "secondary", size: "sm" }));

/** 2. A product, and what it brings. */
export const scrollStackProductTree = (t: Translate): UsageTree =>
  scroller(
    t("demo.scrollStack.product.label"),
    stackOf(
      PROSE,
      back("--color-bg-warning-subtle", text(t("demo.scrollStack.product.eyebrow"), { textRole: "eyebrow" }), heading(t("demo.scrollStack.product.title"), "h2"), text(t("demo.scrollStack.product.body"), { tone: "secondary" })),
      prose(
        heading(t("demo.scrollStack.product.frontTitle"), "h3"),
        feature("demo.scrollStack.product.f1", "demo.scrollStack.product.f1b", t),
        feature("demo.scrollStack.product.f2", "demo.scrollStack.product.f2b", t),
        feature("demo.scrollStack.product.f3", "demo.scrollStack.product.f3b", t),
      ),
    ),
  );

const product = (name: string, price: string, note: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "default", padding: "md", radius: "surface" },
  children: stack(
    "sm",
    {
      contract: "box",
      signature: "Box",
      options: { surface: "sunken", radius: "control", padding: "md" },
      attrs: { "aria-hidden": "true", style: "aspect-ratio: 4 / 3; display: grid; place-content: center;" },
      children: heading(name.charAt(0), "h2"),
    },
    stack("xs", text(name, { weight: "emphasis" }), text(note, { size: "sm", tone: "secondary" })),
    text(price, { weight: "label" }),
  ),
});

/**
 * 3. A collection that blurs away as three product cards land on it, side by side. The front layer is see-through and
 * casts no shadow: what rises is the cards, and the back layer does the receding on its own, going soft and then clear
 * instead of dim. The box reserves its scrollbar's room on both edges, so the cards sit centred whether or not a bar shows.
 */
export const scrollStackCardsTree = (t: Translate): UsageTree =>
  scroller(
    t("demo.scrollStack.cards.label"),
    stackOf(
      hooks({
        "front-bg": "transparent",
        "front-shadow": "none",
        "recede-blur": "10px",
        "recede-opacity": "0",
        "recede-dim": "0",
      }),
      back("--color-bg-info-subtle", text(t("demo.scrollStack.cards.eyebrow"), { textRole: "eyebrow" }), heading(t("demo.scrollStack.cards.title"), "h2"), text(t("demo.scrollStack.cards.body"), { tone: "secondary" })),
      {
        contract: "box",
        signature: "Box",
        options: { padding: "lg" },
        attrs: { style: `${FIT} display: grid; align-content: center;` },
        children: {
          contract: "layout",
          signature: "Inline",
          options: { gap: "md", equal: true, inlineAlign: "stretch" },
          children: [
            product(t("demo.scrollStack.cards.c1.name"), t("demo.scrollStack.cards.c1.price"), t("demo.scrollStack.cards.c1.note")),
            product(t("demo.scrollStack.cards.c2.name"), t("demo.scrollStack.cards.c2.price"), t("demo.scrollStack.cards.c2.note")),
            product(t("demo.scrollStack.cards.c3.name"), t("demo.scrollStack.cards.c3.price"), t("demo.scrollStack.cards.c3.note")),
          ],
        },
      },
    ),
    "scrollbar-gutter: stable both-edges;",
  );

const FIVE_TINTS = ["--color-bg-accent-subtle", "--color-bg-warning-subtle", "--color-bg-info-subtle", "--color-bg-success-subtle"] as const;

const chapter = (n: 1 | 2 | 3 | 4 | 5, t: Translate) => {
  const key = (part: string) => `demo.scrollStack.five.s${n}.${part}` as UIKey;
  return [text(`${n} / 5`, { textRole: "eyebrow" }), heading(t(key("title")), "h2"), text(t(key("body")), { tone: "secondary" })];
};

/**
 * 4. Five sections. A stack holds exactly two layers, so the longer story is a stack inside the front layer of the one
 * before it: each section covers the previous one the way the first covers nothing, and they all take the same motion.
 */
export const scrollStackFiveTree = (t: Translate): UsageTree => {
  const closing: UsageTree = {
    contract: "box",
    signature: "Box",
    options: { padding: "lg" },
    attrs: { style: `${FIT} display: grid; place-content: center; text-align: center;` },
    children: stack("sm", ...chapter(5, t)),
  };
  const chain = ([3, 2] as const).reduce<UsageTree>(
    (front, n) => stackOf(undefined, back(FIVE_TINTS[n - 1]!, ...chapter(n, t)), front),
    stackOf(undefined, back(FIVE_TINTS[3]!, ...chapter(4, t)), closing),
  );
  return scroller(t("demo.scrollStack.five.label"), stackOf(undefined, back(FIVE_TINTS[0]!, ...chapter(1, t)), chain));
};

/** 5. Under a floating bar: the bar owns its band at the top of the box, and the back layer is held under it while the front layer docks right below, corners still rounded. */
export const scrollStackOffsetTree = (t: Translate): UsageTree =>
  scroller(
    t("demo.scrollStack.offset.label"),
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      children: [
        {
          contract: "box",
          signature: "Box",
          options: { surface: "surface", padding: "lg" },
          attrs: { style: "box-sizing: border-box; border-radius: 0; position: sticky; inset-block-start: 0; z-index: 5; block-size: 3rem; display: flex; align-items: center; border-block-end: 1px solid var(--color-border-subtle);" },
          children: text(t("demo.scrollStack.offset.bar"), { size: "sm", weight: "label" }),
        },
        stackOf(
          `${hooks({ offset: "3rem" })} ${PROSE}`,
          back("--color-bg-success-subtle", text(t("demo.scrollStack.offset.eyebrow"), { textRole: "eyebrow" }), heading(t("demo.scrollStack.offset.title"), "h2"), text(t("demo.scrollStack.offset.body"), { tone: "secondary" })),
          prose(heading(t("demo.scrollStack.offset.frontTitle"), "h3"), text(t("demo.scrollStack.offset.p1")), text(t("demo.scrollStack.offset.p2"))),
        ),
      ],
    },
  );

/*
 * THE ANATOMY'S SPECIMEN: the stack at rest, which is also what a browser without scroll-driven animation shows: two
 * blocks one after the other. The motion is switched off for the drawing (it would otherwise answer to the canvas it is
 * drawn on, not to a reader's scroll) and the runway, invisible by design and as tall as a whole scrolling box, is
 * given a visible 6px strip the height of the front layer so that it has something to point at.
 */
export const scrollStackAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-scroll-stack {
  inline-size: min(100%, 22rem);
}

.sk-annotated__subject .sk-scroll-stack__back,
.sk-annotated__subject .sk-scroll-stack__back::after,
.sk-annotated__subject .sk-scroll-stack__front,
.sk-annotated__subject .sk-scroll-stack__content {
  animation-name: none;
}

.sk-annotated__subject .sk-scroll-stack__back {
  position: relative;
  min-block-size: 0;
}

.sk-annotated__subject .sk-scroll-stack__runway {
  inline-size: 0.375rem;
  block-size: 100%;
  background: var(--color-border-accent);
  border-radius: 0.1875rem;
}
`;

export const scrollStackAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("scrollStackPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: stackOf(
      undefined,
      {
        contract: "box",
        signature: "Box",
        options: { padding: "md" },
        attrs: { style: "display: grid; place-content: center; text-align: center; background: var(--color-bg-accent-subtle);" },
        children: stack("xs", text(t("demo.scrollStack.cover.eyebrow"), { textRole: "eyebrow" }), heading(t("demo.scrollStack.cover.title"), "h4")),
      },
      {
        contract: "box",
        signature: "Box",
        options: { padding: "md" },
        children: stack("xs", heading(t("demo.scrollStack.cover.frontTitle"), "h5"), text(t("demo.scrollStack.cover.p1"), { size: "sm" })),
      },
    ),
    items: [
      namePart(".sk-scroll-stack", "block-start", { mark: "bracket" }),
      namePart(".sk-scroll-stack__back", "inline-start"),
      namePart(".sk-scroll-stack__front", "inline-end"),
      namePart(".sk-scroll-stack__runway", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-scroll-stack__content", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * DO / DON'T. Each half is a still of the MOMENT the rule is about, drawn with plain boxes rather than the component:
 * the component's motion answers to a scroll, and a pair is read in one glance. Every half is the same frame with one
 * thing changed. The frame is a fixed height with the "back" pinned behind and the "front" laid over its lower part,
 * which is exactly what the effect looks like halfway through.
 */
const FRAME = "position: relative; inline-size: 100%; block-size: 9rem; overflow: hidden; border-radius: var(--radius-surface);";
const LAYER = "position: absolute; inset-inline: 0; box-sizing: border-box;";

const slab = (style: string, ...children: UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "md" },
  attrs: { style: `${LAYER} ${style}` },
  children: stack("xs", ...children),
});

const frame = (...layers: UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", radius: "surface" },
  attrs: { style: FRAME },
  children: layers,
});

const backSlab = (t: Translate, extra = ""): UsageTree =>
  slab(
    `inset-block: 0; display: grid; place-content: center; text-align: center; background: var(--color-bg-accent-subtle); ${extra}`,
    heading(t("demo.scrollStack.dd.backTitle"), "h4"),
  );

const frontSlab = (t: Translate, background: string, top = "3.25rem"): UsageTree =>
  slab(
    `inset-block: ${top} 0; background: ${background}; border-start-start-radius: var(--radius-surface); border-start-end-radius: var(--radius-surface);`,
    heading(t("demo.scrollStack.dd.frontTitle"), "h5"),
    text(t("demo.scrollStack.dd.frontBody"), { size: "sm" }),
  );

/** Opaque: the front covers the back, and the back's words are gone. */
export const scrollStackDoOpaqueTree = (t: Translate): UsageTree =>
  frame(backSlab(t), frontSlab(t, "var(--color-bg-surface)"));

/** Transparent and not fading: the back's heading shows through the front's text. */
export const scrollStackDontOpaqueTree = (t: Translate): UsageTree =>
  frame(backSlab(t), frontSlab(t, "transparent"));

/** A back layer that fits its box: heading and line sit whole inside it, before anything covers them. */
export const scrollStackDoFitTree = (t: Translate): UsageTree =>
  frame(
    slab(
      "inset-block: 0; display: grid; align-content: center; background: var(--color-bg-accent-subtle);",
      heading(t("demo.scrollStack.dd.backTitle"), "h4"),
      text(t("demo.scrollStack.dd.long1"), { size: "sm" }),
    ),
  );

/** A back layer taller than its box: it holds still with its second and third paragraphs beyond the edge, never seen. */
export const scrollStackDontFitTree = (t: Translate): UsageTree =>
  frame(
    slab(
      "inset-block-start: 0; background: var(--color-bg-accent-subtle);",
      heading(t("demo.scrollStack.dd.backTitle"), "h4"),
      text(t("demo.scrollStack.dd.long1"), { size: "sm" }),
      text(t("demo.scrollStack.dd.long2"), { size: "sm" }),
      text(t("demo.scrollStack.dd.long3"), { size: "sm" }),
    ),
  );

/** The page's own fixed bar, over everything: a strip across the top of the frame. */
const fixedBar = (t: Translate): UsageTree =>
  slab(
    "inset-block-start: 0; z-index: 2; block-size: 2rem; display: flex; align-items: center; padding-block: 0; background: var(--color-bg-surface-raised, var(--color-bg-surface)); border-block-end: 1px solid var(--color-border-default);",
    text(t("demo.scrollStack.dd.bar"), { size: "sm", weight: "emphasis" }),
  );

/** `--sk-scroll-stack-offset` set to the bar's height: the back layer is held right under it and reads whole. */
export const scrollStackDoOffsetTree = (t: Translate): UsageTree =>
  frame(
    slab(
      "inset-block: 2rem 0; display: grid; place-content: start center; text-align: center; background: var(--color-bg-accent-subtle);",
      heading(t("demo.scrollStack.dd.backTitle"), "h4"),
    ),
    frontSlab(t, "var(--color-bg-surface)", "5.25rem"),
    fixedBar(t),
  );

/** No offset: the back layer is held at the very top, behind the bar, and its heading is covered by it. */
export const scrollStackDontOffsetTree = (t: Translate): UsageTree =>
  frame(
    slab(
      "inset-block: 0; display: grid; place-content: start center; text-align: center; background: var(--color-bg-accent-subtle);",
      heading(t("demo.scrollStack.dd.backTitle"), "h4"),
    ),
    frontSlab(t, "var(--color-bg-surface)", "5.25rem"),
    fixedBar(t),
  );
