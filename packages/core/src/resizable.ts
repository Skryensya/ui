import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * RESIZABLE, panels that share one box and a bar between each pair that moves the boundary.
 *
 * THE GENERIC HALF OF A SPLITTER. `splitter.ts` is the behaviour every drag-to-resize handle in the
 * system already shares (WAI's Window Splitter) and `sk-splitter` is its paint, but both live inside
 * something else: Sidebar's edge, Treegrid's column boundaries, Table's column resizer. None of them
 * is a thing a page can reach for when it wants "a list on the left, the detail on the right, and
 * let me drag the line between them". This is that, published once.
 *
 * SIZES ARE PERCENTAGES OF THE GROUP, and they always add up to 100. A handle sits BETWEEN panel `i`
 * and `i + 1` and redistributes exactly that pair: the pair's combined size never changes, so every
 * other panel stays where it was. The same adjacent-pair model Table's columns use
 * (`resolveColumnResize`), carried into a unit that survives the group itself being resized.
 *
 * NOT A SIDEBAR. Sidebar clamps ONE value against a bound and has no "other pane" to trade with.
 * Here every panel is a peer and the box is always full.
 *
 * `direction` NAMES THE AXIS THE PANELS RUN ALONG, as react-resizable-panels does: `horizontal` is
 * panels side by side. The handle announces the opposite (`aria-orientation="vertical"` for the
 * upright bar between side-by-side panels), because that is what WAI's pattern means by it.
 */

export const resizableAttrs = {
  root: "data-sk-resizable",
  direction: "data-direction",
  size: "data-size",
  minSize: "data-min-size",
  maxSize: "data-max-size",
  collapsible: "data-collapsible",
  collapsedSize: "data-collapsed-size",
  /** Written by the bindings on a panel (and its handles) while it sits at its collapsed size. */
  collapsed: "data-collapsed",
  dragging: "data-dragging",
} as const;

/** What a page can send a group from anywhere, with no reference to the component: see `ResizableCommand`. */
export const resizableEvents = {
  /** Detail: a `ResizableCommand`. Collapses, expands or toggles one panel, or resets every size. */
  command: "sk:resizablecommand",
} as const;

/** Written by the bindings on each panel; the stylesheet turns it into `flex-grow`. */
export const resizableProperties = {
  size: "--sk-resizable-size",
} as const;

export const resizableParts = {
  root: "sk-resizable",
  panel: "sk-resizable__panel",
  handle: "sk-resizable__handle",
} as const;

export type ResizablePart = keyof typeof resizableParts;
export type ResizablePartClass = (typeof resizableParts)[ResizablePart];
export type ResizableDirection = "horizontal" | "vertical";

/** Percent moved by one arrow press, and by Shift + arrow. */
export const RESIZABLE_STEP = 1;
export const RESIZABLE_COARSE_STEP = 10;

/** One panel as the arithmetic sees it: where it starts and what it may shrink or grow to. */
export type ResizablePanelSpec = {
  /** The size it was authored with, or undefined to take an equal share of what is left. */
  readonly size?: number;
  readonly minSize: number;
  readonly maxSize: number;
  /**
   * May be dragged below its floor, where it snaps to `collapsedSize` instead of stopping at `minSize`. A
   * collapsible panel is therefore never in between: it is collapsed, or it is at least `minSize`.
   */
  readonly collapsible?: boolean;
  /** The size a collapsible panel collapses to, as a percentage. Default 0: gone, with its bar still there. */
  readonly collapsedSize?: number;
};

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/**
 * The starting sizes, summing to 100.
 *
 * Authored sizes are kept, panels with none split what remains equally, and when the authored ones
 * already overshoot or fall short of 100 everything is scaled to fit rather than refused: a page that
 * wrote `25` and `25` for two panels meant "half and half", not an error. Each result is then held
 * inside its own bounds by moving the excess to the panels that still have room.
 */
export function resolveInitialSizes(panels: readonly ResizablePanelSpec[]): readonly number[] {
  const count = panels.length;
  if (count === 0) return [];
  const given = panels.map((panel) => (panel.size !== undefined && panel.size > 0 ? panel.size : undefined));
  const used = given.reduce<number>((sum, size) => sum + (size ?? 0), 0);
  const open = given.filter((size) => size === undefined).length;
  const share = open > 0 ? Math.max(100 - used, 0) / open : 0;
  const raw = given.map((size) => size ?? share);
  const total = raw.reduce((sum, size) => sum + size, 0) || count;
  const scaled = raw.map((size) => (total > 0 ? (size / total) * 100 : 100 / count));
  return settle(scaled, panels);
}

/** Moves any size outside its bounds back in and hands the difference to panels that can take it. */
function settle(sizes: readonly number[], panels: readonly ResizablePanelSpec[]): readonly number[] {
  const result = sizes.map((size, i) => clamp(size, panels[i]!.minSize, panels[i]!.maxSize));
  let excess = 100 - result.reduce((sum, size) => sum + size, 0);
  for (let pass = 0; pass < result.length && Math.abs(excess) > 1e-9; pass++) {
    const movable = result
      .map((size, i) => ({ i, room: excess > 0 ? panels[i]!.maxSize - size : size - panels[i]!.minSize }))
      .filter((entry) => entry.room > 1e-9);
    if (movable.length === 0) break;
    const each = excess / movable.length;
    for (const { i, room } of movable) {
      const move = clamp(Math.abs(each), 0, room) * Math.sign(each);
      result[i] = result[i]! + move;
      excess -= move;
    }
  }
  return result;
}

/** The size a collapsible panel collapses to. */
const collapsedSizeOf = (panel: ResizablePanelSpec): number => panel.collapsedSize ?? 0;

/** The smallest a panel can be: its floor, or the collapsed size when it is allowed to collapse. */
const floorOf = (panel: ResizablePanelSpec): number => (panel.collapsible ? Math.min(collapsedSizeOf(panel), panel.minSize) : panel.minSize);

/** Whether a panel sits at its collapsed size. Only a collapsible panel can. */
export function resizableIsCollapsed(size: number, panel: ResizablePanelSpec | undefined): boolean {
  return Boolean(panel?.collapsible) && size <= collapsedSizeOf(panel!) + 1e-6;
}

/** A collapsible panel is collapsed or at least at its floor, never between: what lies between goes to the nearer. */
function snapCollapsible(size: number, panel: ResizablePanelSpec): number {
  if (!panel.collapsible || size >= panel.minSize) return size;
  const collapsed = collapsedSizeOf(panel);
  return size < (collapsed + panel.minSize) / 2 ? collapsed : panel.minSize;
}

/** Whether a size is one the panel may rest at: inside its bounds, or exactly collapsed. */
function restsAt(size: number, panel: ResizablePanelSpec): boolean {
  return (size >= panel.minSize - 1e-6 && size <= panel.maxSize + 1e-6) || resizableIsCollapsed(size, panel);
}

/**
 * Redistributes size between panel `index` and `index + 1` by `delta` percent. Neither can leave its
 * own bounds, and the pair's sum is invariant, so growing one is exactly shrinking the other.
 * `+Infinity` / `-Infinity` (what Home and End resolve to) saturate against the bounds with no
 * special case, and for a collapsible panel the smallest size it can reach IS collapsed, so Home and
 * End collapse it without a rule of their own.
 *
 * A collapsible panel dragged below its floor does not stop there: past the midpoint between the floor
 * and its collapsed size it snaps shut, and back out past the same midpoint it snaps open to the floor.
 * If the neighbour cannot take the room a collapse frees (its `maxSize` is in the way) the pair stays
 * where it was rather than landing on a size neither panel may hold.
 */
export function resolvePanelResize(params: {
  readonly sizes: readonly number[];
  readonly panels: readonly ResizablePanelSpec[];
  readonly index: number;
  readonly delta: number;
}): readonly number[] {
  const { sizes, panels, index, delta } = params;
  const before = sizes[index];
  const after = sizes[index + 1];
  const a = panels[index];
  const b = panels[index + 1];
  if (before === undefined || after === undefined || !a || !b) return sizes;
  const total = before + after;
  const low = Math.max(floorOf(a), total - b.maxSize);
  const high = Math.min(a.maxSize, total - floorOf(b));
  if (low > high) return sizes.slice();
  let next = snapCollapsible(clamp(before + delta, low, high), a);
  next = total - snapCollapsible(total - next, b);
  const result = sizes.slice();
  if (!restsAt(next, a) || !restsAt(total - next, b)) return result;
  result[index] = next;
  result[index + 1] = total - next;
  return result;
}

/** What a page can ask of a group, in the units the arithmetic uses: panels are numbered from 0. */
export type ResizableCommand =
  | { readonly action: "collapse" | "expand" | "toggle"; readonly panel: number }
  | { readonly action: "reset" };

/**
 * The panel a collapse key acts on for the bar between panels `index` and `index + 1`: a collapsed
 * neighbour first (so the same key that closed it opens it), else the first collapsible one, the one
 * before the bar preferred. Undefined when neither side can collapse.
 */
export function resizableCollapseTarget(params: {
  readonly sizes: readonly number[];
  readonly panels: readonly ResizablePanelSpec[];
  readonly index: number;
}): number | undefined {
  const { sizes, panels, index } = params;
  const candidates = [index, index + 1].filter((i) => panels[i]?.collapsible);
  return candidates.find((i) => resizableIsCollapsed(sizes[i] ?? 0, panels[i])) ?? candidates[0];
}

/**
 * The sizes after a command. Collapsing hands the panel's room to the neighbour across the bar nearest
 * to it (the one after, except for the last panel), expanding returns it to `restore[panel]` and never
 * below its floor, and `reset` goes back to the sizes the group started with, which also opens
 * anything that was closed. A command that changes nothing returns `sizes` itself.
 */
export function resolveResizableCommand(params: {
  readonly sizes: readonly number[];
  readonly panels: readonly ResizablePanelSpec[];
  readonly initial: readonly number[];
  /** The size each panel had before it collapsed, to open it back to. Absent, the panel's initial size. */
  readonly restore?: readonly (number | undefined)[];
  readonly command: ResizableCommand;
}): readonly number[] {
  const { sizes, panels, initial, restore, command } = params;
  if (command.action === "reset") return initial.length === sizes.length ? initial : sizes;
  const panel = command.panel;
  const spec = panels[panel];
  if (!spec?.collapsible || panels.length < 2) return sizes;
  const collapsed = resizableIsCollapsed(sizes[panel] ?? 0, spec);
  if ((command.action === "collapse" && collapsed) || (command.action === "expand" && !collapsed)) return sizes;
  const index = panel < panels.length - 1 ? panel : panel - 1;
  const current = sizes[panel] ?? 0;
  const target = collapsed ? Math.max(restore?.[panel] ?? initial[panel] ?? spec.minSize, spec.minSize) : collapsedSizeOf(spec);
  const delta = panel === index ? target - current : current - target;
  const next = resolvePanelResize({ sizes, panels, index, delta });
  return next.every((size, i) => Math.abs(size - (sizes[i] ?? 0)) < 1e-9) ? sizes : next;
}

/** What a handle reports: the size of the panel before it, and the travel that panel has. */
export function resizableHandleRange(params: {
  readonly sizes: readonly number[];
  readonly panels: readonly ResizablePanelSpec[];
  readonly index: number;
}): { readonly now: number; readonly min: number; readonly max: number } {
  const { sizes, panels, index } = params;
  const before = sizes[index] ?? 0;
  const total = before + (sizes[index + 1] ?? 0);
  const a = panels[index];
  const b = panels[index + 1];
  return {
    now: Math.round(before),
    min: Math.round(Math.max(a ? floorOf(a) : 0, total - (b?.maxSize ?? 100))),
    max: Math.round(Math.min(a?.maxSize ?? 100, total - (b ? floorOf(b) : 0))),
  };
}

/** The bar's own orientation for a given layout axis: upright between panels that sit side by side. */
export function resizableHandleOrientation(direction: ResizableDirection): "vertical" | "horizontal" {
  return direction === "horizontal" ? "vertical" : "horizontal";
}

/** A pointer travel in px as a percentage of the group's extent along the layout axis. */
export function resizablePercentFromPixels(pixels: number, extent: number): number {
  return extent > 0 ? (pixels / extent) * 100 : 0;
}

export const resizableContract = {
  id: "resizable",
  category: "layout",
  css: "@skryensya/core/components/resizable.css",
  parts: resizableParts,
  hooks: [
    "--sk-resizable-handle-active-color",
    "--sk-resizable-handle-color",
    "--sk-resizable-handle-hit",
    "--sk-resizable-handle-line",
    "--sk-resizable-size",
  ],
  outputHooks: ["--sk-resizable-size"],

  options: {
    /** The axis the panels run along. `horizontal` is side by side; the handle announces the opposite. */
    direction: {
      type: "enum",
      values: ["horizontal", "vertical"],
      default: "horizontal",
      attr: "data-direction",
    },
    /**
     * How much of the group this panel starts with, as a percentage. Left out, the panel takes an
     * equal share of whatever the others did not claim, so two panels with no sizes are half and half.
     */
    size: { type: "number", min: 1, max: 100, attr: "data-size", machineInput: true },
    /** The least this panel may shrink to, as a percentage. A floor most panels never reach. */
    minSize: { type: "number", default: 10, min: 0, max: 100, attr: "data-min-size", machineInput: true },
    maxSize: { type: "number", default: 100, min: 0, max: 100, attr: "data-max-size", machineInput: true },
    /**
     * Lets the panel close all the way. Dragged below its `minSize` it snaps shut instead of stopping, its bar stays
     * where it is so it can be dragged or keyed open again, and Home and End on a bar next to it collapse it. A
     * panel without it keeps its floor and can never disappear.
     */
    collapsible: { type: "boolean", default: false, attr: "data-collapsible", trueValue: "", machineInput: true },
    /** What a collapsible panel collapses to, as a percentage. 0 closes it; a small number leaves a rail. */
    collapsedSize: { type: "number", default: 0, min: 0, max: 100, attr: "data-collapsed-size", machineInput: true },
    /**
     * The handle's accessible name. It is a bare strip between two panels, so nothing about it names
     * itself: a focusable `separator` that says only "separator" is a control nobody can tell apart.
     */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Resizable: {
      intent: ["resizable-panels", "split-view", "draggable-divider", "master-detail-split", "adjustable-columns"],
      host: { element: "div" },
      options: ["direction"],
      forward: ["id", "aria-*"],
      slots: {
        children: { accepts: "signature", of: ["Resizable.Panel", "Resizable.Handle"], required: true },
      },
      mount: "data-sk-resizable",
      template: { element: "div", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/resizable", name: "Resizable" },
    },

    "Resizable.Panel": {
      intent: ["resizable-pane", "split-view-side"],
      host: { element: "div" },
      parents: ["Resizable"],
      options: ["size", "minSize", "maxSize", "collapsible", "collapsedSize"],
      forward: ["id", "aria-*"],
      slots: { children: { accepts: "node" } },
      template: { element: "div", part: "panel", host: true, slot: "children" },
      react: { from: "@skryensya/react/resizable", name: "Resizable.Panel" },
    },

    "Resizable.Handle": {
      intent: ["resize-bar", "panel-divider"],
      host: { element: "div" },
      parents: ["Resizable"],
      options: ["label"],
      requires: ["label"],
      forward: ["id"],
      slots: {},
      template: {
        element: "div",
        part: "handle",
        host: true,
        attrs: { role: "separator", tabindex: "0" },
      },
      react: { from: "@skryensya/react/resizable", name: "Resizable.Handle" },
    },
  },
} as const satisfies ComponentContract;

export type ResizableDirectionOption = OptionValue<typeof resizableContract.options.direction>;
