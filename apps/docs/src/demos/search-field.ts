import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

const width = { style: "inline-size: 24rem; max-inline-size: 100%;" };

/* 1. The live filter: the query narrows something on this page, so nothing is submitted. */
export const searchFieldFilterTree = (t: Translate): UsageTree => ({
  contract: "search-field",
  signature: "SearchField",
  options: { name: "q", placeholder: t("searchField.filterPlaceholder"), clearLabel: t("searchField.clearLabel") },
  attrs: width,
  slots: { label: t("searchField.filterLabel") },
});

/* 2. The site search: a GET form with the `search` landmark. The page already says what it searches. */
export const searchFieldFormTree = (t: Translate): UsageTree => ({
  contract: "search-field",
  signature: "SearchField.form",
  options: { action: "/search", name: "q", labelVisuallyHidden: true, clearLabel: t("searchField.clearLabel") },
  attrs: width,
  slots: { label: t("searchField.formLabel"), submit: t("searchField.submit") },
});

/** Label, magnifier, input, clear button and submit: the parts of the form, at rest. */
export const searchFieldAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("searchField.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "search-field",
      signature: "SearchField.form",
      options: { action: "/search", name: "q-anatomy", clearLabel: t("searchField.clearLabel") },
      attrs: width,
      slots: { label: t("searchField.formLabel"), submit: t("searchField.submit") },
    },
    items: [
      namePart(".sk-search-field", "block-start", { mark: "bracket" }),
      namePart(".sk-search-field__label", "inline-start"),
      namePart(".sk-search-field__icon", "inline-start"),
      namePart(".sk-search-field__input", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-search-field__submit", "inline-end"),
    ],
  },
});
