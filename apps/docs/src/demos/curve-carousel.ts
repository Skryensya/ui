import { satin, type SatinTint } from "../lib/satin";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * CURVECAROUSEL: the slides on a wheel, seen from outside (`convex`) or from inside (`concave`). It
 * rolls without end and keeps turning after a drag by default, opens on the middle slide, and shows a
 * stepper instead of buttons, so each tree writes only its curve and what it changes.
 */
const tints = ["blue", "sand", "sage", "lilac", "slate", "graphite", "blue", "sand"] as const satisfies readonly SatinTint[];

const picture = (tint: SatinTint, aspect = "3/4"): UsageTree => ({
  contract: "carousel",
  signature: "CarouselSlide",
  children: { contract: "image-frame", signature: "ImageFrame", options: { src: satin(tint, "16x9"), alt: "", aspect, radius: "surface" } },
});

const ring = (t: Translate, curve: "convex" | "concave", extra: Record<string, unknown> = {}, aspect = "3/4"): UsageTree => ({
  contract: "carousel",
  signature: "Carousel.curve",
  options: { mounted: true, curve, ...extra },
  attrs: { "aria-label": t("demo.curveCarousel.label") },
  children: tints.map((tint) => picture(tint, aspect)),
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
/* Taller cards: portrait slides the pictures fill. */
export const curveCarouselTallTree = (t: Translate) => ring(t, "concave", { tall: true });
/* One in focus: a large slide, the one before and the one after peeking at the sides. */
export const curveCarouselFocusTree = (t: Translate) => ring(t, "concave", { focus: true, bend: true, fade: true }, "16/9");
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

/* DO / DON'T pairs for the guidelines. */
const slideOf = (children: UsageTree | UsageTree[]): UsageTree => ({ contract: "carousel", signature: "CarouselSlide", children });
const wheel = (t: Translate, slides: UsageTree[]): UsageTree => ({
  contract: "carousel",
  signature: "Carousel.curve",
  options: { mounted: true, curve: "concave" },
  attrs: { "aria-label": t("demo.curveCarousel.label") },
  children: slides,
});
const caption = (text: string): UsageTree => ({ contract: "typography", signature: "Text", options: { size: "sm" }, children: text });

/* One piece per slide: the cards tree is already the right answer. */
export const curveCarouselDoOnePieceTree = curveCarouselCardsTree;
/* Two loose things per slide: the picture and its title turn as separate pieces. */
export const curveCarouselDontOnePieceTree = (t: Translate) =>
  wheel(
    t,
    launches.map((position, index) =>
      slideOf([
        { contract: "image-frame", signature: "ImageFrame", options: { src: satin(tints[index]!, "4x3"), alt: "", aspect: "4/3", radius: "surface" } },
        caption(t(`demo.curveCarousel.card.${position}` as never)),
      ]),
    ),
  );

/* One proportion, so the ring reads as one. */
export const curveCarouselDoSameAspectTree = curveCarouselConcaveTree;
/* Mixed proportions: the ring breaks into uneven pieces. */
const aspects = ["3/4", "16/9", "1/1", "3/4", "16/9", "1/1", "3/4", "16/9"] as const;
export const curveCarouselDontSameAspectTree = (t: Translate) => wheel(t, tints.map((tint, index) => picture(tint, aspects[index])));

/* Pictures, not paragraphs: a turned slide can only be glanced at. */
export const curveCarouselDoPicturesTree = curveCarouselConcaveTree;
export const curveCarouselDontTextTree = (t: Translate) =>
  wheel(
    t,
    launches.map((position, index) =>
      slideOf({
        contract: "box",
        signature: "Box",
        options: { surface: "surface", border: "subtle", padding: "none" },
        children: [
          { contract: "image-frame", signature: "ImageFrame", options: { src: satin(tints[index]!, "4x3"), alt: "", aspect: "16/9", radius: "top" } },
          {
            contract: "box",
            signature: "Box",
            options: { padding: "md" },
            children: [
              { contract: "typography", signature: "Text", options: { weight: "label" }, children: t(`demo.curveCarousel.card.${position}` as never) },
              caption(t("demo.curveCarousel.longText" as never)),
            ],
          },
        ],
      }),
    ),
  );

/* Enough slides to make a ring: six or more. */
export const curveCarouselDoCountTree = curveCarouselConcaveTree;
export const curveCarouselDontCountTree = (t: Translate) => wheel(t, tints.slice(0, 3).map((tint) => picture(tint)));

/* Both sides dissolve; without it the end slides are cut by the edge. */
export const curveCarouselDoFadeTree = curveCarouselFadeTree;
export const curveCarouselDontFadeTree = curveCarouselConcaveTree;

/* A lens you can still read: up to about 2, not the 2.5 limit on a convex ring. */
export const curveCarouselDoLensTree = curveCarouselStrongTree;
export const curveCarouselDontLensTree = (t: Translate) => ring(t, "convex", { curveStrength: 2.5 });
