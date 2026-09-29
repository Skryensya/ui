import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/* Zag's own segment names are hardcoded English; every demo passes the page's locale instead. */
const segmentLabel = (t: Translate) => ({ segmentLabel: t("otpInput.segmentLabel") });

/** Label, the row of segments and the hint: the parts at rest. */
export const otpInputAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("otpInput.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "otp-input",
      signature: "OtpInput",
      options: { name: "otp-anatomy", ...segmentLabel(t) },
      slots: { label: t("otpInput.smsLabel"), hint: t("otpInput.smsHint") },
    },
    items: [
      namePart(".sk-otp-input", "block-start", { mark: "bracket" }),
      namePart(".sk-otp-input__label", "inline-start"),
      namePart(".sk-otp-input__control", "inline-end"),
      namePart(".sk-otp-input__segment", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-otp-input__hint", "inline-end"),
    ],
  },
});

/*
 * 1. A code sent by SMS: the defaults. Six digits, `otp` on, so the phone offers the code it just
 * received as a keyboard suggestion.
 */
export const otpInputSmsTree = (t: Translate): UsageTree => ({
  contract: "otp-input",
  signature: "OtpInput",
  options: { name: "sms-code", required: true, ...segmentLabel(t) },
  slots: { label: t("otpInput.smsLabel"), hint: t("otpInput.smsHint") },
});

/* 2. A code with letters: a recovery or pairing code, where a numeric keypad would be wrong. */
export const otpInputAlphanumericTree = (t: Translate): UsageTree => ({
  contract: "otp-input",
  signature: "OtpInput",
  options: { name: "pairing-code", type: "alphanumeric", otp: false, count: 5, ...segmentLabel(t) },
  slots: { label: t("otpInput.alphanumericLabel"), hint: t("otpInput.alphanumericHint") },
});

/*
 * 3. A PIN: something the person knows, not something that was sent. Masked, four digits, and `otp`
 * off, so the phone does not offer an unrelated SMS code for it.
 */
export const otpInputPinTree = (t: Translate): UsageTree => ({
  contract: "otp-input",
  signature: "OtpInput",
  options: { name: "pin", count: 4, mask: true, otp: false, ...segmentLabel(t) },
  slots: { label: t("otpInput.pinLabel") },
});

/* 4. The states: a code the server rejected, and one that cannot be changed right now. */
export const otpInputStatesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "otp-input",
      signature: "OtpInput",
      options: { name: "invalid-code", invalid: true, defaultValue: "482913", ...segmentLabel(t) },
      slots: { label: t("otpInput.smsLabel"), hint: t("otpInput.invalidHint") },
    },
    {
      contract: "otp-input",
      signature: "OtpInput",
      options: { name: "disabled-code", disabled: true, ...segmentLabel(t) },
      slots: { label: t("otpInput.disabledLabel") },
    },
  ],
});

/* One code, the specimen the `mask` and `invalid` previews vary: filled, so masking shows. */
export const otpInputSingleTree = (t: Translate): UsageTree => ({
  contract: "otp-input",
  signature: "OtpInput",
  options: { name: "single-code", defaultValue: "482913", ...segmentLabel(t) },
  slots: { label: t("otpInput.smsLabel") },
});

/* Don't: a code with nothing saying where it was sent. */
export const otpInputDontNoHintTree = (t: Translate): UsageTree => ({
  contract: "otp-input",
  signature: "OtpInput",
  options: { name: "sms-code-nohint", ...segmentLabel(t) },
  slots: { label: t("otpInput.smsLabel") },
});

/* Don't: a long key cut into sixteen boxes. */
export const otpInputDontLongTree = (t: Translate): UsageTree => ({
  contract: "otp-input",
  signature: "OtpInput",
  options: { name: "license-key", type: "alphanumeric", otp: false, count: 16, ...segmentLabel(t) },
  slots: { label: t("otpInput.dd.licenseLabel") },
});

export const otpInputDoLongTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("otpInput.dd.licenseLabel") },
  children: { contract: "input", signature: "Input", options: { name: "license-key-input", placeholder: "XXXX-XXXX-XXXX-XXXX" } },
  attrs: { style: "inline-size: 16rem" },
});
