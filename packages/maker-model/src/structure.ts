import type { ComponentContract, ContractSignature, ContractSlot } from "@skryensya/core/contract";
import { isPausedFamily } from "@skryensya/core/paused";
import { contractIds, getContract, getSignature } from "@skryensya/core/registry";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import {
  ancestors,
  childrenOf,
  findChild,
  isNode,
  locate,
  replaceNode,
  walk,
  withChildren,
  type MakerChild,
  type MakerNode,
  type Place,
} from "./node.js";
import { toUsageTree } from "./project.js";

/*
 * WHERE A NODE MAY GO, read from the contract and nothing else. A drop zone the Maker offers is a
 * place this says yes to; one it would refuse is never drawn, which is what keeps a maker page's
 * STRUCTURE sound at every step (decision 31). Options are another matter: they may be pending.
 *
 * Only what a contract states as structure is checked here: which slot takes nodes, which
 * signatures a slot or a parent admits, `notInside` at any depth, the upper bounds of a slot, and
 * HTML's content model (a `<p>` inside a `<button>` is markup the parser rewrites). The last one is
 * the validator's own rule, asked on a trial tree, since only it knows what each node renders as.
 * Lower bounds (a required child, a minimum count, a required descendant) are what a node is still
 * WAITING for, so they are pending, never a reason to refuse a drop.
 */

export type SignatureRef = { readonly contract: string; readonly signature: string };

export type Resolved = {
  readonly contract: ComponentContract;
  readonly signature: ContractSignature;
};

export function resolve(ref: SignatureRef): Resolved | undefined {
  const contract = getContract(ref.contract);
  const signature = contract ? getSignature(contract, ref.signature) : undefined;
  return contract && signature ? { contract, signature } : undefined;
}

/** Every signature the Maker may offer: the published catalogue, paused families left out. */
export function catalogue(): readonly SignatureRef[] {
  const refs: SignatureRef[] = [];
  for (const id of contractIds()) {
    if (isPausedFamily(id)) continue;
    const contract = getContract(id);
    if (!contract) continue;
    for (const signature of Object.keys(contract.signatures)) refs.push({ contract: id, signature });
  }
  return refs;
}

/** The slot of a node, when its contract declares one by that name. */
export function slotOf(node: MakerNode, slot: string): ContractSlot | undefined {
  return resolve(node)?.signature.slots[slot];
}

/**
 * Whether `child` may sit in `slot` of `parent`, where `trail` is every node from the root down to
 * the parent (the parent excluded). `leaving` is a child already in that slot that is on its way
 * out (a move within one slot), so it does not count against the slot's upper bounds.
 */
export function canPlace(
  parent: MakerNode,
  slot: string,
  child: MakerChild,
  trail: readonly MakerNode[],
  leaving?: string,
): boolean {
  const declared = slotOf(parent, slot);
  if (!declared) return false;
  if (declared.accepts !== "node" && declared.accepts !== "signature") return false;

  if (!isNode(child)) return declared.accepts === "node";

  const resolved = resolve(child);
  if (!resolved) return false;
  if (declared.of && !declared.of.includes(child.signature)) return false;
  const parents = resolved.signature.parents;
  if (parents && parents.length > 0 && !parents.includes(parent.signature)) return false;
  if (!clearOfForbiddenAncestors(child, [...trail, parent].map((node) => node.signature))) return false;

  const siblings = childrenOf(parent, slot).filter((sibling) => sibling.id !== leaving && sibling.id !== child.id);
  return withinUpperBounds(declared, [...siblings, child]);
}

/** `notInside` holds at any depth: check the child and everything it brings along. */
function clearOfForbiddenAncestors(node: MakerNode, above: readonly string[]): boolean {
  const forbidden = resolve(node)?.signature.notInside ?? [];
  if (forbidden.some((signature) => above.includes(signature))) return false;
  const here = [...above, node.signature];
  for (const held of Object.values(node.slots)) {
    if (held.kind !== "nodes") continue;
    for (const child of held.children) if (isNode(child) && !clearOfForbiddenAncestors(child, here)) return false;
  }
  return true;
}

function withinUpperBounds(slot: ContractSlot, children: readonly MakerChild[]): boolean {
  const composed = children.filter(isNode);
  if (slot.maxItems !== undefined && composed.length > slot.maxItems) return false;
  for (const [signature, allowed] of Object.entries(slot.cardinality ?? {})) {
    if (allowed === "many") continue;
    if (composed.filter((child) => child.signature === signature).length > 1) return false;
  }
  for (const group of slot.groupCardinality ?? []) {
    if (group.count === "many") continue;
    if (composed.filter((child) => group.of.includes(child.signature)).length > 1) return false;
  }
  return true;
}

