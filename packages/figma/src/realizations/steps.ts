import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Steps, as Figma structure, drawn as it nests: three stages, one done, one current, one to come,
 * each with its marker, label and description as text properties. One set per appearance, its
 * orientations down.
 */
export const stepsRealization: Realization = {
  contract: "steps",
  signature: "Steps",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 480,
  slots: {},
  collections: {
    items: {
      slot: "label",
      items: [
        { options: { status: "complete" }, text: "Account", more: { marker: "1", description: "Your details" } },
        { options: { status: "current" }, text: "Plan", more: { marker: "2", description: "Pick a plan" } },
        { options: { status: "upcoming" }, text: "Payment", more: { marker: "3", description: "Card or invoice" } },
      ],
    },
  },
  icons,
  grid: { columns: [], rows: ["orientation"], descending: [] },
  stage,
};
