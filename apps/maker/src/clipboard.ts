import { applyAll, canPlaceAt, findChild, isNode, randomId, reidentify, type MakerChild } from "@skryensya/maker-model";
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

/** The copied node, if there is one this browser can still read. */
export function copied(): MakerChild | undefined {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MakerChild) : undefined;
  } catch {
    return undefined;
  }
}

function store(child: MakerChild): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(child));
    return true;
  } catch {
    return false;
  }
}

const nameOf = (child: MakerChild) => (isNode(child) ? child.signature : "text");

/** Copy the selected node. The page's Main is the page itself and is never copied. */
export function copySelection(maker: Maker): boolean {
  const id = maker.view.selected;
  const child = id && id !== maker.page.root.id ? findChild(maker.page.root, id) : undefined;
  if (!child) return false;
  if (!store(child)) {
    maker.say("This browser would not keep the copy (storage is full or off).");
    return false;
  }
  maker.say(`Copied ${nameOf(child)}.`);
  return true;
}

/** Copy the selected node, then remove it: one step, undone as one. */
export function cutSelection(maker: Maker): boolean {
  const remove = actions.find((action) => action.id === "remove")!;
  const gesture = allowed(maker.page.root, maker.view.selected, remove);
  if (!gesture || !copySelection(maker)) return false;
  maker.gesture(gesture.operations, gesture.select);
  return true;
}

/** Whether a paste would do anything here: something copied, and a place that accepts it. */
export function canPaste(maker: Maker): boolean {
  const child = copied();
  return Boolean(child && canPlaceAt(maker.page.root, insertionFor(maker), child));
}

export function paste(maker: Maker): boolean {
  const child = copied();
  if (!child) return false;
  const place = insertionFor(maker);
  const copy = reidentify(child, randomId);
  if (!canPlaceAt(maker.page.root, place, copy) || !applyAll(maker.page.root, [{ type: "insert", at: place, child: copy }]).ok) {
    maker.say(`${nameOf(child)} cannot go here.`);
    return false;
  }
  maker.gesture([{ type: "insert", at: place, child: copy }], copy.id);
  return true;
}
