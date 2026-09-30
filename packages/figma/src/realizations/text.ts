import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Text, as Figma structure: a run of body copy. One set per weight; its sizes across and its tones
 * down. The element it renders as (p, div, span) and its role change nothing drawn.
 */
export const textRealization: Realization = {
  contract: "typography",
  id: "text",
  signature: "Text",
  splitBy: "weight",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["textElement", "textRole"],
  slots: { children: { holds: "text", sample: "The quick brown fox" } },
  icons,
  grid: { columns: ["size"], rows: ["tone"], descending: [] },
  stage,
};
