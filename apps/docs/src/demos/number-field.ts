import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/** Label, control, both steppers and the input: the spinbutton's own parts at rest. */
export const numberFieldAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("numberFieldPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "number-field",
      signature: "NumberField",
      options: {
        locale: t("kit.locale"),
        defaultValue: "5",
        decrementLabel: t("demo.numberField.decrement"),
        incrementLabel: t("demo.numberField.increment"),
        max: 20,
        min: 0,
        name: "quantity-anatomy",
        step: 1,
      },
      slots: { label: t("demo.numberField.label") },
    },
    items: [
      namePart(".sk-number-field", "block-start", { mark: "bracket" }),
      namePart(".sk-number-field__label", "inline-start"),
      namePart(".sk-number-field__control", "block-end"),
      namePart(".sk-number-field__decrement", "inline-start"),
      namePart(".sk-number-field__input", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-number-field__increment", "inline-end"),
    ],
  },
});

/** A bounded quantity with explicit names for both icon-only steppers. */
export const numberFieldTree = (t: Translate): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    locale: t("kit.locale"),
    defaultValue: "5",
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    max: 20,
    min: 0,
    name: "quantity",
    step: 1,
  },
  slots: { label: t("demo.numberField.label") },
});

/* One field: the specimen the States showcase repeats. */
export const numberFieldSingleTree = (t: Translate): UsageTree => ({
  ...numberFieldTree(t),
  attrs: { style: "inline-size: min(100%, 14rem)" },
});

/* Don't: an approximate value typed digit by digit, where dragging reads better. */
export const numberFieldDontApproxTree = (t: Translate): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    locale: t("kit.locale"),
    defaultValue: "65",
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    max: 100,
    min: 0,
    name: "volume",
    step: 1,
  },
  slots: { label: t("demo.numberField.dd.volume") },
  attrs: { style: "inline-size: 14rem" },
});

/*
 * ONE NUMBER, THREE LOCALES: the field writes the same amount the way each language does (grouping and
 * decimal mark), and what is submitted is still the number. A field's `locale` is a choice made per
 * instance and the difference shows at rest, so it is the one property here that earns a live card.
 * `defaultValue` is written the way the field's own locale writes a number (the machine reads it back
 * with that locale), so each language gets its own spelling of the same amount.
 */
const amountByLocale: Record<string, string> = { "en-US": "1234567.89", "es-CL": "1234567,89", "en-IN": "1234567.89" };

export const numberFieldLocaleTree = (t: Translate, locale: string): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    locale,
    defaultValue: amountByLocale[locale] ?? "1234567.89",
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    name: `amount-${locale}`,
    step: 1,
  },
  slots: { label: t("demo.numberField.amount") },
  attrs: { style: "inline-size: min(100%, 16rem)" },
});

/* A step smaller than one: half a kilo at a time, so the decimal mark shows. */
export const numberFieldDecimalTree = (t: Translate): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    locale: t("kit.locale"),
    defaultValue: "2.5",
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    max: 10,
    min: 0,
    name: "weight",
    step: 0.5,
  },
  slots: { label: t("demo.numberField.weight") },
  attrs: { style: "inline-size: min(100%, 14rem)" },
});

/* No `min` and no `max`: the value can go anywhere, which is right for an adjustment and wrong for a count. */
export const numberFieldUnboundedTree = (t: Translate): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    locale: t("kit.locale"),
    defaultValue: "0",
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    name: "offset",
    step: 1,
  },
  slots: { label: t("demo.numberField.offset") },
  attrs: { style: "inline-size: min(100%, 14rem)" },
});

/* Usage guide. A count has a floor: the Do states it, the Don't lets a stay be minus two nights. */
const nights = (t: Translate, options: Record<string, unknown>, label: string): UsageTree => ({
  contract: "number-field",
  signature: "NumberField",
  options: {
    locale: t("kit.locale"),
    decrementLabel: t("demo.numberField.decrement"),
    incrementLabel: t("demo.numberField.increment"),
    name: "nights",
    step: 1,
    ...options,
  },
  slots: { label },
  attrs: { style: "inline-size: 14rem" },
});

export const numberFieldDoBoundsTree = (t: Translate): UsageTree =>
  nights(t, { defaultValue: "1", min: 1, max: 14 }, t("demo.numberField.nights"));

export const numberFieldDontBoundsTree = (t: Translate): UsageTree =>
  nights(t, { defaultValue: "-2" }, t("demo.numberField.nights"));

/* Usage guide. The label says what is counted; "Number" says nothing a person can act on. */
export const numberFieldDoLabelTree = (t: Translate): UsageTree =>
  nights(t, { defaultValue: "3", min: 1, max: 14 }, t("demo.numberField.nights"));

export const numberFieldDontLabelTree = (t: Translate): UsageTree =>
  nights(t, { defaultValue: "3", min: 1, max: 14 }, t("demo.numberField.generic"));
