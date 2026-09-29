import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

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
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: {
    children: { holds: "text", sample: "Badge" },
  },
  icons,
  // A row per size, largest first; across it, every tone.
  grid: { columns: ["tone"], rows: ["size"], descending: ["size"] },
  stage,
};
