import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * FormField, as Figma structure, drawn as it nests: its label, hint and the Input it labels, every
 * text a property (the hint switchable). Required and disabled across. An error would redden the
 * Input it wires to, which the Input's own invalid state already draws.
 */
export const formFieldRealization: Realization = {
  contract: "form-field",
  signature: "FormField",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["labelHidden"],
  width: 320,
  slots: {
    label: { holds: "text", sample: "Email" },
    hint: { holds: "text", sample: "We only use it to send receipts." },
    // The Input's own placeholder, from the tree below.
    placeholder: { holds: "text", sample: "name@example.com", pseudo: "placeholder" },
  },
  content: { trees: { children: [{ contract: "input", signature: "Input", options: { placeholder: "name@example.com" } }] } },
  icons,
  grid: { columns: ["required", "disabled"], rows: [], descending: [] },
  stage,
};
