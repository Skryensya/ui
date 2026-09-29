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
      namePart(".sk-pagination__item", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-pagination__ellipsis", "inline-end"),
      namePart(".sk-pagination__next", "block-end"),
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
