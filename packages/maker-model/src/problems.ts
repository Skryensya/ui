import { validateUsageTree, type Problem } from "@skryensya/ai-compiler/validate";
import { isNode, type MakerNode } from "./node.js";
import { toUsageTree } from "./project.js";

/*
 * PENDING, read from the validator itself. The Maker keeps no rule list of its own: it projects the
 * page to the usage tree `validate_ui` would receive and asks. Whatever comes back is shown on the
 * nodes it concerns and reported, never repaired.
 *
 * The validator names a place by its trail of signatures (`Main > Stack > Inline`), not by identity,
 * so two sibling Inlines share a trail. A problem is placed on every node that trail could mean:
 * over-reporting a pending mark beats hiding one.
 */

export type NodeProblem = Problem & { readonly nodes: readonly string[] };

export type Pending = {
  /** No errors: the page validates. Advisories may remain. */
  readonly valid: boolean;
  readonly problems: readonly NodeProblem[];
};

export function pending(root: MakerNode): Pending {
  const result = validateUsageTree(toUsageTree(root));
  const trails = trailIndex(root);
  const problems = result.problems.map((problem) => ({ ...problem, nodes: nodesFor(problem.path, trails, root.id) }));
  return { valid: result.valid, problems };
}

/** The problems that concern one node. */
export function problemsOf(state: Pending, id: string): readonly NodeProblem[] {
  return state.problems.filter((problem) => problem.nodes.includes(id));
}

function trailIndex(root: MakerNode): ReadonlyMap<string, readonly string[]> {
  const index = new Map<string, string[]>();
  const visit = (node: MakerNode, above: readonly string[]) => {
    const trail = [...above, node.signature];
    const key = trail.join(" > ");
    index.set(key, [...(index.get(key) ?? []), node.id]);
    for (const held of Object.values(node.slots)) {
      if (held.kind !== "nodes") continue;
      for (const child of held.children) if (isNode(child)) visit(child, trail);
    }
  };
  visit(root, []);
  return index;
}

/** The nodes a validator path names, walking up to the nearest trail that exists (an item's path). */
function nodesFor(path: string, trails: ReadonlyMap<string, readonly string[]>, rootId: string): readonly string[] {
  const parts = path.split(" > ");
  while (parts.length > 0) {
    const found = trails.get(parts.join(" > "));
    if (found) return found;
    parts.pop();
  }
  return [rootId];
}
