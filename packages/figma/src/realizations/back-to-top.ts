import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/* BackToTop, as Figma structure: the floating button, one set per appearance, at rest and hovered. */
export const backToTopRealization: Realization = {
  contract: "back-to-top",
  signature: "BackToTop",
  splitBy: "appearance",
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
  // The chevron is the whole drawing; the label is its accessible name, clipped out of sight.
  parts: { icon: { holds: "icon", icon: "chevron-up" } },
  slots: { children: { holds: "text", sample: "Back to top", hidden: true } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
