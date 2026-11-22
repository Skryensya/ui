import { satin, type SatinTint } from "../lib/satin";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * STRIPCAROUSEL: one story open, the next ones beside it as strips that thin out, the open one's caption
 * underneath (Stripe's news section). Each entry is a picture, a title, a line of text and a link.
 */
const stories = [
  ["blue", "first"],
  ["sage", "second"],
  ["lilac", "third"],
  ["sand", "fourth"],
  ["slate", "fifth"],
  ["graphite", "sixth"],
] as const satisfies readonly (readonly [SatinTint, string])[];

const story = (t: Translate, tint: SatinTint, key: string) => ({
  slots: {
    media: { contract: "image-frame", signature: "ImageFrame", options: { src: satin(tint, "16x9"), alt: "" } },
    title: t(`demo.stripCarousel.${key}.title` as Parameters<Translate>[0]),
    body: t(`demo.stripCarousel.${key}.body` as Parameters<Translate>[0]),
    action: {
      contract: "button",
      signature: "Button.navigation",
      options: { href: "#", variant: "soft", size: "sm" },
      children: t("demo.stripCarousel.action"),
    },
  },
});

const strips = (t: Translate, count: number, heading = true): UsageTree => ({
  contract: "carousel",
  signature: "Carousel.strips",
  options: { mounted: true },
  attrs: { "aria-label": t("demo.stripCarousel.label") },
  slots: {
    ...(heading ? { heading: { contract: "typography", signature: "Heading", options: { headingElement: "h3", flush: true }, children: t("demo.stripCarousel.heading") } } : {}),
    items: stories.slice(0, count).map(([tint, key]) => story(t, tint, key)),
  },
});

export const stripCarouselNewsTree = (t: Translate) => strips(t, 6);
/* Three stories: fewer strips, each one wider. */
export const stripCarouselShortTree = (t: Translate) => strips(t, 3, false);
