import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/**
 * Offline media every demo on the MediaOverlay page uses: the Lightbox demos' fjord photo. A real
 * photograph is what the wash is for, and its bright sky and dark water are the case where legible
 * type over an image needs the gradient.
 */
export const DEMO_MEDIA_OVERLAY_SRC = "/demos/lightbox/fjord.jpg";

/*
 * Both demos convert once ImageFrame grew a `caption` slot: the wash is not a second media source,
 * so `src` and MediaOverlay can sit together without breaking `exactlyOneOf`.
 *
 * Edge labels (`bottom`, `top`, …) stay written: they are the option values the page is teaching.
 */

/** Box + ImageFrame + caption wash: a card with type on the photo and body below. */
export const mediaOverlayCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "none" },
  children: [
    {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9", radius: "top", src: DEMO_MEDIA_OVERLAY_SRC, alt: "" },
      slots: {
        caption: {
          contract: "media-overlay",
          signature: "MediaOverlay",
          options: { edge: "bottom" },
          children: [
            {
              contract: "media-overlay",
              signature: "MediaOverlayShade",
              options: { strength: "strong" },
            },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: t("demo.mediaOverlay.title"),
            },
            {
              contract: "typography",
              signature: "Text",
              children: t("demo.mediaOverlay.caption"),
            },
          ],
        },
      },
    },
    {
      contract: "box",
      signature: "Box",
      options: { padding: "md" },
      children: {
        contract: "typography",
        signature: "Text",
        options: { size: "sm", tone: "secondary" },
        children: t("demo.mediaOverlay.body"),
      },
    },
  ],
});

function edgeFrame(
  edge: "top" | "bottom" | "start" | "end",
  strength: "subtle" | "moderate" | "strong" = "moderate",
  label: string = edge,
): UsageTree {
  return {
    contract: "image-frame",
    signature: "ImageFrame",
    options: { aspect: "4/3", src: DEMO_MEDIA_OVERLAY_SRC, alt: "" },
    slots: {
      caption: {
        contract: "media-overlay",
        signature: "MediaOverlay",
        options: { edge },
        children: [
          {
            contract: "media-overlay",
            signature: "MediaOverlayShade",
            options: { strength },
          },
          label,
        ],
      },
    },
  };
}

/** Same wash, four edges: the band follows the caption box, not a percentage of the photo. */
export const mediaOverlayEdgesTree = (): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "md" },
  children: [edgeFrame("bottom"), edgeFrame("top"), edgeFrame("start"), edgeFrame("end")],
});

/** Same edge, three strengths: more opacity and tint, never more of the photo covered. */
export const mediaOverlayStrengthsTree = (): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  children: (["subtle", "moderate", "strong"] as const).map((strength) => edgeFrame("bottom", strength, strength)),
});

/** The frame, the caption that sets the measure and the wash inside it. */
export const mediaOverlayAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("mediaOverlay.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9", src: DEMO_MEDIA_OVERLAY_SRC, alt: "" },
      attrs: { style: "inline-size: 24rem; max-inline-size: 100%;" },
      slots: {
        caption: {
          contract: "media-overlay",
          signature: "MediaOverlay",
          options: { edge: "bottom" },
          children: [
            { contract: "media-overlay", signature: "MediaOverlayShade", options: { strength: "strong" } },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: t("demo.mediaOverlay.title"),
            },
          ],
        },
      },
    },
    items: [
      namePart(".sk-image-frame", "block-start", { mark: "bracket" }),
      namePart(".sk-media-overlay", "inline-end", { mark: "bracket" }),
      namePart(".sk-media-overlay-shade", "block-end"),
    ],
  },
});

/*
 * USAGE GUIDE. Both pairs use the same photo and the same frame, so the only thing that differs is
 * what the rule is about: how much text rides on the photo, and whether the veil is there at all.
 * The photo is the bright-sky one on purpose: it is where a missing veil is plain to see.
 */
const heading = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Heading",
  options: { headingSize: "h4", flush: true },
  children: t("demo.mediaOverlay.title"),
});

const captionFrame = (children: UsageTree[], shade: boolean, strength: "subtle" | "moderate" | "strong" = "strong", edge: "top" | "bottom" = "bottom"): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: { aspect: "4/3", radius: "surface", src: DEMO_MEDIA_OVERLAY_SRC, alt: "" },
  slots: {
    caption: {
      contract: "media-overlay",
      signature: "MediaOverlay",
      options: { edge },
      children: shade
        ? [{ contract: "media-overlay", signature: "MediaOverlayShade", options: { strength } }, ...children]
        : children,
    },
  },
});

/** Do: a short title and one line. */
export const mediaOverlayDoShortTextTree = (t: Translate): UsageTree =>
  captionFrame([heading(t), { contract: "typography", signature: "Text", children: t("demo.mediaOverlay.caption") }], true);

/** Don't: a paragraph on the photo, which the veil has to grow to cover. */
export const mediaOverlayDontLongTextTree = (t: Translate): UsageTree =>
  captionFrame([heading(t), { contract: "typography", signature: "Text", children: t("demo.mediaOverlay.long") }], true);

/** Do: the veil under the text. */
export const mediaOverlayDoShadeTree = (t: Translate): UsageTree => captionFrame([heading(t)], true);

/** Don't: the same title with no veil, white type on a bright sky. */
export const mediaOverlayDontNoShadeTree = (t: Translate): UsageTree => captionFrame([heading(t)], false);

/** Do: a strong veil under light type, on the photo's bright sky (the top edge). */
export const mediaOverlayDoStrengthTree = (t: Translate): UsageTree => captionFrame([heading(t)], true, "strong", "top");

/** Don't: a subtle veil on that same sky: the type has almost nothing to stand on. */
export const mediaOverlayDontStrengthTree = (t: Translate): UsageTree => captionFrame([heading(t)], true, "subtle", "top");
