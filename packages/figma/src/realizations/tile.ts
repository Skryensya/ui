import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

const content = (title: string, description: string): UsageTree => ({ contract: "tile", signature: "TileContent", slots: { title, description } });

/*
 * TileLink, as Figma structure, drawn as it nests: a card that goes somewhere, its title over its
 * description, at a width. Hovered and focused across; one set per appearance. Padding is a scale
 * and left to the layout that places it.
 */
export const tileLinkRealization: Realization = {
  contract: "tile",
  id: "tile-link",
  signature: "TileLink",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: [],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["padding"],
  width: 320,
  given: { href: "#" },
  slots: {},
  content: { trees: { children: [content("Billing", "Invoices, payment methods and receipts")] } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
