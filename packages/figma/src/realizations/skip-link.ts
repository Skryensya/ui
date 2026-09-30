import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * SkipLink, as Figma structure: drawn as it shows once focused, the only moment anyone sees it. At
 * rest it is off screen by design, so there is nothing else to draw.
 */
export const skipLinkRealization: Realization = {
  contract: "skip-link",
  signature: "SkipLink",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  // Revealed on :focus (not :focus-visible, the sheet explains why): drawn that way, always.
  simulate: [":focus"],
  slots: { children: { holds: "text", sample: "Skip to content" } },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
