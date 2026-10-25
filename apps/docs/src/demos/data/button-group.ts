import type { ItemInput } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";

/** The variants of the default action, which is everything the split half offers. */
export const splitMenuItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "save-copy" }, slots: { label: t("demo.buttonGroup.copy") } },
  { options: { value: "save-template" }, slots: { label: t("demo.buttonGroup.template") } },
];

export const currencyItems: readonly ItemInput[] = [
  { options: { value: "usd" }, slots: { label: "USD" } },
  { options: { value: "eur" }, slots: { label: "EUR" } },
  { options: { value: "clp" }, slots: { label: "CLP" } },
];
