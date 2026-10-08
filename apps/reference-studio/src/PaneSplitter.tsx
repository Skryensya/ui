import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  hasCrossedDragThreshold,
  resolveSplitterKey,
  splitterDirectionSign,
  splitterValuePercent,
} from "@skryensya/core/splitter";
/*
 * The Window Splitter (WAI-ARIA APG) between the capture and the inspector, built from the design
 * system's own splitter behaviour (`@skryensya/core/splitter`) and its `sk-splitter` bar, the same
 * way the Sidebar's resize handle is.
 *
 * The width is NOT React state. It is one custom property on the layout, clamped by CSS, which keeps
 * a drag at pointer speed instead of render speed (the inspector's tab panels are not cheap to
 * re-render) and leaves the stylesheet as the only place that knows the limits. Absent, the layout
 * sizes the inspector from the capture; Enter or a double click forgets the width and goes back.
 */
const MIN = 320;
const CANVAS_MIN = 280;
const PROPERTY = "--studio-inspector-width";
const KEY = "reference-studio:inspector-width";
const direction = (element: Element): "ltr" | "rtl" =>
  getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr";
export function PaneSplitter({
  target,
  label,
}: {
  /** The layout whose inspector column this resizes. */
  target: RefObject<HTMLElement | null>;
  label: string;
}) {
  const handle = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
    dragging: boolean;
  } | null>(null);
  const [percent, setPercent] = useState(50);
  const inspector = () => handle.current?.parentElement ?? undefined;
  /* The layout's own ref is attached after this component's first layout effect, so on mount it is
   * found through the DOM, which is already in place. */
  const layout = () =>
    target.current ??
    handle.current?.closest<HTMLElement>(".studio-workbench__body") ??
    null;
  const bounds = () => {
    const total = layout()?.getBoundingClientRect().width ?? 0;
    return { min: MIN, max: Math.max(MIN, total - CANVAS_MIN) };
  };
  const settled = () => inspector()?.getBoundingClientRect().width ?? MIN;
  const describe = useCallback(() => {
    const { min, max } = bounds();
    setPercent(splitterValuePercent(settled(), min, max));
  }, []);
  /** Write a width, or forget it. What was granted is read back, never assumed. */
  const apply = (width: number | null) => {
    const body = layout();
    if (!body) return;
    if (width === null) {
      body.style.removeProperty(PROPERTY);
      body.removeAttribute("data-split");
    } else {
      const { min, max } = bounds();
      const next = Math.round(Math.min(Math.max(width, min), max));
      body.style.setProperty(PROPERTY, `${next}px`);
      body.setAttribute("data-split", "");
    }
    describe();
  };
  const commit = () => {
    try {
      const width = parseInt(
        layout()?.style.getPropertyValue(PROPERTY) ?? "",
      );
      if (Number.isFinite(width)) localStorage.setItem(KEY, String(width));
      else localStorage.removeItem(KEY);
    } catch {
      /* not remembered */
    }
  };
  /* Before paint, so a remembered width never flashes the default one first. */
  useLayoutEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem(KEY) ?? "");
      if (Number.isFinite(stored)) apply(stored);
      else describe();
    } catch {
      describe();
    }
  }, []);
  /* The window, or the zoom mode, moved the limits: the CSS clamp already follows, this reports it. */
  useEffect(() => {
    const body = target.current;
    if (!body || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(describe);
    observer.observe(body);
    return () => observer.disconnect();
  }, [describe, target]);
  const reset = () => {
    apply(null);
    commit();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = resolveSplitterKey(event);
    if (action.kind === "none") return;
    event.preventDefault();
    const sign = splitterDirectionSign(direction(event.currentTarget));
    const { min, max } = bounds();
    switch (action.kind) {
      case "delta":
        /* The bar sits on the inspector's near edge: moving it toward the reader's start widens it. */
        apply(settled() - action.delta * sign);
        break;
      case "home":
        apply(min);
        break;
      case "end":
        apply(max);
        break;
      case "reset":
        reset();
        return;
    }
    commit();
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: settled(),
      dragging: false,
    };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if (
      !gesture.dragging &&
      !hasCrossedDragThreshold(gesture.startX, event.clientX)
    )
      return;
    if (!gesture.dragging) {
      gesture.dragging = true;
      event.currentTarget.setAttribute("data-dragging", "");
      layout()?.setAttribute("data-resizing", "");
    }
    const sign = splitterDirectionSign(direction(event.currentTarget));
    apply(gesture.startWidth - (event.clientX - gesture.startX) * sign);
  };
  const onLostPointerCapture = (event: PointerEvent<HTMLDivElement>) => {
    const gesture = drag.current;
    if (!gesture) return;
    drag.current = null;
    event.currentTarget.removeAttribute("data-dragging");
    layout()?.removeAttribute("data-resizing");
    if (gesture.dragging) commit();
  };
  return (
    <div
      ref={handle}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="sk-splitter"
      tabIndex={0}
      title="Drag to resize · double-click to reset"
      onDoubleClick={reset}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onLostPointerCapture={onLostPointerCapture}
    />
  );
}
