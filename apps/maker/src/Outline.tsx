import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@skryensya/react/button";
import { TreeView } from "@skryensya/react/tree-view";
import type { TreeNode } from "@skryensya/core/tree-view";
import {
  childrenOf,
  findChild,
  findNode,
  isNode,
  locate,
  nodeSlots,
  type MakerChild,
  type MakerNode,
  type Place,
} from "@skryensya/maker-model";
import { DRAG_THRESHOLD, type Drag, type Target } from "./drag";
import { useHotkey } from "@skryensya/react/hotkey";
import { actions, type Action } from "./actions";
import { runCanvasCommand, type CanvasCommand } from "./CanvasMenu";
import type { Maker } from "./state";

/*
 * THE OUTLINE: the maker page as what it is, a tree. It is the complete way to work: everything the
 * stage does by pointer, this does by keyboard too, which is why every shortcut lives here.
 *
 * A slot other than `children` shows as its own labelled branch (`Hero › actions`), so "move this
 * button into the hero's actions" is a move like any other. Text runs are leaves, quoted.
 */

const SLOT = "slot:";

function slotBranchId(owner: string, slot: string) {
  return `${SLOT}${owner}:${slot}`;
}

function parseSlotBranch(id: string): { owner: string; slot: string } | undefined {
  if (!id.startsWith(SLOT)) return undefined;
  const [owner, slot] = id.slice(SLOT.length).split(":");
  return owner && slot ? { owner, slot } : undefined;
}

/**
 * A named slot shows when it holds something. An EMPTY one shows only while something is being dragged
 * and its node is selected: that is when it is worth dropping into, and otherwise every selected button
 * carried two empty rows (`› pre`, `› post`) to scan past.
 */
function toTree(child: MakerChild, selected?: string, dragging = false): TreeNode {
  if (!isNode(child)) return { id: child.id, label: preview(child.text) || "“ ”" };
  const held = childrenOf(child, "children");
  /*
   * A node whose only content is one run of text is named by it ("Button · Get started"), and the run is not
   * a row of its own: two rows for one thing was the noise. The Inspector still edits that text from the node.
   */
  const only = held.length === 1 && !isNode(held[0]!) ? (held[0] as { text: string }).text : undefined;
  const children: TreeNode[] = only !== undefined ? [] : held.map((c) => toTree(c, selected, dragging));
  for (const slot of nodeSlots(child)) {
    if (slot === "children") continue;
    const inSlot = childrenOf(child, slot);
    if (inSlot.length === 0 && !(dragging && selected === child.id)) continue;
    children.push({ id: slotBranchId(child.id, slot), label: `› ${slot}`, children: inSlot.map((c) => toTree(c, selected, dragging)) });
  }
  const label = outlineLabel(child.signature, only);
  return children.length > 0 ? { id: child.id, label, children } : { id: child.id, label };
}

/** `Button.action` is the contract's name for a variant; the layers say what it is, "Button". */
export function outlineLabel(signature: string, text?: string): string {
  const name = signature.split(".")[0]!;
  const shown = text === undefined ? "" : preview(text);
  return shown ? `${name} · ${shown}` : name;
}

function preview(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  return trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed;
}

function branchIds(nodes: readonly TreeNode[], into: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children) {
      into.push(node.id);
      branchIds(node.children, into);
    }
  }
  return into;
}