/** The slots of a node that take nodes, in the order the contract declares them. */
export function nodeSlots(node: MakerNode): readonly string[] {
  const signature = resolve(node)?.signature;
  if (!signature) return [];
  return Object.entries(signature.slots)
    .filter(([, slot]) => slot.accepts === "node" || slot.accepts === "signature")
    .map(([name]) => name);
}

/**
 * Every place `child` could be dropped in the page, as gaps between existing children. For a child
 * already in the page, the gaps on either side of it are left out (dropping there changes nothing)
 * and so is everything inside it (a node cannot hold itself).
 */
export function dropTargets(root: MakerNode, child: MakerChild): readonly Place[] {
  const inPage = findChild(root, child.id) !== undefined;
  const from = inPage ? locate(root, child.id) : undefined;
  const inside = new Set<string>();
  if (inPage && isNode(child)) for (const node of walk(child)) inside.add(node.id);

  const places: Place[] = [];
  const baseline = contentModelErrors(root);
  for (const parent of walk(root)) {
    if (inside.has(parent.id)) continue;
    const trail = ancestors(root, parent.id);
    for (const slot of nodeSlots(parent)) {
      const leaving = from && from.parent.id === parent.id && from.slot === slot ? child.id : undefined;
      if (!canPlace(parent, slot, child, trail, leaving)) continue;
      if (!keepsContentModel(root, parent.id, slot, child, baseline)) continue;
      const count = childrenOf(parent, slot).length;
      for (let index = 0; index <= count; index++) {
        if (leaving && (index === from!.index || index === from!.index + 1)) continue;
        places.push({ parent: parent.id, slot, index });
      }
    }
  }
  return places;
}

/**
 * Where an insertion lands when something is selected: inside it (at the end of its first slot
 * that takes nodes) when it can hold children, otherwise right after it in its own parent.
 */
export function insertionPlace(root: MakerNode, selected: string): Place | undefined {
  const target = findChild(root, selected);
  if (!target) return undefined;
  if (isNode(target)) {
    const slot = nodeSlots(target)[0];
    if (slot) return { parent: target.id, slot, index: childrenOf(target, slot).length };
  }
  const at = locate(root, selected);
  return at ? { parent: at.parent.id, slot: at.slot, index: at.index + 1 } : undefined;
}

/** Whether `child` may be dropped at this place. */
export function canPlaceAt(root: MakerNode, place: Place, child: MakerChild): boolean {
  const parent = findChild(root, place.parent);
  if (!parent || !isNode(parent)) return false;
  const from = locate(root, child.id);
  const leaving = from && from.parent.id === parent.id && from.slot === place.slot ? child.id : undefined;
  if (isNode(child) && [...walk(child)].some((node) => node.id === parent.id)) return false;
  if (!canPlace(parent, place.slot, child, ancestors(root, parent.id), leaving)) return false;
  return keepsContentModel(root, parent.id, place.slot, child, contentModelErrors(root));
}

/**
 * Whether putting `child` in this slot adds a content-model error the page did not already have.
 * The position among siblings never changes what an element may contain, so one trial per slot.
 */
function keepsContentModel(root: MakerNode, parentId: string, slot: string, child: MakerChild, baseline: number): boolean {
  if (!isNode(child)) return true;
  const without = detached(root, child.id);
  const trial = replaceNode(without, parentId, (parent) => withChildren(parent, slot, [...childrenOf(parent, slot), child]));
  return contentModelErrors(trial) <= baseline;
}

/** How many content-model errors the page has: the one structural rule only the validator knows. */
export function contentModelErrors(root: MakerNode): number {
  return validateUsageTree(toUsageTree(root)).problems.filter((problem) => problem.rule === "content-model").length;
}

function detached(root: MakerNode, id: string): MakerNode {
  const at = locate(root, id);
  if (!at) return root;
  return replaceNode(root, at.parent.id, (parent) =>
    withChildren(
      parent,
      at.slot,
      childrenOf(parent, at.slot).filter((sibling) => sibling.id !== id),
    ),
  );
}

/**
 * What the palette offers at a place: every catalogue signature whose preset may go there. Built on
 * the preset rather than the bare signature because what a signature brings along (a Wrapper's own
 * `notInside`, a Heading's rendered element) is what decides it.
 */
export function insertable(
  root: MakerNode,
  place: Place,
  presetOf: (ref: SignatureRef) => MakerNode | undefined,
  refs: readonly SignatureRef[] = catalogue(),
): readonly SignatureRef[] {
  return refs.filter((ref) => {
    const preset = presetOf(ref);
    return preset !== undefined && canPlaceAt(root, place, preset);
  });
}
