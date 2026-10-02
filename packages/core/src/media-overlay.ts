import type { ComponentContract } from "./contract.js";

/*
 * MEDIA OVERLAY, wash sized to the caption it protects.
 *
 * Parts are the authored anatomy the CSS contracts against. The wash is decorative
 * (`aria-hidden`) and lives *inside* the caption so its box is the type's box.
 */
export const mediaOverlayParts = {
  root: "sk-media-overlay-shade",
  caption: "sk-media-overlay",
} as const;

export type MediaOverlayPart = keyof typeof mediaOverlayParts;
export type MediaOverlayPartClass = (typeof mediaOverlayParts)[MediaOverlayPart];

/** Which edge of the media the caption (and its wash) sits on. */
export type MediaOverlayEdge = "top" | "bottom" | "start" | "end";

/** How opaque / tinted the wash is behind the type, not how much of the image it covers. */
export type MediaOverlayStrength = "subtle" | "moderate" | "strong";

/*
 * A wash so type stays readable over a photo. Always `aria-hidden`: it is paint, and the caption it
 * sits behind is the content. Named for what it is and never for where it is used (`hero`, `card`):
 * a name that says who uses it becomes a lie the moment a second thing needs it.
 */
export const mediaOverlayContract = {
  id: "media-overlay",
  category: "content",
  css: "@skryensya/core/patterns/media-overlay.css",
  parts: mediaOverlayParts,
  /*
   * Caption measure hooks plus the wash's author-facing and derived paints. The wash vars live on
   * a rule that also mentions `.sk-media-overlay`, so the publisher's "own family only" rule skips
   * them; they are still declared in the sheet and are the real override surface.
   */
  hooks: [
    "--sk-media-overlay-fg",
    "--sk-media-overlay-gap",
    "--sk-media-overlay-padding",
    "--sk-media-overlay-shade-base",
    "--sk-media-overlay-shade-direction",
    "--sk-media-overlay-shade-ink",
    "--sk-media-overlay-shade-ink-mid",
    "--sk-media-overlay-shade-mix",
    "--sk-media-overlay-shade-opacity",
    "--sk-media-overlay-shade-tint",
    "--sk-media-overlay-shade-tint-edge",
    "--sk-media-overlay-shade-tint-mid",
  ],

  options: {
    /** Which edge of the media the caption sits on. The wash fades toward the photo from there. */
    edge: { type: "enum", values: ["top", "bottom", "start", "end"], default: "bottom", attr: "data-edge" },
    strength: { type: "enum", values: ["subtle", "moderate", "strong"], default: "moderate", attr: "data-strength" },
    /**
     * `figcaption` when the frame is a `<figure>` (`ImageFrame.frameElement`); otherwise `div`.
     * React's `as`.
     */
    captionElement: { type: "enum", values: ["div", "figcaption"], default: "div", element: true, prop: "as" },
  },

  signatures: {
    /*
     * The caption is the MEASURE. The wash sizes to it, not to a percentage of the media, which is
     * the whole idea of the pattern, and it is why publishing the gradient without this was
     * publishing something that paints nothing: absolutely positioned with no box to fill.
     */
    MediaOverlay: {
      intent: ["caption-over-a-photo", "text-over-an-image", "text-on-media", "overlay-title"],
      host: { element: "div" },
      options: ["edge", "captionElement"],
      parents: ["ImageFrame"],
      /* React `strength` injects MediaOverlayShade; trees may also nest it as a child. */
      compose: [{ of: "media-overlay", systemOwned: true }],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "caption", host: true, slot: "children" },
      react: { from: "@skryensya/react/media-overlay", name: "MediaOverlay" },
    },

    MediaOverlayShade: {
      intent: ["readable-text-over-a-photo", "readable-text-over-an-image", "scrim-behind-a-caption"],
      host: { element: "div" },
      options: ["strength"],
      parents: ["MediaOverlay"],
      slots: {},
      template: { element: "div", part: "root", host: true, attrs: { "aria-hidden": "true" } },
      react: { from: "@skryensya/react/media-overlay", name: "MediaOverlayShade" },
    },
  },
} as const satisfies ComponentContract;
