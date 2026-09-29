import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Tag, as Figma structure, drawn as it nests: a chip with its text, and its remove button when
 * removable. One set per appearance; a row per tone.
 */
export const tagRealization: Realization = {
  contract: "tag",
  signature: "Tag",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: { children: { holds: "text", sample: "Tag" } },
  icons,
  grid: { columns: ["tone"], rows: ["removable"], descending: [] },
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
