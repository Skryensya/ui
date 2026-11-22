import { satin, type SatinTint } from "../lib/satin";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * CURVECAROUSEL: the slides on a wheel, seen from outside (`convex`) or from inside (`concave`). It
 * rolls without end and keeps turning after a drag by default, opens on the middle slide, and shows a
 * stepper instead of buttons, so each tree writes only its curve and what it changes.
 */
const tints = ["blue", "sand", "sage", "lilac", "slate", "graphite", "blue", "sand"] as const satisfies readonly SatinTint[];

const picture = (tint: SatinTint): UsageTree => ({
  contract: "carousel",
  signature: "CarouselSlide",
  children: { contract: "image-frame", signature: "ImageFrame", options: { src: satin(tint, "4x3"), alt: "", aspect: "3/4", radius: "surface" } },
});

const ring = (t: Translate, curve: "convex" | "concave", extra: Record<string, unknown> = {}): UsageTree => ({
  contract: "carousel",
  signature: "Carousel.curve",
  options: { mounted: true, curve, ...extra },
  attrs: { "aria-label": t("demo.curveCarousel.label") },
  children: tints.map(picture),
});

export const curveCarouselConvexTree = (t: Translate) => ring(t, "convex");
export const curveCarouselConcaveTree = (t: Translate) => ring(t, "concave");
/* The sides fade out with FadeEdge (the carousel's `fade`), so the ring dissolves instead of being cut. */
export const curveCarouselFadeTree = (t: Translate) => ring(t, "concave", { fade: true });
/* Each picture bends along the ring: its top and bottom edges arc, the wide-lens look. */
export const curveCarouselBentTree = (t: Translate) => ring(t, "concave", { bend: true, fade: true });
/* Autoplay: the stepper's current segment fills with the time left; hover or focus pauses it. */
export const curveCarouselAutoplayTree = (t: Translate) => ring(t, "concave", { autoplay: true });
/* Ends and no glide: the wheel stops at the first and the last slide and settles as soon as it is let go. */
export const curveCarouselFiniteTree = (t: Translate) => ring(t, "convex", { infinite: "off", momentum: "off" });
/* A stronger lens: the ends grow twice as much. */
export const curveCarouselStrongTree = (t: Translate) => ring(t, "concave", { curveStrength: 2 });

/* A slide holds ONE thing for the curve to turn: here a card (picture and title in one Box), not two. */
const launches = ["first", "second", "third", "fourth", "fifth", "sixth"] as const;

export const curveCarouselCardsTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel.curve",
  options: { mounted: true, curve: "convex" },
  attrs: { "aria-label": t("demo.curveCarousel.cards.label") },
  children: launches.map((position, index) => ({
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "none" },
      children: [
        { contract: "image-frame", signature: "ImageFrame", options: { src: satin(tints[index]!, "4x3"), alt: "", aspect: "4/3", radius: "top" } },
        {
          contract: "box",
          signature: "Box",
          options: { padding: "md" },
          children: { contract: "typography", signature: "Text", options: { weight: "label" }, children: t(`demo.curveCarousel.card.${position}` as never) },
        },
      ],
    },
  })),
});
