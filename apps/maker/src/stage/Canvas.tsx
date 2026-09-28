import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHotkey } from "@skryensya/react/hotkey";
import type { Drag } from "../drag";
import { IconButton } from "../IconButton";
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

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 4;
const PAD = 64;
const clamp = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));

export function Canvas({ maker, drag, insets }: { maker: Maker; drag: Drag; insets: { left: number; right: number; top: number } }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, k: 1 });
  const [panKey, setPanKey] = useState(false);
  const [panning, setPanning] = useState(false);
  const fitted = useRef(false);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

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
      setCamera({ x: left - region.x * k, y: top - region.y * k, k });
    },
    [room],
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

  const zoomAt = useCallback((factor: number, clientX?: number, clientY?: number) => {
    const viewport = viewportRef.current?.getBoundingClientRect();
    if (!viewport) return;
    setCamera((current) => {
      const k = clamp(current.k * factor);
      const cx = (clientX ?? viewport.left + viewport.width / 2) - viewport.left;
      const cy = (clientY ?? viewport.top + viewport.height / 2) - viewport.top;
      return { k, x: cx - ((cx - current.x) * k) / current.k, y: cy - ((cy - current.y) * k) / current.k };
    });
  }, []);

  const onWheel = useCallback(
    (wheel: CanvasWheel) => {
      if (wheel.zoom) zoomAt(Math.exp(-wheel.deltaY * 0.01), wheel.clientX, wheel.clientY);
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

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const onEmpty = event.target === viewportRef.current || event.target === worldRef.current;
    if (!(event.button === 1 || (event.button === 0 && (panKey || onEmpty)))) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanning(true);
    const start = { x: event.clientX, y: event.clientY, camera: cameraRef.current };
    const move = (next: PointerEvent) =>
      setCamera({ ...start.camera, x: start.camera.x + next.clientX - start.x, y: start.camera.y + next.clientY - start.y });
    const up = () => {
      setPanning(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  useHotkey("shift+1", () => fitAll());
  useHotkey("shift+2", () => fitPage(pageId));
  useHotkey("shift+0", () => setCamera((current) => ({ ...current, k: 1 })));
  useHotkey("mod+=", () => zoomAt(1.25));
  useHotkey("mod+-", () => zoomAt(0.8));

  return (
    <>
      <div
        ref={viewportRef}
        className={`maker-canvas${panKey ? " maker-canvas--pan-ready" : ""}${panning ? " maker-canvas--panning" : ""}`}
        onPointerDown={onPointerDown}
        aria-label="Canvas"
        role="region"
      >
        <div ref={worldRef} className="maker-canvas__world" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.k})` }}>
          {maker.site.pages.map((page) => (
            <Artboard key={page.id} maker={maker} drag={drag} pageId={page.id} zoom={camera.k} onWheel={onWheel} onPanKey={setPanKey} />
          ))}
        </div>
      </div>
      <div className="maker-zoom" role="toolbar" aria-label="Zoom">
        <IconButton icon={{ role: "zoom-out" }} label="Zoom out" shortcut="⌘−" onClick={() => zoomAt(0.8)} />
        <button type="button" className="maker-zoom__value" title="Zoom to 100% (Shift+0)" onClick={() => setCamera((current) => ({ ...current, k: 1 }))}>
          {Math.round(camera.k * 100)}%
        </button>
        <IconButton icon={{ role: "zoom-in" }} label="Zoom in" shortcut="⌘=" onClick={() => zoomAt(1.25)} />
        <IconButton icon={{ role: "fit" }} label="Fit every page" shortcut="Shift+1" onClick={fitAll} />
        <IconButton icon={{ role: "maximize" }} label="Fit the open page" shortcut="Shift+2" onClick={() => fitPage(pageId)} />
      </div>
    </>
  );
}
