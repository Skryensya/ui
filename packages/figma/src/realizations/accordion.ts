import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const item = (value: string, question: string, answer: string): UsageTree => ({
  contract: "accordion",
  signature: "Accordion.Item",
  options: { value, ...(value === "billing" ? { defaultOpen: true } : {}) },
  slots: {
    children: [
      { contract: "accordion", signature: "Accordion.Trigger", slots: { children: question } },
      { contract: "accordion", signature: "Accordion.Content", slots: { children: answer } },
    ],
  },
});

/*
 * Accordion, as Figma structure, drawn as it nests: three sections, the first open. Every heading
 * and answer is a text property. One set per appearance.
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
  slots: {},
  content: {
    trees: {
      children: [
        item("billing", "How is billing handled?", "Invoices go out on the first of each month."),
        item("cancel", "Can I cancel at any time?", "Yes. Your plan runs to the end of the period."),
        item("export", "Can I export my data?", "Every record can be exported as CSV or JSON."),
      ],
    },
    names: { "Accordion.Trigger.children": "heading", "Accordion.Content.children": "answer" },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
