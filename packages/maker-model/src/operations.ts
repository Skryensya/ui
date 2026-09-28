import type { ContractOption } from "@skryensya/core/contract";
import { unsafeUrlProblem } from "@skryensya/ai-compiler/validate";
import type { ItemInput, OptionInput } from "@skryensya/core/usage-tree";
import {
  ancestors,
  childrenOf,
  findChild,
  findNode,
  isNode,
  locate,
  replaceNode,
  withChildren,
  type MakerChild,
  type MakerNode,
  type Place,
} from "./node.js";
import { canPlace, canPlaceAt, contentModelErrors, resolve, slotOf } from "./structure.js";

/*
 * THE CLOSED SET (decision 31). Dragging in the outline or on the stage, the keyboard, the inspector
 * and, later, a prompt all say what they want in these terms and in no others. None of them takes a
 * position: `Place` is a parent, a slot and an index among siblings, and the browser decides where
 * that ends up on screen.
 *
 * Operations are data, so a gesture can be logged, replayed, sent by an agent or undone. Anything
 * that mints an identity (an insert, a wrap) carries the identities it mints, so replaying the same
 * operations gives the same page.
 *
 * An operation that would break the page's structure is REFUSED with a reason, never repaired. One
 * that leaves an option or a required child missing is applied: that page is pending, not broken.
 */
export type Operation =
  | { readonly type: "insert"; readonly at: Place; readonly child: MakerChild }
  | { readonly type: "move"; readonly child: string; readonly to: Place }
  | { readonly type: "remove"; readonly child: string }
  | { readonly type: "wrap"; readonly children: readonly string[]; readonly container: MakerNode }
  | { readonly type: "unwrap"; readonly node: string }
  | { readonly type: "setOption"; readonly node: string; readonly name: string; readonly value?: OptionInput }
  | { readonly type: "setAttr"; readonly node: string; readonly name: string; readonly value?: string }
  | { readonly type: "setText"; readonly node: string; readonly slot: string; readonly text: string }
  | { readonly type: "setItems"; readonly node: string; readonly slot: string; readonly items: readonly ItemInput[] };

export type Applied = { readonly ok: true; readonly root: MakerNode } | { readonly ok: false; readonly reason: string };

const refuse = (reason: string): Applied => ({ ok: false, reason });

export function apply(root: MakerNode, operation: Operation): Applied {
  const result = dispatch(root, operation);
  /*
   * Whatever changed shape, however it did it, may not leave HTML the parser would rewrite. Checked
   * once here rather than per operation, so a new operation cannot forget it: a wrap that puts a
   * Stack inside a heading is refused exactly like a drop that does.
   */
  if (result.ok && STRUCTURAL.has(operation.type) && contentModelErrors(result.root) > contentModelErrors(root)) {
    return refuse("That would put a block inside an element that only holds inline content.");
  }
  return result;
}

const STRUCTURAL = new Set<Operation["type"]>(["insert", "move", "wrap", "unwrap"]);

function dispatch(root: MakerNode, operation: Operation): Applied {
  switch (operation.type) {
    case "insert":
      return insert(root, operation.at, operation.child);
    case "move":
      return move(root, operation.child, operation.to);
    case "remove":
      return remove(root, operation.child);
    case "wrap":
      return wrap(root, operation.children, operation.container);
    case "unwrap":
      return unwrap(root, operation.node);
    case "setOption":
      return setOption(root, operation.node, operation.name, operation.value);
    case "setAttr":
      return setAttr(root, operation.node, operation.name, operation.value);
    case "setText":
      return setText(root, operation.node, operation.slot, operation.text);
    case "setItems":
      return setItems(root, operation.node, operation.slot, operation.items);
  }
}

/** Every operation in order, or none: a gesture is one step, so it lands whole or not at all. */
export function applyAll(root: MakerNode, operations: readonly Operation[]): Applied {
  let current = root;
  for (const operation of operations) {
    const result = apply(current, operation);
    if (!result.ok) return result;
    current = result.root;
  }
  return { ok: true, root: current };
}

function insert(root: MakerNode, at: Place, child: MakerChild): Applied {
  if (findChild(root, child.id)) return refuse(`"${child.id}" is already in the page; move it instead.`);
  if (isNode(child)) {
    for (const id of identities(child)) if (findChild(root, id)) return refuse(`"${id}" is already in the page.`);
  }
  if (!canPlaceAt(root, at, child)) return refuse(`${describe(child)} cannot go in "${at.slot}" of "${at.parent}".`);
  return { ok: true, root: spliceInto(root, at, child) };
}

