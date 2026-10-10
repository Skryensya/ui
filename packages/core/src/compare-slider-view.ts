import type { CompareSliderDirection } from "./compare-slider.js";

/*
 * HOW A COMPARE SLIDER IS DRAWN WHILE IT MOVES, shared by both bindings so they cannot draw it differently.
 *
 * It used to write the position as a custom property on the ROOT and let the stylesheet derive everything from it: the clip on
 * the after layer, and the divider's `inset-inline-start`. Measured while dragging (Chromium, 3 s): ~57 layouts a second and
 * ~24 ms of style work, because
 *   - a custom property is inherited, so changing it on the root restyled BOTH layers and everything inside them (the layers
 *     are the author's: a photo, a chart, a whole screenshot);
 *   - the divider moved with `inset-*`, which is layout, and every pointer move first READ the root's box and its computed
 *     direction, forcing the browser to settle layout before it could be invalidated again.
 *
 * What it does now: the clip is written inline on the after layer (that one element is restyled, and a clip is paint, not
 * layout), the divider moves with `translate` (compositor, no layout) from a size the view keeps up to date with a
 * ResizeObserver, and the direction is read once. A press takes a fresh box with `refresh()`; a move reads nothing.
 *
 * The root's `--sk-compare-slider-position` is still the INITIAL position, which is what a server renders and what the
 * stylesheet falls back to; once the view is connected it is no longer the thing that moves.
 */

export type CompareSliderView = {
  /** Draw the divider at `position` (0 to 100 from the start edge). Cheap when nothing visible moved. */
  paint(position: number): void;
  /** Ask the browser for the box and the direction again. Called when a press begins, never on a move. */
  refresh(): void;
  /** The box as of the last `refresh()` (or the last resize). */
  readonly rect: DOMRect;
  readonly rtl: boolean;
  /** Remove every inline style the view wrote, so the stylesheet's own position takes over again. */
  destroy(): void;
};

export function createCompareSliderView(
  root: HTMLElement,
  handle: HTMLElement,
  after: HTMLElement | null,
  direction: CompareSliderDirection,
): CompareSliderView {
  const win = root.ownerDocument.defaultView;
  const horizontal = direction === "horizontal";

  let rect = root.getBoundingClientRect();
  let rtl = horizontal && win?.getComputedStyle(root).direction === "rtl";
  let lastClip = "";
  let lastOffset = Number.NaN;
  let lastAria = -1;
  let lastPosition = 50;

  /* The stylesheet places the divider with `inset-*`; this view places it with `translate`, so it starts from the edge. */
  if (horizontal) handle.style.insetInlineStart = "0";
  else handle.style.insetBlock = "0 auto";

  const observer =
    win && typeof win.ResizeObserver === "function"
      ? new win.ResizeObserver(() => {
          rect = root.getBoundingClientRect();
          lastOffset = Number.NaN;
          paintAt(lastPosition);
        })
      : null;
  observer?.observe(root);

  const clipFor = (position: number) => {
    const percent = Number(position.toFixed(2));
    if (!horizontal) return `inset(${percent}% 0 0 0)`;
    return rtl ? `inset(0 ${percent}% 0 0)` : `inset(0 0 0 ${percent}%)`;
  };

  function paintAt(position: number): void {
    lastPosition = position;
    if (after) {
      const clip = clipFor(position);
      if (clip !== lastClip) {
        lastClip = clip;
        after.style.clipPath = clip;
      }
    }
    /* Half a pixel is the finest a divider can be placed; asking for more is writing a value nobody can see. */
    const size = horizontal ? rect.width : rect.height;
    const offset = Math.round(((position / 100) * size) * 2) / 2;
    if (offset !== lastOffset) {
      lastOffset = offset;
      handle.style.translate = horizontal ? `${rtl ? -offset : offset}px 0` : `0 ${offset}px`;
    }
    const aria = Math.round(position);
    if (aria !== lastAria) {
      lastAria = aria;
      handle.setAttribute("aria-valuenow", String(aria));
    }
  }

  return {
    paint: paintAt,
    refresh() {
      rect = root.getBoundingClientRect();
      rtl = horizontal && win?.getComputedStyle(root).direction === "rtl";
      lastClip = "";
      lastOffset = Number.NaN;
      paintAt(lastPosition);
    },
    get rect() {
      return rect;
    },
    get rtl() {
      return rtl;
    },
    destroy() {
      observer?.disconnect();
      after?.style.removeProperty("clip-path");
      handle.style.removeProperty("translate");
      handle.style.removeProperty("inset-inline-start");
      handle.style.removeProperty("inset-block");
    },
  };
}
