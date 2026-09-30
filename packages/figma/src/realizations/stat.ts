import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/* Stat, as Figma structure: a figure with its name and its change, the trends across. */
export const statRealization: Realization = {
  contract: "stat",
  signature: "Stat",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  // Counting up is an animation; locale, suffix and digits only format the figure's text.
  exclude: ["animate"],
  slots: {
    label: { holds: "text", sample: "Active users" },
    value: { holds: "text", sample: "12,480" },
    change: { holds: "text", sample: "+4.2%" },
  },
  icons,
  grid: { columns: ["trend"], rows: [], descending: [] },
  stage,
};
