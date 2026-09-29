import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/*
 * Checkbox, as Figma structure, drawn as it nests: the box and its label. Its states are the ones a
 * checkbox shows, checked and indeterminate among them. One set per appearance.
 */
export const checkboxRealization: Realization = {
  contract: "checkbox",
  signature: "Checkbox",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "unchecked",
    options: ["defaultChecked", "disabled"],
    names: { defaultChecked: "checked" },
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
      // Only a script sets it (the input's `indeterminate` property): held here as the pseudo-class.
      { name: "indeterminate", pseudo: ":indeterminate" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["required", "defaultIndeterminate"],
  slots: { children: { holds: "text", sample: "Email me updates" } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
