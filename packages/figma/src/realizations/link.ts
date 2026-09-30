import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/* Link, as Figma structure: an underlined run of text, its tones across, at rest and hovered. */
export const linkRealization: Realization = {
  contract: "typography",
  id: "link",
  signature: "Link",
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
  slots: { children: { holds: "text", sample: "Read the guide" } },
  icons,
  grid: { columns: ["state"], rows: ["linkTone"], descending: [] },
  stage,
};
