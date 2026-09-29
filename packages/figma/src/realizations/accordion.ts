import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/* One section as the docs compose it: the trigger's title and description with its chevron, then the answer. */
const item = (value: string, title: string, description: string, answer: string): UsageTree => ({
  contract: "accordion",
  signature: "Accordion.Item",
  options: { value, ...(value === "billing" ? { defaultOpen: true } : {}) },
  children: [
    {
      contract: "accordion",
      signature: "Accordion.Trigger",
      children: [
        { contract: "tile", signature: "TileContent", slots: { title, description } },
        { contract: "tile", signature: "TileChevron" },
      ],
    },
    { contract: "accordion", signature: "Accordion.Content", children: answer },
  ],
});

/*
 * Accordion, as Figma structure, drawn as it nests: three sections, the first open, its chevron
 * turned as the binding turns it. Every title, description and answer is a text property. One set
 * per appearance.
 */
export const accordionRealization: Realization = {
  contract: "accordion",
  signature: "Accordion",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["type", "collapsible", "disabled"],
  width: 360,
  // Open, as the binding marks the trigger of a section that starts open.
  marks: { '[data-value="billing"] .sk-tile__trigger': { "data-state": "open", "aria-expanded": "true" } },
  slots: {},
  content: {
    trees: {
      children: [
        item("billing", "Billing", "When and how you are charged", "Invoices go out on the first of each month."),
        item("cancel", "Cancelling", "What happens when you stop", "Your plan runs to the end of the period."),
        item("export", "Exporting", "Taking your data with you", "Every record can be exported as CSV or JSON."),
      ],
    },
    names: { "Accordion.Content.children": "answer" },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
