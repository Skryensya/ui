import type { ComponentContract } from "./contract.js";

/*
 * FADE EDGE is paint-only composition. It wraps another module without changing its semantics,
 * focus order, overflow, or behavior. Marquee is one consumer, not a special case: the same wrapper
 * belongs around a scroll region, image, or any other edge whose hard clip needs a visual release.
 */

export const fadeEdgeParts = {
  root: "sk-fade-edge",
} as const;

export type FadeEdgeMode = "transparent" | "color";
/** One edge, physical like the gradient it turns. */
export type FadeEdgeSide = "to-bottom" | "to-top" | "to-right" | "to-left";
/** Both ends of an axis: the start (left, top) and the end (right, bottom). */
export type FadeEdgeAxis = "horizontal" | "vertical";
export type FadeEdgeDirection = FadeEdgeSide | FadeEdgeAxis;

/** The two sides an axis fades, start first. */
export const fadeEdgeAxisSides = {
  horizontal: ["to-left", "to-right"],
  vertical: ["to-top", "to-bottom"],
} as const satisfies Record<FadeEdgeAxis, readonly [FadeEdgeSide, FadeEdgeSide]>;

/*
 * SCROLL-AWARE: the fade says "there is more this way", so once the scroll reaches the edge it
 * points at, it is saying something false. Opting in lets the bindings write `data-at-edge` at that
 * moment and the stylesheet retire the fade.
 *
 * CSS FIRST, SCRIPT AS FALLBACK. A container query cannot do it: it styles the container's
 * DESCENDANTS, and the fade is painted on the scroller itself. The element's own scroll TIMELINE can
 * (`animation-timeline: scroll(self)`), so where it is supported the stylesheet retires each ramp on
 * the scroll position from the first frame, with no script and no late jump. The bindings still
 * write `data-at-edge` (or `data-at-start` / `data-at-end` for an axis) for browsers without scroll
 * timelines, and measure the scrollbars, which no stylesheet can (`fade-edge-dom.ts`).
 */
export const fadeEdgeAttrs = {
  mount: "data-sk-fade-edge",
  scrollAware: "data-scroll-aware",
  direction: "data-direction",
  atEdge: "data-at-edge",
  /* An axis direction retires each end on its own. */
  atStart: "data-at-start",
  atEnd: "data-at-end",
  /* The gutters are written: until then a scroller paints no fade rather than one over its scrollbar. */
  measured: "data-measured",
} as const;

/** Custom properties the bindings write on the root: the thickness of its own scrollbars. */
export const fadeEdgeProperties = {
  gutterBlock: "--sk-fade-edge-gutter-block",
  gutterInline: "--sk-fade-edge-gutter-inline",
} as const;

/** The scroll geometry `fadeEdgeHasMore` reads, so a test can pass a plain object. */
export type FadeEdgeScrollMetrics = {
  readonly scrollTop: number;
  readonly scrollLeft: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;
  readonly clientWidth: number;
  readonly clientHeight: number;
  /** Right-to-left scrolls with a NEGATIVE `scrollLeft`, from 0 at the right edge (CSSOM View). */
  readonly rtl: boolean;
};

/*
 * A pixel of slack: zoom and fractional layouts leave `scrollTop + clientHeight` a fraction short of
 * `scrollHeight` at the very end, and a fade that never retires over half a pixel is the bug.
 */
const EDGE_SLACK = 1;

/**
 * Whether there is still content past the edge a fade in `direction` covers. The directions are
 * PHYSICAL, like the gradient they turn, so `to-right` means the right edge in either writing mode.
 */
export function fadeEdgeHasMore(metrics: FadeEdgeScrollMetrics, direction: FadeEdgeSide): boolean {
  const maxY = metrics.scrollHeight - metrics.clientHeight;
  const maxX = metrics.scrollWidth - metrics.clientWidth;
  /* Distance from the physical LEFT edge, whichever way the axis runs. */
  const fromLeft = metrics.rtl ? maxX + metrics.scrollLeft : metrics.scrollLeft;
  switch (direction) {
    case "to-bottom":
      return metrics.scrollTop < maxY - EDGE_SLACK;
    case "to-top":
      return metrics.scrollTop > EDGE_SLACK;
    case "to-right":
      return fromLeft < maxX - EDGE_SLACK;
    case "to-left":
      return fromLeft > EDGE_SLACK;
  }
}

export const fadeEdgeContract = {
  id: "fade-edge",
  category: "layout",
  css: "@skryensya/core/components/fade-edge.css",
  parts: fadeEdgeParts,
  hooks: [
    "--sk-fade-edge-color",
    "--sk-fade-edge-gutter-block",
    "--sk-fade-edge-gutter-inline",
    "--sk-fade-edge-axis",
    "--sk-fade-edge-mask-far",
    "--sk-fade-edge-mask-near",
    "--sk-fade-edge-mask-ramp",
    "--sk-fade-edge-ramp-far",
    "--sk-fade-edge-ramp-near",
    "--sk-fade-edge-ramp",
    "--sk-fade-edge-size",
  ],
  options: {
    mode: {
      type: "enum",
      values: ["transparent", "color"],
      default: "transparent",
      attr: "data-fade",
    },
    direction: {
      type: "enum",
      values: ["to-bottom", "to-top", "to-right", "to-left", "horizontal", "vertical"],
      default: "to-bottom",
      attr: "data-direction",
    },
    /*
     * Retire the fade once the scroll reaches its edge, and while the content fits without
     * scrolling at all. Only meaningful when the FadeEdge IS the scroll container.
     */
    scrollAware: { type: "boolean", default: false, attr: "data-scroll-aware", trueValue: "" },
    size: { type: "string", styleProperty: "--sk-fade-edge-size" },
    color: { type: "string", styleProperty: "--sk-fade-edge-color" },
  },
  signatures: {
    FadeEdge: {
      intent: ["soften-a-clipped-edge", "overflow-fade", "paint-only-wrapper"],
      host: { element: "div" },
      options: ["mode", "direction", "scrollAware", "size", "color"],
      /* The colour only paints in `color` mode; with the default transparent fade it is set and unused. */
      excludes: { "mode=transparent": ["color"] },
      mount: "data-sk-fade-edge",
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/fade-edge", name: "FadeEdge" },
    },
  },
} as const satisfies ComponentContract;
