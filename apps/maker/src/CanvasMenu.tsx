import { useEffect, useId, useRef } from "react";
import { anchoredParts } from "@skryensya/core/anchored";
import { isTypingContext } from "@skryensya/core/hotkey";
import { menuParts, type MenuItem } from "@skryensya/core/menu";
import { MenuPopup, useMenuMachine } from "@skryensya/react/menu";
import { actions, allowed, canDo } from "./actions";
import { ancestors, childrenOf, findChild, locate, randomId, reidentify, type MakerChild, type Operation } from "@skryensya/maker-model";
import { canPaste, copied, copySelection, cutSelection, paste } from "./clipboard";
import { selectParent, type Maker } from "./state";

/*
 * THE CANVAS'S OWN COMMANDS: a context menu on a right click anywhere in a page, and the keys a
 * design tool answers wherever the canvas has focus (Delete, ⌘C, ⌘X, ⌘V, ⌘D).
 *
 * Both start inside a page's frame more often than not, and a frame's events never reach this
 * document, so the frame FORWARDS them (Artboard.tsx) as two window events: which command a key
 * named, and where on screen a right click happened. Everything that decides what a command does
 * lives here, once, for the frame, the empty canvas and the menu alike.
 *
 * The menu is the kit's own Menu (its machine and its popup), opened at the pointer the way Menu's
 * context trigger opens it: the machine is told `CONTEXT_MENU` with the point. Each entry is
 * available exactly when the model would accept the gesture, like the inspector's buttons.
 */

export type CanvasCommand = "copy" | "cut" | "paste" | "duplicate" | "remove" | "move-up" | "move-down" | "outdent" | "indent" | "wrap" | "unwrap" | "select-all";

/** A frame asks for a command by name. */
export const CANVAS_COMMAND = "maker:canvas-command";
/** A frame asks for the context menu at a point, in this document's coordinates. */
export const CANVAS_CONTEXT_MENU = "maker:canvas-context-menu";

/** Which command a key press names, if any. Pure: the frame and this document both ask it. */
export function canvasKeyCommand(event: KeyboardEvent): CanvasCommand | undefined {
  const mod = event.metaKey || event.ctrlKey;
  if (!mod && !event.shiftKey && !event.altKey && (event.key === "Delete" || event.key === "Backspace")) return "remove";
  if (!mod && event.altKey && !event.shiftKey) {
    switch (event.key) {
      case "ArrowUp":
        return "move-up";
      case "ArrowDown":
        return "move-down";
      case "ArrowLeft":
        return "outdent";
      case "ArrowRight":
        return "indent";
      default:
        return undefined;
    }
  }
  if (!mod || event.altKey) return undefined;
  if (event.shiftKey && event.key.toLowerCase() !== "g") return undefined;
  switch (event.key.toLowerCase()) {
    case "a":
      return event.shiftKey ? undefined : "select-all";
    case "c":
      return "copy";
    case "x":
      return "cut";
    case "v":
      return "paste";
    case "d":
      return "duplicate";
    case "g":
      return event.shiftKey ? "unwrap" : "wrap";
    default:
      return undefined;
  }
}

/** Run a command on the selection. Whether it did anything. */
export function runCanvasCommand(maker: Maker, command: CanvasCommand): boolean {
  switch (command) {
    case "copy":
      return copySelection(maker);
    case "cut":
      return cutSelection(maker);
    case "paste":
      return paste(maker);
    case "select-all": {
      const selectedIds = selectableIds(maker.page.root);
      maker.setView({ selected: selectedIds.at(-1), selectedIds });
      return selectedIds.length > 0;
    }
    case "duplicate":
    case "move-up":
    case "move-down":
    case "outdent":
    case "indent":
    case "wrap":
    case "unwrap":
    case "remove": {
      if (command === "duplicate" && maker.view.selectedIds.length > 1) return duplicateMany(maker);
      if ((command === "move-up" || command === "move-down") && maker.view.selectedIds.length > 1) return moveMany(maker, command);
      if (command === "remove" && maker.view.selectedIds.length > 1) {
        const ids = rootMostSelection(maker).filter((id) => id !== maker.page.root.id);
        if (ids.length === 0) return false;
        const first = locate(maker.page.root, ids[0]!);
        const operations: Operation[] = ids.map((child) => ({ type: "remove", child }));
        maker.gesture(operations, first?.parent.id);
        return true;
      }
      const gesture = allowed(maker.page.root, maker.view.selected, actions.find((action) => action.id === command)!);
      if (!gesture) return false;
      maker.gesture(gesture.operations, gesture.select);
      return true;
    }
  }
}

