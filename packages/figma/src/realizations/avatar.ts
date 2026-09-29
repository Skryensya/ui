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

const disc = (initials: string, size: string) => ({ contract: "avatar", signature: "Avatar.initials", options: { size }, slots: { children: initials } });

/* AvatarGroup: three people stacked a third over one another, and the count of the rest. */
export const avatarGroupRealization: Realization = {
  contract: "avatar",
  id: "avatar-group",
  signature: "AvatarGroup",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  given: { label: "Project members" },
  slots: { overflow: { holds: "text", sample: "+4" } },
  content: { trees: { children: [disc("AS", "md"), disc("MJ", "md"), disc("LR", "md")] }, names: { children: "initials" } },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
