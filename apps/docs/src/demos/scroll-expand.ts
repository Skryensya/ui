import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

/*
 * SCROLL EXPAND DEMOS. Every example is a whole story in a scroll box of its own: a box of fixed height that is a size
 * container (the two things the component needs of whatever scrolls it), holding the component. The box is part of the
 * tree, so the same example fits the docs card and both Storybooks without a wrapper of each one's own.
 *
 * TWO KINDS OF WORDS, AND NEITHER IS THE COMPONENT'S. The BIG words stand above the window before it opens and are a
 * heading in the lead slot: the component fades its box as the container opens. The SMALL words are the `reveal` slot: they
 * are not on screen in the small window and arrive, one after another, as it opens. What FILLS the container (`children`)
 * is the backdrop, there from the first frame: a photo, a tinted slab.
 *
 * The photos are the ones the Lightbox demos use, kept under `public/demos/lightbox/` so the demos and the gates work
 * offline.
 */

const heading = (children: string | UsageTree, size: string): UsageTree => ({
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

/** The big words: one display heading in the lead. The component fades its box; the words are the demo's. */
const lead = (start: string, end?: string): UsageTree => heading(end === undefined ? start : `${start} ${end}`, "display-md");

/** The wash behind revealed words over a photo. The same in both colour schemes on purpose, as the white of the words is: a photo does not change with the theme. */
const SCRIM = "--sk-scroll-expand-scrim: color-mix(in srgb, var(--palette-stone-950) 42%, transparent);";

/** What fills the container: a photo. `ImageFrame` square and unrounded, because the component owns the window. */
const photo = (name: string, alt: string): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: { src: `/demos/lightbox/${name}.jpg`, alt, aspect: "auto", fit: "cover", radius: "none" },
});

/** Words over a photo: white, whatever the scheme. Each is its own child of the reveal, so each arrives after the one before. */
const onMedia = (tree: UsageTree): UsageTree => ({ ...tree, attrs: { ...tree.attrs, style: "color: var(--color-text-on-media);" } });

/** The container's own words: an eyebrow, a title and a line, three children of the reveal. */
const caption = (eyebrow: string, title: string, body: string): UsageTree[] => [
  onMedia({ contract: "typography", signature: "Text", options: { textRole: "eyebrow" }, children: eyebrow }),
  onMedia({ contract: "typography", signature: "Heading", options: { headingSize: "h3", flush: true }, children: title }),
  onMedia({ contract: "typography", signature: "Text", options: { size: "sm" }, children: body }),
];

const after = (title: string, ...paragraphs: string[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "lg" },
  children: stack("md", heading(title, "h3"), ...paragraphs.map((p) => text(p))),
});

/** The scroll box every example lives in; see ScrollStack's demos for why it is two boxes. */
const scroller = (label: string, content: UsageTree): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "default", radius: "surface" },
  attrs: { style: "inline-size: 100%; overflow: hidden;" },
  children: {
    contract: "box",
    signature: "Box",
    options: { surface: "surface" },
    attrs: {
      role: "region",
      tabindex: "0",
      "aria-label": label,
      style: "isolation: isolate; inline-size: 100%; block-size: 28rem; overflow: auto; container-type: size;",
    },
    children: content,
  },
});

const expand = (rootStyle: string | undefined, slots: Record<string, UsageTree | UsageTree[]>, options: Record<string, string> = {}): UsageTree => ({
  contract: "scroll-expand",
  signature: "ScrollExpand",
  options,
  ...(rootStyle ? { attrs: { style: rootStyle } } : {}),
  slots,
});

const k = (name: string) => `demo.scrollExpand.${name}` as UIKey;

/** 1. A photo with its own words, and big words above that part as it opens. */
export const scrollExpandTree = (t: Translate): UsageTree =>
  scroller(
    t(k("fjord.label")),
    expand(SCRIM, {
      lead: lead(t(k("fjord.start")), t(k("fjord.end"))),
      children: photo("fjord", t(k("fjord.alt"))),
      reveal: caption(t(k("fjord.eyebrow")), t(k("fjord.title")), t(k("fjord.body"))),
      after: after(t(k("fjord.afterTitle")), t(k("fjord.p1")), t(k("fjord.p2"))),
    }),
  );

const stat = (value: string, label: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "default", padding: "sm", radius: "control" },
  attrs: { style: "text-align: center;" },
  children: stack("xs", heading(value, "h4"), text(label, { size: "sm", tone: "secondary" })),
});

/** 2. The container is not a picture: a piece of interface, with its own words, opens the same way. */
export const scrollExpandInterfaceTree = (t: Translate): UsageTree =>
  scroller(
    t(k("ui.label")),
    expand("--sk-scroll-expand-inset-inline: 16%; --sk-scroll-expand-inset-block: 28%;", {
      lead: lead(t(k("ui.start")), t(k("ui.end"))),
      children: {
        contract: "box",
        signature: "Box",
        options: { padding: "lg" },
        attrs: { style: "box-sizing: border-box; inline-size: 100%; block-size: 100%; background: var(--color-bg-accent-subtle);" },
        children: text(" ", { size: "sm" }),
      },
      reveal: [
        stack("xs", text(t(k("ui.eyebrow")), { textRole: "eyebrow" }), heading(t(k("ui.title")), "h4")),
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", equal: true, inlineAlign: "stretch" },
          children: [stat("128", t(k("ui.s1"))), stat("94%", t(k("ui.s2"))), stat("3 min", t(k("ui.s3")))],
        },
      ],
      after: after(t(k("ui.afterTitle")), t(k("ui.p1"))),
    }),
  );

