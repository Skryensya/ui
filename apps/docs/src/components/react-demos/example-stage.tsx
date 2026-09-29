/* One tree, drawn live and left alone: `UsagePreview`'s fixed mode. No control, nothing to vary. */
import type { UsageTree } from "@skryensya/core/usage-tree";
import { useRenderedTree } from "./use-rendered-tree";

export function ExampleStage({ tree }: { tree: UsageTree }) {
  const render = useRenderedTree(tree);
  return <div className="sk-preview-card__stage">{render ? render(tree) : null}</div>;
}
