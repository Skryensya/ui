import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";
import { useHotkey } from "@skryensya/react/hotkey";
import type { Drag } from "../drag";
import type { Maker } from "../state";
import { Artboard, type CanvasWheel } from "./Artboard";

/*
 * THE CANVAS: a pannable, zoomable workspace with every page of the site on it as an artboard, side
 * by side. It is a way of LOOKING at the site and nothing else (decision 31): the artboards are laid
 * out by the browser in a row, the camera (offset and zoom) is view state that is never saved into a
 * page, and inside each artboard the page is ordinary document flow.
 *
 *   wheel / two fingers       pan                  ⌘/Ctrl + wheel, pinch   zoom at the pointer
 *   space + drag, middle drag pan                  drag on empty canvas    pan
 *   Shift+1                   fit every page       Shift+2                 fit the open page
 *   Shift+0                   100%                 ⌘/Ctrl + = / -          zoom in / out
 */

export type Camera = { readonly x: number; readonly y: number; readonly k: number };

/** A pan in progress: where the pointer is now, and its end. Coordinates are this document's. */
export type CanvasPan = { move(x: number, y: number): void; end(): void };

/** What the Maker's bar can ask of the canvas: the same commands its shortcuts run. */
export type CanvasControls = {
  fitAll(): void;
  fitPage(): void;
  zoomIn(): void;
  zoomOut(): void;
  actualSize(): void;
};

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 4;
const PAD = 64;
const ZOOM_STEP = 1.15;
const clamp = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));
const wheelZoomFactor = (deltaY: number) => Math.exp(-Math.min(Math.max(deltaY, -50), 50) * 0.004);

