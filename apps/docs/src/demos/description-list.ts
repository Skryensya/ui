import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

type UIKey = Parameters<Translate>[0];
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/** One pair. The keys are typed off Translate so a misspelled message id fails the build. */
const item = (t: Translate, term: UIKey, value: UIKey): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionItem",
  slots: { term: t(term), children: t(value) },
});

/** The list, one pair, and the two halves inside it. */
export const descriptionListAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("descriptionListPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "description-list",
      signature: "DescriptionList",
      children: [
        item(t, "demo.descriptionList.order.term", "demo.descriptionList.order.value"),
        item(t, "demo.descriptionList.placed.term", "demo.descriptionList.placed.value"),
      ],
    },
    items: [
      namePart(".sk-description-list", "block-start", { mark: "bracket" }),
      namePart(".sk-description-list__group", "inline-start"),
      namePart(".sk-description-list__term", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-description-list__details", "inline-end", { ringPlacement: "offset", ringDistance: 4 }),
    ],
  },
});

/*
 * THE CASE THE COMPONENT WAS BUILT FOR: the details of one record. Stacked, which is the shape that
 * survives any width and any length of name.
 */
export const descriptionListTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [
    item(t, "demo.descriptionList.order.term", "demo.descriptionList.order.value"),
    item(t, "demo.descriptionList.placed.term", "demo.descriptionList.placed.value"),
    item(t, "demo.descriptionList.total.term", "demo.descriptionList.total.value"),
  ],
});

/** The same facts side by side. Below 36rem it stacks again on its own. */
export const descriptionListColumnsTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  options: { layout: "columns" },
  children: [
    item(t, "demo.descriptionList.order.term", "demo.descriptionList.order.value"),
    item(t, "demo.descriptionList.placed.term", "demo.descriptionList.placed.value"),
    item(t, "demo.descriptionList.total.term", "demo.descriptionList.total.value"),
    item(t, "demo.descriptionList.payment.term", "demo.descriptionList.payment.value"),
  ],
});

/** Ruled and tight: reference material to scan rather than prose to read. */
export const descriptionListDividedTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  options: { layout: "columns", dividers: true, density: "compact" },
  children: [
    item(t, "demo.descriptionList.spec.format.term", "demo.descriptionList.spec.format.value"),
    item(t, "demo.descriptionList.spec.size.term", "demo.descriptionList.spec.size.value"),
    item(t, "demo.descriptionList.spec.updated.term", "demo.descriptionList.spec.updated.value"),
    item(t, "demo.descriptionList.spec.licence.term", "demo.descriptionList.spec.licence.value"),
  ],
});

/*
 * The value is a NODE, and this is what that buys: a status as a Tag rather than as a word, and a
 * tracking number that is a link. The name stays text on purpose.
 */
export const descriptionListRichTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  options: { layout: "columns" },
  children: [
    {
      contract: "description-list",
      signature: "DescriptionItem",
      slots: {
        term: t("demo.descriptionList.status.term"),
        children: {
          contract: "tag",
          signature: "Tag",
          options: { tone: "success" },
          slots: { children: t("demo.descriptionList.status.value") },
        },
      },
    },
    {
      contract: "description-list",
      signature: "DescriptionItem",
      slots: {
        term: t("demo.descriptionList.tracking.term"),
        children: {
          contract: "typography",
          signature: "Link",
          options: { href: "https://example.org/t/4821" },
          slots: { children: t("demo.descriptionList.tracking.value") },
        },
      },
    },
  ],
});

/* Usage guide: three orders crammed into one list, so every name repeats and the rows have to be
   compared across records, which is a table's job. */
export const descriptionListDontManyTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  options: { dividers: true },
  children: ["#4821", "#4822", "#4823"].flatMap((order, index) => [
    { contract: "description-list", signature: "DescriptionItem", slots: { term: t("demo.descriptionList.order.term"), children: order } },
    {
      contract: "description-list",
      signature: "DescriptionItem",
      slots: { term: t("demo.descriptionList.total.term"), children: ["$38.990", "$12.400", "$7.250"][index]! },
    },
  ]),
});

/** Long terms need the stacked layout rather than a squeezed shared-looking label column. */
export const descriptionListLongTermsTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [
    item(t, "demo.descriptionList.longTerm1", "demo.descriptionList.longValue1"),
    item(t, "demo.descriptionList.longTerm2", "demo.descriptionList.longValue2"),
  ],
});

export const descriptionListDontLongTermsTree = (t: Translate): UsageTree => ({
  ...descriptionListLongTermsTree(t),
  options: { layout: "columns" },
});

/** Precise values retain their units; naked numbers lose their meaning. */
export const descriptionListUnitsTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [item(t, "demo.descriptionList.spec.size.term", "demo.descriptionList.spec.size.value")],
});

export const descriptionListDontUnitsTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [{
    contract: "description-list",
    signature: "DescriptionItem",
    slots: { term: t("demo.descriptionList.spec.size.term"), children: t("demo.descriptionList.spec.sizeBare") },
  }],
});

/** Explicitly name unavailable data instead of leaving an empty value. */
export const descriptionListMissingTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [item(t, "demo.descriptionList.tracking.term", "demo.descriptionList.missingValue")],
});

export const descriptionListDontMissingTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [{
    contract: "description-list",
    signature: "DescriptionItem",
    slots: { term: t("demo.descriptionList.tracking.term"), children: "" },
  }],
});

/** Keep terms concise so they scan as labels, not as another paragraph. */
export const descriptionListShortTermsTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [item(t, "demo.descriptionList.order.term", "demo.descriptionList.order.value")],
});

export const descriptionListDontLongLabelTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [{
    contract: "description-list",
    signature: "DescriptionItem",
    slots: { term: t("demo.descriptionList.longLabel"), children: t("demo.descriptionList.order.value") },
  }],
});

/** A value can be a real link when it names a destination the reader may follow. */
export const descriptionListLinkedValueTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [{
    contract: "description-list",
    signature: "DescriptionItem",
    slots: {
      term: t("demo.descriptionList.tracking.term"),
      children: { contract: "typography", signature: "Link", options: { href: "https://example.org/t/4821" }, children: t("demo.descriptionList.tracking.value") },
    },
  }],
});

export const descriptionListDontLinkedValueTree = (t: Translate): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionList",
  children: [{
    contract: "description-list",
    signature: "DescriptionItem",
    slots: { term: t("demo.descriptionList.tracking.term"), children: "https://example.org/t/4821" },
  }],
});
