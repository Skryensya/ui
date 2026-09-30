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

/* BadgeHolder: a count pinned to the corner of the avatar it sits on, as the sheet shifts it out. */
export const badgeHolderRealization: Realization = {
  contract: "badge",
  id: "badge-holder",
  signature: "BadgeHolder",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: {},
  content: {
    trees: {
      children: [
        { contract: "avatar", signature: "Avatar.initials", options: { size: "lg" }, slots: { children: "AS" } },
        { contract: "badge", signature: "Badge", options: { tone: "danger" }, slots: { children: "3" } },
      ],
    },
    names: { "Avatar.initials.children": "initials", "Badge.children": "count" },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
