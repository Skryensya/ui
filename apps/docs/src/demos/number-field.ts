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

/* One field, the specimen the `appearance` and `disabled` previews vary. */
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
