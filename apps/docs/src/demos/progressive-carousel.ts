import { satin, type SatinTint } from "../lib/satin";
import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * PROGRESSIVECAROUSEL: a circular row of stories whose widths shrink progressively, the active one first,
 * its caption underneath. Each entry is a picture, a title, a line of text and a link.
 */
const stories = [
  ["blue", "first"],
  ["sage", "second"],
  ["lilac", "third"],
  ["sand", "fourth"],
  ["slate", "fifth"],
  ["graphite", "sixth"],
  ["lilac", "seventh"],
  ["sage", "eighth"],
  ["blue", "ninth"],
] as const satisfies readonly (readonly [SatinTint, string])[];

const story = (t: Translate, tint: SatinTint, key: string) => ({
  slots: {
    media: { contract: "image-frame", signature: "ImageFrame", options: { src: satin(tint, "16x9"), alt: "" } },
    title: t(`demo.progressiveCarousel.${key}.title` as Parameters<Translate>[0]),
    body: t(`demo.progressiveCarousel.${key}.body` as Parameters<Translate>[0]),
    action: {
      contract: "button",
      signature: "Button.navigation",
      options: { href: "#", variant: "soft", size: "sm" },
      children: t("demo.progressiveCarousel.action"),
    },
  },
});

const shell = (t: Translate, items: ItemInput[], { heading = true, options = {}, specimen = false }: { heading?: boolean; options?: Record<string, unknown>; specimen?: boolean } = {}): UsageTree => ({
  contract: "carousel",
  signature: "Carousel.progressive",
  options: { mounted: true, ...options },
  // A do/don't specimen is drawn at its natural size, and the row has none of its own: it gets a desktop width.
  attrs: { "aria-label": t("demo.progressiveCarousel.label"), ...(specimen ? { style: "inline-size: 48rem" } : {}) },
  slots: {
    ...(heading ? { heading: { contract: "typography", signature: "Heading", options: { headingElement: "h3", flush: true }, children: t("demo.progressiveCarousel.heading") } } : {}),
    items,
  },
});

const strips = (t: Translate, count: number, heading = true, options: Record<string, unknown> = {}, specimen = false): UsageTree =>
  shell(t, Array.from({ length: count }, (_, i) => story(t, stories[i % stories.length]![0], stories[i % stories.length]![1])), { heading, options, specimen });

export const progressiveCarouselNewsTree = (t: Translate) => strips(t, 9);
/* Three stories: fewer strips, each one wider. */
export const progressiveCarouselShortTree = (t: Translate) => strips(t, 3, false);
/* Opens on the third: it comes first, and the two before it wait at the end of the loop. */
export const progressiveCarouselMiddleTree = (t: Translate) => strips(t, 6, true, { defaultPage: 2 });

/* DO / DON'T pairs for the guidelines. */
/* The picture is only a picture; its words go in the caption, where a strip cannot cut them. */
export const progressiveCarouselDoPictureTree = (t: Translate) => strips(t, 5, false, {}, true);
export const progressiveCarouselDontPictureTree = (t: Translate) =>
  shell(
    t,
    stories.slice(0, 5).map(([, key]) => ({
      slots: {
        media: {
          contract: "box",
          signature: "Box",
          options: { surface: "sunken", padding: "lg" },
          children: { contract: "typography", signature: "Heading", options: { headingElement: "h4", flush: true }, children: t(`demo.progressiveCarousel.${key}.title` as Parameters<Translate>[0]) },
        },
        title: t(`demo.progressiveCarousel.${key}.title` as Parameters<Translate>[0]),
      },
    })),
    { heading: false, specimen: true },
  );
/* Several stories; one alone is not a carousel. */
export const progressiveCarouselDoCountTree = (t: Translate) => strips(t, 6, false, {}, true);
export const progressiveCarouselDontCountTree = (t: Translate) => strips(t, 1, false, {}, true);
/* Under the picture: a short title, one line and one link. A paragraph pushes the page down at every turn. */
export const progressiveCarouselDoCaptionTree = (t: Translate) => strips(t, 4, false, {}, true);
export const progressiveCarouselDontCaptionTree = (t: Translate) =>
  shell(
    t,
    stories.slice(0, 4).map(([tint, key]) => {
      const entry = story(t, tint, key);
      return { slots: { ...entry.slots, body: t("demo.progressiveCarousel.longBody") } };
    }),
    { heading: false, specimen: true },
  );
