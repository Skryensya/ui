import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/* Switch, as Figma structure, drawn as it nests: the track, its thumb and the label. One set per appearance. */
export const switchRealization: Realization = {
  contract: "switch",
  signature: "Switch",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "off",
    options: ["defaultChecked", "disabled"],
    names: { defaultChecked: "on" },
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: [],
  slots: { children: { holds: "text", sample: "Notifications" } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
