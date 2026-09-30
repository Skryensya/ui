import type { Realization } from "../realization.js";

/*
 * Badge, as Figma structure. The axes, their values, the defaults and the paint of every cell are
 * read from `badgeContract` and `badge.css`; this file says only what those cannot.
 */
export const badgeRealization: Realization = {
  contract: "badge",
  // The labelled pill. BadgeDot is a different drawing (no text, a pulse); BadgeHolder draws nothing.
  signature: "Badge",
  // As Button: an appearance is picked for a product, rarely per instance.
  splitBy: "appearance",
  // A badge is static: never hovered, pressed or focused, so it draws no states at all.
  state: { axis: "state", rest: "rest", options: [], interactions: [] },
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: {
    children: { holds: "text", sample: "Badge" },
  },
  icons: { module: "@skryensya/icons-lucide", export: "lucideIcons" },
  // A row per size, largest first; across it, every tone.
  grid: { columns: ["tone"], rows: ["size"], descending: ["size"] },
  // The same stage as every other set in the file, so they read as one catalogue.
  stage: {
    contract: "component-preview",
    hook: "--sk-component-preview-bg",
    label: {
      color: "--color-text-secondary",
      fontFamily: "--font-family-body",
      fontSize: "--font-size-caption",
      fontWeight: "--font-weight-label",
    },
    divider: "--color-border-subtle",
  },
};
