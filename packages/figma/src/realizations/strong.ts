import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/* Strong, as Figma structure: the emphasised run inside body copy. */
export const strongRealization: Realization = {
  contract: "typography",
  id: "strong",
  signature: "Strong",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: { children: { holds: "text", sample: "Important" } },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
