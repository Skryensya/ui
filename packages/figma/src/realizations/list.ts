import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const row = (icon: string, title: string, description: string): UsageTree => ({
  contract: "list",
  signature: "ListItem",
  slots: { leading: { contract: "icon", signature: "Icon", options: { name: icon } }, title, description },
});

/*
 * List, as Figma structure, drawn as it nests: three rows, each with its icon, title and description
 * as text properties. Its dividers and density across.
 */
export const listRealization: Realization = {
  contract: "list",
  signature: "List",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 360,
  slots: {},
  content: {
    trees: {
      children: [
        row("user", "Profile", "Name, photo and contact details"),
        row("settings", "Preferences", "Language, theme and notifications"),
        row("file", "Documents", "Everything you have uploaded"),
      ],
    },
  },
  icons,
  grid: { columns: ["dividers", "density"], rows: [], descending: [] },
  stage,
};
