import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const link = (icon: string, label: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href: "#", ...(current ? { current: true } : {}) },
  slots: { icon: { contract: "icon", signature: "Icon", options: { name: icon } }, children: label },
});

/*
 * Sidebar, as the docs compose it: its collapse trigger, a labelled group of links with the current
 * one marked, a separator and a footer line, at a rail's width and a page's height. Every label is
 * a text property; one set per appearance.
 */
export const sidebarRealization: Realization = {
  contract: "sidebar",
  signature: "Sidebar",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["defaultCollapsed", "storageKey", "minInlineSize", "maxInlineSize"],
  width: 240,
  given: { landmarkLabel: "Workspace" },
  slots: {},
  content: {
    trees: {
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: { contract: "sidebar", signature: "SidebarTrigger", options: { label: "Collapse" }, slots: { icon: { contract: "icon", signature: "Icon", options: { name: "menu" } } } },
        },
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: {
            contract: "nav-list",
            signature: "NavList",
            attrs: { "aria-label": "Workspace" },
            children: {
              contract: "nav-list",
              signature: "NavListGroup",
              slots: { label: "Workspace", children: [link("folder", "Projects", true), link("calendar", "Schedule"), link("settings", "Settings")] },
            },
          },
        },
        { contract: "sidebar", signature: "SidebarSeparator" },
        { contract: "sidebar", signature: "SidebarFooter", children: "Signed in as Ana" },
      ],
    },
    names: { "NavListGroup.label": "group", "NavListLink.children": "link", "SidebarFooter.children": "footer" },
  },
  icons,
  /* A rail on either edge (`side`) is the same rail in a mirror: the two sit side by side, as they would on a shell. */
  grid: { columns: ["side"], rows: [], descending: [] },
  stage,
};
