import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/** The variants of the default action, which is everything the split half offers. */
export const splitMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "save-copy" }, slots: { label: t("demo.buttonGroup.copy") } },
  { options: { value: "save-template" }, slots: { label: t("demo.buttonGroup.template") } },
];

/** More mail actions, behind the size example's final ButtonGroup member. */
export const mailMoreItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "snooze" }, slots: { label: t("demo.buttonGroup.snooze") } },
  { options: { value: "mark-unread" }, slots: { label: t("demo.buttonGroup.markUnread") } },
];

export const currencyItems: readonly ItemInput[] = [
  { options: { value: "usd" }, slots: { label: "USD" } },
  { options: { value: "eur" }, slots: { label: "EUR" } },
  { options: { value: "clp" }, slots: { label: "CLP" } },
];