/** 3. One short lead that stays where it is and fades, a wider first window and square corners: hooks, not options. */
export const scrollExpandWideTree = (t: Translate): UsageTree =>
  scroller(
    t(k("coast.label")),
    expand(`${SCRIM} --sk-scroll-expand-inset-block: 24%; --sk-scroll-expand-inset-inline: 14%; --sk-scroll-expand-radius: 0px; --sk-scroll-expand-reveal-shift: 0px; --sk-scroll-expand-reveal-blur: 0px;`, {
      lead: lead(t(k("coast.start"))),
      children: photo("coast", t(k("coast.alt"))),
      reveal: caption(t(k("coast.eyebrow")), t(k("coast.title")), t(k("coast.body"))),
      after: after(t(k("coast.afterTitle")), t(k("coast.p1"))),
    }),
  );

/** 4. The opposite: it starts full and closes to the window as you scroll, and the big words come back. */
export const scrollExpandContractTree = (t: Translate): UsageTree =>
  scroller(
    t(k("camp.label")),
    expand(
      SCRIM,
      {
        lead: lead(t(k("camp.start")), t(k("camp.end"))),
        children: photo("snow-camp", t(k("camp.alt"))),
        reveal: caption(t(k("camp.eyebrow")), t(k("camp.title")), t(k("camp.body"))),
        after: after(t(k("camp.afterTitle")), t(k("camp.p1"))),
      },
      { direction: "contract" },
    ),
  );

/*
 * THE ANATOMY'S SPECIMEN: the component at rest, which is also what a browser without scroll-driven animation shows:
 * the lead, the container at full size and what follows. The motion is off for the drawing, and the clock, invisible by
 * design and a whole scrolling box tall, is drawn as a 6px strip so it has something to point at.
 */
export const scrollExpandAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-scroll-expand {
  inline-size: min(100%, 22rem);
}

.sk-annotated__subject .sk-scroll-expand__clock {
  display: block;
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: 0.375rem;
  background: var(--color-border-accent);
  border-radius: 0.1875rem;
}

.sk-annotated__subject .sk-scroll-expand__container {
  aspect-ratio: 16 / 8;
}

.sk-annotated__subject .sk-scroll-expand__lead {
  padding-block: var(--space-inset-md);
}
`;

export const scrollExpandAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("scrollExpandPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: expand(SCRIM, {
      lead: heading(`${t(k("fjord.start"))} ${t(k("fjord.end"))}`, "h4"),
      children: photo("fjord", t(k("fjord.alt"))),
      reveal: [onMedia({ contract: "typography", signature: "Heading", options: { headingSize: "h5", flush: true }, children: t(k("fjord.title")) })],
      after: text(t(k("fjord.p1")), { size: "sm" }),
    }),
    items: [
      namePart(".sk-scroll-expand", "block-start", { mark: "bracket" }),
      namePart(".sk-scroll-expand__track", "inline-start", { mark: "bracket" }),
      namePart(".sk-scroll-expand__clock", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-scroll-expand__stage", "inline-end", { mark: "bracket" }),
      namePart(".sk-scroll-expand__lead", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-scroll-expand__container", "block-end", { mark: "bracket" }),
      namePart(".sk-scroll-expand__backdrop", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-scroll-expand__reveal", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-scroll-expand__after", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * DO / DON'T. Each half is a still of the FIRST frame, the small window, drawn with the same clip the component opens
 * from: its motion answers to a scroll and a pair is read at a glance. The pair differs only in where the words are.
 */
const WINDOW = "clip-path: inset(30% 32% round var(--radius-surface));";

const still = (words: UsageTree | undefined, t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", radius: "surface" },
  attrs: { style: "position: relative; inline-size: 100%; block-size: 9rem; overflow: hidden;" },
  children: {
    contract: "box",
    signature: "Box",
    /* A Box needs one option off its default; `surface` is the one that changes nothing here (the box behind is the same). */
    options: { surface: "surface" },
    attrs: { style: `position: absolute; inset: 0; display: grid; ${WINDOW}` },
    children: [
      photo("fjord", t(k("fjord.alt"))),
      ...(words
        ? [
            {
              contract: "box",
              signature: "Box",
              options: { padding: "sm" },
              attrs: { style: "position: absolute; inset: 0; display: grid; place-content: end center; text-align: center; background: color-mix(in srgb, var(--palette-stone-950) 42%, transparent);" },
              children: words,
            } satisfies UsageTree,
          ]
        : []),
    ],
  },
});

/** The words are in the reveal: the small window shows only the picture, and they arrive as it opens. */
export const scrollExpandDoCentreTree = (t: Translate): UsageTree => still(undefined, t);

/** The words are baked into the picture: they are on screen from the first frame, and the small window cuts them off. */
export const scrollExpandDontCentreTree = (t: Translate): UsageTree => still(onMedia(heading(t(k("fjord.title")), "h5")), t);
