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

/* Tag.link: a chip that navigates, so it is hovered and focused. */
export const tagLinkRealization: Realization = {
  ...tagRealization,
  id: "tag-link",
  signature: "Tag.link",
  state: {
    axis: "state",
    rest: "rest",
    options: [],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  exclude: [],
  given: { href: "#" },
  grid: { columns: ["state"], rows: ["tone"], descending: [] },
};
