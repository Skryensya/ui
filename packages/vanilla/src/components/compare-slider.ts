import {
  COMPARE_SLIDER_COARSE_STEP,
  COMPARE_SLIDER_DEFAULT_POSITION,
  COMPARE_SLIDER_STEP,
  compareSliderAttrs,
  compareSliderClamp,
  compareSliderHandleOrientation,
  compareSliderKeyOrientation,
  compareSliderMove,
  compareSliderParts,
  compareSliderPositionFromPointer,
  compareSliderProperties,
  type CompareSliderDirection,
} from "@skryensya/core/compare-slider";
import { createCompareSliderView } from "@skryensya/core/compare-slider-view";
import { resolveSplitterKey } from "@skryensya/core/splitter";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

type Cleanup = () => void;

/** Fired on the root after every change of the position. Detail: `{ position }`. */
export const COMPARE_SLIDER_CHANGE_EVENT = "sk:comparesliderchange";

/*
 * The DOM adapter owns the gesture and the measurement, never the arithmetic: `core/compare-slider.ts` decides what a pointer
 * or a key means as a position, this file turns the events into calls and writes the answer back as
 * the clip and the divider's place straight on the elements they move (see `compare-slider-view.ts`, which has the numbers
 * for why it is not a custom property on the root). The same split `connectResizable` keeps.
 *
 * A press ANYWHERE on the box moves the divider there and starts following the pointer (captured on the root, so it
 * keeps following when the pointer outruns the box), unlike a Resizable bar, which waits for travel past a threshold:
 * here the press IS the gesture, since there is no other thing a press on the box could mean.
 */
export function connectCompareSlider(root: HTMLElement): Cleanup {
  const handle = root.querySelector<HTMLElement>(`:scope > .${compareSliderParts.handle}`);
  if (!handle) return () => {};
  const direction: CompareSliderDirection = root.getAttribute(compareSliderAttrs.direction) === "vertical" ? "vertical" : "horizontal";
  const horizontal = direction === "horizontal";
  /* A position of 0 is a position: only a missing or unreadable one falls back to the middle. */
  const authored = Number.parseFloat(root.getAttribute(compareSliderAttrs.position) ?? "");
  const start = compareSliderClamp(Number.isFinite(authored) ? authored : COMPARE_SLIDER_DEFAULT_POSITION);
  let position = start;

  handle.setAttribute("role", "slider");
  if (!handle.hasAttribute("tabindex")) handle.tabIndex = 0;
  handle.setAttribute("aria-orientation", compareSliderHandleOrientation(direction));
  handle.setAttribute("aria-valuemin", "0");
  handle.setAttribute("aria-valuemax", "100");

  /* The INITIAL position, once: what the stylesheet falls back to and what React renders, so the two bindings agree. It never moves again. */
  root.style.setProperty(compareSliderProperties.position, String(start));
  const after = root.querySelector<HTMLElement>(`:scope > .${compareSliderParts.after}`);
  const view = createCompareSliderView(root, handle, after, direction);
  const paint = (): void => view.paint(position);

  const commit = (next: number): void => {
    const value = compareSliderClamp(next);
    if (value === position) return;
    position = value;
    paint();
    root.dispatchEvent(new CustomEvent(COMPARE_SLIDER_CHANGE_EVENT, { detail: { position } }));
  };

  /* The box and the direction are asked for when a press begins (`view.refresh()`), and kept for the moves that follow. */
  const rtl = (): boolean => view.rtl;

  const fromPointer = (event: PointerEvent): number => {
    const rect = view.rect;
    return compareSliderPositionFromPointer({
      direction,
      pointer: horizontal ? event.clientX : event.clientY,
      start: horizontal ? rect.left : rect.top,
      end: horizontal ? rect.right : rect.bottom,
      rtl: view.rtl,
    });
  };

  let dragging = false;
  const onDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    view.refresh();
    handle.focus({ preventScroll: true });
    root.setPointerCapture?.(event.pointerId);
    dragging = true;
    root.setAttribute(compareSliderAttrs.dragging, "");
    commit(fromPointer(event));
  };
  const onMove = (event: PointerEvent): void => {
    if (dragging) commit(fromPointer(event));
  };
  const onEnd = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    root.removeAttribute(compareSliderAttrs.dragging);
    root.releasePointerCapture?.(event.pointerId);
  };
  const onKey = (event: KeyboardEvent): void => {
    const action = resolveSplitterKey(event, { step: COMPARE_SLIDER_STEP, coarseStep: COMPARE_SLIDER_COARSE_STEP, orientation: compareSliderKeyOrientation(direction) });
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "delta") commit(compareSliderMove(position, action.delta * (rtl() ? -1 : 1)));
    else if (action.kind === "home") commit(0);
    else if (action.kind === "end") commit(100);
    else commit(start);
  };
  const onDouble = (): void => commit(start);

  root.addEventListener("pointerdown", onDown);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerup", onEnd);
  root.addEventListener("pointercancel", onEnd);
  handle.addEventListener("keydown", onKey);
  handle.addEventListener("dblclick", onDouble);

  paint();

  return () => {
    root.removeEventListener("pointerdown", onDown);
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerup", onEnd);
    root.removeEventListener("pointercancel", onEnd);
    handle.removeEventListener("keydown", onKey);
    handle.removeEventListener("dblclick", onDouble);
    root.removeAttribute(compareSliderAttrs.dragging);
    view.destroy();
  };
}

export const mountCompareSlider = createConnectMount({
  key: "compare-slider",
  rootSelector: `[${compareSliderAttrs.root}]`,
  connect: connectCompareSlider,
});
