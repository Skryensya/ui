import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/* NumberField, as Figma structure, drawn as it nests: the value between its decrease and increase buttons. */
export const numberFieldRealization: Realization = {
  contract: "number-field",
  signature: "NumberField",
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
  exclude: ["required"],
  width: 200,
  slots: { value: { holds: "text", sample: "12", option: "defaultValue", pseudo: "value" } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