export function Outline({ maker, drag }: { maker: Maker; drag: Drag }) {
  const root = maker.page.root;
  const selected = maker.view.selected;
  const selectedIds = maker.view.selectedIds;
  const dragging = drag.session !== undefined;
  const nodes = useMemo(() => [toTree(root, selected, dragging)], [root, selected, dragging]);
  const branches = useMemo(() => branchIds(nodes), [nodes]);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const expanded = branches.filter((id) => !collapsed.has(id));
  const hostRef = useRef<HTMLDivElement>(null);
  /*
   * Clicking a row selects it; only the chevron or the keyboard folds it. The tree view toggles a
   * branch on any click of its row, which in an outline hid a container's children the moment it
   * was selected, so a fold that did not come from the chevron or a key is ignored.
   */
  const intent = useRef<"fold" | "select">("fold");
  const pendingIds = useMemo(() => new Set(maker.problems.problems.filter((p) => p.severity === "error").flatMap((p) => p.nodes)), [maker.problems]);

  /* ─── keyboard: every structural gesture, on the selected node ──────────────────────────── */

  /*
   * The structural shortcuts, one kit hotkey per action (decision 25), scoped to the outline so
   * they act on the selection only while the tree has focus. Folding by keyboard is still the tree
   * view's own; noting the key here is what lets that fold through.
   */
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const onKeyDownCapture = () => {
    intent.current = "fold";
  };

  /* ─── pointer: drag a row ────────────────────────────────────────────────────────────────── */

  /*
   * WAS THIS PRESS ON THE CHEVRON? Asked of where the pointer is, not of what it hit: the chevron
   * takes no pointer events of its own (the tree view paints it inside the row's control and lets
   * the control receive the press), so the event's target is always the whole row's button and a
   * `closest()` on the chevron never matched. Every fold by pointer was then read as a selection
   * and thrown away, which is why no branch could be closed with the mouse. A few pixels of slack
   * around a 16px glyph, so a press at its edge still folds.
   */
  const onChevron = (event: React.PointerEvent) => {
    const control = (event.target as Element).closest(".sk-tree-view__branch-control");
    const chevron = control?.querySelector(".sk-tree-view__branch-indicator");
    if (!chevron) return false;
    const box = chevron.getBoundingClientRect();
    const slack = 4;
    return (
      event.clientX >= box.left - slack &&
      event.clientX <= box.right + slack &&
      event.clientY >= box.top - slack &&
      event.clientY <= box.bottom + slack
    );
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    intent.current = onChevron(event) ? "fold" : "select";
    if (event.button !== 0) return;
    const row = (event.target as Element).closest<HTMLElement>("[data-value]");
    const id = row?.dataset.value;
    if (!id || id === root.id || parseSlotBranch(id)) return;
    const child = findChild(root, id);
    if (!child) return;
    const host = event.currentTarget;
    const start = { x: event.clientX, y: event.clientY };
    let dragging = false;
    const onMove = (move: PointerEvent) => {
      if (dragging || Math.hypot(move.clientX - start.x, move.clientY - start.y) < DRAG_THRESHOLD) return;
      dragging = true;
      host.setPointerCapture(event.pointerId);
      drag.begin(child, false);
      drag.move(move.clientX, move.clientY);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  useEffect(
    () =>
      drag.register("outline", (x, y, allowed) => {
        const host = hostRef.current;
        if (!host) return undefined;
        const box = host.getBoundingClientRect();
        if (x < box.left || x > box.right || y < box.top || y > box.bottom) return undefined;
        return outlineTarget(root, host, allowed, x, y);
      }),
    [drag.register, root],
  );

  const indicator = drag.session?.target?.surface === "outline" ? drag.session.target.indicator : undefined;
  const hostBox = hostRef.current?.getBoundingClientRect();

  return (
    <div
      className="maker-outline sk-scrollbar sk-scrollbar--reveal"
      ref={(element) => {
        hostRef.current = element;
        setHost(element);
      }}
      onKeyDownCapture={onKeyDownCapture}
      onPointerDown={onPointerDown}
    >
      {actions.flatMap((action) =>
        action.hotkeys.map((spec) => <ActionHotkey key={spec} spec={spec} action={action} target={host} maker={maker} />),
      )}
      <style>
        {[...pendingIds]
          .map((id) => `.maker-outline [data-value="${CSS.escape(id)}"] > :is(.sk-tree-view__item-text, .sk-tree-view__branch-control .sk-tree-view__branch-text)::after`)
          .join(",\n")}
        {pendingIds.size > 0 ? ' { content: " · pending"; color: var(--color-text-tertiary); font-size: 0.85em; }' : ""}
      </style>
      <div className="maker-outline__tools" aria-label="Layer tree actions">
        <Button variant="ghost" size="xs" disabled={branches.length === 0 || collapsed.size === branches.length} onClick={() => setCollapsed(new Set(branches))}>
          Collapse all
        </Button>
        <Button variant="ghost" size="xs" disabled={collapsed.size === 0} onClick={() => setCollapsed(new Set())}>
          Expand all
        </Button>
      </div>
      <TreeView
        label="Page outline"
        nodes={nodes}
        selectionMode="multiple"
        selectedValue={selectedIds.length > 0 ? [...selectedIds] : selected ? [selected] : []}
        expandedValue={expanded}
        onExpandedChange={({ expandedValue }) => {
          if (intent.current !== "fold") return;
          setCollapsed(new Set(branches.filter((id) => !expandedValue.includes(id))));
        }}
        onSelectionChange={({ selectedValue }) => {
          const values = selectedValue.map((value) => parseSlotBranch(value)?.owner ?? value).filter((value) => findChild(root, value));
          const selected = values.at(-1);
          if (!selected) return;
          maker.setView({ selected, selectedIds: values });
        }}
      />
      {indicator && hostBox ? (
        <div
          className={`maker-overlay maker-overlay--drop-${indicator.kind}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInlineStart: indicator.rect.left - hostBox.left,
            insetBlockStart: indicator.rect.top - hostBox.top + (hostRef.current?.scrollTop ?? 0),
            inlineSize: indicator.rect.width,
            blockSize: indicator.rect.height,
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * A row in the outline takes a drop above it, below it, or (in its middle band, when it can hold
 * children) inside it at the end. A slot branch takes it inside that slot.
 */
function outlineTarget(root: MakerNode, host: HTMLElement, allowed: readonly Place[], x: number, y: number): Target | undefined {
  const element = host.ownerDocument.elementFromPoint(x, y);
  const row = element?.closest<HTMLElement>("[data-value]");
  const id = row?.dataset.value;
  if (!row || !id || !host.contains(row)) return undefined;
  const has = (place: Place) => allowed.some((p) => p.parent === place.parent && p.slot === place.slot && p.index === place.index);
  const line = row.querySelector<HTMLElement>(":scope > .sk-tree-view__branch-control") ?? row;
  const rect = line.getBoundingClientRect();
  const lineAt = (top: number) => ({ kind: "line" as const, rect: { left: rect.left, top: top - 1.5, width: rect.width, height: 3 } });

  const branch = parseSlotBranch(id);
  if (branch) {
    const owner = findNode(root, branch.owner);
    const place = owner ? { parent: owner.id, slot: branch.slot, index: childrenOf(owner, branch.slot).length } : undefined;
    return place && has(place) ? { place, surface: "outline", indicator: { kind: "box", rect } } : undefined;
  }

  const child = findChild(root, id);
  if (!child) return undefined;
  const band = (y - rect.top) / rect.height;
  if (isNode(child) && band > 0.3 && band < 0.7) {
    const inside = { parent: child.id, slot: "children", index: childrenOf(child, "children").length };
    if (has(inside)) return { place: inside, surface: "outline", indicator: { kind: "box", rect } };
  }
  const at = locate(root, id);
  if (!at) return undefined;
  const before = { parent: at.parent.id, slot: at.slot, index: at.index };
  const after = { ...before, index: at.index + 1 };
  if (band < 0.5 && has(before)) return { place: before, surface: "outline", indicator: lineAt(rect.top) };
  if (band >= 0.5 && has(after)) return { place: after, surface: "outline", indicator: lineAt(rect.bottom) };
  return undefined;
}

/** One shortcut, bound through the kit's hotkeys for as long as the outline is mounted. */
function ActionHotkey({ spec, action, target, maker }: { spec: string; action: Action; target: HTMLElement | null; maker: Maker }) {
  useHotkey(
    spec,
    () => {
      if (runCanvasCommand(maker, action.id as CanvasCommand)) return;
      maker.say("Nothing to do there: that move has no place the contract allows.");
    },
    { target, enabled: target !== null },
  );
  return null;
}
