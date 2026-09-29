import type { UsageTree } from "@skryensya/core/usage-tree";
import { withOptionAt, type TreePath } from "../components/react-demos/usage-tree-path";

/*
 * ONE SPECIMEN, SHOWN SEVERAL WAYS AT ONCE: the static showcase for what a live property preview is
 * the wrong tool for (see the component-page-modernization skill). A state such as `disabled` is a
 * runtime condition, not a choice a page teaches by toggling, and a token scale such as `padding` has
 * no reason per step to explain; both read better as every case side by side, each with its name.
 *
 * `target` reaches an option that lives below the root, the same path `UsagePreview` takes.
 */
export type VariantCase = {
  /** The caption under the specimen: the value's name, or a state's. */
  label: string;
  options: Record<string, unknown>;
};

export const variantsTree = (
  base: UsageTree,
  cases: readonly VariantCase[],
  target: TreePath = [],
  /** Lay the cases on a grid of this many columns instead of one wrapping row: for large specimens. */
  columns?: "2" | "3",
): UsageTree => ({
  contract: "layout",
  ...(columns
    ? { signature: "Grid", options: { columns, gap: "lg", responsive: true } }
    : { signature: "Inline", options: { gap: "lg", inlineAlign: "start" } }),
  children: cases.map(({ label, options }) => ({
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm", align: "center" },
    children: [
      Object.entries(options).reduce<UsageTree>((tree, [name, value]) => withOptionAt(tree, target, name, value), base),
      { contract: "typography", signature: "Text", options: { size: "caption", tone: "secondary" }, children: label },
    ],
  })),
});
