import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { selectTree } from "./select";
import { comboboxSingleTree } from "./combobox";
import { datePickerTree } from "./date-picker";
import { timeFieldTree } from "./time-field";
import { colorPickerTree } from "./color-picker";
import { tagsInputTree } from "./tags-input";
import { editorTree } from "./editor";
import { clipboardFieldTree } from "./clipboard";
import { tocPlainTree } from "./toc";

type UIKey = Parameters<Translate>[0];

/*
 * THE SECOND PAIR FOR THE FIELD-SHAPED COMPONENTS: THE NAME.
 *
 * Every one of these pages already says "name the field by what it is for", and every one has a first pair about
 * something else. Here the same specimen is drawn twice with only its visible name changed, so the lesson is the one
 * word: "Country" against "Choose", "Check-in" against "Date". The specimens are the pages' own trees; the name is
 * written over the one slot or option each of them names its field with.
 */

type Where = "slot" | "option" | "title" | "fieldLabel";

function relabel(tree: UsageTree, where: Where, value: string): UsageTree {
  if (where === "slot") return { ...tree, slots: { ...(tree.slots ?? {}), label: value } };
  if (where === "fieldLabel") return { ...tree, slots: { ...(tree.slots ?? {}), fieldLabel: value } };
  if (where === "title") return { ...tree, options: { ...(tree.options ?? {}), title: value } };
  return { ...tree, options: { ...(tree.options ?? {}), label: value } };
}

const pair = (slug: string, base: (t: Translate) => UsageTree, where: Where) => ({
  do: (t: Translate): UsageTree => relabel(base(t), where, t(`dd2.${slug}.doLabel` as UIKey)),
  dont: (t: Translate): UsageTree => relabel(base(t), where, t(`dd2.${slug}.dontLabel` as UIKey)),
});

export const dd2 = {
  select: pair("select", selectTree, "slot"),
  combobox: pair("combobox", comboboxSingleTree, "slot"),
  datePicker: pair("datePicker", datePickerTree, "slot"),
  timeField: pair("timeField", timeFieldTree, "slot"),
  colorPicker: pair("colorPicker", colorPickerTree, "slot"),
  tagsInput: pair("tagsInput", tagsInputTree, "option"),
  editor: pair("editor", editorTree, "option"),
  clipboard: pair("clipboard", clipboardFieldTree, "fieldLabel"),
  toc: pair("toc", tocPlainTree, "title"),
};

/* ───────────── Separator: a word or two ───────────── */

const signInWith = (t: Translate, between: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    { contract: "button", signature: "Button.action", options: { variant: "solid", tone: "accent" }, slots: { children: t("demo.separator.signInWithKey") } },
    { contract: "separator", signature: "LabelledSeparator", slots: { children: between } },
    { contract: "button", signature: "Button.action", options: { variant: "soft" }, slots: { children: t("demo.separator.signInWithEmail") } },
  ],
});

export const separatorWordDoTree = (t: Translate): UsageTree => signInWith(t, t("demo.separator.or"));
export const separatorWordDontTree = (t: Translate): UsageTree => signInWith(t, t("dd2.separator.long"));

/* ───────────── Segmented: one or two words, one shape ───────────── */

const segmented = (t: Translate, labels: readonly string[]): UsageTree => ({
  contract: "segmented",
  signature: "Segmented",
  options: { value: "a", label: t("demo.segmented.label") },
  attrs: { style: "max-inline-size: 100%;" },
  slots: { items: labels.map((label, i) => ({ options: { value: ["a", "b", "c"][i]! }, slots: { label } })) },
});

export const segmentedShapeDoTree = (t: Translate): UsageTree =>
  segmented(t, [t("demo.segmented.day"), t("demo.segmented.week"), t("demo.segmented.month")]);

export const segmentedShapeDontTree = (t: Translate): UsageTree =>
  segmented(t, [t("dd2.segmented.a"), t("dd2.segmented.b"), t("dd2.segmented.c")]);
