import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/* Radio, as Figma structure, drawn as it nests: the circle, its dot and the label. One set per appearance. */
export const radioRealization: Realization = {
  contract: "radio-group",
  signature: "Radio",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "unchecked",
    options: ["radioDefaultChecked", "disabled"],
    names: { radioDefaultChecked: "checked" },
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["required"],
  given: { name: "plan" },
  slots: { children: { holds: "text", sample: "Monthly" } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
