import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { planItems } from "./data/select";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * Two demos for one claim: the chrome is not the control's.
 *
 * The first fills every slot so the six ids are all on screen at once; the second is the same chrome
 * around a `<select>`, which is the whole reason the contract is not called Input. Read together they
 * show the wiring never asking what it wrapped.
 */

/** Label, required mark, hint and error all present: the chrome the diagram names. */
export const formFieldAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("formFieldPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: formFieldTree(t),
    items: [
      /* The field's own box has no corner of its own to borrow, and its parts sit flush against its
         edges: an inset ring would trace the same line as the label's. Offset far enough to read as
         the box AROUND them, with a corner so it reads as a mark and not as a crop. */
      namePart(".sk-form-field", "block-start", { mark: "bracket", ringPlacement: "offset", ringDistance: 10, ringRadius: 10 }),
      /* Text has square corners and no edge to speak of, so a ring drawn 2px off the glyphs reads as
         an underline that failed. Clear of the text, and rounded, so each one reads as one mark. */
      namePart(".sk-form-field__label", "inline-start", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
      /* THE SLOTTED CONTROL, and the only name here that belongs to another contract. It is named
         anyway because that is the claim: the chrome holds a control it never asks about, and a hole
         with no name in the middle of the drawing states the opposite. No `ringRadius`: the input
         has a corner of its own, and letting the ring take it is what says the ring is ITS outline
         and not one more box the diagram laid on top. */
      namePart(".sk-input", "inline-start", { ringPlacement: "offset", ringDistance: 3 }),
      namePart(".sk-form-field__required", "inline-end", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
      namePart(".sk-form-field__hint", "inline-end", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
      namePart(".sk-form-field__error", "block-end", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
    ],
  },
});

/** One email field, already invalid: the error's presence is what marks the control. */
export const formFieldTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  options: { required: true },
  slots: {
    label: "Email",
    hint: t("demo.formField.hint"),
    error: t("demo.formField.error"),
  },
  children: {
    contract: "input",
    signature: "Input",
    options: { type: "email", name: "email" },
  },
});

/*
 * The same chrome, a different control. Nothing about the field changes: it derives its ids from
 * whatever signature is slotted into it, and a `<select>` host cannot carry its own visible label.
 */
export const formFieldAroundSelectTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: {
    label: t("demo.select.label"),
    hint: t("demo.formField.planHint"),
  },
  children: {
    contract: "select",
    signature: "Select.native",
    options: { name: "plan" },
    slots: { items: planItems },
  },
});

/* Do/Don't: the field has a real label; the placeholder is only an example value. */
export const formFieldDoLabelTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.email") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "email", name: "email-label", placeholder: "name@example.com" } },
});

export const formFieldDontLabelTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.information") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "email", name: "email-placeholder", placeholder: t("demo.formField.dd.email") } },
});

/* Do/Don't: the format said up front in the hint, or only after it fails. */
export const formFieldDoHintTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.date"), hint: t("demo.formField.dd.dateHint") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "date-hint" } },
});

export const formFieldDontHintTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.date"), error: t("demo.formField.dd.dateError") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "date-error" } },
});

/* Do/Don't: an error gives a fix, not only a verdict. */
export const formFieldDoErrorTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.email"), error: t("demo.formField.dd.emailError") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "email", name: "email-specific-error" }, attrs: { value: "ana" } },
});

export const formFieldDontErrorTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.email"), error: t("demo.formField.dd.genericError") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "email", name: "email-generic-error" }, attrs: { value: "ana" } },
});

/* Do/Don't: required is a real control state, not just words in the label. */
export const formFieldDoRequiredTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  options: { required: true },
  slots: { label: t("demo.formField.dd.taxId"), hint: t("demo.formField.dd.taxIdHint") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "tax-id-required" } },
});

export const formFieldDontRequiredTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.taxIdRequiredText"), hint: t("demo.formField.dd.taxIdHint") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "tax-id-text-only" } },
});

/* Do/Don't: one field asks one question. */
export const formFieldDoOneQuestionTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.legalName"), hint: t("demo.formField.dd.legalNameHint") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "legal-name" }, attrs: { autocomplete: "name" } },
});

export const formFieldDontOneQuestionTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.nameAndPhone") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "name-and-phone", placeholder: t("demo.formField.dd.nameAndPhonePlaceholder") } },
});

/* Do/Don't: long answers get a multiline control. */
export const formFieldDoTextareaTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.deliveryNotes"), hint: t("demo.formField.dd.deliveryNotesHint") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Textarea", options: { name: "delivery-notes" }, attrs: { rows: "4" } },
});

export const formFieldDontTextareaTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.deliveryNotes") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "delivery-notes-one-line", placeholder: t("demo.formField.dd.deliveryNotesPlaceholder") } },
});

/* Do/Don't: the hint adds information instead of repeating the label. */
export const formFieldDoPurposeTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.phone"), hint: t("demo.formField.dd.phonePurpose") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "tel", name: "phone-purpose" }, attrs: { autocomplete: "tel" } },
});

export const formFieldDontPurposeTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.phone"), hint: t("demo.formField.dd.phoneRepeat") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "tel", name: "phone-repeat" }, attrs: { autocomplete: "tel" } },
});

/* Do/Don't: server validation belongs in the error slot. */
export const formFieldDoServerErrorTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.email"), error: t("demo.formField.dd.accountError") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "email", name: "account-email" }, attrs: { value: "ana@example.com" } },
});

export const formFieldDontServerErrorTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.email"), hint: t("demo.formField.dd.accountError") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { type: "email", name: "account-email-hint" }, attrs: { value: "ana@example.com" } },
});

/* Do/Don't: optional is helper text, not the value placeholder. */
export const formFieldDoOptionalTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.middleName"), hint: t("demo.formField.dd.optional") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "middle-name" }, attrs: { autocomplete: "additional-name" } },
});

export const formFieldDontOptionalTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.formField.dd.middleName") },
  attrs: { style: "inline-size: 16rem" },
  children: { contract: "input", signature: "Input", options: { name: "middle-name-placeholder", placeholder: t("demo.formField.dd.optional") } },
});
