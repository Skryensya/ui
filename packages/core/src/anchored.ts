import { getPlacement } from "@zag-js/popper";

/*
 * ANCHORED, the contract, and deliberately a small module.
 *
 * Eight components place a box against another element: tooltip, popover, menu and its submenus,
 * select, combobox, date picker and the copy button's flag. ONE engine places all of them, Zag's
 * popper (`@zag-js/popper`, floating-ui underneath), and there is no second path.
 *
 * Most of them already run a Zag machine, and that machine writes the placement as inline style on
 * its positioner (`getPositionerProps()`), so the component only has to carry the classes below and
 * `anchoredPositioning`. Popover and the copy button's flag have no machine of their own; they call
 * `placeAnchored` and get the same engine, the same variables and the same arrow.
 *
 * What the stylesheet owns (`patterns/anchored.css`) is only what that engine leaves open: that the
 * box is fixed, where the arrow's diamond sits and which way it turns.
 *
 * NOT A CATALOGUE FAMILY, on purpose (decided 2026-10-28): no `contracts/semantic/anchored.yaml`.
 * Placement is an option of the box being placed (`placement` on Tooltip and Popover; the others
 * choose their own), never a node of its own, so a composer meets it there and a contract here would
 * describe nothing `validate_ui` could emit.
 */

/**
 * Which side of the anchor the box asks for, in logical axes like the rest of the system, so they
 * swap themselves in RTL. A REQUEST and not a guarantee: when it does not fit, the popper flips it
 * to the opposite side of the SAME axis.
 */
export type AnchorPlacement = "block-start" | "block-end" | "inline-start" | "inline-end";

export const anchorPlacements = [
  "block-start",
  "block-end",
  "inline-start",
  "inline-end",
] as const satisfies readonly AnchorPlacement[];

export function isAnchorPlacement(value: unknown): value is AnchorPlacement {
  return typeof value === "string" && (anchorPlacements as readonly string[]).includes(value);
}

/**
 * Zag's placements are PHYSICAL; ours are logical. This is the translation, for the boxes that are
 * placed by `placeAnchored` and for a machine that is handed the side as an option.
 */
export const anchorPlacementToZag = {
  "block-start": "top",
  "block-end": "bottom",
  "inline-start": "left",
  "inline-end": "right",
} as const satisfies Record<AnchorPlacement, string>;

/*
 * Two flat classes, not a BEM pair: the anchor is not inside the positioner, and in React the
 * positioner is portalled to the body, so nesting one under the other would name a containment that
 * does not exist. They compose with the component's own parts the way `sk-interactive` composes with
 * `sk-button`: `class="sk-tooltip__trigger sk-anchor"`, `class="sk-tooltip__positioner sk-anchored"`.
 */
export const anchoredParts = {
  /** The element the box is placed against. */
  anchor: "sk-anchor",
  /** The box being placed. */
  positioner: "sk-anchored",
  /**
   * OPTIONAL. A rotated square poking out of the box toward the anchor, authored as a child of the
   * positioner and marked `data-part="arrow"`, which is how the popper finds it to move it. Absent
   * unless the markup asks for it: a tooltip or a popover wants one because it is floating chrome
   * that has to say WHICH control it is talking about; a menu or a select does not, because a shared
   * edge already says it. Decorative, so it is always `aria-hidden`.
   */
  arrow: "sk-anchored-arrow",
} as const;

export type AnchoredPart = keyof typeof anchoredParts;
export type AnchoredPartClass = (typeof anchoredParts)[AnchoredPart];

export const anchoredAttrs = {
  /**
   * The requested placement. Authored on a component's root where that is convenient, but it must
   * END UP on the positioner, which is where the stylesheet reads it: React portals the positioner
   * to the body, and inheritance from the root does not reach it there.
   */
  placement: "data-sk-placement",
} as const;

/**
 * The positioning every machine in the kit is given, spread into its `positioning` option.
 *
 * `absolute`: the box scrolls WITH the document, so the compositor moves it together with its anchor
 * and it cannot trail it on page scroll (a `fixed` box is repositioned by JS a frame later: measured,
 * a full wheel step behind). Overflow is still measured against the viewport by the popper.
 *
 * `animationFrame`: the popper re-measures every frame while the box is open, instead of after each
 * scroll event, which lands a frame behind the page and reads as a menu trailing its trigger. The
 * cost is one cheap measurement per frame, only while something is open.
 */
