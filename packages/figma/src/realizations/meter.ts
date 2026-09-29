import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Meter, as Figma structure, drawn as it nests: its label and value over the track, the bar part
 * full, at a width, its tones down. The fill is what the binding writes when it mounts.
 */
export const meterRealization: Realization = {
  contract: "meter",
  signature: "Meter",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 240,
  given: { value: 68 },
  mounted: { track: "--sk-meter-fill: 68%" },
  slots: {
    label: { holds: "text", sample: "Storage", option: "label" },
    value: { holds: "text", sample: "68%", option: "valueText" },
  },
  icons,
  grid: { columns: [], rows: ["tone"], descending: [] },
  stage,
};
