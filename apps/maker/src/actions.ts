import {
  applyAll,
  childrenOf,
  findChild,
  isNode,
  locate,
  presetFor,
  randomId,
  reidentify,
  type MakerNode,
  type Operation,
} from "@skryensya/maker-model";
import type { AnyIcon } from "./icons";

/*
 * THE STRUCTURAL ACTIONS on the selection, in one place, so the keyboard and the toolbars are the
 * same gestures and cannot drift. Each one is a list of operations or nothing; a toolbar button is
 * disabled exactly when its gesture would be refused, because it is asked by applying the gesture,
 * not by a second set of rules.
 */

export type Gesture = { readonly operations: readonly Operation[]; readonly select?: string };

export type ActionId = "move-up" | "move-down" | "outdent" | "indent" | "wrap" | "unwrap" | "duplicate" | "remove";

export type Action = {
  readonly id: ActionId;
  readonly label: string;
  readonly shortcut: string;
  readonly icon: AnyIcon;
  readonly gesture: (root: MakerNode, id: string) => Gesture | undefined;
};

const MOD = typeof navigator !== "undefined" && /mac/i.test(navigator.platform) ? "⌘" : "Ctrl+";

export const actions: readonly Action[] = [
  {
    id: "move-up",
    label: "Move before the previous sibling",
    shortcut: "Alt+↑",
    icon: { glyph: "move-up" },
    gesture: (root, id) => {
      const at = locate(root, id);
      return at && at.index > 0 ? { operations: [{ type: "move", child: id, to: { parent: at.parent.id, slot: at.slot, index: at.index - 1 } }] } : undefined;
    },
  },
  {
    id: "move-down",
    label: "Move after the next sibling",
    shortcut: "Alt+↓",
    icon: { glyph: "move-down" },
    gesture: (root, id) => {
      const at = locate(root, id);
      if (!at || at.index >= childrenOf(at.parent, at.slot).length - 1) return undefined;
      return { operations: [{ type: "move", child: id, to: { parent: at.parent.id, slot: at.slot, index: at.index + 2 } }] };
    },
  },
  {
    id: "outdent",
    label: "Move out of its container",
    shortcut: "Alt+←",
    icon: { glyph: "outdent" },
    gesture: (root, id) => {
      const at = locate(root, id);
      const outer = at && locate(root, at.parent.id);
      return outer ? { operations: [{ type: "move", child: id, to: { parent: outer.parent.id, slot: outer.slot, index: outer.index + 1 } }] } : undefined;
    },
  },
  {
    id: "indent",
    label: "Move into the previous container",
    shortcut: "Alt+→",
    icon: { glyph: "indent" },
    gesture: (root, id) => {
      const at = locate(root, id);
      const previous = at ? childrenOf(at.parent, at.slot)[at.index - 1] : undefined;
      if (!previous || !isNode(previous)) return undefined;
      return { operations: [{ type: "move", child: id, to: { parent: previous.id, slot: "children", index: childrenOf(previous, "children").length } }] };
    },
  },
  {
    id: "wrap",
    label: "Wrap in a Stack",
    shortcut: `${MOD}G`,
    icon: { glyph: "wrap" },
    gesture: (root, id) => wrapIn(root, id, "layout", "Stack"),
  },
  {
    id: "unwrap",
    label: "Unwrap: replace by its children",
    shortcut: `${MOD}⇧G`,
    icon: { glyph: "unwrap" },
    gesture: (root, id) => {
      const node = findChild(root, id);
      return node && isNode(node) ? { operations: [{ type: "unwrap", node: id }], select: childrenOf(node, "children")[0]?.id } : undefined;
    },
  },
  {
    id: "duplicate",
    label: "Duplicate",
    shortcut: `${MOD}D`,
    icon: { glyph: "duplicate" },
    gesture: (root, id) => {
      const at = locate(root, id);
      const child = findChild(root, id);
      if (!at || !child) return undefined;
      const copy = reidentify(child, randomId);
      return { operations: [{ type: "insert", at: { parent: at.parent.id, slot: at.slot, index: at.index + 1 }, child: copy }], select: copy.id };
    },
  },
  {
    id: "remove",
    label: "Remove",
    shortcut: "Delete",
    icon: { role: "delete" },
    gesture: (root, id) => {
      const at = locate(root, id);
      if (!at) return undefined;
      const siblings = childrenOf(at.parent, at.slot);
      const next = siblings[at.index + 1] ?? siblings[at.index - 1];
      return { operations: [{ type: "remove", child: id }], select: next?.id ?? at.parent.id };
    },
  },
];

export function wrapIn(root: MakerNode, id: string, contract: string, signature: string): Gesture | undefined {
  if (!locate(root, id)) return undefined;
  const container = presetFor({ contract, signature }, randomId);
  return container ? { operations: [{ type: "wrap", children: [id], container }], select: container.id } : undefined;
}

/** The gesture, only when the model would accept it: what enables a button. */
export function allowed(root: MakerNode, id: string | undefined, action: Action): Gesture | undefined {
  if (!id) return undefined;
  const gesture = action.gesture(root, id);
  return gesture && applyAll(root, gesture.operations).ok ? gesture : undefined;
}

/** The action a key press means, if any. */
export function actionForKey(key: string, alt: boolean, mod: boolean, shift: boolean): Action | undefined {
  const byId = (id: ActionId) => actions.find((action) => action.id === id);
  if (alt && !mod) {
    if (key === "ArrowUp") return byId("move-up");
    if (key === "ArrowDown") return byId("move-down");
    if (key === "ArrowLeft") return byId("outdent");
    if (key === "ArrowRight") return byId("indent");
  }
  if (mod && (key === "g" || key === "G")) return byId(shift ? "unwrap" : "wrap");
  if (mod && !shift && (key === "d" || key === "D")) return byId("duplicate");
  if (!mod && !alt && (key === "Delete" || key === "Backspace")) return byId("remove");
  return undefined;
}