function move(root: MakerNode, id: string, to: Place): Applied {
  const child = findChild(root, id);
  if (!child) return refuse(`No "${id}" in the page.`);
  if (id === root.id) return refuse("The page's root does not move.");
  if (!canPlaceAt(root, to, child)) return refuse(`${describe(child)} cannot go in "${to.slot}" of "${to.parent}".`);
  const from = locate(root, id)!;
  /* `to.index` is a gap in the list as it stands, the moving child still in it. */
  const sameSlot = from.parent.id === to.parent && from.slot === to.slot;
  const index = sameSlot && to.index > from.index ? to.index - 1 : to.index;
  const without = detach(root, id);
  const moved = sameSlot ? child : leaveParent(child, from.parent, from.slot);
  return { ok: true, root: spliceInto(without, { ...to, index }, moved) };
}

function remove(root: MakerNode, id: string): Applied {
  if (id === root.id) return refuse("The page's root cannot be removed.");
  if (!findChild(root, id)) return refuse(`No "${id}" in the page.`);
  return { ok: true, root: detach(root, id) };
}

/**
 * Put contiguous siblings of one slot inside a new container, which takes the first one's place.
 * Only contiguous siblings: gathering scattered nodes is a move followed by a wrap, so that each
 * operation does one thing and `unwrap` undoes exactly this.
 */
function wrap(root: MakerNode, ids: readonly string[], container: MakerNode): Applied {
  if (ids.length === 0) return refuse("Wrap needs at least one child.");
  const locations = ids.map((id) => locate(root, id));
  if (locations.some((at) => at === undefined)) return refuse("Every wrapped child must be in the page, and not be its root.");
  const first = locations[0]!;
  if (locations.some((at) => at!.parent.id !== first.parent.id || at!.slot !== first.slot)) {
    return refuse("Only siblings of one slot can be wrapped together.");
  }
  const indexes = locations.map((at) => at!.index).sort((a, b) => a - b);
  if (indexes.some((index, i) => index !== indexes[0]! + i)) return refuse("Only contiguous siblings can be wrapped together.");
  if (findChild(root, container.id)) return refuse(`"${container.id}" is already in the page.`);
  if (childrenOf(container, "children").length > 0) return refuse("The container must arrive empty.");
  const slot = slotOf(container, "children");
  if (!slot || (slot.accepts !== "node" && slot.accepts !== "signature")) {
    return refuse(`${container.signature} has no children slot to wrap into.`);
  }

  const siblings = childrenOf(first.parent, first.slot);
  const wrapped = siblings.slice(indexes[0], indexes[0]! + indexes.length).map((child) => leaveParent(child, first.parent, first.slot));
  const filled = withChildren(container, "children", []);
  const trail = [...ancestors(root, first.parent.id), first.parent];
  for (const child of wrapped) {
    if (!canPlace(filled, "children", child, trail)) return refuse(`${describe(child)} cannot go inside ${container.signature}.`);
  }
  const next = withChildren(container, "children", wrapped);
  const replaced = [...siblings.slice(0, indexes[0]), next, ...siblings.slice(indexes[0]! + indexes.length)];
  const parentAfter = withChildren(first.parent, first.slot, replaced);
  if (!canPlace(parentAfter, first.slot, next, ancestors(root, first.parent.id), next.id)) {
    return refuse(`${container.signature} cannot go in "${first.slot}" of ${first.parent.signature}.`);
  }
  return { ok: true, root: replaceNode(root, first.parent.id, () => parentAfter) };
}

/** Replace a container by its children, in order. The inverse of `wrap`. */
function unwrap(root: MakerNode, id: string): Applied {
  const node = findNode(root, id);
  const at = locate(root, id);
  if (!node || !at) return refuse(`No "${id}" to unwrap, or it is the root.`);
  const filled = Object.entries(node.slots).filter(([name, held]) =>
    name === "children" ? false : held.kind === "nodes" ? held.children.length > 0 : held.kind === "text" ? held.text !== "" : held.items.length > 0,
  );
  if (filled.length > 0) return refuse(`${node.signature} holds content outside its children; unwrapping would drop it.`);
  const inner = childrenOf(node, "children").map((child) => leaveParent(child, node, "children"));
  const siblings = childrenOf(at.parent, at.slot);
  const replaced = [...siblings.slice(0, at.index), ...inner, ...siblings.slice(at.index + 1)];
  const parentAfter = withChildren(at.parent, at.slot, replaced);
  const trail = ancestors(root, at.parent.id);
  for (const child of inner) {
    if (!canPlace(parentAfter, at.slot, child, trail, child.id)) {
      return refuse(`${describe(child)} cannot sit directly in "${at.slot}" of ${at.parent.signature}.`);
    }
  }
  return { ok: true, root: replaceNode(root, at.parent.id, () => parentAfter) };
}

