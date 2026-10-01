import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The color picker four ways: full, compact, with presets, and native. The native one has its own
 * signature (`ColorPicker.native`) for the reason `DatePicker.native` has one: choosing between
 * them is choosing WHO OWNS the behaviour, the browser or an enhancer, and no flag should be able
 * to stand in for that decision.
 */

export const colorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker",
  options: {
    triggerLabel: t("kit.chooseColor"),
    name: "brand",
    value: "#3366ff",
    swatches: "#3366ff #22c55e #f59e0b #ef4444 #111827 #ffffff",
  },
  slots: { label: t("demo.colorPicker.label") },
});

export const compactColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker.compact",
  options: {
    triggerLabel: t("kit.chooseColor"),
    name: "accent",
    value: "#22aabb",
    swatches: "#22aabb #3366ff #22c55e #f59e0b",
  },
  slots: { label: t("demo.colorPicker.compactLabel") },
});

export const presetsColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker",
  options: {
    triggerLabel: t("kit.chooseColor"),
    name: "brand",
    value: "#3366ff",
    swatches: "#ef4444 #22c55e #3366ff #f59e0b #111111 #ffffff",
  },
  slots: { label: t("demo.colorPicker.presetsLabel") },
});

export const disabledColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker",
  options: { triggerLabel: t("kit.chooseColor"), value: "#3366ff", disabled: true },
  slots: { label: t("demo.colorPicker.label") },
});

/** The layer that works with no script at all: a real `<input type="color">` in the same chrome. */
export const nativeColorPickerTree = (t: Translate): UsageTree => ({
  contract: "color-picker",
  signature: "ColorPicker.native",
  options: { name: "bg", value: "#ffffff" },
  slots: { label: t("demo.colorPicker.nativeLabel") },
});
