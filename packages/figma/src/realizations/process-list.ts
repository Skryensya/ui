import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const step = (title: string, body: string): UsageTree => ({
  contract: "process-list",
  signature: "ProcessListItem",
  slots: { title, children: { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: body } },
});

/*
 * ProcessList, as the docs compose it: three numbered steps, each a title over its explanation, at a
 * reading width. Every title and line is a text property.
 */
export const processListRealization: Realization = {
  contract: "process-list",
  signature: "ProcessList",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 400,
  slots: {},
  content: {
    trees: {
      children: [
        step("Install the packages", "Add the core styles and the bindings your app uses."),
        step("Import the styles", "One stylesheet brings every component's defaults."),
        step("Compose your first screen", "Start from a template and change what it says."),
      ],
    },
    names: { "ProcessListItem.title": "title", "Text.children": "body" },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
