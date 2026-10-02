import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type UIKey = Parameters<Translate>[0];

/*
 * Three generic plans, compared on what a person weighs when choosing one. Content is deliberately
 * ordinary: the component is the point, not the product.
 */
const column = (t: Translate, key: UIKey): UsageTree => ({
  contract: "comparison-table",
  signature: "ComparisonColumn",
  children: t(key),
});

const cell = (text: string | UsageTree): UsageTree => ({
  contract: "comparison-table",
  signature: "ComparisonCell",
  children: text,
});

const row = (label: string, cells: (string | UsageTree)[]): UsageTree => ({
  contract: "comparison-table",
  signature: "ComparisonRow",
  slots: { label, children: cells.map(cell) },
});

const plans = ["basic", "team", "business"] as const;
const aspects = ["users", "storage", "support"] as const;

/** One cell's text, by plan and aspect: `demo.comparisonTable.<aspect>.<plan>`. */
const text = (
  t: Translate,
  aspect: (typeof aspects)[number],
  plan: (typeof plans)[number],
) => t(`demo.comparisonTable.${aspect}.${plan}` as UIKey);

const build = (
  t: Translate,
  count: 2 | 3,
  extra: Partial<{ options: Record<string, unknown>; caption: string }> = {},
): UsageTree => {
  const used = plans.slice(0, count);
  return {
    contract: "comparison-table",
    signature: "ComparisonTable",
    options: {
      aspectLabel: t("demo.comparisonTable.aspect"),
      ...(extra.options ?? {}),
    },
    slots: {
      ...(extra.caption ? { caption: extra.caption } : {}),
      columns: used.map((plan) =>
        column(t, `demo.comparisonTable.plan.${plan}` as UIKey),
      ),
    },
    children: aspects.map((aspect) =>
      row(
        t(`demo.comparisonTable.aspect.${aspect}` as UIKey),
        used.map((plan) => text(t, aspect, plan)),
      ),
    ),
  };
};

/** Two things on three aspects: the smallest comparison, and the one most pages need. */
export const comparisonTableTree = (t: Translate): UsageTree => build(t, 2);

/** Three things. The widest the table gets before it should be a catalogue. */
export const comparisonTableThreeTree = (t: Translate): UsageTree =>
  build(t, 3);

/** The same table with a caption, for one that is not right under a heading that already names it. */
export const comparisonTableCaptionTree = (t: Translate): UsageTree =>
  build(t, 3, { caption: t("demo.comparisonTable.caption") });

/** What the `density` card varies: the same comparison, with its rows tightened when asked. */
export const comparisonTableDensityTree = (t: Translate): UsageTree =>
  build(t, 2);

/** A cell that links out: the one place a cell holds more than text. */
export const comparisonTableLinksTree = (t: Translate): UsageTree => ({
  contract: "comparison-table",
  signature: "ComparisonTable",
  options: { aspectLabel: t("demo.comparisonTable.aspect") },
  slots: {
    columns: [
      column(t, "demo.comparisonTable.plan.basic"),
      column(t, "demo.comparisonTable.plan.team"),
    ],
  },
  children: [
    row(t("demo.comparisonTable.aspect.users"), [
      text(t, "users", "basic"),
      text(t, "users", "team"),
    ]),
    row(t("demo.comparisonTable.aspect.terms"), [
      {
        contract: "typography",
        signature: "Link",
        options: { href: "#" },
        children: t("demo.comparisonTable.terms.basic"),
      },
      {
        contract: "typography",
        signature: "Link",
        options: { href: "#" },
        children: t("demo.comparisonTable.terms.team"),
      },
    ]),
  ],
});

/*
 * The corner label is hidden in the real table: it is the name a screen reader gives the column of
 * aspects, and a sighted reader sees an empty corner. A diagram that names a part nobody can see
 * points at nothing, so the specimen reveals it, small and dashed, and the page says so.
 */
