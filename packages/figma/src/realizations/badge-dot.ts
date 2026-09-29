import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Badge's dot (`BadgeDot`), as Figma structure: the same contract as the labelled Badge, a different
 * drawing. A bare circle in its tone, no text, so nothing here but where its tones go.
 *
 * `pulse` is not drawn. Its halo is an animation on `::after` that sits at opacity 0 at rest, so the
 * cascade finds no difference between a pulsing dot and a still one, and Figma has no animation to
 * give it. The dot is drawn as it rests.
 */
export const badgeDotRealization: Realization = {
  contract: "badge",
  signature: "BadgeDot",
  // No appearance on the dot: one set.
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: {},
  icons,
  // Its tones across, in one row.
  grid: { columns: ["tone"], rows: [], descending: [] },
  stage,
};
