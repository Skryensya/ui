import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Tooltip, as Figma structure: the bubble alone, its hint as a text property. The control it points
 * at is a component of its own, and where the bubble sits is the layout's; the arrow is left out.
 */
export const tooltipRealization: Realization = {
  contract: "tooltip",
  signature: "Tooltip",
  nested: true,
  drawFrom: ".sk-tooltip__content",
  // Shown, as the machine marks it open.
  marks: { ".sk-tooltip__content": { "data-state": "open" } },
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["placement", "arrow", "interactive", "disabled", "defaultOpen"],
  slots: { content: { holds: "text", sample: "Copy link" } },
  content: { trees: { children: [{ contract: "button", signature: "Button.action", slots: { children: "Share" } }] } },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
