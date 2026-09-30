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
 * NavList, as Figma structure, drawn as it nests: one labelled group of three destinations, the
 * first the current page. Every label is a text property. Its orientations down.
 */
export const navListRealization: Realization = {
  contract: "nav-list",
  signature: "NavList",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: [],
  width: 240,
  slots: {},
  content: {
    trees: {
      children: [
        {
          contract: "nav-list",
          signature: "NavListGroup",
          options: { heading: true },
          slots: { label: "Workspace", children: [link("folder", "Projects", true), link("user", "Members"), link("settings", "Settings")] },
        },
      ],
    },
    names: { "NavListGroup.label": "group", "NavListLink.children": "link" },
  },
  icons,
  grid: { columns: [], rows: ["orientation"], descending: [] },
  stage,
};
