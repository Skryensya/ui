import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * OtpInput, as Figma structure, drawn as it nests: its label over four empty segments, each showing
 * the placeholder the binding writes into it. Disabled and invalid down.
 */
export const otpInputRealization: Realization = {
  contract: "otp-input",
  signature: "OtpInput",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: ["disabled", "invalid"],
    interactions: [],
  },
  overlays: {},
  ring: "focus ring",
  exclude: ["type", "mask", "otp", "readOnly", "required"],
  given: { count: 4, name: "code" },
  marks: {
    ".sk-otp-input__segment:nth-of-type(1)": { placeholder: "○" },
    ".sk-otp-input__segment:nth-of-type(2)": { placeholder: "○" },
    ".sk-otp-input__segment:nth-of-type(3)": { placeholder: "○" },
    ".sk-otp-input__segment:nth-of-type(4)": { placeholder: "○" },
  },
  slots: {
    label: { holds: "text", sample: "Verification code" },
    placeholder: { holds: "text", sample: "○", pseudo: "placeholder" },
  },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
