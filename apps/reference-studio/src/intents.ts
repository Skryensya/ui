import type { ComboboxItem } from "@skryensya/core/combobox";
import { intents } from "@skryensya/reference-model";
/* The id is the label because it is what gets searched: typing `metrics/` narrows to a domain. */
export const intentItems: ComboboxItem[] = intents.map((i) => ({
  value: i.id,
  label: i.id,
  description: typeof i.label === "string" ? i.label : i.label.en,
}));
/** Combobox copy in the studio's language (the kit's defaults are Spanish). */
export const comboboxCopy = {
  clearLabel: "Clear",
  emptyLabel: "No matching intent",
  selectedLabel: "Selected intent",
  resultCountLabel: ({ count }: { count: number }) =>
    `${count} ${count === 1 ? "intent" : "intents"}`,
};
