import { componentNavigation } from "./navigation";
import type { CanvasBlock } from "./canvas-fragment";

/*
 * The wall is a set of clusters, one per category of the sidebar's component list, so a reader who knows the
 * navigation finds the same grouping here. Layout primitives (Stack, Inline, Grid...) are spacing, not components:
 * they have no specimen of their own and stay off the wall, and so does Canvas itself (a pan/zoom view nested in this one).
 */
const OFF_WALL = new Set(["layout", "canvas"]);

const groupOf = new Map<string, { id: string; label: string }>();
for (const group of componentNavigation)
  for (const item of group.items) groupOf.set(item.href.split("/").pop()!, { id: group.id ?? group.group, label: group.group });

export type Cluster = { id: string; label: string; blocks: CanvasBlock[] };

/** Clusters in the sidebar's order; a component the sidebar does not list goes to a last "other" cluster. */
export function clusterBlocks(blocks: CanvasBlock[], other: string): Cluster[] {
  const clusters = new Map<string, Cluster>(componentNavigation.map((g) => [g.id ?? g.group, { id: g.id ?? g.group, label: g.group, blocks: [] }]));
  for (const block of blocks) {
    if (OFF_WALL.has(block.component)) continue;
    const group = groupOf.get(block.component) ?? { id: "other", label: other };
    if (!clusters.has(group.id)) clusters.set(group.id, { id: group.id, label: group.label, blocks: [] });
    clusters.get(group.id)!.blocks.push(block);
  }
  return [...clusters.values()].filter((c) => c.blocks.length);
}
