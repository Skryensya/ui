import type { UsageTree } from "@skryensya/core/usage-tree";

/**
 * A page's content in the measure its job needs: a Wrapper with the same gutters the footer uses, so what sits in the work area
 * lines up with the rest of the page and stops growing on a wide screen. A reading column is `md`; a work area with tables and
 * cards is `lg`.
 */
export const measured = (content: UsageTree, size: "sm" | "md" | "lg" = "lg"): UsageTree => ({
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: size, gutter: "md", gutterExpanded: "lg" },
  children: content,
});
