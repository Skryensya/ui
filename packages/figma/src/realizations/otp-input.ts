import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * OtpInput, as Figma structure, drawn as it nests: its label over four empty boxes (an empty box shows
 * nothing: `placeholder` defaults to empty). Disabled and invalid down.
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
  exclude: ["type", "mask", "otp", "readOnly", "required", "groupSize"],
  given: { count: 4, name: "code" },
  slots: {
    label: { holds: "text", sample: "Verification code" },
  },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
