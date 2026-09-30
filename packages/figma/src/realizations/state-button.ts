import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/*
 * StateButton, as Figma structure, drawn as it nests: an icon button showing its current face (the
 * others wait unseen, as they do on the page; swap the glyph for another). Hovered and focused; its
 * appearance and size are forwarded attributes and stay at their defaults.
 */
export const stateButtonRealization: Realization = {
  contract: "state-button",
  signature: "StateButton",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: [],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: [],
  slots: {},
  collections: {
    faces: {
      slot: "icon",
      undrawn: true,
      items: [
        { options: { name: "light", icon: "mode-light" } },
        { options: { name: "dark", icon: "mode-dark" } },
      ],
    },
  },
  icons,
  given: { current: "light" },
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
