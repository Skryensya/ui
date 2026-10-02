import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * COMPARISON TABLE, the same few aspects set side by side for two to four things.
 *
 * WHAT MAKES IT A TABLE, AND NOT A DESCRIPTION LIST: a cell here means something because of its row
 * AND its column ("how is it typed" for "PasswordInput"), which is exactly the question
 * `DescriptionList`'s own header says to ask first. Two products on one page, three plans, an old and
 * a new behaviour: the columns are the things compared, the rows are what they are compared on.
 *
 * WHY IT IS NOT JUST `Table`. A `Table` is the general grid: seven signatures, any shape, and the
 * author decides which cell is a header. A comparison is one shape, always the same: a row header on
 * the left (the aspect), a column header on top (the thing), and text in between. Writing that out
 * with `Table` is `TableHead > TableRow > TableHeader` and so on, and getting it wrong is easy and
 * silent: a `<th>` with no `scope`, a corner cell with nothing in it, a row whose first cell is a
 * plain `<td>`. This contract is that one shape with the accessibility already decided:
 *
 *   - Every column header carries `scope="col"` and every row's first cell is a `<th scope="row">`,
 *     so a reader that announces "PasswordInput, How it is typed" has what it needs to.
 *   - The corner cell is never empty: `aspectLabel` is required and drawn visually hidden, because an
 *     empty `<th>` is the one cell a screen reader reads as nothing at all.
 *   - A row cannot be a different length from the header: columns and cells are slots with the same
 *     cardinality, and the validator counts them.
 *
 * Two to four columns, because beyond that a comparison stops being one: it is a catalogue, and a
 * catalogue is a `Table` (sortable, scrollable, with its own density).
 */
export const comparisonTableParts = {
  root: "sk-comparison-table",
  caption: "sk-comparison-table__caption",
  /** The top-left cell. It names the row headers' column and is visually hidden. */
  corner: "sk-comparison-table__corner",
  cornerLabel: "sk-comparison-table__corner-label",
  column: "sk-comparison-table__column",
  row: "sk-comparison-table__row",
  rowHeader: "sk-comparison-table__row-header",
  cell: "sk-comparison-table__cell",
} as const;

export type ComparisonTablePart = keyof typeof comparisonTableParts;
export type ComparisonTablePartClass = (typeof comparisonTableParts)[ComparisonTablePart];

export const comparisonTableContract = {
  id: "comparison-table",
  category: "data",
  css: "@skryensya/core/components/comparison-table.css",
  parts: comparisonTableParts,
  hooks: [
    "--sk-comparison-table-border-color",
    "--sk-comparison-table-cell-padding-block",
    "--sk-comparison-table-cell-padding-inline",
    "--sk-comparison-table-column-fg",
    "--sk-comparison-table-font-size",
    "--sk-comparison-table-row-header-fg",
    /** The width of the aspect column, a length: a comparison reads left to right and the names should line up. */
    "--sk-comparison-table-row-header-size",
  ],

  options: {
    /**
     * What the first column holds, in words ("Aspect", "Feature"). The corner cell is drawn visually
     * hidden, and it is required rather than defaulted: the English word is wrong on a Spanish page,
     * and a column header that says nothing is the failure this contract exists to prevent.
     */
    aspectLabel: { type: "string" },
    /** Tighter rows, for a comparison that is reference material rather than reading. */
    density: { type: "enum", values: ["compact"], attr: "data-density" },
  },

  signatures: {
    ComparisonTable: {
      intent: ["compare-two-to-four-things", "feature-comparison", "when-to-use-which", "side-by-side"],
      host: { element: "table" },
      options: ["aspectLabel", "density"],
      requires: ["aspectLabel"],
      forward: ["id", "aria-*"],
      slots: {
        /** A name for the table. Optional: a heading right above it usually already says what it compares. */
        caption: { accepts: "text" },
        /** The things compared, one per column. Two to four. */
        columns: { accepts: "signature", required: true, of: ["ComparisonColumn"], minItems: 2, maxItems: 4 },
        /** The aspects compared, one per row. */
        children: { accepts: "signature", required: true, of: ["ComparisonRow"] },
      },
      template: {
        element: "table",
        part: "root",
        host: true,
        children: [
          { element: "caption", part: "caption", whenGiven: "caption", slot: "caption" },
          {
            element: "thead",
            children: [
              {
                element: "tr",
                children: [
                  {
                    element: "th",
                    part: "corner",
                    attrs: { scope: "col" },
                    children: [{ element: "span", part: "cornerLabel", textFromOption: "aspectLabel" }],
                  },
                  { slot: "columns" },
                ],
              },
            ],
          },
          { element: "tbody", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/comparison-table", name: "ComparisonTable" },
    },

    ComparisonColumn: {
      intent: ["one-thing-compared", "column-header"],
      host: { element: "th" },
      parents: ["ComparisonTable"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "th", part: "column", attrs: { scope: "col" }, host: true, slot: "children" },
      react: { from: "@skryensya/react/comparison-table", name: "ComparisonColumn" },
    },

    ComparisonRow: {
      intent: ["one-aspect-compared", "row"],
      host: { element: "tr" },
      parents: ["ComparisonTable"],
      options: [],
      slots: {
        /** The aspect: what the row compares on. Text, because it is a header and a header names. */
        label: { accepts: "text", required: true },
        /** One cell per column, in column order. */
        children: { accepts: "signature", required: true, of: ["ComparisonCell"] },
      },
      template: {
        element: "tr",
        part: "row",
        host: true,
        children: [
          { element: "th", part: "rowHeader", attrs: { scope: "row" }, slot: "label" },
          { slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/comparison-table", name: "ComparisonRow" },
    },

    ComparisonCell: {
      intent: ["how-one-thing-answers-one-aspect", "cell"],
      host: { element: "td" },
      parents: ["ComparisonRow"],
      options: [],
      /* A node: short text, with code and a link or two. A cell that needs a paragraph wants a Table. */
      slots: { children: { accepts: "node", required: true } },
      template: { element: "td", part: "cell", host: true, slot: "children" },
      react: { from: "@skryensya/react/comparison-table", name: "ComparisonCell" },
    },
  },
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type ComparisonTableDensity = OptionValue<typeof comparisonTableContract.options.density>;
