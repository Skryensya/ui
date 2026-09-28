import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/** Offline media every demo on the MediaGradient page uses. */
export const DEMO_MEDIA_GRADIENT_SRC = "/demos/media-gradient.svg";

/*
 * Both demos convert once ImageFrame grew a `caption` slot: the wash is not a second media source,
 * so `src` and MediaCaption can sit together without breaking `exactlyOneOf`.
 *
 * Edge labels (`bottom`, `top`, …) stay written: they are the option values the page is teaching.
 */

/** Box + ImageFrame + caption wash: a card with type on the photo and body below. */
export const mediaGradientCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "none" },
  children: [
    {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9", radius: "top", src: DEMO_MEDIA_GRADIENT_SRC, alt: "" },
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          options: { edge: "bottom" },
          children: [
            {
              contract: "media-gradient",
              signature: "MediaGradient",
              options: { strength: "lg" },
            },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: t("demo.mediaGradient.title"),
            },
            {
              contract: "typography",
              signature: "Text",
              children: t("demo.mediaGradient.caption"),
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
        children: t("demo.mediaGradient.body"),
      },
    },
  ],
});

function edgeFrame(
  edge: "top" | "bottom" | "start" | "end",
  strength: "sm" | "md" | "lg" = "md",
  label: string = edge,
): UsageTree {
  return {
    contract: "image-frame",
    signature: "ImageFrame",
    options: { aspect: "4/3", src: DEMO_MEDIA_GRADIENT_SRC, alt: "" },
    slots: {
      caption: {
        contract: "media-gradient",
        signature: "MediaCaption",
        options: { edge },
        children: [
          {
            contract: "media-gradient",
            signature: "MediaGradient",
            options: { strength },
          },
          label,
        ],
      },
    },
  };
}

/** Same wash, four edges: the band follows the caption box, not a percentage of the photo. */
export const mediaGradientEdgesTree = (): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "md" },
  children: [edgeFrame("bottom"), edgeFrame("top"), edgeFrame("start"), edgeFrame("end")],
});

/** Same edge, three strengths: more opacity and tint, never more of the photo covered. */
export const mediaGradientStrengthsTree = (): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md" },
  children: (["sm", "md", "lg"] as const).map((strength) => edgeFrame("bottom", strength, strength)),
});

/** The frame, the caption that sets the measure and the wash inside it. */
export const mediaGradientAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("mediaGradient.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9", src: DEMO_MEDIA_GRADIENT_SRC, alt: "" },
      attrs: { style: "inline-size: 24rem; max-inline-size: 100%;" },
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          options: { edge: "bottom" },
          children: [
            { contract: "media-gradient", signature: "MediaGradient", options: { strength: "lg" } },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h4", flush: true },
              children: t("demo.mediaGradient.title"),
            },
          ],
        },
      },
    },
    items: [
      namePart(".sk-image-frame", "block-start", { mark: "bracket" }),
      namePart(".sk-media-caption", "inline-end", { mark: "bracket" }),
      namePart(".sk-media-gradient", "block-end"),
    ],
  },
});
