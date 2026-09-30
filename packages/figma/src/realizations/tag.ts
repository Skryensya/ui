import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Tag, as Figma structure: a chip with its text. One set per appearance; a row per tone.
 * `removable` is left out: its remove button is a control of its own inside the chip, which a
 * layer of text or icon cannot stand for, so it waits for nested drawing.
 */
export const tagRealization: Realization = {
  contract: "tag",
  signature: "Tag",
  splitBy: "appearance",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["removable"],
  slots: { children: { holds: "text", sample: "Tag" } },
  icons,
  grid: { columns: ["tone"], rows: [], descending: [] },
  stage,
};
