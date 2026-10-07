import { snippets } from "@skryensya/examples";
import { canonicalTrees } from "@skryensya/ai-gates/src/trees.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/** Every real tree the repository already holds: the published snippets and the gates' cases. */
export const corpus: readonly { readonly name: string; readonly tree: UsageTree }[] = [
  ...snippets.map((snippet) => ({ name: `snippet/${snippet.id}`, tree: snippet.tree })),
  ...canonicalTrees.map((entry) => ({ name: `gate/${entry.name}`, tree: entry.tree })),
];