/**
 * Only an option the signature declares, with a value the contract allows. `undefined` removes it,
 * which puts the default back. This is the whole of the Maker's styling vocabulary.
 */
function setOption(root: MakerNode, id: string, name: string, value: OptionInput | undefined): Applied {
  const node = findNode(root, id);
  if (!node) return refuse(`No "${id}" in the page.`);
  const resolved = resolve(node);
  if (!resolved) return refuse(`${node.contract}/${node.signature} is not in the catalogue.`);
  if (!resolved.signature.options.includes(name)) {
    return refuse(`${node.signature} has no option "${name}". It takes: ${resolved.signature.options.join(", ") || "none"}.`);
  }
  const option = resolved.contract.options[name]!;
  if (value !== undefined) {
    const problem = valueProblem(option, value);
    if (problem) return refuse(`"${name}" ${problem}`);
    const unsafe = option.attr && typeof value === "string" ? unsafeUrlProblem(option.attr, value) : undefined;
    if (unsafe) return refuse(`"${name}": ${unsafe}`);
  }
  return {
    ok: true,
    root: replaceNode(root, id, (current) => {
      const options = { ...current.options };
      if (value === undefined) delete options[name];
      else options[name] = value;
      return { ...current, options };
    }),
  };
}

/*
 * No attribute that would let a page style or place itself. `style` and `class` are how a
 * coordinate would get back in, and an attribute an option already writes would fight the option.
 */
const NEVER_AUTHORED = new Set(["style", "class"]);

/**
 * Attributes on the host: a child attribute the parent's slot publishes (Inline's `data-sizing`,
 * LayoutGrid's `data-width`), held to its vocabulary, or a plain host attribute (`aria-label`,
 * `href`-less `id`) the signature forwards.
 */
function setAttr(root: MakerNode, id: string, name: string, value: string | undefined): Applied {
  const node = findNode(root, id);
  if (!node) return refuse(`No "${id}" in the page.`);
  if (NEVER_AUTHORED.has(name) || name.startsWith("on")) return refuse(`"${name}" is never authored in the Maker.`);
  const resolved = resolve(node);
  if (!resolved) return refuse(`${node.contract}/${node.signature} is not in the catalogue.`);
  const owned = resolved.signature.options.some((option) => resolved.contract.options[option]?.attr === name);
  if (owned) return refuse(`"${name}" is written by one of ${node.signature}'s options; set the option.`);

  const unsafe = value !== undefined ? unsafeUrlProblem(name, value) : undefined;
  if (unsafe) return refuse(`"${name}": ${unsafe}`);

  const childAttr = parentChildAttr(root, id, name);
  if (childAttr) {
    if (value !== undefined) {
      const problem = valueProblem(childAttr, value);
      if (problem) return refuse(`"${name}" ${problem}`);
    }
  } else if (name.startsWith("data-")) {
    return refuse(`"${name}" is not an attribute this node's parent publishes.`);
  } else {
    const forward = resolved.signature.forward;
    if (forward && !forward.some((allowed) => (allowed.endsWith("*") ? name.startsWith(allowed.slice(0, -1)) : allowed === name))) {
      return refuse(`${node.signature} does not forward "${name}". It forwards: ${forward.join(", ")}.`);
    }
  }

  return {
    ok: true,
    root: replaceNode(root, id, (current) => {
      const attrs = { ...current.attrs };
      if (value === undefined) delete attrs[name];
      else attrs[name] = value;
      return { ...current, attrs };
    }),
  };
}

