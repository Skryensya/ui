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

/* Don't: a long key cut into ten boxes. */
export const otpInputDontLongTree = (t: Translate): UsageTree => ({
  contract: "otp-input",
  signature: "OtpInput",
  options: { name: "license-key", type: "alphanumeric", otp: false, count: 10, ...segmentLabel(t) },
  slots: { label: t("otpInput.dd.licenseLabel") },
});

export const otpInputDoLongTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("otpInput.dd.licenseLabel") },
  children: { contract: "input", signature: "Input", options: { name: "license-key-input", placeholder: "XXXX-XXXX-XXXX-XXXX" } },
  attrs: { style: "inline-size: 16rem" },
});

/* The one code the `count` card varies: as many digits as there are boxes, so each length reads full. */
export const otpInputCountCase = (
  t: Translate,
  length: number = 6,
  override: { label?: string; defaultValue?: string } = {},
): UsageTree => {
  /* A number or the default: the demo corpus gate calls every factory with a few stand-in arguments. */
  const count = typeof length === "number" ? length : 6;
  const given = typeof override === "object" && override !== null ? override : {};
  return {
    contract: "otp-input",
    signature: "OtpInput",
    options: {
      name: `count-${count}`,
      count,
      defaultValue: given.defaultValue ?? "48291356".slice(0, count),
      ...segmentLabel(t),
    },
    slots: { label: given.label ?? t("otpInput.smsLabel") },
  };
};

/* The same code in each state the field can be in: what a person is told changes with it. */
export const otpInputStateCase = (t: Translate, which: "default" | "readOnly" | "invalid" | "disabled" = "default"): UsageTree => {
  const state = ["readOnly", "invalid", "disabled"].includes(which) ? which : "default";
  return {
    contract: "otp-input",
    signature: "OtpInput",
    options: {
      name: `state-${state}`,
      defaultValue: "482913",
      ...(state === "default" ? {} : { [state]: true }),
      ...segmentLabel(t),
    },
    slots: { label: t("otpInput.smsLabel"), ...(state === "invalid" ? { hint: t("otpInput.invalidHint") } : {}) },
  };
};

/*
 * USAGE GUIDE: MASKING AND GROUPING. A Do/Don't half is static markup with no binding behind it, so a
 * `defaultValue` would never reach the boxes and a masked one would show nothing to compare. These are
 * frozen specimens: the digits are in the inputs and the `mask` symbol is already over them, the same
 * markup the template writes and the bindings keep. Boxes are drawn small so eight fit the frame.
 */
const specimen = (
  t: Translate,
  { label, value, mask = false, groupSize }: { label: string; value: string; mask?: boolean; groupSize?: 2 | 3 | 4 },
): string => {
  const cells = value
    .split("")
    .map(
      (digit) => `<span class="sk-otp-input__cell" data-filled><input class="sk-otp-input__segment sk-interactive" type="text" value="${digit}" readonly tabindex="-1" aria-label="${t("otpInput.dd.segment")}" /><span class="sk-otp-input__mask" aria-hidden="true"><span data-sk-icon="mask" data-sk-icon-size="md"></span></span></span>`,
    )
    .join("");
  return `<div class="sk-otp-input"${mask ? " data-mask" : ""}${groupSize ? ` data-group-size="${groupSize}"` : ""} style="--sk-otp-input-segment-size: 1.75rem; --sk-otp-input-gap: 0.125rem; --sk-otp-input-group-gap: var(--space-inline-md); font-size: var(--font-size-body-sm);">
  <span class="sk-otp-input__label">${label}</span>
  <div class="sk-otp-input__control">${cells}</div>
</div>`;
};

export const otpInputDoMaskHtml = (t: Translate): string =>
  specimen(t, { label: t("otpInput.pinLabel"), value: "4821", mask: true });

export const otpInputDontMaskHtml = (t: Translate): string =>
  specimen(t, { label: t("otpInput.smsLabel"), value: "482913", mask: true });

/* Eight boxes in one row are read and keyed digit by digit; two groups of four are not. */
export const otpInputDoGroupHtml = (t: Translate): string =>
  specimen(t, { label: t("otpInput.recoveryLabel"), value: "48291356", groupSize: 4 });

export const otpInputDontGroupHtml = (t: Translate): string =>
  specimen(t, { label: t("otpInput.recoveryLabel"), value: "48291356" });

/** Don't: a one-time code typed into a single hidden field. Nothing suggests the SMS, and it cannot be checked. */
export const otpInputDontPasswordTree = (t: Translate): UsageTree => ({
  contract: "password-input",
  signature: "PasswordInput",
  options: { name: "code-as-password", showLabel: t("passwordInput.showLabel"), hideLabel: t("passwordInput.hideLabel") },
  attrs: { style: "inline-size: 18rem; max-inline-size: 100%;" },
  slots: { label: t("otpInput.smsLabel") },
});