function selectableIds(root: MakerChild): readonly string[] {
  if (!("signature" in root)) return [root.id];
  const ids: string[] = [];
  for (const held of Object.values(root.slots)) {
    if (held.kind !== "nodes") continue;
    for (const child of held.children) {
      ids.push(child.id, ...selectableIds(child));
    }
  }
  return ids;
}

function rootMostSelection(maker: Maker): readonly string[] {
  const selected = maker.view.selectedIds;
  return selected.filter((id) => !ancestors(maker.page.root, id).some((node) => selected.includes(node.id)));
}

function selectedLocations(maker: Maker) {
  return rootMostSelection(maker)
    .map((id) => ({ id, at: locate(maker.page.root, id), child: findChild(maker.page.root, id) }))
    .filter((entry): entry is { id: string; at: NonNullable<ReturnType<typeof locate>>; child: MakerChild } => Boolean(entry.at && entry.child));
}

function duplicateMany(maker: Maker): boolean {
  const entries = selectedLocations(maker).filter((entry) => entry.id !== maker.page.root.id);
  if (entries.length < 2) return false;
  const operations: Operation[] = [];
  const selectedIds: string[] = [];
  for (const entry of [...entries].sort((a, b) => b.at.index - a.at.index)) {
    const child = reidentify(entry.child, randomId);
    operations.push({ type: "insert", at: { parent: entry.at.parent.id, slot: entry.at.slot, index: entry.at.index + 1 }, child });
    selectedIds.push(child.id);
  }
  maker.gesture(operations, selectedIds.at(-1));
  maker.setView({ selected: selectedIds.at(-1), selectedIds });
  return true;
}

function moveMany(maker: Maker, direction: "move-up" | "move-down"): boolean {
  const entries = selectedLocations(maker).filter((entry) => entry.id !== maker.page.root.id);
  if (entries.length < 2) return false;
  const first = entries[0]!;
  if (entries.some((entry) => entry.at.parent.id !== first.at.parent.id || entry.at.slot !== first.at.slot)) {
    maker.say("Select siblings in one container to move them together.");
    return false;
  }
  const sorted = [...entries].sort((a, b) => a.at.index - b.at.index);
  const indexes = sorted.map((entry) => entry.at.index);
  if (indexes.some((index, i) => index !== indexes[0]! + i)) {
    maker.say("Select adjacent siblings to move them as a group.");
    return false;
  }
  const operations: Operation[] = [];
  if (direction === "move-up") {
    if (sorted[0]!.at.index === 0) return false;
    for (const entry of sorted) operations.push({ type: "move", child: entry.id, to: { parent: first.at.parent.id, slot: first.at.slot, index: entry.at.index - 1 } });
  } else {
    const siblingCount = childrenOf(first.at.parent, first.at.slot).length;
    if (sorted.at(-1)!.at.index >= siblingCount - 1) return false;
    for (const entry of [...sorted].reverse()) operations.push({ type: "move", child: entry.id, to: { parent: first.at.parent.id, slot: first.at.slot, index: entry.at.index + 2 } });
  }
  maker.gesture(operations, maker.view.selected);
  maker.setView({ selected: maker.view.selected, selectedIds: maker.view.selectedIds });
  return true;
}

/*
 * Keys that are not the canvas's to take: a field being typed in (the inspector, an in-place text
 * edit), an open menu or dialog, and the layers tree, which answers Delete and ⌘D itself.
 */
function keyIsElsewhere(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || isTypingContext(event.target)) return true;
  const target = event.target as Element | null;
  return Boolean(target?.closest?.('[role="menu"], [role="menuitem"], dialog, [popover], .maker-outline, [contenteditable], [data-maker-editing]'));
}

