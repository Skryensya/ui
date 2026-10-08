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
  dragging: "data-dragging",
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

/**
 * Redistributes size between panel `index` and `index + 1` by `delta` percent. Neither can leave its
 * own bounds, and the pair's sum is invariant, so growing one is exactly shrinking the other.
 * `+Infinity` / `-Infinity` (what Home and End resolve to) saturate against the bounds with no
 * special case.
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
  const low = Math.max(a.minSize, total - b.maxSize);
  const high = Math.min(a.maxSize, total - b.minSize);
  const next = low > high ? before : clamp(before + delta, low, high);
  const result = sizes.slice();
  result[index] = next;
  result[index + 1] = total - next;
  return result;
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
    min: Math.round(Math.max(a?.minSize ?? 0, total - (b?.maxSize ?? 100))),
    max: Math.round(Math.min(a?.maxSize ?? 100, total - (b?.minSize ?? 0))),
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
      options: ["size", "minSize", "maxSize"],
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
