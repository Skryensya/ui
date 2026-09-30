import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/*
 * Select, as Figma structure, drawn as it nests: its closed trigger showing the chosen value and the
 * chevron. The list opens in a layer of its own and is not drawn here. One set per appearance.
 */
export const selectRealization: Realization = {
  contract: "select",
  signature: "Select",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: ["disabled"],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["required"],
  width: 240,
  given: { value: "monthly" },
  // Closed, as the binding leaves it: the list waits in a hidden positioner.
  marks: { ".sk-select__positioner": { hidden: "" } },
  slots: { value: { holds: "text", sample: "Monthly", mountedIn: ".sk-select__value" } },
  collections: {
    items: {
      slot: "label",
      undrawn: true,
      items: [
        { options: { value: "monthly" }, text: "Monthly" },
        { options: { value: "yearly" }, text: "Yearly" },
      ],
    },
  },
  icons,
  grid: { columns: ["state"], rows: ["variant"], descending: [] },
  stage,
};
