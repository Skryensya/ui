import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { pageSizeItems } from "./data/table";
import { deploymentsTable } from "./table";

/* The pager's own wording, in the page's locale: its defaults are English. */
const pagerOptions = (t: Translate, pageSize: number) => ({
  pageSize,
  statusTemplate: t("demo.table.range"),
  previousLabel: t("demo.table.previousPage"),
  nextLabel: t("demo.table.nextPage"),
  pageLabel: t("demo.table.page"),
});

const nav = (t: Translate): UsageTree => ({
  contract: "table-pager",
  signature: "TablePagerNav",
  options: { navLabel: t("demo.table.pagination") },
});

/** The full composition: table, then a bar with the page size at its start and range + nav at its end. */
export const tablePagerTree = (t: Translate): UsageTree => ({
  contract: "table-pager",
  signature: "TablePager",
  options: pagerOptions(t, 5),
  children: [
    deploymentsTable(t),
    {
      contract: "table-pager",
      signature: "TablePagerBar",
      children: [
        {
          contract: "table-pager",
          signature: "TablePagerSize",
          children: {
            contract: "select",
            signature: "Select",
            options: { name: "page-size", value: "5" },
            slots: { label: t("demo.table.rowsPerPage"), items: pageSizeItems },
          },
        },
        {
          contract: "table-pager",
          signature: "TablePagerEnd",
          children: [
            {
              contract: "table-pager",
              signature: "TablePagerStatus",
              children: t("demo.table.range", { start: "1", end: "5", total: "8" }),
            },
            nav(t),
          ],
        },
      ],
    },
  ],
});

/** Bar, size, end, range and the generated nav: the parts around the table. */
export const tablePagerAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("tablePager.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: tablePagerTree(t),
    items: [
      namePart(".sk-table-pager", "block-start", { mark: "bracket" }),
      namePart(".sk-table-pager__bar", "block-end", { mark: "bracket" }),
      namePart(".sk-table-pager__size", "inline-start"),
      namePart(".sk-table-pager__status", "block-end"),
      namePart(".sk-pagination", "inline-end"),
    ],
  },
});

/*
 * The least a pager needs: no page-size choice and no range, only the nav. `TablePagerSize` and
 * `TablePagerStatus` are both optional; `TablePagerEnd` and its nav are not.
 */
export const tablePagerMinimalTree = (t: Translate): UsageTree => ({
  contract: "table-pager",
  signature: "TablePager",
  options: pagerOptions(t, 3),
  children: [
    deploymentsTable(t),
    {
      contract: "table-pager",
      signature: "TablePagerBar",
      children: { contract: "table-pager", signature: "TablePagerEnd", children: nav(t) },
    },
  ],
});

/* Don't: the pager separated from its table, a row of numbers with nothing to say what they page. */
export const tablePagerDontDetachedTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xl" },
  children: [
    deploymentsTable(t),
    { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: t("demo.tablePager.dd.between") },
    {
      contract: "pagination",
      signature: "Pagination",
      options: { page: 1, total: 4, label: t("demo.table.pagination"), previousLabel: t("demo.table.previousPage"), nextLabel: t("demo.table.nextPage") },
    },
  ],
});
