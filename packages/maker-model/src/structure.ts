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
 * Where an insertion lands when something is selected: inside it when it is a CONTAINER, otherwise
 * right after it in its own parent.
 *
 * A heading, a paragraph or a button also has a slot that takes nodes, but what it holds is its own
 * text: after adding a heading, the next thing a person adds is the paragraph below it, not a link
 * inside it. Inserting inside those made every sequence a round trip to reselect the parent. So a
 * node counts as a container when it is a layout primitive, when its slot takes composed
 * signatures (an accordion's items), or when it already holds nodes and no text of its own.
 */
export function isContainer(node: MakerNode): boolean {
  const resolved = resolve(node);
  if (!resolved) return false;
  if (resolved.contract.category === "layout") return nodeSlots(node).length > 0;
  const slot = nodeSlots(node)[0];
  if (!slot) return false;
  if (resolved.signature.slots[slot]?.accepts === "signature") return true;
  const held = childrenOf(node, slot);
  return held.length > 0 && held.every(isNode);
}

export function insertionPlace(root: MakerNode, selected: string): Place | undefined {
  const target = findChild(root, selected);
  if (!target) return undefined;
  if (isNode(target) && isContainer(target)) {
    const slot = nodeSlots(target)[0]!;
    return { parent: target.id, slot, index: childrenOf(target, slot).length };
  }
  const at = locate(root, selected);
  return at ? { parent: at.parent.id, slot: at.slot, index: at.index + 1 } : undefined;
}

/** Whether `child` may be dropped at this place. */
export function canPlaceAt(root: MakerNode, place: Place, child: MakerChild, baseline?: number): boolean {
  const parent = findChild(root, place.parent);
  if (!parent || !isNode(parent)) return false;
  const from = locate(root, child.id);
  const leaving = from && from.parent.id === parent.id && from.slot === place.slot ? child.id : undefined;
  if (isNode(child) && [...walk(child)].some((node) => node.id === parent.id)) return false;
  if (!canPlace(parent, place.slot, child, ancestors(root, parent.id), leaving)) return false;
  /* `baseline` lets a caller asking about many children at one place validate the page once, not once each. */
  return keepsContentModel(root, parent.id, place.slot, child, baseline ?? contentModelErrors(root));
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
  /* A page is immutable, so the count for one never changes: asked for the same page by the toolbars, the menus, the
     palette and every structural operation, it validated the whole page each time. The WeakMap forgets it with the page. */
  const known = contentModelCache.get(root);
  if (known !== undefined) return known;
  const count = validateUsageTree(toUsageTree(root)).problems.filter((problem) => problem.rule === "content-model").length;
  contentModelCache.set(root, count);
  return count;
}
const contentModelCache = new WeakMap<MakerNode, number>();

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
  const baseline = contentModelErrors(root);
  return refs.filter((ref) => {
    const preset = presetOf(ref);
    return preset !== undefined && canPlaceAt(root, place, preset, baseline);
  });
}

/*
 * LAYOUT ADVICE: what the validator accepts and a page should not do. Not errors (the page composes) and not for the person at
 * the canvas: it is what an agent is told after it proposes a page, so its next attempt fixes it. The one that matters most is
 * a page with no limit on its width: content directly in Main grows with the window, which is what a Wrapper's ceiling exists for.
 */
/* Components that set their own measure, or are meant to span the page: advising a Wrapper around a Marquee squeezes a strip that was asked to be full width. */
const OWN_MEASURE = new Set(["Wrapper", "Navbar", "AppBar", "Sidebar", "Footer", "LayoutGrid", "SkipLink", "Hero", "Marquee", "Marquee.autoplay", "Carousel"]);

export function layoutAdvice(root: MakerNode): readonly string[] {
  const advice: string[] = [];
  for (const node of walk(root)) {
    if (node.signature === "Wrapper" && node.options?.wrapperSize === "full") {
      advice.push(`Wrapper ${node.id} has wrapperSize "full", which has no maximum width: the page grows with the window. Use sm, md or lg unless a full-width column was asked for.`);
    }
    const kids = childrenOf(node, "children").filter(isNode);
    /* A Wrapper only measures. Two things sitting in it directly have no spacing of their own: the Stack is what arranges them. */
    if (node.signature === "Wrapper" && kids.length >= 2) {
      advice.push(`Wrapper ${node.id} holds ${kids.length} things directly, with nothing to space them. Put them in one Stack (gap md) inside the Wrapper.`);
    }
    /* Inline is a ROW: actions, tags, a label and its value. A heading is a block, and belongs in a Stack. */
    if (node.signature === "Inline" && kids.some((child) => child.signature === "Heading" || child.signature === "Hero")) {
      advice.push(`Inline ${node.id} holds a Heading: an Inline is a row of things side by side (buttons, tags). Put headings and paragraphs in a Stack, and the row of actions in an Inline inside it.`);
    }
    /* Buttons side by side are an Inline; as direct children of a Stack they run down the page. */
    if (node.signature === "Stack" && kids.filter((child) => child.signature.startsWith("Button")).length >= 2) {
      advice.push(`Stack ${node.id} has two or more Buttons as direct children, one under another. Actions that sit together go in an Inline inside the Stack.`);
    }
  }
  if (root.signature !== "Main") return advice;
  for (const section of childrenOf(root, "children")) {
    if (!isNode(section) || OWN_MEASURE.has(section.signature)) continue;
    const hasWrapper = [...walk(section)].some((node) => node.signature === "Wrapper");
    const hasContent = childrenOf(section, "children").some((child) => !isNode(child) || !["Stack", "Inline", "Grid", "Box"].includes(child.signature));
    if (!hasWrapper && hasContent) {
      advice.push(`Section ${section.signature} ${section.id} has no Wrapper: its content grows with the window. Put its content in a Wrapper (wrapperSize md for text, lg for wide layouts).`);
    }
  }
  return advice;
}
