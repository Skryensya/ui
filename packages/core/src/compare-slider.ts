import type { ComponentContract, OptionValue } from "./contract.js";

/*
 * COMPARE SLIDER, two layers of the same size with a divider you drag to reveal one over the other: before and after, old and
 * new, with and without.
 *
 * BUILT ON THE SAME BAR AS RESIZABLE. The divider is the splitter every drag-to-resize handle in the system shares
 * (`splitter.ts`: the same keys, the same RTL sign, the same thumb in the middle), carrying one value instead of a
 * pair of panel sizes: how much of the box the BEFORE layer shows, as a percentage from the start edge. The AFTER layer
 * is the whole box underneath, and a clip opens over it, so nothing in either layer is resized, squashed or re-flowed:
 * both are always laid out at the full size of the box, and the divider only decides where one stops and the other
 * starts. `Resizable` conserves a total between neighbours; Compare Slider has no neighbours, only one reveal.
 *
 * THE THUMB IS ALWAYS THERE. Resizable and Sidebar show the six-dot thumb (`patterns/grip.css`) when the pointer, the
 * keys or a drag find the bar, because there the bar is chrome. Here the divider is the whole point of the component, so
 * the thumb never leaves: a reader who has not touched it yet is still told that it moves.
 *
 * ANYTHING CAN BE COMPARED. A layer is a box, not an image: two photos, two versions of an interface, a chart with and
 * without a series. Each should fill its box. The layers are plain `div`s with no role; the divider is the one control,
 * a `slider` with its value, its axis and a name.
 *
 * `direction` NAMES THE AXIS THE LAYERS RUN ALONG, as Resizable's does: `horizontal` is side by side with an upright
 * divider; `vertical` is one above the other with a horizontal one. The divider announces the axis it TRAVELS along, which
 * is the same one.
 */

export const compareSliderAttrs = {
  root: "data-sk-compare-slider",
  direction: "data-direction",
  position: "data-position",
  dragging: "data-dragging",
} as const;

/**
 * The INITIAL position, 0 to 100: what a server renders on the root and what the stylesheet falls back to. While a binding is
 * connected the position is drawn straight on the layer and the divider instead (`compare-slider-view.ts`), so read it from the
 * divider's `aria-valuenow` or the `sk:comparesliderchange` event, never from this property.
 */
export const compareSliderProperties = {
  position: "--sk-compare-slider-position",
} as const;

/** Fired on the root after every change of the position. Detail: `{ position }`. */
export const compareSliderEvents = {
  change: "sk:comparesliderchange",
} as const;

export const compareSliderParts = {
  root: "sk-compare-slider",
  /** The layer shown from the start edge to the divider. */
  before: "sk-compare-slider__before",
  /** The layer shown from the divider to the end edge. */
  after: "sk-compare-slider__after",
  /** The divider: a focusable `slider`, the line and the hit area. */
  handle: "sk-compare-slider__handle",
  /** The six-dot thumb in the middle of the divider. Always visible. `aria-hidden`. */
  grip: "sk-compare-slider__grip",
} as const;

export type CompareSliderPart = keyof typeof compareSliderParts;
export type CompareSliderPartClass = (typeof compareSliderParts)[CompareSliderPart];
export type CompareSliderDirection = "horizontal" | "vertical";

/** Percent moved by one arrow press, and by Shift + arrow. */
export const COMPARE_SLIDER_STEP = 1;
export const COMPARE_SLIDER_COARSE_STEP = 10;
export const COMPARE_SLIDER_DEFAULT_POSITION = 50;

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** A position held inside the box. Anything that is not a finite number falls back to the middle. */
export function compareSliderClamp(position: number): number {
  return Number.isFinite(position) ? clamp(position, 0, 100) : COMPARE_SLIDER_DEFAULT_POSITION;
}

/**
 * The position after a move of `delta` percent. `+Infinity` and `-Infinity` (what End and Home resolve to) saturate
 * against the ends with no special case, as they do for a Resizable bar.
 */
export function compareSliderMove(position: number, delta: number): number {
  return compareSliderClamp(position + delta);
}

