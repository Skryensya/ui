import { ancestors, applyAll, canPlaceAt, findChild, isNode, locate, randomId, reidentify, type MakerChild, type Operation, type Place } from "@skryensya/maker-model";
import { actions, allowed } from "./actions";
import { insertionFor } from "./Palette";
import type { Maker } from "./state";

/*
 * THE MAKER'S CLIPBOARD: a node and everything in it, copied out of one place of a page and pasted
 * into another, of this page, another page, or another project.
 *
 * Kept in this browser's `localStorage`, not the system clipboard. Reading the system clipboard asks
 * the person for permission (or is refused outright) the moment it happens outside a native paste
 * event, and a context menu's "Paste" is not one; `localStorage` is shared by every Maker tab and
 * window of this origin, which is exactly the reach "copy here, paste in the other project" needs,
 * with nothing to grant. What is stored is the node as the page holds it; a paste gives it and every
 * node inside it fresh identities, so the same copy can be pasted any number of times.
 *
 * A paste lands where an insert from the palette would: inside the selected container, after the
 * selected node, or at the end of the page. Where the contract refuses the node there, nothing
 * changes and the notice says so, the same as a refused drop.
 */

const KEY = "skryensya-maker:clipboard";

type Clip = { readonly kind: "one"; readonly child: MakerChild } | { readonly kind: "many"; readonly children: readonly MakerChild[] };

/** The copied node or group, if there is one this browser can still read. */
export function copied(): Clip | undefined {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Clip | MakerChild;
    return "kind" in parsed ? parsed : { kind: "one", child: parsed };
  } catch {
    return undefined;
  }
}

function store(clip: Clip): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(clip));
    return true;
  } catch {
    return false;
  }
}

const nameOf = (child: MakerChild) => (isNode(child) ? child.signature : "text");
const clipName = (clip: Clip) => (clip.kind === "one" ? nameOf(clip.child) : `${clip.children.length} items`);

/** Copy the selected node. The page's Main is the page itself and is never copied. */
export function copySelection(maker: Maker): boolean {
  const ids = rootMostSelection(maker).filter((id) => id !== maker.page.root.id);
  const children = ids.map((id) => findChild(maker.page.root, id)).filter((child): child is MakerChild => Boolean(child));
  const clip = children.length > 1 ? { kind: "many" as const, children } : children[0] ? { kind: "one" as const, child: children[0] } : undefined;
  if (!clip) return false;
  if (!store(clip)) {
    maker.say("This browser would not keep the copy (storage is full or off).");
    return false;
  }
  maker.say(`Copied ${clipName(clip)}.`);
  return true;
}

/** Copy the selected node, then remove it: one step, undone as one. */
export function cutSelection(maker: Maker): boolean {
  const ids = rootMostSelection(maker).filter((id) => id !== maker.page.root.id);
  if (ids.length > 1) {
    if (!copySelection(maker)) return false;
    const first = locate(maker.page.root, ids[0]!);
    maker.gesture(ids.map((child) => ({ type: "remove", child })), first?.parent.id);
    return true;
  }
  const remove = actions.find((action) => action.id === "remove")!;
  const gesture = allowed(maker.page.root, maker.view.selected, remove);
  if (!gesture || !copySelection(maker)) return false;
  maker.gesture(gesture.operations, gesture.select);
  return true;
}

/** Whether a paste would do anything here: something copied, and a place that accepts it. */
export function canPaste(maker: Maker): boolean {
  const clip = copied();
  if (!clip) return false;
  const place = insertionFor(maker);
  if (clip.kind === "one") return canPlaceAt(maker.page.root, place, clip.child);
  return Boolean(groupPasteOperations(maker, clip.children, place));
}

export function paste(maker: Maker): boolean {
  const clip = copied();
  if (!clip) return false;
  const place = insertionFor(maker);
  if (clip.kind === "many") {
    const grouped = groupPasteOperations(maker, clip.children, place);
    if (!grouped) {
      maker.say(`${clipName(clip)} cannot go here.`);
      return false;
    }
    maker.gesture(grouped.operations, grouped.selectedIds.at(-1));
    maker.setView({ selected: grouped.selectedIds.at(-1), selectedIds: grouped.selectedIds });
    return true;
  }
  const copy = reidentify(clip.child, randomId);
  if (!canPlaceAt(maker.page.root, place, copy) || !applyAll(maker.page.root, [{ type: "insert", at: place, child: copy }]).ok) {
    maker.say(`${nameOf(clip.child)} cannot go here.`);
    return false;
  }
  maker.gesture([{ type: "insert", at: place, child: copy }], copy.id);
  return true;
}

function rootMostSelection(maker: Maker): readonly string[] {
  const selected = maker.view.selectedIds.length > 0 ? maker.view.selectedIds : maker.view.selected ? [maker.view.selected] : [];
  return selected.filter((id) => !ancestors(maker.page.root, id).some((node) => selected.includes(node.id)));
}

function groupPasteOperations(maker: Maker, children: readonly MakerChild[], at: Place): { operations: readonly Operation[]; selectedIds: readonly string[] } | undefined {
  const copies = children.map((child) => reidentify(child, randomId));
  const operations = copies.map((child, index) => ({ type: "insert" as const, at: { ...at, index: at.index + index }, child }));
  return applyAll(maker.page.root, operations).ok ? { operations, selectedIds: copies.map((child) => child.id) } : undefined;
}
