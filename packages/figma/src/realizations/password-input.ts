import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/* PasswordInput, as Figma structure, drawn as it nests: the field, its placeholder and the reveal button. */
export const passwordInputRealization: Realization = {
  contract: "password-input",
  signature: "PasswordInput",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: ["disabled", "readOnly", "invalid"],
    names: { readOnly: "read-only" },
    interactions: [{ name: "focus", pseudo: ":focus-visible" }],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["required", "defaultVisible"],
  width: 240,
  slots: { placeholder: { holds: "text", sample: "Password", option: "placeholder", pseudo: "placeholder" } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
