import type { ItemInput, OptionInput } from "@skryensya/core/usage-tree";

/*
 * A maker page is a tree and nothing else (decision 31). A node knows its signature, the options
 * and attributes the author chose, and what each of its slots holds. It never knows where the
 * browser put it or how big it came out: those are read from the stage while painting and thrown
 * away, which is why no type in this file has a field that could hold them.
 */

/** A run of text in a slot that takes nodes: movable like a node, so it carries an identity too. */
export type MakerText = {
  readonly id: string;
  readonly text: string;
};

export type MakerChild = MakerNode | MakerText;

/**
 * What one slot holds, by the kind of slot the contract declares. Explicit rather than inferred
 * from the value's shape, because an empty list is otherwise both "no children" and "no entries".
 */
export type MakerSlot =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "nodes"; readonly children: readonly MakerChild[] }
  | { readonly kind: "items"; readonly items: readonly ItemInput[] };

export type MakerNode = {
  readonly id: string;
  readonly contract: string;
  readonly signature: string;
  readonly options?: Readonly<Record<string, OptionInput>>;
  readonly attrs?: Readonly<Record<string, string>>;
  readonly slots: Readonly<Record<string, MakerSlot>>;
};

/** A gap between two children of one slot: `index` 0 is before the first, `length` after the last. */
export type Place = {
  readonly parent: string;
  readonly slot: string;
  readonly index: number;
};

/** Where a node sits: its parent, the slot, and its index among that slot's children. */
export type Location = {
  readonly parent: MakerNode;
  readonly slot: string;
  readonly index: number;
};

export function isText(child: MakerChild): child is MakerText {
  return "text" in child && !("signature" in child);
}

export function isNode(child: MakerChild): child is MakerNode {
  return "signature" in child;
}

/** The children of a slot that takes nodes; empty for any other kind of slot, or none. */
export function childrenOf(node: MakerNode, slot: string): readonly MakerChild[] {
  const held = node.slots[slot];
  return held?.kind === "nodes" ? held.children : [];
}

/** Every node of the tree, depth first, the root included. */
export function* walk(root: MakerNode): Generator<MakerNode> {
  yield root;
  for (const held of Object.values(root.slots)) {
    if (held.kind !== "nodes") continue;
    for (const child of held.children) if (isNode(child)) yield* walk(child);
  }
}

/** Every child (node or text) of the tree, the root excluded. */
export function* walkChildren(root: MakerNode): Generator<MakerChild> {
  for (const held of Object.values(root.slots)) {
    if (held.kind !== "nodes") continue;
    for (const child of held.children) {
      yield child;
      if (isNode(child)) yield* walkChildren(child);
    }
  }
}

export function findNode(root: MakerNode, id: string): MakerNode | undefined {
  for (const node of walk(root)) if (node.id === id) return node;
  return undefined;
}

export function findChild(root: MakerNode, id: string): MakerChild | undefined {
  if (root.id === id) return root;
  for (const child of walkChildren(root)) if (child.id === id) return child;
  return undefined;
}

/** Where a child sits. Undefined for the root, which sits nowhere, and for an unknown id. */
export function locate(root: MakerNode, id: string): Location | undefined {
  for (const node of walk(root)) {
    for (const [slot, held] of Object.entries(node.slots)) {
      if (held.kind !== "nodes") continue;
      const index = held.children.findIndex((child) => child.id === id);
      if (index !== -1) return { parent: node, slot, index };
    }
  }
  return undefined;
}

/** The nodes from the root down to (not including) the child with this id. */
export function ancestors(root: MakerNode, id: string): readonly MakerNode[] {
  const trail: MakerNode[] = [];
  const search = (node: MakerNode): boolean => {
    for (const held of Object.values(node.slots)) {
      if (held.kind !== "nodes") continue;
      for (const child of held.children) {
        if (child.id === id) return true;
        if (isNode(child)) {
          trail.push(child);
          if (search(child)) return true;
          trail.pop();
        }
      }
    }
    return false;
  };
  if (root.id === id) return [];
  trail.push(root);
  return search(root) ? trail.slice(0) : [];
}

/** A copy of the tree with the node of this id replaced by what `change` returns. */
export function replaceNode(root: MakerNode, id: string, change: (node: MakerNode) => MakerNode): MakerNode {
  if (root.id === id) return change(root);
  let changed = false;
  const slots: Record<string, MakerSlot> = {};
  for (const [name, held] of Object.entries(root.slots)) {
    if (held.kind !== "nodes") {
      slots[name] = held;
      continue;
    }
    const children = held.children.map((child) => {
      if (!isNode(child)) return child;
      const next = replaceNode(child, id, change);
      if (next !== child) changed = true;
      return next;
    });
    slots[name] = changed ? { kind: "nodes", children } : held;
  }
  return changed ? { ...root, slots } : root;
}

/** A copy of the node with one slot's children replaced. */
export function withChildren(node: MakerNode, slot: string, children: readonly MakerChild[]): MakerNode {
  return { ...node, slots: { ...node.slots, [slot]: { kind: "nodes", children } } };
}
