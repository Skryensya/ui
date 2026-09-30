import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Kbd, as Figma structure: a drawn key. One set per appearance, its tones across, and beside each
 * tone the same key holding the labels a shortcut really uses.
 */
export const kbdRealization: Realization = {
  contract: "kbd",
  signature: "Kbd",
  splitBy: "appearance",
  // A key is pressed by the keyboard, not the pointer: `data-pressed` is written by a script, not a state.
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: { children: { holds: "text", sample: "K" } },
  // The keys a shortcut really shows: glyphs that stay square, and words that widen the key.
  samples: { slot: "children", title: "as other keys", values: ["⌘", "⇧", "⌥", "Esc", "Enter", "↵", "Space"] },
  icons,
  grid: { columns: ["tone"], rows: [], descending: [] },
  stage,
};
