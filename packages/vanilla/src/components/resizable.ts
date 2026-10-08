import {
  RESIZABLE_COARSE_STEP,
  RESIZABLE_STEP,
  resizableAttrs,
  resizableHandleOrientation,
  resizableHandleRange,
  resizableParts,
  resizablePercentFromPixels,
  resizableProperties,
  resolveInitialSizes,
  resolvePanelResize,
  type ResizableDirection,
  type ResizablePanelSpec,
} from "@skryensya/core/resizable";
import { hasCrossedDragThreshold, resolveSplitterKey, splitterDirectionSign } from "@skryensya/core/splitter";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

type Cleanup = () => void;

/** Fired on the root after every change of the sizes, with the new percentages in panel order. */
export const RESIZABLE_CHANGE_EVENT = "sk:resizablesizeschange";

const numberAttr = (el: HTMLElement, name: string): number | undefined => {
  const value = Number.parseFloat(el.getAttribute(name) ?? "");
  return Number.isFinite(value) ? value : undefined;
};

/*
 * The DOM adapter owns the gesture and the measurement, never the arithmetic: `resolvePanelResize`
 * decides where a boundary may go, this file only turns a pointer or a key into a delta for it and
 * writes the answer back as a flex weight on each panel. The same split `connectMarquee` keeps.
 *
 * A press ARMS the gesture and only travel past the threshold STARTS it, so a click on the bar that
 * moves nothing never flips the panels into a drag. Pointer capture keeps the gesture on the bar
 * when the pointer outruns it, which a fast drag always does.
 */
export function connectResizable(root: HTMLElement): Cleanup {
  const panels = Array.from(root.querySelectorAll<HTMLElement>(`:scope > .${resizableParts.panel}`));
  const handles = Array.from(root.querySelectorAll<HTMLElement>(`:scope > .${resizableParts.handle}`));
  const direction: ResizableDirection = root.getAttribute(resizableAttrs.direction) === "vertical" ? "vertical" : "horizontal";
  const barOrientation = resizableHandleOrientation(direction);

  const specs: ResizablePanelSpec[] = panels.map((panel) => ({
    size: numberAttr(panel, resizableAttrs.size),
    minSize: numberAttr(panel, resizableAttrs.minSize) ?? 10,
    maxSize: numberAttr(panel, resizableAttrs.maxSize) ?? 100,
  }));
  const initial = resolveInitialSizes(specs);
  let sizes: readonly number[] = initial;

  for (const panel of panels) if (!panel.id) panel.id = uniqueId("sk-resizable-panel");

  const paint = (): void => {
    panels.forEach((panel, i) => panel.style.setProperty(resizableProperties.size, String(sizes[i] ?? 0)));
    handles.forEach((handle, i) => {
      const range = resizableHandleRange({ sizes, panels: specs, index: i });
      handle.setAttribute("aria-valuenow", String(range.now));
      handle.setAttribute("aria-valuemin", String(range.min));
      handle.setAttribute("aria-valuemax", String(range.max));
    });
  };

  const commit = (next: readonly number[]): void => {
    if (next === sizes) return;
    sizes = next;
    paint();
    root.dispatchEvent(new CustomEvent(RESIZABLE_CHANGE_EVENT, { detail: { sizes } }));
  };

  /** The extent the percentages are shares of: the panels' own room, which is the group minus its bars. */
  const extent = (): number =>
    panels.reduce((sum, panel) => {
      const rect = panel.getBoundingClientRect();
      return sum + (direction === "horizontal" ? rect.width : rect.height);
    }, 0);

  const sign = (): number => (direction === "horizontal" ? splitterDirectionSign(getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr") : 1);

  const cleanups: Cleanup[] = [];

  handles.forEach((handle, index) => {
    if (!panels[index] || !panels[index + 1]) return;
    handle.setAttribute("role", "separator");
    if (!handle.hasAttribute("tabindex")) handle.tabIndex = 0;
    handle.setAttribute("aria-orientation", barOrientation);
    handle.setAttribute("aria-controls", panels[index]!.id);

    const resize = (from: readonly number[], delta: number): void =>
      commit(resolvePanelResize({ sizes: from, panels: specs, index, delta }));

    let start: { position: number; sizes: readonly number[] } | null = null;
    let dragging = false;
    const position = (event: PointerEvent): number => (direction === "horizontal" ? event.clientX : event.clientY);

    const onDown = (event: PointerEvent): void => {
      if (event.button !== 0) return;
      start = { position: position(event), sizes };
      handle.setPointerCapture?.(event.pointerId);
    };
    const onMove = (event: PointerEvent): void => {
      if (!start) return;
      if (!dragging) {
        if (!hasCrossedDragThreshold(start.position, position(event))) return;
        dragging = true;
        handle.setAttribute(resizableAttrs.dragging, "");
        root.setAttribute(resizableAttrs.dragging, "");
      }
      const pixels = (position(event) - start.position) * sign();
      resize(start.sizes, resizablePercentFromPixels(pixels, extent()));
    };
    const onEnd = (event: PointerEvent): void => {
      if (!start) return;
      start = null;
      dragging = false;
      handle.removeAttribute(resizableAttrs.dragging);
      root.removeAttribute(resizableAttrs.dragging);
      handle.releasePointerCapture?.(event.pointerId);
    };
    const onKey = (event: KeyboardEvent): void => {
      const action = resolveSplitterKey(event, {
        step: RESIZABLE_STEP,
        coarseStep: RESIZABLE_COARSE_STEP,
        orientation: barOrientation,
      });
      if (action.kind === "none") return;
      event.preventDefault();
      if (action.kind === "delta") resize(sizes, action.delta * sign());
      else if (action.kind === "home") resize(sizes, -Infinity);
      else if (action.kind === "end") resize(sizes, Infinity);
      else resize(sizes, (initial[index] ?? sizes[index] ?? 0) - (sizes[index] ?? 0));
    };
    const onDouble = (): void => resize(sizes, (initial[index] ?? sizes[index] ?? 0) - (sizes[index] ?? 0));

    handle.addEventListener("pointerdown", onDown);
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
    handle.addEventListener("keydown", onKey);
    handle.addEventListener("dblclick", onDouble);
    cleanups.push(() => {
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      handle.removeEventListener("keydown", onKey);
      handle.removeEventListener("dblclick", onDouble);
    });
  });

  paint();

  return () => {
    for (const cleanup of cleanups) cleanup();
    root.removeAttribute(resizableAttrs.dragging);
  };
}

export const mountResizable = createConnectMount({
  key: "resizable",
  rootSelector: `[${resizableAttrs.root}]`,
  connect: connectResizable,
});