export const anchoredPositioning = {
  strategy: "absolute",
  /** The gap to the anchor, in px: what `--space-stack-xs` was when the stylesheet placed these. */
  gutter: 4,
  listeners: {
    ancestorScroll: true,
    ancestorResize: true,
    elementResize: true,
    layoutShift: true,
    animationFrame: true,
  },
} as const;

export interface PlaceAnchoredOptions {
  /** The side to ask for. Default `block-end`. */
  placement?: AnchorPlacement;
  /** The gap to the anchor, in px. */
  gutter?: number;
  /** Make the box as wide as the anchor. */
  sameWidth?: boolean;
  /** `absolute` scrolls with the document; `fixed` for a top-layer box, which is not in its flow. */
  strategy?: "absolute" | "fixed";
}

/**
 * Place `floating` against `reference` with the popper, and hand back the undo. For the boxes that
 * have no Zag machine of their own; the machines place theirs.
 *
 * The popper writes `--x`/`--y` on the box (the stylesheet turns them into the transform) and, when
 * the box holds a `[data-part="arrow"]`, moves it too. `data-side` is mirrored onto the box and the
 * arrow with the side the popper RESOLVED, which is what the stylesheet reads to turn the diamond.
 */
export function placeAnchored(
  reference: HTMLElement,
  floating: HTMLElement,
  { placement = "block-end", gutter = anchoredPositioning.gutter, sameWidth = false, strategy = "absolute" }: PlaceAnchoredOptions = {},
): () => void {
  const arrow = floating.querySelector<HTMLElement>("[data-part=arrow]");
  floating.style.position = strategy;
  const stop = getPlacement(reference, floating, {
    ...anchoredPositioning,
    strategy,
    placement: anchorPlacementToZag[placement],
    gutter,
    sameWidth,
    onComplete(data) {
      const side = data.placement.split("-")[0];
      floating.dataset.side = side;
      // A box measured while still `display: none` has no size and lands at the origin; the next pass
      // (the popper watches the box's size) puts it right, and only then is it let be seen.
      if (floating.offsetWidth) floating.dataset.placed = "";
      if (arrow) arrow.dataset.side = side;
    },
  });
  return () => {
    stop();
    delete floating.dataset.placed;
  };
}

/*
 * The native `popover` boxes: the browser owns their light-dismiss, Escape and top layer, so there is
 * no machine to place them. One listener for the document places whichever `.sk-anchored[popover]`
 * opens against the control whose `popovertarget` names it, and lets go when it closes. Idempotent,
 * so every binding that renders a Popover can ask for it.
 *
 * Placed on `toggle`, once the box is shown and so has a size to measure; `data-placed` keeps it hidden
 * until the first real measurement, so it never flashes at the origin.
 */
const placedPopovers = new WeakMap<Element, () => void>();
let popoverListenersInstalled = false;

export function placeNativePopovers(doc: Document = document): void {
  if (popoverListenersInstalled) return;
  popoverListenersInstalled = true;
  const isAnchoredPopover = (el: EventTarget | null): el is HTMLElement =>
    el instanceof HTMLElement && el.hasAttribute("popover") && el.classList.contains(anchoredParts.positioner);
  doc.addEventListener(
    "toggle",
    (event) => {
      const box = event.target;
      if (!isAnchoredPopover(box)) return;
      placedPopovers.get(box)?.();
      placedPopovers.delete(box);
      if ((event as ToggleEvent).newState !== "open") return;
      const trigger = doc.querySelector<HTMLElement>(`[popovertarget="${CSS.escape(box.id)}"]:not([popovertargetaction="hide"])`);
      if (!trigger) return;
      const requested = box.getAttribute(anchoredAttrs.placement);
      placedPopovers.set(box, placeAnchored(trigger, box, { placement: isAnchorPlacement(requested) ? requested : "block-end", strategy: "fixed" }));
    },
    true,
  );
}
