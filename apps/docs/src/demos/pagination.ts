import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/* Mid-window so previous, items, ellipsis and next are all on screen to name. */
export const paginationAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("paginationPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "pagination",
      signature: "Pagination",
      options: {
        page: 5,
        total: 12,
        label: t("demo.pagination.label"),
        previousLabel: t("demo.pagination.previous"),
        nextLabel: t("demo.pagination.next"),
      },
    },
    items: [
      namePart(".sk-pagination", "block-start", { mark: "bracket" }),
      namePart(".sk-pagination__previous", "inline-start"),
      namePart(".sk-pagination__ellipsis", "block-end"),
      /* The pages either side of the current one: what `siblings` keeps. One entry, one bubble per match. */
      {
        ...namePart('.sk-pagination__item:has(+ .sk-pagination__item[aria-current="page"]), .sk-pagination__item[aria-current="page"] + .sk-pagination__item', "block-end", { match: "all" }),
        slots: { children: "siblings" },
      },
      /* The drawing points at the current page, but the legend names the class every page shares. */
      { ...namePart(".sk-pagination__item[aria-current=\"page\"]", "block-end"), slots: { children: "sk-pagination__item" } },
      namePart(".sk-pagination__next", "inline-end"),
    ],
  },
});

/* Twelve pages seen from the first: enough for the window to collapse into one ellipsis. */
export const paginationTree = (t: Translate): UsageTree => ({
  contract: "pagination",
  signature: "Pagination",
  options: {
    page: 1,
    total: 12,
    label: t("demo.pagination.label"),
    previousLabel: t("demo.pagination.previous"),
    nextLabel: t("demo.pagination.next"),
  },
});

/* Don't: two pages of results split in two. */
export const paginationDontFewTree = (t: Translate): UsageTree => ({
  contract: "pagination",
  signature: "Pagination",
  options: {
    page: 1,
    total: 2,
    label: t("demo.pagination.label"),
    previousLabel: t("demo.pagination.previous"),
    nextLabel: t("demo.pagination.next"),
  },
});

const paginationRows = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "xs" },
  children: [1, 2, 3].map((n) => ({ contract: "typography", signature: "Text", children: `${t("demo.pagination.dd.row")} ${n}` })),
});

/* Do/Don't: the pager under what it pages, or above it. */
export const paginationDoBelowTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "center" },
  children: [paginationRows(t), paginationTree(t)],
});

export const paginationDontAboveTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "center" },
  children: [paginationTree(t), paginationRows(t)],
});

/* A pager with its page and total chosen by the caller, for the variants below. */
const pager = (t: Translate, options: { page: number; total: number; siblings?: number }): UsageTree => ({
  contract: "pagination",
  signature: "Pagination",
  options: {
    ...options,
    label: t("demo.pagination.label"),
    previousLabel: t("demo.pagination.previous"),
    nextLabel: t("demo.pagination.next"),
  },
});

/** The same twenty pages and the same current one; only how many neighbours stay beside it changes. */
export const paginationSiblingsCase = (t: Translate, siblings: 0 | 1 | 2 = 1): UsageTree =>
  pager(t, { page: 8, total: 20, siblings: [0, 1, 2].includes(siblings) ? siblings : 1 });

/** The pager where it belongs: under the page's results, with where you are in them said in words. */
export const paginationResultsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md", align: "center" },
  children: [
    paginationRows(t),
    { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: t("demo.pagination.status") },
    pager(t, { page: 3, total: 22 }),
  ],
});

/** Every place the current page can be: the window collapses on one side, both, or neither. */
export const paginationPositionCase = (t: Translate, page: 1 | 6 | 12 = 6): UsageTree =>
  pager(t, { page: typeof page === "number" ? page : 6, total: 12 });

/** One tree for the appearance card: a mid-window page, so the current one has neighbours on both sides. */
export const paginationAppearanceTree = (t: Translate): UsageTree => pager(t, { page: 5, total: 12 });
