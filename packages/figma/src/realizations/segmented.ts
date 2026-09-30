import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Segmented, as Figma structure, drawn as it nests: three options, the first chosen, its sizes down.
 * One set per appearance. Each option's label is a text property.
 */
export const segmentedRealization: Realization = {
  contract: "segmented",
  signature: "Segmented",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  given: { value: "day", label: "View" },
  marks: { '.sk-segmented__option[data-value="day"]': { "aria-checked": "true" } },
  slots: {},
  collections: {
    items: {
      slot: "label",
      items: [
        { options: { value: "day" }, text: "Day" },
        { options: { value: "week" }, text: "Week" },
        { options: { value: "month" }, text: "Month" },
      ],
    },
  },
  icons,
  grid: { columns: [], rows: ["size"], descending: ["size"] },
  stage,
};
