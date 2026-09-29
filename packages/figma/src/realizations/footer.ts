import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Footer, as Figma structure, drawn as it nests: a credit line on its surface, at a width. Surfaces
 * down, the divider across; padding is a scale and left to the page. The credit is a text property.
 */
export const footerRealization: Realization = {
  contract: "footer",
  signature: "Footer",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["padding", "paddingExpanded", "footerElement", "appearance"],
  width: 640,
  slots: {},
  content: {
    trees: { children: [{ contract: "typography", signature: "Text", options: { tone: "tertiary", size: "sm" }, children: "© 2026 Skryensya. Made with care." }] },
    names: { "Text.children": "credit" },
  },
  icons,
  grid: { columns: ["divider"], rows: ["surface"], descending: [] },
  stage,
};
