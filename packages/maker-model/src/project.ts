import { getContract, getSignature } from "@skryensya/core/registry";
import { slotsOf, type ItemInput, type SlotContent, type UsageTree } from "@skryensya/core/usage-tree";
import { isNode, type MakerChild, type MakerNode, type MakerSlot } from "./node.js";

/*
 * THE PROJECTION IS THE WHOLE POINT OF THE ID. A maker node is a usage-tree node plus an identity,
 * and nothing else: strip the identities and what is left is the tree `validate_ui` accepts, the
 * tree both bindings render and the tree an agent would have proposed. Anything the Maker needed
 * beyond that would be a second vocabulary, which is what decision 31 refuses.
 */

export type IdFactory = () => string;

/** Short, random, collision-safe for a page's worth of nodes. Tests pass a counter instead. */
export const randomId: IdFactory = () => {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

/** A counter, for tests and for anything that needs the same ids twice. */
export function counterIds(prefix = "n"): IdFactory {
  let next = 0;
  return () => `${prefix}${++next}`;
}

/**
 * The usage tree this maker node stands for. A slot of one entry is written bare and a slot of
 * several as a list, `children` through the sugar and the rest under `slots`: the canonical shape,
 * so a tree read in and written back out emits exactly the same markup.
 */
export function toUsageTree(node: MakerNode): UsageTree {
  const slots: Record<string, SlotContent> = {};
  let children: SlotContent | undefined;
  for (const [name, held] of Object.entries(node.slots)) {
    const content = slotContent(held);
    if (content === undefined) continue;
    if (name === "children") children = content;
    else slots[name] = content;
  }
  return {
    contract: node.contract,
    signature: node.signature,
    ...(node.options && Object.keys(node.options).length > 0 ? { options: { ...node.options } } : {}),
    ...(node.attrs && Object.keys(node.attrs).length > 0 ? { attrs: { ...node.attrs } } : {}),
    ...(Object.keys(slots).length > 0 ? { slots } : {}),
    ...(children !== undefined ? { children } : {}),
  };
}

function slotContent(held: MakerSlot): SlotContent | undefined {
  if (held.kind === "text") return held.text;
  if (held.kind === "items") return held.items.length > 0 ? held.items : undefined;
  const entries = held.children.map((child) => (isNode(child) ? toUsageTree(child) : child.text));
  if (entries.length === 0) return undefined;
  return entries.length === 1 ? entries[0] : entries;
}

/** The maker node for a usage tree, every node and text run given a fresh identity. */
export function fromUsageTree(tree: UsageTree, newId: IdFactory): MakerNode {
  const contract = getContract(tree.contract);
  const signature = contract ? getSignature(contract, tree.signature) : undefined;
  const slots: Record<string, MakerSlot> = {};
  for (const [name, content] of Object.entries(slotsOf(tree))) {
    const accepts = signature?.slots[name]?.accepts;
    slots[name] = toSlot(content, accepts, newId);
  }
  return {
    id: newId(),
    contract: tree.contract,
    signature: tree.signature,
    ...(tree.options ? { options: { ...tree.options } } : {}),
    ...(tree.attrs ? { attrs: { ...tree.attrs } } : {}),
    slots,
  };
}

function toSlot(content: SlotContent, accepts: string | undefined, newId: IdFactory): MakerSlot {
  if (accepts === "text" && typeof content === "string") return { kind: "text", text: content };
  const list = Array.isArray(content) ? (content as readonly unknown[]) : [content];
  if (accepts === "items" || (accepts === undefined && list.length > 0 && list.every(isItem))) {
    return { kind: "items", items: list as readonly ItemInput[] };
  }
  const children: MakerChild[] = (list as readonly (string | UsageTree)[]).map((entry) =>
    typeof entry === "string" ? { id: newId(), text: entry } : fromUsageTree(entry, newId),
  );
  return { kind: "nodes", children };
}

function isItem(entry: unknown): boolean {
  return typeof entry === "object" && entry !== null && "slots" in entry && !("signature" in entry);
}

/** A copy of a child with every identity inside it replaced: what duplicating inserts. */
export function reidentify(child: MakerChild, newId: IdFactory): MakerChild {
  if (!isNode(child)) return { id: newId(), text: child.text };
  const slots: Record<string, MakerSlot> = {};
  for (const [name, held] of Object.entries(child.slots)) {
    slots[name] = held.kind === "nodes" ? { kind: "nodes", children: held.children.map((c) => reidentify(c, newId)) } : held;
  }
  return { ...child, id: newId(), slots };
}
