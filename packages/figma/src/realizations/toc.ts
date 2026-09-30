import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Toc, as Figma structure, drawn as it nests: its title over four entries, two at h3 depth, the
 * reader's current one marked. Every label is a text property.
 */
export const tocRealization: Realization = {
  contract: "toc",
  signature: "Toc",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: [],
  width: 240,
  slots: { title: { holds: "text", sample: "On this page", option: "title" } },
  collections: {
    items: {
      slot: "children",
      items: [
        { options: { href: "#installation" }, text: "Installation" },
        { options: { href: "#env", level: "h3", current: true }, text: "Environment" },
        { options: { href: "#flags", level: "h3" }, text: "Flags" },
        { options: { href: "#reference" }, text: "Reference" },
      ],
    },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
