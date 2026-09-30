import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/*
 * Input, as Figma structure: the field at a width, holding its placeholder, one set per appearance.
 * Its states are the ones a field shows: focused, disabled, invalid and read-only, the last two set
 * by the attributes the signature forwards. Type, name, format and the error label change no paint.
 */
export const inputRealization: Realization = {
  contract: "input",
  signature: "Input",
  splitBy: "appearance",
  state: {
    axis: "state",
    rest: "rest",
    options: ["disabled"],
    interactions: [{ name: "focus", pseudo: ":focus-visible" }],
    attributes: [
      { name: "invalid", attrs: { "aria-invalid": "true" } },
      { name: "read-only", attrs: { readonly: "" } },
    ],
  },
  overlays: {},
  ring: "focus ring",
  exclude: ["format", "country", "errorLabel"],
  width: 240,
  slots: {
    placeholder: { holds: "text", sample: "Email address", option: "placeholder", pseudo: "placeholder" },
  },
  icons,
  grid: { columns: ["state"], rows: ["controlSize"], descending: ["controlSize"] },
  stage,
};
