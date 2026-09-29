import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const action: UsageTree = {
  contract: "button",
  signature: "Button.action",
  options: { variant: "solid", size: "md", weldEnd: true },
  slots: { children: "Save" },
};
const menu: UsageTree = {
  contract: "menu",
  signature: "Menu",
  options: { label: "More save options", triggerLabel: "More save options", triggerVariant: "solid", triggerSize: "md", triggerIconOnly: true, triggerWeldStart: true },
  slots: { items: [{ options: { value: "copy" }, slots: { label: "Save a copy" } }] },
};

/*
 * SplitButton, as the docs compose it: the action welded to its menu's chevron, the menu closed. Its
 * look follows the Button it holds; the action's label is a text property.
 */
export const splitButtonRealization: Realization = {
  contract: "split-button",
  signature: "SplitButton",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["label"],
  given: { label: "Save" },
  marks: { ".sk-menu__positioner": { hidden: "" } },
  slots: {},
  content: { trees: { action: [action], menu: [menu] }, names: { "Button.action.children": "action" } },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
