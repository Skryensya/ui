import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Popover, as Figma structure: its open panel drawn alone, title, description, message and close
 * button, at a width. The trigger that opens it is a Button of its own and where the panel sits is
 * the layout's; the arrow is left out. One set per appearance.
 */
export const popoverRealization: Realization = {
  contract: "popover",
  signature: "Popover",
  splitBy: "appearance",
  nested: true,
  drawFrom: ".sk-popover__content",
  simulate: [":popover-open"],
  simulateOn: ".sk-popover__content",
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["placement", "arrow", "triggerVariant", "triggerTone", "triggerSize", "triggerAppearance", "triggerIconOnly"],
  width: 280,
  given: { triggerLabel: "Details" },
  slots: {
    // The trigger is not drawn: its text is markup only.
    trigger: { holds: "text", sample: "Details", hidden: true },
    title: { holds: "text", sample: "Storage" },
    description: { holds: "text", sample: "You are using 7.4 GB of 10 GB." },
    children: { holds: "text", sample: "Upgrade for more room." },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