/**
 * Where the pointer is, as a position: its distance from the box's START edge as a percentage of the box's extent along
 * the axis. In a right-to-left page the start edge of a horizontal compare is the right one, so the distance is measured
 * from there; a vertical one always starts at the top.
 */
export function compareSliderPositionFromPointer(params: {
  readonly direction: CompareSliderDirection;
  /** The pointer's coordinate along the axis (`clientX` or `clientY`). */
  readonly pointer: number;
  /** The box's near and far edges along the same axis, in the same coordinates. */
  readonly start: number;
  readonly end: number;
  readonly rtl?: boolean;
}): number {
  const { direction, pointer, start, end, rtl } = params;
  const extent = end - start;
  if (!(extent > 0)) return COMPARE_SLIDER_DEFAULT_POSITION;
  const travelled = direction === "horizontal" && rtl ? end - pointer : pointer - start;
  return compareSliderClamp((travelled / extent) * 100);
}

/** The divider's own orientation for a layout axis: it announces the axis it travels along, which is the layout's. */
export function compareSliderHandleOrientation(direction: CompareSliderDirection): "horizontal" | "vertical" {
  return direction;
}

/** The keys' bar orientation: upright between layers side by side, so Left and Right move it; flat between stacked ones, so Up and Down do. */
export function compareSliderKeyOrientation(direction: CompareSliderDirection): "vertical" | "horizontal" {
  return direction === "horizontal" ? "vertical" : "horizontal";
}

export const compareSliderContract = {
  id: "compare-slider",
  category: "content",
  css: "@skryensya/core/components/compare-slider.css",
  parts: compareSliderParts,
  hooks: [
    "--sk-compare-slider-bg",
    "--sk-compare-slider-handle-active-color",
    "--sk-compare-slider-handle-color",
    "--sk-compare-slider-handle-hit",
    "--sk-compare-slider-handle-line",
    "--sk-compare-slider-position",
    "--sk-compare-slider-radius",
  ],

  options: {
    /** The axis the layers run along. `horizontal` is side by side with an upright divider; `vertical` is stacked. */
    direction: {
      type: "enum",
      values: ["horizontal", "vertical"],
      default: "horizontal",
      attr: "data-direction",
    },
    /**
     * How much of the box the before layer shows when it starts, as a percentage from the start edge. The middle by
     * default. A drag, a key or `Enter` (back to this) moves it from there.
     */
    position: { type: "number", default: 50, min: 0, max: 100, attr: "data-position", machineInput: true },
    /**
     * The divider's accessible name. It is a bare line and a thumb, so nothing about it names itself: a focusable
     * `slider` that says only "slider" is a control nobody can tell apart.
     */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    CompareSlider: {
      intent: ["before-after", "compare-two-layers", "image-comparison", "reveal-slider", "draggable-divider-reveal"],
      host: { element: "div" },
      options: ["direction", "position", "label"],
      requires: ["label"],
      forward: ["id", "aria-*"],
      slots: {
        /** The layer shown from the start edge to the divider. It should fill its box. */
        before: { accepts: "node", required: true },
        /** The layer shown from the divider to the end edge. It should fill its box, the same box as the other. */
        after: { accepts: "node", required: true },
      },
      mount: "data-sk-compare-slider",
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { element: "div", part: "before", slot: "before" },
          { element: "div", part: "after", slot: "after" },
          {
            element: "div",
            part: "handle",
            options: ["label"],
            attrs: {
              role: "slider",
              tabindex: "0",
              "aria-valuemin": "0",
              "aria-valuemax": "100",
              "aria-valuenow": "50",
            },
            attrsWhen: [{ option: "direction", equals: "vertical", attrs: { "aria-orientation": "vertical" } }],
            // The thumb is paint (`patterns/grip.css`): the divider takes the pointer and the keys.
            children: [{ element: "span", part: "grip", also: ["sk-grip"], attrs: { "aria-hidden": "true" } }],
          },
        ],
      },
      react: { from: "@skryensya/react/compare-slider", name: "CompareSlider" },
    },
  },
} as const satisfies ComponentContract;

export type CompareSliderDirectionOption = OptionValue<typeof compareSliderContract.options.direction>;
