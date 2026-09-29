import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/* Code, as Figma structure: an inline run of code, with names it usually carries beside it. */
export const codeRealization: Realization = {
  contract: "typography",
  id: "code",
  signature: "Code",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: { children: { holds: "text", sample: "useState" } },
  samples: { slot: "children", title: "holding", values: ["npm install", "--color-bg", "<Button>"] },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