export function Canvas({
  maker,
  drag,
  insets,
  controls,
  onZoom,
}: {
  maker: Maker;
  drag: Drag;
  insets: { left: number; right: number; top: number };
  /** Filled with the canvas's commands, for the bar to call. */
  controls?: MutableRefObject<CanvasControls | null>;
  /** The zoom as it changes, for the bar to show. */
  onZoom?: (k: number) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, k: 1 });
  const [panKey, setPanKey] = useState(false);
  const [panning, setPanning] = useState(false);
  const [zooming, setZooming] = useState(false);
  const fitted = useRef(false);
  const zoomTimer = useRef(0);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const smoothZoom = useCallback(() => {
    setZooming(true);
    window.clearTimeout(zoomTimer.current);
    zoomTimer.current = window.setTimeout(() => setZooming(false), 320);
  }, []);

  useEffect(() => () => window.clearTimeout(zoomTimer.current), []);

  /** The room left for artboards once the floating panels are accounted for. */
  const room = useCallback(() => {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return undefined;
    return { left: box.left + insets.left, top: box.top + insets.top, width: box.width - insets.left - insets.right, height: box.height - insets.top };
  }, [insets.left, insets.right, insets.top]);

  /** Frame a region of the world (unzoomed px) in the room, never past 100%. */
  const frame = useCallback(
    (region: { x: number; y: number; width: number; height: number }, maxK = 1) => {
      const space = room();
      const viewport = viewportRef.current?.getBoundingClientRect();
      if (!space || !viewport || region.width <= 0) return;
      const k = clamp(Math.min(maxK, (space.width - PAD * 2) / region.width, (space.height - PAD * 2) / region.height));
      const left = space.left - viewport.left + (space.width - region.width * k) / 2;
      const top = space.top - viewport.top + PAD;
      smoothZoom();
      setCamera({ x: left - region.x * k, y: top - region.y * k, k });
    },
    [room, smoothZoom],
  );

  /** Every artboard, measured in world coordinates (their layout box, not their zoomed one). */
  const artboards = () => [...(worldRef.current?.querySelectorAll<HTMLElement>(".maker-artboard") ?? [])];

  const fitAll = useCallback(() => {
    const boards = artboards();
    if (boards.length === 0) return;
    const right = Math.max(...boards.map((board) => board.offsetLeft + board.offsetWidth));
    const bottom = Math.max(...boards.map((board) => board.offsetTop + board.offsetHeight));
    /* The height counted is capped, so a very long page does not shrink everything to a sliver. */
    frame({ x: 0, y: 0, width: right, height: Math.min(bottom, right * 0.75) });
  }, [frame]);

  const fitPage = useCallback(
    (id: string) => {
      const board = artboards().find((element) => element.dataset.page === id);
      if (!board) return;
      frame({ x: board.offsetLeft, y: board.offsetTop, width: board.offsetWidth, height: Math.min(board.offsetHeight, board.offsetWidth * 0.75) });
    },
    [frame],
  );

  const zoomAt = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const viewport = viewportRef.current?.getBoundingClientRect();
      if (!viewport) return;
      smoothZoom();
      setCamera((current) => {
        const k = clamp(current.k * factor);
        const cx = (clientX ?? viewport.left + viewport.width / 2) - viewport.left;
        const cy = (clientY ?? viewport.top + viewport.height / 2) - viewport.top;
        return { k, x: cx - ((cx - current.x) * k) / current.k, y: cy - ((cy - current.y) * k) / current.k };
      });
    },
    [smoothZoom],
  );

  const onWheel = useCallback(
    (wheel: CanvasWheel) => {
      if (wheel.zoom) zoomAt(wheelZoomFactor(wheel.deltaY), wheel.clientX, wheel.clientY);
      else setCamera((current) => ({ ...current, x: current.x - wheel.deltaX, y: current.y - wheel.deltaY }));
    },
    [zoomAt],
  );

  /* The first view of a project frames all of it, once the artboards have a size. */
  useLayoutEffect(() => {
    if (fitted.current) return;
    const timer = window.setTimeout(() => {
      fitted.current = true;
      fitAll();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fitAll]);

  /* Opening a page that is off screen brings its artboard into view. */
  const pageId = maker.page.id;
  useEffect(() => {
    if (!fitted.current) return;
    const board = artboards().find((element) => element.dataset.page === pageId);
    const space = room();
    if (!board || !space) return;
    const box = board.getBoundingClientRect();
    const visible = box.right > space.left && box.left < space.left + space.width && box.bottom > space.top && box.top < space.top + space.height;
    if (!visible) fitPage(pageId);
  }, [pageId, fitPage, room]);

  /* Wheel on the canvas itself (between artboards). Non-passive: it replaces the browser's scroll. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const listener = (event: WheelEvent) => {
      event.preventDefault();
      onWheel({ deltaX: event.deltaX, deltaY: event.deltaY, zoom: event.ctrlKey || event.metaKey, clientX: event.clientX, clientY: event.clientY });
    };
    viewport.addEventListener("wheel", listener, { passive: false });
    return () => viewport.removeEventListener("wheel", listener);
  }, [onWheel]);

  /* Space held anywhere outside a text field turns dragging into panning. */
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable], button, [role=treeitem], [role=tree]")) return;
      event.preventDefault();
      setPanKey(true);
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") setPanKey(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /**
   * A pan, from a point in this document's coordinates: what a drag on the empty canvas starts, and
   * what an artboard starts for a middle-button press inside its page (whose events never reach
   * this document; see Artboard.tsx). The camera follows the pointer by the distance it moved.
   */
  const beginPan = useCallback((x: number, y: number): CanvasPan => {
    setPanning(true);
    const start = { x, y, camera: cameraRef.current };
    return {
      move: (nextX, nextY) => setCamera({ ...start.camera, x: start.camera.x + nextX - start.x, y: start.camera.y + nextY - start.y }),
      end: () => setPanning(false),
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const onEmpty = event.target === viewportRef.current || event.target === worldRef.current;
    if (!(event.button === 1 || (event.button === 0 && (panKey || onEmpty)))) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const pan = beginPan(event.clientX, event.clientY);
    const move = (next: PointerEvent) => pan.move(next.clientX, next.clientY);
    const up = () => {
      pan.end();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (controls) {
    controls.current = {
      fitAll,
      fitPage: () => fitPage(pageId),
      zoomIn: () => zoomAt(ZOOM_STEP),
      zoomOut: () => zoomAt(1 / ZOOM_STEP),
      actualSize: () => {
        smoothZoom();
        setCamera((current) => ({ ...current, k: 1 }));
      },
    };
  }
  useEffect(() => onZoom?.(camera.k), [camera.k, onZoom]);

  useHotkey("shift+1", () => fitAll());
  useHotkey("shift+2", () => fitPage(pageId));
  useHotkey("shift+0", () => {
    smoothZoom();
    setCamera((current) => ({ ...current, k: 1 }));
  });
  useHotkey("mod+=", () => zoomAt(ZOOM_STEP));
  useHotkey("mod+-", () => zoomAt(1 / ZOOM_STEP));

  return (
    <>
      <div
        ref={viewportRef}
        className={`maker-canvas${panKey ? " maker-canvas--pan-ready" : ""}${panning ? " maker-canvas--panning" : ""}${zooming ? " maker-canvas--zooming" : ""}`}
        onPointerDown={onPointerDown}
        aria-label="Canvas"
        role="region"
      >
        <div ref={worldRef} className="maker-canvas__world" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.k})` }}>
          {maker.site.pages.map((page) => (
            <Artboard key={page.id} maker={maker} drag={drag} pageId={page.id} zoom={camera.k} onWheel={onWheel} onPanKey={setPanKey} onPanStart={beginPan} />
          ))}
        </div>
      </div>
    </>
  );
}