export function CanvasMenu({ maker }: { maker: Maker }) {
  const live = useRef(maker);
  live.current = maker;
  const id = useId();
  const eventRootRef = useRef<HTMLDivElement | null>(null);
  const { service, api } = useMenuMachine({ id });

  /* The keys, when the canvas (not a frame) has focus: the empty canvas, a panel's chrome. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (live.current.view.mode !== "edit" || keyIsElsewhere(event)) return;
      const command = canvasKeyCommand(event);
      /* ⌘C with text selected on the page is the browser's copy, not the Maker's. */
      if (!command || (command === "copy" && window.getSelection()?.toString())) return;
      if (runCanvasCommand(live.current, command)) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* What the frames forward. */
  useEffect(() => {
    const onCommand = (event: Event) => runCanvasCommand(live.current, (event as CustomEvent<CanvasCommand>).detail);
    const onMenu = (event: Event) => {
      const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail;
      service.send({ type: "CONTEXT_MENU", point: { x, y } });
    };
    window.addEventListener(CANVAS_COMMAND, onCommand);
    window.addEventListener(CANVAS_CONTEXT_MENU, onMenu);
    return () => {
      window.removeEventListener(CANVAS_COMMAND, onCommand);
      window.removeEventListener(CANVAS_CONTEXT_MENU, onMenu);
    };
  }, [service]);

  const root = maker.page.root;
  const selected = maker.view.selected;
  const isPage = selected === root.id;
  const available = (command: CanvasCommand) => {
    if (command === "copy") return Boolean(selected) && !isPage;
    if (command === "cut") return !isPage && canDo(root, selected, actions.find((action) => action.id === "remove")!);
    if (command === "paste") return canPaste(maker);
    if (command === "remove" && maker.view.selectedIds.length > 1) return rootMostSelection(maker).some((id) => id !== root.id);
    return canDo(root, selected, actions.find((action) => action.id === command)!);
  };
  /* The four moves share one submenu: side by side at the top level they made the menu taller than
     the screen, and the move a person wants is found by its verb first. */
  const moves = actions.filter((action) => ["move-up", "move-down", "outdent", "indent"].includes(action.id));
  const wraps = actions.filter((action) => action.id === "wrap" || action.id === "unwrap");
  const entry = (action: (typeof actions)[number]): MenuItem => ({
    value: `action-${action.id}`,
    label: action.label,
    disabled: !canDo(root, selected, action),
  });

  const items: MenuItem[] = [
    { value: "copy", label: "Copy", disabled: !available("copy") },
    { value: "cut", label: "Cut", disabled: !available("cut") },
    { value: "paste", label: copied() ? "Paste" : "Paste (nothing copied)", disabled: !available("paste") },
    { value: "duplicate", label: "Duplicate", disabled: !available("duplicate") },
    { value: "select-all", label: "Select all", disabled: selectableIds(root).length === 0 },
    { value: "sep-edit", kind: "separator" },
    { value: "parent", label: "Select parent", disabled: !selected },
    { value: "move", label: "Move", disabled: moves.every((action) => !canDo(root, selected, action)), children: moves.map(entry) },
    ...wraps.map(entry),
    { value: "sep-remove", kind: "separator" },
    { value: "remove", label: "Delete", tone: "danger", disabled: !available("remove") },
  ];

  const onSelect = ({ value }: { value: string }) => {
    const maker = live.current;
    if (value === "parent") return selectParent(maker);
    if (value.startsWith("action-")) {
      const action = actions.find((entry) => `action-${entry.id}` === value);
      const gesture = action && allowed(maker.page.root, maker.view.selected, action);
      if (gesture) maker.gesture(gesture.operations, gesture.select);
      return;
    }
    runCanvasCommand(maker, value as CanvasCommand);
  };

  return (
    <div className={`${menuParts.root} maker-canvas-menu`} data-density="compact" ref={eventRootRef}>
      <MenuPopup
        api={api}
        checkedState={{}}
        density="compact"
        eventRootRef={eventRootRef}
        items={items}
        onSelect={onSelect}
        positionerProps={{ ...api.getPositionerProps(), className: `${menuParts.positioner} ${anchoredParts.positioner} maker-canvas-menu__popup` }}
        service={service}
        setCheckedState={() => {}}
      />
    </div>
  );
}
