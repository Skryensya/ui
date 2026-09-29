import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * EmptyState, as Figma structure, drawn as it nests: the icon on its disc, the title and the
 * description, centred down a column at a width. The actions slot holds buttons of their own and
 * waits for instances of other components.
 */
export const emptyStateRealization: Realization = {
  contract: "empty-state",
  signature: "EmptyState",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 360,
  slots: {
    icon: { holds: "icon", icon: "folder" },
    title: { holds: "text", sample: "Nothing here yet" },
    description: { holds: "text", sample: "Items you add will show up here, newest first." },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
