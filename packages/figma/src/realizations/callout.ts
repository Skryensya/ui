import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Callout, as Figma structure, drawn as it nests: the icon beside a column holding the title and the
 * message. One set per appearance, its tones down. The actions slot holds buttons of their own and
 * waits for instances of other components.
 */
export const calloutRealization: Realization = {
  contract: "callout",
  signature: "Callout",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  // It fills its container; drawn alone, at a width its message wraps in.
  width: 360,
  slots: {
    icon: { holds: "icon", icon: "info", shown: true },
    title: { holds: "text", sample: "Heads up" },
    children: { holds: "text", sample: "Your changes are saved as a draft until you publish them." },
  },
  icons,
  grid: { columns: [], rows: ["tone"], descending: [] },
  stage,
};
