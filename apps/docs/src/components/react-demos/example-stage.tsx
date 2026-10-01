/* One tree, drawn live and left alone: `UsagePreview`'s fixed mode. No control, nothing to vary. */
import type { UsageTree } from "@skryensya/core/usage-tree";
import { useRenderedTree } from "./use-rendered-tree";

/** `measure` caps the specimen's width on the stage only, as a CSS length. */
export function ExampleStage({ tree, measure }: { tree: UsageTree; measure?: string }) {
  const render = useRenderedTree(tree);
  const example = render ? render(tree) : null;
  return (
    <div className="sk-preview-card__stage">
      {measure ? <div style={{ inlineSize: "100%", maxInlineSize: measure }}>{example}</div> : example}
    </div>
  );
}
