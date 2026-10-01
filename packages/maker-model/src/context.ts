import { ancestors, childrenOf, findChild, isNode, isText, locate, walkChildren, type MakerChild, type MakerNode, type Place } from "./node.js";
import { layoutRole } from "./role.js";
import { insertionPlace, isContainer, nodeSlots } from "./structure.js";
import { pending } from "./problems.js";
import type { MakerSite } from "./site.js";
import { applyAll } from "./operations.js";
import { presetFor } from "./preset.js";
import { counterIds } from "./project.js";

/** Ephemeral evidence, never stored in a site or its history. */
export interface MakerAgentView {
  page: string;
  selected?: string;
  selectedIds: readonly string[];
  width: "fit" | number | { px: number };
  scheme: "light" | "dark";
  contrast: boolean;
  density: "compact" | "default" | "comfortable";
  mode: "edit" | "interact";
}

function boundedRecord<T extends string | number | boolean>(record: Readonly<Record<string, T>> | undefined) {
  return record ? Object.fromEntries(Object.entries(record).map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 1000) : value])) : undefined;
}

function summary(child: MakerChild) {
  if (!isNode(child)) return { id: child.id, text: child.text.slice(0, 1000) };
  return {
    id: child.id, contract: child.contract, signature: child.signature,
    options: boundedRecord(child.options), attrs: boundedRecord(child.attrs),
    valuesTruncated: Object.values({ ...child.options, ...child.attrs }).some(value => typeof value === "string" && value.length > 1000),
    slots: Object.fromEntries(Object.entries(child.slots).map(([name, slot]) => [name,
      slot.kind === "text" ? { kind: slot.kind, text: slot.text.slice(0, 1000) } :
      slot.kind === "items" ? { kind: slot.kind, count: slot.items.length } :
      { kind: slot.kind, count: slot.children.length, text: slot.children.filter(isText).map(c => c.text).join(" ").slice(0, 1000) },
    ])),
  };
}

function subtree(node: MakerNode, maxNodes: number, maxDepth: number) {
  const nodes: { slot: string; depth: number; node: ReturnType<typeof summary> }[] = [];
  const visit = (parent: MakerNode, depth: number) => {
    for (const [slot, held] of Object.entries(parent.slots)) {
      if (held.kind !== "nodes") continue;
      for (const child of held.children) {
        if (nodes.length >= maxNodes || depth > maxDepth) continue;
        nodes.push({ slot, depth, node: summary(child) });
        if (isNode(child)) visit(child, depth + 1);
      }
    }
  };
  visit(node, 1);
  let total = 0;
  for (const _child of walkChildren(node)) total++;
  return { depth: maxDepth, total, truncated: total > nodes.length, nodes };
}

/** Deterministic, bounded context built from Maker's own selection and placement semantics.
 * Places are candidate gaps, NOT permission to insert any signature: canPlaceAt/apply judges
 * the particular child. No child-independent placement can promise that a heading accepts a Grid.
 */
export function makerContext(site: MakerSite, project: { id: string; revision: number }, view: MakerAgentView) {
  const page = site.pages.find(p => p.id === view.page) ?? site.pages[0]!;
  const root = page.root;
  const ids = [...new Set([...(view.selected ? [view.selected] : []), ...view.selectedIds])].filter(id => findChild(root, id));
  const primary = view.selected && ids.includes(view.selected) ? view.selected : undefined;
  const target = findChild(root, primary ?? ids[0] ?? root.id)!;
  const at = locate(root, target.id);
  const siblings = at ? childrenOf(at.parent, at.slot) : [];
  const locations = ids.map(id => locate(root, id));
  const shared = locations.length > 0 && locations.every(l => l && l.parent.id === locations[0]?.parent.id && l.slot === locations[0]?.slot);
  const ordered = shared ? [...ids].sort((a, b) => locate(root, a)!.index - locate(root, b)!.index) : ids;
  const indices = shared ? ordered.map(id => locate(root, id)!.index) : [];
  const contiguous = shared && indices.every((index, i) => i === 0 || index === indices[i - 1]! + 1);
  const inside = isNode(target) && isContainer(target) ? insertionPlace(root, target.id) : undefined;
  const before: Place | undefined = at ? { parent: at.parent.id, slot: at.slot, index: at.index } : undefined;
  const after = before ? { ...before, index: before.index + 1 } : undefined;
  const wrapTargets = contiguous && ids.length <= 32 ? ["Inline", "Stack", "Grid"].filter(signature => {
    const container = presetFor({ contract: "layout", signature }, counterIds("context-probe-"));
    return container && applyAll(root, [{ type: "wrap", children: ordered, container: { ...container, slots: { children: { kind: "nodes", children: [] } } } }]).ok;
  }) : [];
  const problems = pending(root).problems;
  const context = {
    project, page: { id: page.id, name: page.name, path: page.path },
    selection: {
      primary, selectedIds: ids, total: ids.length, truncated: ids.length > 32,
      nodes: ids.slice(0, 32).map(id => {
        const child = findChild(root, id)!;
        const above = ancestors(root, id);
        return { ...summary(child), role: layoutRole(root, id), ancestors: above.slice(-12).map(summary), ancestorsTruncated: above.length > 12,
          ...(isNode(child) ? { descendants: subtree(child, 24, 2) } : {}) };
      }),
      sharedParent: shared ? { id: locations[0]!.parent.id, slot: locations[0]!.slot } : undefined,
      contiguousSiblings: contiguous, siblingOrder: ordered,
      capabilities: { canWrapTogether: wrapTargets.length > 0, wrapTargets: wrapTargets.map(signature => ({ contract: "layout", signature })), canRemove: ids.length > 0 && locations.every(Boolean) },
    },
    neighborhood: { parent: at ? summary(at.parent) : undefined,
      before: at ? siblings.slice(Math.max(0, at.index - 2), at.index).map(summary) : [],
      after: at ? siblings.slice(at.index + 1, at.index + 3).map(summary) : [] },
    pageRoot: summary(root),
    insertion: { before, after, inside: inside ?? (ids.length === 0 ? insertionPlace(root, root.id) : undefined),
      here: insertionPlace(root, target.id), requiresChildValidation: true },
    section: (isNode(target) && isContainer(target) ? target : [...ancestors(root, target.id)].reverse().find(isContainer))?.id,
    slots: isNode(target) ? nodeSlots(target) : [],
    pending: problems.slice(0, 20),
    pendingTruncated: problems.length > 20,
    view: { stageWidth: view.width, scheme: view.scheme, contrast: view.contrast, density: view.density, mode: view.mode },
  };
  // Detach every option/attribute from caller-owned objects: a turn is an immutable snapshot.
  return structuredClone(context);
}

export type MakerAgentContext = ReturnType<typeof makerContext>;
