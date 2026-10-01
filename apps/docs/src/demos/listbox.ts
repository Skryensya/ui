import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * THE LISTBOX EXAMPLES, AS USAGE TREES, so both stages come from one source. Every option is a
 * `{ value, label }` entry; the initial selection is marked on the option itself (`defaultSelected`),
 * which is how the contract says "these two" as easily as "this one".
 */

const option = (value: string, label: string, extra: { defaultSelected?: boolean; disabled?: boolean } = {}) => ({
  options: { value, ...extra },
  slots: { label },
});

/** Anatomy: one list with a chosen option, so the check has something to point at. */
export const listboxAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("listbox.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "listbox",
      signature: "Listbox",
      attrs: { style: "inline-size: 16rem;" },
      slots: {
        label: t("listbox.demoViewLabel"),
        items: [
          option("list", t("listbox.demoViewList"), { defaultSelected: true }),
          option("board", t("listbox.demoViewBoard")),
          option("calendar", t("listbox.demoViewCalendar")),
        ],
      },
    },
    items: [
      namePart(".sk-listbox", "block-start", { mark: "bracket" }),
      namePart(".sk-listbox__label", "inline-start"),
      namePart(".sk-listbox__content", "inline-start"),
      namePart(".sk-listbox__item", "inline-end"),
      namePart(".sk-listbox__item-text", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-listbox__item-indicator", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** 1. One choice, seen whole while it is made: how a list of things is shown. */
export const listboxSingleTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  attrs: { style: "inline-size: 16rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoViewLabel"),
    items: [
      option("list", t("listbox.demoViewList"), { defaultSelected: true }),
      option("board", t("listbox.demoViewBoard")),
      option("calendar", t("listbox.demoViewCalendar")),
      option("timeline", t("listbox.demoViewTimeline")),
    ],
  },
});

/** 2. Several at once, two chosen from the start and one that cannot be. */
export const listboxMultipleTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  options: { selectionMode: "multiple" },
  attrs: { style: "inline-size: 16rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoLabelsLabel"),
    items: [
      option("bug", t("listbox.demoLabelBug"), { defaultSelected: true }),
      option("docs", t("listbox.demoLabelDocs")),
      option("design", t("listbox.demoLabelDesign"), { defaultSelected: true }),
      option("performance", t("listbox.demoLabelPerformance")),
      option("legacy", t("listbox.demoLabelLegacy"), { disabled: true }),
    ],
  },
});

/** 3. Across rather than down: the left and right arrows move, and the row scrolls if it must. */
export const listboxHorizontalTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  options: { orientation: "horizontal", selectionMode: "multiple" },
  slots: {
    label: t("listbox.demoDaysLabel"),
    items: (["mon", "tue", "wed", "thu", "fri"] as const).map((day) =>
      option(day, t(`listbox.demoDay.${day}`), { defaultSelected: day === "mon" || day === "wed" }),
    ),
  },
});

/* One list, the specimen the `selectionMode` and `orientation` previews vary. */
export const listboxPlainTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  attrs: { style: "inline-size: min(100%, 16rem)" },
  slots: {
    label: t("listbox.demoViewLabel"),
    items: [
      option("list", t("listbox.demoViewList"), { defaultSelected: true }),
      option("board", t("listbox.demoViewBoard")),
      option("calendar", t("listbox.demoViewCalendar")),
    ],
  },
});

export const listboxDoMultipleFiltersTree = (t: Translate): UsageTree => listboxMultipleTree(t);

export const listboxDontSingleFiltersTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  attrs: { style: "inline-size: 16rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoLabelsLabel"),
    items: [
      option("bug", t("listbox.demoLabelBug"), { defaultSelected: true }),
      option("docs", t("listbox.demoLabelDocs")),
      option("design", t("listbox.demoLabelDesign")),
      option("performance", t("listbox.demoLabelPerformance")),
    ],
  },
});

export const listboxDoHorizontalShortTree = (t: Translate): UsageTree => listboxHorizontalTree(t);

export const listboxDontHorizontalLongTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  options: { orientation: "horizontal" },
  attrs: { style: "inline-size: 16rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoViewLabel"),
    items: [
      option("table", t("listbox.dd.fullTable"), { defaultSelected: true }),
      option("dashboard", t("listbox.dd.dashboard")),
      option("calendar", t("listbox.demoViewCalendar")),
    ],
  },
});

export const listboxDoDisabledTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  attrs: { style: "inline-size: 16rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoViewLabel"),
    items: [
      option("list", t("listbox.demoViewList"), { defaultSelected: true }),
      option("board", t("listbox.demoViewBoard")),
      option("timeline", t("listbox.demoViewTimeline"), { disabled: true }),
    ],
  },
});

export const listboxDontMissingTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  attrs: { style: "inline-size: 16rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoViewLabel"),
    items: [
      option("list", t("listbox.demoViewList"), { defaultSelected: true }),
      option("board", t("listbox.demoViewBoard")),
    ],
  },
});

export const listboxDoNaturalOrderTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  options: { selectionMode: "multiple" },
  attrs: { style: "inline-size: 14rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoDaysLabel"),
    items: (["mon", "tue", "wed", "thu", "fri"] as const).map((day) => option(day, t(`listbox.demoDay.${day}`))),
  },
});

export const listboxDontAlphabeticalDaysTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  options: { selectionMode: "multiple" },
  attrs: { style: "inline-size: 14rem; max-inline-size: 100%;" },
  slots: {
    label: t("listbox.demoDaysLabel"),
    items: (["fri", "mon", "thu", "tue", "wed"] as const).map((day) => option(day, t(`listbox.demoDay.${day}`))),
  },
});

/* Don't: commands in a listbox, which reads as a choice that stays chosen. */
export const listboxDontActionsTree = (t: Translate): UsageTree => ({
  contract: "listbox",
  signature: "Listbox",
  attrs: { style: "inline-size: 14rem" },
  slots: {
    label: t("listbox.dd.actionsLabel"),
    items: [
      option("duplicate", t("listbox.dd.duplicate")),
      option("rename", t("listbox.dd.rename")),
      option("delete", t("listbox.dd.delete")),
    ],
  },
});
