import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Heading, as Figma structure: one set, a row per size, largest first. The level it renders as (h1
 * to h6) is the document's outline, not its look, and `flush` only drops its outer margin.
 */
export const headingRealization: Realization = {
  contract: "typography",
  id: "heading",
  signature: "Heading",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["headingElement", "flush"],
  slots: { children: { holds: "text", sample: "Section title" } },
  icons,
  grid: { columns: [], rows: ["headingSize"], descending: [] },
  stage,
};
