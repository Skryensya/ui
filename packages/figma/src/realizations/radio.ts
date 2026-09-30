import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/* Radio, as Figma structure, drawn as it nests: the circle, its dot and the label. One set per appearance. */
export const radioRealization: Realization = {
  contract: "radio-group",
  // Its own sets, apart from RadioGroup's: `radio/<appearance>`.
  id: "radio",
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

/* RadioGroup: three choices, the first chosen, one of them disabled, laid down and across. */
export const radioGroupRealization: Realization = {
  contract: "radio-group",
  id: "radio-group",
  signature: "RadioGroup",
  splitBy: "appearance",
  nested: true,
  state: { axis: "state", rest: "rest", options: [], interactions: [] },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["spread", "disabled", "required", "label"],
  given: { name: "billing", value: "monthly" },
  slots: {},
  collections: {
    items: {
      slot: "label",
      items: [
        { options: { value: "monthly" }, text: "Monthly" },
        { options: { value: "yearly" }, text: "Yearly" },
        { options: { value: "lifetime", disabled: true }, text: "Lifetime" },
      ],
    },
  },
  icons,
  grid: { columns: [], rows: ["orientation"], descending: [] },
  stage,
};
