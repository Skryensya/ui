import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Progress, as Figma structure: the track and its bar, drawn at a width and part full, its tones down.
 * The value is the instance's: resize the bar.
 */
export const progressRealization: Realization = {
  contract: "progress",
  signature: "Progress",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 240,
  given: { value: 60, label: "Upload" },
  slots: {},
  icons,
  grid: { columns: [], rows: ["tone"], descending: [] },
  stage,
};