export const comparisonTableRevealCss = `.sk-comparison-table__corner { padding: var(--sk-comparison-table-cell-padding-block) var(--sk-comparison-table-cell-padding-inline); }
.sk-comparison-table__corner-label {
  position: static;
  inline-size: auto;
  block-size: auto;
  margin: 0;
  padding-inline: 0.375rem;
  overflow: visible;
  clip-path: none;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-control);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-label);
}`;

/** The label, a column, a row's header, a cell, and the corner label, revealed so it can be pointed at. */
export const comparisonTableAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("comparisonTablePage.anatomyLabel"),
    inert: true,
  },
  slots: {
    ...anatomyHints(t),
    subject: {
      ...build(t, 2),
      attrs: { style: "inline-size: min(100%, 34rem)" },
    },
    items: [
      namePart(".sk-comparison-table", "block-start", { mark: "bracket" }),
      namePart(".sk-comparison-table__column", "block-start", {
        match: "first",
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-comparison-table__row", "inline-start", {
        match: "first",
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-comparison-table__row-header", "inline-start", {
        match: "first",
      }),
      namePart(".sk-comparison-table__cell", "inline-end", { match: "first" }),
      namePart(".sk-comparison-table__corner-label", "inline-start", {
        match: "first",
        ringPlacement: "offset",
        ringDistance: 2,
      }),
    ],
  },
});

/* Usage guide: short cells read across a row; a paragraph in a cell cannot be compared with its neighbour. */
export const comparisonTableDoShortTree = (t: Translate): UsageTree =>
  build(t, 2);

export const comparisonTableDontLongTree = (t: Translate): UsageTree => ({
  contract: "comparison-table",
  signature: "ComparisonTable",
  options: { aspectLabel: t("demo.comparisonTable.aspect") },
  slots: {
    columns: [
      column(t, "demo.comparisonTable.plan.basic"),
      column(t, "demo.comparisonTable.plan.team"),
    ],
  },
  children: [
    row(t("demo.comparisonTable.aspect.support"), [
      t("demo.comparisonTable.long.basic"),
      t("demo.comparisonTable.long.team"),
    ]),
  ],
});

/* Usage guide: an aspect is a noun the plans answer; a question makes every cell restate it. */
export const comparisonTableDoAspectTree = (t: Translate): UsageTree =>
  build(t, 2);

export const comparisonTableDontAspectTree = (t: Translate): UsageTree => ({
  contract: "comparison-table",
  signature: "ComparisonTable",
  options: { aspectLabel: t("demo.comparisonTable.aspect") },
  slots: {
    columns: [
      column(t, "demo.comparisonTable.plan.basic"),
      column(t, "demo.comparisonTable.plan.team"),
    ],
  },
  children: [
    row(t("demo.comparisonTable.question.users"), [
      text(t, "users", "basic"),
      text(t, "users", "team"),
    ]),
    row(t("demo.comparisonTable.question.support"), [
      text(t, "support", "basic"),
      text(t, "support", "team"),
    ]),
  ],
});

/*
 * THE COMPONENT COMPARED WITH ITS NEIGHBOUR, USING ITSELF. The honest test of a comparison table is
 * a comparison someone really has to make: when is this the right tool and when is `Table`? The
 * columns are the two components and the rows are what a person weighs.
 */
const versusAspects = ["best", "size", "headers", "extras", "setup"] as const;

export const comparisonTableVersusTree = (t: Translate): UsageTree => ({
  contract: "comparison-table",
  signature: "ComparisonTable",
  options: { aspectLabel: t("demo.comparisonTable.aspect") },
  slots: {
    caption: t("demo.comparisonTable.versus.caption"),
    columns: [
      {
        contract: "comparison-table",
        signature: "ComparisonColumn",
        children: "ComparisonTable",
      },
      {
        contract: "comparison-table",
        signature: "ComparisonColumn",
        children: "Table",
      },
    ],
  },
  children: versusAspects.map((aspect) =>
    row(t(`demo.comparisonTable.versus.${aspect}` as UIKey), [
      t(`demo.comparisonTable.versus.${aspect}.cmp` as UIKey),
      t(`demo.comparisonTable.versus.${aspect}.table` as UIKey),
    ]),
  ),
});
