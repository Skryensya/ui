import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Locale, Translate } from "../i18n";
import { localeOf } from "../i18n";
import { countries, slug } from "./data/countries";

/*
 * One combobox over the whole country list, from the contract published for it.
 *
 * The list is filtered client-side by both bindings, so "every country" costs no more markup logic
 * than the four rows this demo used to ship, only more entries. That is the point of the demo: a
 * combobox earns its place exactly when the list is too long to scan.
 *
 * The names come from `./data/countries` rather than from `demo.*` keys: 194 keys pairing two proper
 * nouns would be a dictionary pretending to be a translation table.
 */
export const comboboxTree = (t: Translate, locale: Locale = localeOf(t)): UsageTree => ({
  contract: "combobox",
  signature: "Combobox",
  options: { name: "country", placeholder: t("demo.combobox.placeholder") },
  slots: {
    label: t("demo.combobox.label"),
    hint: t("demo.combobox.hint"),
    items: countries[locale].map((name) => ({
      options: { value: slug(name) },
      slots: { label: name },
    })),
  },
});

/* One field, the specimen the `appearance` and `disabled` previews vary. */
export const comboboxSingleTree = (t: Translate, locale: Locale = localeOf(t)): UsageTree => ({
  ...comboboxTree(t, locale),
  attrs: { style: "inline-size: min(100%, 18rem)" },
});

const sizeItems = [
  { options: { value: "s" }, slots: { label: "S" } },
  { options: { value: "m" }, slots: { label: "M" } },
  { options: { value: "l" }, slots: { label: "L" } },
] as const;

/* Do: three options can be read at once. */
export const comboboxDoFewTree = (t: Translate): UsageTree => ({
  contract: "radio-group",
  signature: "RadioGroup",
  options: { name: "size-radio", value: "m", orientation: "horizontal", label: t("demo.combobox.dd.size") },
  slots: { items: sizeItems },
});

/* Frozen open state, so the comparison shows the three choices that need no filtering. */
export const comboboxDontFewHtml = (t: Translate): string => `<div class="sk-combobox sk-form-field" style="inline-size: 16rem">
  <label class="sk-combobox__label sk-form-field__label">${t("demo.combobox.dd.size")}</label>
  <div class="sk-combobox__control sk-anchor">
    <div class="sk-combobox__value"><input class="sk-combobox__input" type="text" value="" placeholder="${t("demo.combobox.dd.sizePlaceholder")}" readonly tabindex="-1" /></div>
    <span class="sk-combobox__trigger" data-state="open" aria-hidden="true">
      <span data-state="closed">⌄</span><span data-state="open">⌃</span>
    </span>
  </div>
  <div class="sk-combobox__positioner sk-anchored" style="position: static; inline-size: 100%;">
    <div class="sk-combobox__content sk-scrollbar" data-state="open" role="listbox">
      <div class="sk-combobox__item sk-interactive" role="option"><span class="sk-combobox__item-copy"><span class="sk-combobox__item-label">S</span></span></div>
      <div class="sk-combobox__item sk-interactive" role="option"><span class="sk-combobox__item-copy"><span class="sk-combobox__item-label">M</span></span></div>
      <div class="sk-combobox__item sk-interactive" role="option"><span class="sk-combobox__item-copy"><span class="sk-combobox__item-label">L</span></span></div>
    </div>
  </div>
</div>`;

/* Don't: three options behind typing, where radios show them all. */
export const comboboxDontFewTree = (t: Translate): UsageTree => ({
  contract: "combobox",
  signature: "Combobox",
  options: { name: "size", placeholder: t("demo.combobox.dd.sizePlaceholder") },
  attrs: { style: "inline-size: 16rem" },
  slots: {
    label: t("demo.combobox.dd.size"),
    items: sizeItems,
  },
});

/* Several countries at once, each chosen one a removable chip. */
export const comboboxMultipleTree = (t: Translate, locale: Locale = localeOf(t)): UsageTree => ({
  ...comboboxSingleTree(t, locale),
  options: { name: "countries", placeholder: t("demo.combobox.placeholder"), multiple: true },
  slots: { ...comboboxTree(t, locale).slots, label: t("demo.combobox.multipleLabel") },
});
