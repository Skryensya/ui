import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const action: UsageTree = {
  contract: "button",
  signature: "Button.action",
  options: { variant: "solid", size: "md" },
  slots: { children: "Save" },
};
const menu: UsageTree = {
  contract: "menu",
  signature: "Menu",
  options: { label: "More save options", triggerLabel: "More save options", triggerVariant: "solid", triggerSize: "md", triggerIconOnly: true },
  slots: { items: [{ options: { value: "copy" }, slots: { label: "Save a copy" } }] },
};

/*
 * ButtonGroup, as a split button: the action welded to its menu's chevron, the menu closed. The
 * group squares the touching corners; the action's label is a text property.
 */
export const buttonGroupRealization: Realization = {
  contract: "button-group",
  signature: "ButtonGroup",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["label", "htmlFor"],
  given: { label: "Save" },
  marks: { ".sk-menu__positioner": { hidden: "" } },
  slots: {},
  content: { trees: { children: [action, menu] }, names: { "Button.action.children": "action" } },
  icons,
  grid: { columns: [], rows: ["orientation"], descending: [] },
  stage,
};
