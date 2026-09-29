import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const children: UsageTree[] = [
  { contract: "accordion", signature: "Details.Summary", slots: { children: "What happens to my data?" } },
  { contract: "accordion", signature: "Details.Content", slots: { children: "It stays in your account until you delete it." } },
];

/*
 * Details, as Figma structure, drawn as it nests: one disclosure, its summary and chevron, closed and
 * open across. The summary and the answer are text properties. One set per appearance.
 */
export const detailsRealization: Realization = {
  contract: "accordion",
  id: "details",
  signature: "Details",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["name"],
  width: 360,
  slots: {},
  content: {
    trees: { children },
    names: { "Details.Summary.children": "summary", "Details.Content.children": "answer" },
  },
  icons,
  grid: { columns: ["open"], rows: [], descending: [] },
  stage,
};
