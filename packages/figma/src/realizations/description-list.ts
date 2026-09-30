import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const item = (term: string, details: string) => ({
  contract: "description-list",
  signature: "DescriptionItem",
  slots: { term, children: details },
});

/*
 * DescriptionList, as Figma structure, drawn as it nests: three pairs at a width, every term and
 * value a text property. One set per layout, dividers and density across.
 */
export const descriptionListRealization: Realization = {
  contract: "description-list",
  signature: "DescriptionList",
  splitBy: "layout",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 360,
  slots: {},
  content: {
    trees: { children: [item("Status", "Active"), item("Plan", "Team, billed yearly"), item("Renews", "March 3, 2027")] },
    names: { children: "details" },
  },
  icons,
  grid: { columns: ["dividers", "density"], rows: [], descending: [] },
  stage,
};
