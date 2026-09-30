import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/*
 * CopyButton, as Figma structure, drawn as it nests: its copy glyph at rest, the check once copied
 * (the state the machine marks). Sizes down, variants across; one set per appearance.
 */
export const copyButtonRealization: Realization = {
  contract: "clipboard",
  id: "copy-button",
  signature: "CopyButton",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: [],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
    attributes: [{ name: "copied", attrs: { "data-copied": "" } }],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["timeout"],
  given: { value: "npm i @skryensya/ui" },
  slots: {},
  icons,
  grid: { columns: ["variant", "state"], rows: ["size"], descending: ["size"] },
  stage,
};