function setText(root: MakerNode, id: string, slot: string, text: string): Applied {
  const target = findChild(root, id);
  if (!target) return refuse(`No "${id}" in the page.`);
  if (!isNode(target)) {
    /* A text run in a slot of nodes: the run itself is what changes. */
    const at = locate(root, id)!;
    const siblings = childrenOf(at.parent, at.slot).map((child) => (child.id === id ? { id, text } : child));
    return { ok: true, root: replaceNode(root, at.parent.id, (parent) => withChildren(parent, at.slot, siblings)) };
  }
  const declared = slotOf(target, slot);
  if (!declared) return refuse(`${target.signature} has no slot "${slot}".`);
  if (declared.accepts === "text") {
    return { ok: true, root: replaceNode(root, id, (node) => ({ ...node, slots: { ...node.slots, [slot]: { kind: "text", text } } })) };
  }
  if (declared.accepts === "node") {
    /* Text in a slot of nodes replaces what the slot holds with one run; to mix, insert runs. */
    const current = childrenOf(target, slot);
    if (current.some(isNode)) return refuse(`"${slot}" of ${target.signature} holds nodes; edit a text run instead.`);
    const run = current[0] ? { id: current[0].id, text } : undefined;
    if (!run) return refuse(`"${slot}" of ${target.signature} is empty; insert a text run.`);
    return { ok: true, root: replaceNode(root, id, (node) => withChildren(node, slot, [run])) };
  }
  return refuse(`"${slot}" of ${target.signature} does not take text.`);
}

function setItems(root: MakerNode, id: string, slot: string, items: readonly ItemInput[]): Applied {
  const node = findNode(root, id);
  if (!node) return refuse(`No "${id}" in the page.`);
  if (slotOf(node, slot)?.accepts !== "items") return refuse(`"${slot}" of ${node.signature} is not a collection.`);
  return { ok: true, root: replaceNode(root, id, (current) => ({ ...current, slots: { ...current.slots, [slot]: { kind: "items", items } } })) };
}

/* ─── helpers ─────────────────────────────────────────────────────────────────────────────────── */

function valueProblem(option: ContractOption, value: OptionInput): string | undefined {
  if (option.type === "enum") {
    return typeof value === "string" && (option.values ?? []).includes(value)
      ? undefined
      : `must be one of ${(option.values ?? []).join(", ")}; got ${JSON.stringify(value)}.`;
  }
  if (option.type === "boolean") return typeof value === "boolean" ? undefined : `is a boolean; got ${JSON.stringify(value)}.`;
  if (option.type === "number") return typeof value === "number" ? undefined : `is a number; got ${JSON.stringify(value)}.`;
  return typeof value === "string" ? undefined : `is a string; got ${JSON.stringify(value)}.`;
}

function parentChildAttr(root: MakerNode, id: string, name: string): ContractOption | undefined {
  const at = locate(root, id);
  if (!at) return undefined;
  const childAttrs = slotOf(at.parent, at.slot)?.childAttrs ?? {};
  return Object.values(childAttrs).find((option) => option.attr === name);
}

/**
 * Child attributes belong to the relation with a parent (`data-sizing` in an Inline). A child that
 * changes parent leaves behind the ones the old slot published, rather than carrying a rule its new
 * parent never reads. Anything else it carries stays.
 */
function leaveParent(child: MakerChild, parent: MakerNode, slot: string): MakerChild {
  if (!isNode(child) || !child.attrs) return child;
  const published = new Set(Object.values(slotOf(parent, slot)?.childAttrs ?? {}).map((option) => option.attr));
  if (published.size === 0) return child;
  const kept = Object.fromEntries(Object.entries(child.attrs).filter(([name]) => !published.has(name)));
  const { attrs: _dropped, ...rest } = child;
  return Object.keys(kept).length > 0 ? { ...rest, attrs: kept } : rest;
}

function spliceInto(root: MakerNode, at: Place, child: MakerChild): MakerNode {
  return replaceNode(root, at.parent, (parent) => {
    const siblings = [...childrenOf(parent, at.slot)];
    siblings.splice(at.index, 0, child);
    return withChildren(parent, at.slot, siblings);
  });
}

function detach(root: MakerNode, id: string): MakerNode {
  const at = locate(root, id);
  if (!at) return root;
  return replaceNode(root, at.parent.id, (parent) =>
    withChildren(
      parent,
      at.slot,
      childrenOf(parent, at.slot).filter((child) => child.id !== id),
    ),
  );
}

function identities(node: MakerNode): readonly string[] {
  const ids: string[] = [];
  const visit = (child: MakerChild) => {
    ids.push(child.id);
    if (isNode(child)) for (const held of Object.values(child.slots)) if (held.kind === "nodes") held.children.forEach(visit);
  };
  visit(node);
  return ids;
}

function describe(child: MakerChild): string {
  return isNode(child) ? child.signature : "Text";
}
