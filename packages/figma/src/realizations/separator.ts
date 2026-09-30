import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Separator, as Figma structure: the rule, drawn at a width, since on a page of its own it has no
 * container to fill. Its tones down. Horizontal only: the vertical rule's sheet sizes it but paints
 * nothing. Spacing is margin, which belongs to the layout placing it; decorative only changes its role.
 */
export const separatorRealization: Realization = {
  contract: "separator",
  signature: "Separator",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["orientation", "spacing", "decorative"],
  width: 240,
  slots: {},
  icons,
  grid: { columns: [], rows: ["tone"], descending: [] },
  stage,
};

/* LabelledSeparator: a word between two rules that fill the rest of the row. */
export const labelledSeparatorRealization: Realization = {
  contract: "separator",
  id: "labelled-separator",
  signature: "LabelledSeparator",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["spacing"],
  width: 240,
  slots: { children: { holds: "text", sample: "or" } },
  icons,
  grid: { columns: [], rows: ["tone"], descending: [] },
  stage,
};
