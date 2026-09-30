import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const link = (label: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href: "#", ...(current ? { current: true } : {}) },
  children: label,
});

/*
 * Navbar, as the docs compose it: the brand, a row of links with the current page marked, and two
 * actions, at a page's width. Every label is a text property; one set per appearance.
 */
export const navbarRealization: Realization = {
  contract: "navbar",
  signature: "Navbar",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: [],
  width: 960,
  slots: {},
  content: {
    trees: {
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Atlas" },
        {
          contract: "nav-list",
          signature: "NavList",
          options: { orientation: "horizontal" },
          attrs: { "aria-label": "Main" },
          children: { contract: "nav-list", signature: "NavListGroup", children: [link("Home", true), link("Projects"), link("Reports"), link("Team")] },
        },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: [
            { contract: "button", signature: "Button.action", options: { variant: "ghost" }, children: "Invite" },
            { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: "New project" },
          ],
        },
      ],
    },
    names: { "NavbarBrand.children": "brand", "NavListLink.children": "link", "Button.action.children": "action" },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
