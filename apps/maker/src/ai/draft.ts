import { isNode, walk, type MakerNode, type MakerSite } from "@skryensya/maker-model";

/**
 * What the canvas draws while Maker AI works: the site as it would be with the operations written so far.
 * `added` is what is NEW against the real project, found by identity, so the stage can bring those nodes in.
 * It is read-only and never saved: applying a proposal is a separate, undoable gesture.
 */
export type Draft = {
  readonly site: MakerSite;
  readonly added: ReadonlySet<string>;
  /** How many operations it stands for. */
  readonly operations: number;
  /** Still being written. False once the proposal is final and waiting for Apply or Discard. */
  readonly building: boolean;
};

export function draftOf(base: MakerSite, site: MakerSite, operations: number, building: boolean): Draft {
  const known = new Set<string>();
  for (const page of base.pages) for (const node of walk(page.root)) known.add(node.id);
  const added = new Set<string>();
  for (const page of site.pages) for (const node of walk(page.root)) if (!known.has(node.id)) added.add(node.id);
  return { site, added, operations, building };
}

export type PlanItemStatus = "pending" | "building" | "complete";

/**
 * How far a build has got, read off the draft and not stored: each node the draft adds whose parent
 * is not itself new is one finished piece of the page, and a lone new wrapper counts its new children.
 * Best effort: pieces are matched to the plan by order, not by name.
 */
export function addedPieces(draft: Draft): number {
  const pieces = (node: MakerNode): number => {
    const own: MakerNode[] = [];
    const collect = (parent: MakerNode) => {
      for (const held of Object.values(parent.slots)) {
        if (held.kind !== "nodes") continue;
        for (const child of held.children) if (isNode(child)) draft.added.has(child.id) ? own.push(child) : collect(child);
      }
    };
    collect(node);
    return own.length === 1 ? Math.max(1, pieces(own[0]!)) : own.length;
  };
  return draft.site.pages.reduce((sum, page) => sum + pieces(page.root), 0);
}

/** The plan's items in order: the first `done` are complete, the next is being built while the draft is still being written. */
export function planStatuses(total: number, done: number, building: boolean): PlanItemStatus[] {
  return Array.from({ length: total }, (_, n) => n < done ? "complete" : n === done && building ? "building" : "pending");
}
