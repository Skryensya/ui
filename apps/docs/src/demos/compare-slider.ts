import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

/*
 * COMPARE DEMOS. Every example is two layers of the SAME box, because a comparison only works when what is on one side of
 * the divider lines up with what is on the other. Photos are the ones the Lightbox demos use (kept under
 * `public/demos/lightbox/` so the demos and the gates work offline) at one aspect ratio, so both layers measure alike; the
 * "before" is the same photo put through a CSS filter, which is what an edit is and keeps the two registered pixel for pixel.
 */

const k = (name: string) => `demo.compareSlider.${name}` as UIKey;

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

/** A layer that is a photo, filling its box. `filter` is the edit. */
const photo = (name: string, alt: string, filter?: string): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: { src: `/demos/lightbox/${name}.jpg`, alt, aspect: "3/2", fit: "cover", radius: "none" },
  ...(filter ? { attrs: { style: `filter: ${filter};` } } : {}),
});

const compare = (label: string, before: UsageTree, after: UsageTree, options: Record<string, string | number> = {}, rootStyle?: string): UsageTree => ({
  contract: "compare-slider",
  signature: "CompareSlider",
  options: { label, ...options },
  ...(rootStyle ? { attrs: { style: rootStyle } } : {}),
  slots: { before, after },
});

/** 1. A photo and the same photo before the edit. */
export const compareSliderTree = (t: Translate): UsageTree =>
  compare(
    t(k("coast.label")),
    photo("coast", t(k("coast.beforeAlt")), "grayscale(1) contrast(0.9) brightness(0.95)"),
    photo("coast", t(k("coast.afterAlt"))),
  );

/**
 * One version of an interface: a surface with a title, a price and a line. Plain text, because a press on the box is the
 * divider's. The old one reads from the start and the new one from the end, so each stays readable on its own side of the
 * divider: two layers centred in the same place would hide one behind the other.
 */
const version = (surface: string, title: string, price: string, line: string, side: "start" | "end", extra = "", action?: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface, padding: "lg" },
  attrs: {
    style: `box-sizing: border-box; inline-size: 100%; block-size: 100%; aspect-ratio: 3 / 2; display: grid; place-content: center ${side}; text-align: ${side}; ${extra}`,
  },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    /* Each item takes its own width and sits on the layer's side, so a button is a button and not a bar across the box. */
    attrs: { style: `justify-items: ${side};` },
    children: [
      text(title, { textRole: "eyebrow" }),
      heading(price, "display-sm"),
      text(line, { size: "sm", tone: "secondary" }),
      ...(action ? [{ contract: "button", signature: "Button.action", options: { variant: "soft" }, children: action } satisfies UsageTree] : []),
    ],
  },
});

/** 2. A layer is a box, not an image: two versions of the same interface, the old one and the new one. */
export const compareSliderInterfaceTree = (t: Translate): UsageTree =>
  compare(
    t(k("ui.label")),
    version("sunken", t(k("ui.beforeTitle")), t(k("ui.beforePrice")), t(k("ui.beforeLine")), "start"),
    version("raised", t(k("ui.afterTitle")), t(k("ui.afterPrice")), t(k("ui.afterLine")), "end", "background: var(--color-bg-accent-subtle);"),
  );

/** 3. Stacked, starting nearer the top: the same place by day and by night. */
export const compareSliderVerticalTree = (t: Translate): UsageTree =>
  compare(
    t(k("fjord.label")),
    photo("fjord", t(k("fjord.beforeAlt")), "brightness(0.42) saturate(0.7) hue-rotate(-14deg)"),
    photo("fjord", t(k("fjord.afterAlt"))),
    { direction: "vertical", position: 35 },
  );

/* The anatomy's specimen: the component as it is, the divider and its thumb drawn on it. */
export const compareSliderAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-compare-slider {
  inline-size: min(100%, 24rem);
}
`;

export const compareSliderAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("compareSliderPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: compare(
      t(k("coast.label")),
      photo("coast", t(k("coast.beforeAlt")), "grayscale(1) contrast(0.9) brightness(0.95)"),
      photo("coast", t(k("coast.afterAlt"))),
    ),
    items: [
      namePart(".sk-compare-slider", "block-start", { mark: "bracket" }),
      namePart(".sk-compare-slider__before", "inline-start", { mark: "bracket" }),
      namePart(".sk-compare-slider__after", "inline-end", { mark: "bracket" }),
      namePart(".sk-compare-slider__handle", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-compare-slider__grip", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/*
 * DO / DON'T, three pairs, one lesson each. A half is emitted as static markup and never hydrated, so nothing here moves:
 * the divider is where each example puts it, and a position is written as the variable the stylesheet reads
 * (`--sk-compare-slider-position`) because the enhancer that would turn the `position` option into that variable does not run.
 */
const at = (percent: number) => `--sk-compare-slider-position: ${percent};`;

/** 1. What the two layers are. The same subject at the same size shows ONE thing changing; two different pictures show two things that do not line up. */
export const compareSliderDoRegisteredTree = (t: Translate): UsageTree =>
  compare(
    t(k("coast.label")),
    photo("coast", t(k("coast.beforeAlt")), "grayscale(1) contrast(0.9) brightness(0.95)"),
    photo("coast", t(k("coast.afterAlt"))),
    {},
    at(50),
  );

export const compareSliderDontRegisteredTree = (t: Translate): UsageTree =>
  compare(t(k("coast.label")), photo("waterfall", t(k("waterfall.alt"))), photo("coast", t(k("coast.afterAlt"))), {}, at(50));

/**
 * 2. What is inside a layer. Plain text and pictures can be read from either side; a button cannot be pressed, since a press
 * anywhere on the box is the divider's. The button is in ONE layer, the one on the far side, so it crosses the divider and
 * shows what the clip does to it, instead of two buttons stacked on each other.
 */
const versions = (t: Translate, withActions: boolean): [UsageTree, UsageTree] => [
  version("sunken", t(k("ui.beforeTitle")), t(k("ui.beforePrice")), t(k("ui.beforeLine")), "start", "", undefined),
  version("raised", t(k("ui.afterTitle")), t(k("ui.afterPrice")), t(k("ui.afterLine")), "end", "background: var(--color-bg-accent-subtle);", withActions ? t(k("ui.afterAction")) : undefined),
];

export const compareSliderDoStaticTree = (t: Translate): UsageTree => compare(t(k("ui.label")), ...versions(t, false), {}, at(50));

export const compareSliderDontStaticTree = (t: Translate): UsageTree => compare(t(k("ui.label")), ...versions(t, true), {}, at(50));

/** 3. Where it starts. In the middle both layers are on screen, so the reader sees there is something to compare; at an end it looks like one picture. */
const night = (t: Translate): [UsageTree, UsageTree] => [
  photo("fjord", t(k("fjord.beforeAlt")), "brightness(0.42) saturate(0.7) hue-rotate(-14deg)"),
  photo("fjord", t(k("fjord.afterAlt"))),
];

export const compareSliderDoStartTree = (t: Translate): UsageTree => compare(t(k("fjord.label")), ...night(t), {}, at(50));

export const compareSliderDontStartTree = (t: Translate): UsageTree => compare(t(k("fjord.label")), ...night(t), { position: 0 }, at(0));
