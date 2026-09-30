import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const tool = (label: string, icon: string): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { iconOnly: true, size: "sm", variant: "ghost" },
  attrs: { "aria-label": label },
  children: { contract: "icon", signature: "Icon", options: { name: icon } },
});

/*
 * Toolbar, as the docs compose it: a group of two tools, a separator, and a third tool on its own.
 * Down and across; one set per appearance.
 */
export const toolbarRealization: Realization = {
  contract: "toolbar",
  signature: "Toolbar",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["loopFocus"],
  given: { label: "Formatting" },
  slots: {},
  content: {
    trees: {
      children: [
        { contract: "toolbar", signature: "ToolbarGroup", children: [tool("Copy", "copy"), tool("Edit", "edit")] },
        { contract: "toolbar", signature: "ToolbarSeparator" },
        tool("Delete", "delete"),
      ],
    },
  },
  icons,
  grid: { columns: [], rows: ["orientation"], descending: [] },
  stage,
};
