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
import { detectMac, formatHotkey } from "@skryensya/core/hotkey";
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
  /** Hotkey specs in the kit's syntax (decision 25); the first is the one shown. */
  readonly hotkeys: readonly string[];
  readonly icon: AnyIcon;
  readonly gesture: (root: MakerNode, id: string) => Gesture | undefined;
};

export const actions: readonly Action[] = [
  {
    id: "move-up",
    label: "Move before the previous sibling",
    hotkeys: ["alt+arrowup"],
    icon: { glyph: "move-up" },
    gesture: (root, id) => {
      const at = locate(root, id);
      return at && at.index > 0 ? { operations: [{ type: "move", child: id, to: { parent: at.parent.id, slot: at.slot, index: at.index - 1 } }] } : undefined;
    },
  },
  {
    id: "move-down",
    label: "Move after the next sibling",
    hotkeys: ["alt+arrowdown"],
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
    hotkeys: ["alt+arrowleft"],
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
    hotkeys: ["alt+arrowright"],
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
    hotkeys: ["mod+g"],
    icon: { glyph: "wrap" },
    gesture: (root, id) => wrapIn(root, id, "layout", "Stack"),
  },
  {
    id: "unwrap",
    label: "Unwrap: replace by its children",
    hotkeys: ["mod+shift+g"],
    icon: { glyph: "unwrap" },
    gesture: (root, id) => {
      const node = findChild(root, id);
      return node && isNode(node) ? { operations: [{ type: "unwrap", node: id }], select: childrenOf(node, "children")[0]?.id } : undefined;
    },
  },
  {
    id: "duplicate",
    label: "Duplicate",
    hotkeys: ["mod+d"],
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
    hotkeys: ["delete", "backspace"],
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

/** An action's shortcut the way the platform writes it: "⌘G" on a Mac, "Ctrl+G" elsewhere. */
export function shortcutOf(action: Action): string {
  return formatHotkey(action.hotkeys[0]!, detectMac());
}
