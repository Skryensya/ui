import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Avatar, as Figma structure: the initials disc. One set per appearance, its sizes across, largest
 * first, and beside each size the disc holding other initials, one letter and two.
 * The image avatar waits: its photo is a fill from a URL, which the manifest does not carry.
 */
export const avatarRealization: Realization = {
  contract: "avatar",
  signature: "Avatar.initials",
  splitBy: "appearance",
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  slots: { children: { holds: "text", sample: "AS" } },
  samples: { slot: "children", title: "with other initials", values: ["A", "MJ", "LR"] },
  icons,
  grid: { columns: ["size"], rows: [], descending: ["size"] },
  stage,
};
