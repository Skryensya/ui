import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Breadcrumb, as Figma structure, drawn as it nests: three levels, two links and the current page,
 * with the system's own separators between them. Each level's label is a text property.
 */
export const breadcrumbRealization: Realization = {
  contract: "breadcrumb",
  signature: "Breadcrumb",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["label", "collapsedLabel"],
  slots: {},
  collections: {
    items: {
      slot: "label",
      items: [
        { options: { href: "#" }, text: "Home" },
        { options: { href: "#" }, text: "Projects" },
        { options: { current: true }, text: "Settings" },
      ],
    },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
