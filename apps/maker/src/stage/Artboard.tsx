import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { childrenOf, findChild, findNode, locate, type MakerNode } from "@skryensya/maker-model";
import { DRAG_THRESHOLD, type Drag } from "../drag";
import { selectParent, stageTree, type Maker, type StageWidth } from "../state";
import { elementFor, nodeIdAt, placeAt, type Rect } from "./geometry";
import type { CanvasPan } from "./Canvas";
import { CANVAS_COMMAND, CANVAS_CONTEXT_MENU, canvasKeyCommand } from "../CanvasMenu";
import { EDIT_TEXT } from "../Inspector";

/*
 * AN ARTBOARD: one page of the site on the canvas, in an iframe as wide as the chosen stage width
 * and not a pixel different, so the page's own media queries and container widths answer to that
 * width exactly as they will in a real browser. It is as tall as its content, like a frame on a
 * design canvas: the canvas scrolls, the page does not.
 *
 * The open page's artboard is the one being edited: selection, hover, dragging and drops happen in
 * it. Clicking any other artboard opens that page. The canvas's zoom scales every artboard; the
 * frame keeps its CSS width and everything that turns a pointer into a place divides by the zoom.
 *
 * Overlays (hover, selection, the drop indicator) are painted over the iframe in this document,
 * from rects read out of the stage's DOM the moment they are needed. They take no pointer events
 * and add no box to the page, so they cannot move what they outline.
 */

const REM = 16;
const EXPANDED_PX = 52 * REM;

/** The CSS width of every artboard. "fit" (a column-era value) reads as the desktop width. */
export function widthPx(width: StageWidth): number {
  if (width === "fit") return 72 * REM;
  if (typeof width === "number") return width * REM;
  return width.px;
}

/* The shortest an artboard gets: an empty page still has room to drop into. */
const MIN_HEIGHT = 640;

/** A wheel or trackpad gesture over an artboard, in the Maker's own viewport coordinates. */
export type CanvasWheel = { deltaX: number; deltaY: number; zoom: boolean; clientX: number; clientY: number };

type Overlay = { selected?: Rect; selectedMany?: readonly Rect[]; hovered?: Rect; label?: string; marquee?: Rect };

export function Artboard({
  maker,
  drag,
  pageId,
  zoom,
  onWheel,
  onPanKey,
  onPanStart,
}: {
  maker: Maker;
  drag: Drag;
  pageId: string;
  zoom: number;
  onWheel: (wheel: CanvasWheel) => void;
  /** Space held or released inside the page, so the canvas can pan while the pointer is over it. */
  onPanKey: (held: boolean) => void;
  /** A middle-button press inside the page starts a pan of the canvas, in the canvas's coordinates. */
  onPanStart: (x: number, y: number) => CanvasPan;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<string>();
  const [overlay, setOverlay] = useState<Overlay>({});
  const [frameWidth, setFrameWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(MIN_HEIGHT);
  const [renderError, setRenderError] = useState<string>();
  const page = maker.site.pages.find((entry) => entry.id === pageId) ?? maker.page;
  const root = page.root;
  const active = page.id === maker.page.id;
  const mode = maker.view.mode;
  const selected = active ? maker.view.selected : undefined;
  const selectedIds = active ? maker.view.selectedIds : [];
  const stageSelected = active && mode === "edit" ? selected : undefined;
  const fresh = maker.fresh;
  const scale = zoom;
  const targetPx = widthPx(maker.view.width);
  const frameHeight = Math.max(MIN_HEIGHT, contentHeight);

  /* Latest values for listeners that live on the stage's document across renders. */
  const live = useRef({ root, selected, selectedIds, mode, drag, maker, scale, active, pageId, onWheel, onPanKey, onPanStart });
  live.current = { root, selected, selectedIds, mode, drag, maker, scale, active, pageId, onWheel, onPanKey, onPanStart };

  const doc = () => frameRef.current?.contentDocument ?? null;

  /*
   * The stage is ready when its document has installed `window.makerStage`. It says so with a
   * message, but a stage served from cache can say it before this listener exists, and a missed
   * message left the stage blank for good. So its presence is also checked directly: now, and when
   * the iframe finishes loading.
   */
  const checkReady = () => {
    if (frameRef.current?.contentWindow?.makerStage) setReady(true);
  };
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === "maker-stage-ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    checkReady();
    return () => window.removeEventListener("message", onMessage);
  }, []);

  /* ─── render ─────────────────────────────────────────────────────────────────────────────── */

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const stage = frameRef.current?.contentWindow?.makerStage;
    if (!ready || !stage) return;
    let cancelled = false;
    stage
      .render(stageTree(root, stageSelected, fresh))
      .then(() => {
        if (cancelled) return;
        setRenderError(undefined);
        setTick((t) => t + 1);
      })
      .catch((error: unknown) => setRenderError(error instanceof Error ? error.message : String(error)));
    return () => {
      cancelled = true;
    };
  }, [ready, root, stageSelected, fresh]);

  /* ─── theme: view state mirrored onto the stage's root, never into the page ──────────────── */

  const { scheme, contrast, density, radius } = maker.view;
  useEffect(() => {
    const html = doc()?.documentElement;
    if (!ready || !html) return;
    html.setAttribute("data-scheme", scheme);
    html.style.colorScheme = scheme;
    if (contrast) html.setAttribute("data-contrast", "high");
    else html.removeAttribute("data-contrast");
    html.style.setProperty("--sk-density", density === "compact" ? "0.75" : density === "comfortable" ? "1.25" : "1");
    html.setAttribute("data-radius", radius);
    html.setAttribute("data-maker-mode", mode);
    setTick((t) => t + 1);
  }, [ready, scheme, contrast, density, radius, mode]);

  /* ─── overlays, recomputed from the DOM whenever anything may have moved ────────────────── */

  const measure = useCallback(() => {
    const document = doc();
    if (!document) return;
    const rectOf = (id: string | undefined): Rect | undefined => {
      if (!id) return undefined;
      const node = findChild(live.current.root, id);
      /* A text run has no element of its own: outline the node that holds it. */
      const owner = node && "signature" in node ? id : ownerOf(live.current.root, id);
      const element = owner ? elementFor(document, owner) : null;
      return element ? element.getBoundingClientRect() : undefined;
    };
    const selectedNode = selected ? findChild(root, selected) : undefined;
    setOverlay((current) => ({
      selected: mode === "edit" ? rectOf(selected) : undefined,
      selectedMany: mode === "edit" ? selectedIds.filter((id) => id !== selected).map(rectOf).filter((rect): rect is Rect => Boolean(rect)) : undefined,
      hovered: mode === "edit" && hovered !== selected && !selectedIds.includes(hovered ?? "") ? rectOf(hovered) : undefined,
      label: selectedIds.length > 1 ? `${selectedIds.length} selected` : selectedNode && "signature" in selectedNode ? selectedNode.signature : selectedNode ? "Text" : undefined,
      marquee: current.marquee,
    }));
    setFrameWidth(frameRef.current?.clientWidth ?? 0);
    /* As tall as the page's content. #stage has no minimum of its own, so a page that uses 100vh
       settles at the frame's height instead of growing it forever. */
    const content = document.getElementById("stage")?.scrollHeight ?? 0;
    setContentHeight((current) => (Math.abs(current - content) > 1 ? content : current));
  }, [selected, hovered, mode, root]);

  useLayoutEffect(measure, [measure, tick]);

  useEffect(() => {
    const frameWindow = frameRef.current?.contentWindow;
    const document = doc();
    if (!ready || !frameWindow || !document) return;
    /* Next frame, not inside the observer's own callback: measuring updates the overlays, and a
       resize answered in the same frame is the "ResizeObserver loop" the browser reports. */
    let frame = 0;
    const later = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(later);
    observer.observe(document.documentElement);
    const content = document.getElementById("stage");
    if (content) observer.observe(content);
    observer.observe(frameRef.current!);
    frameWindow.addEventListener("scroll", later);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      frameWindow.removeEventListener("scroll", later);
    };
  }, [ready, measure]);

  /* ─── pointer on the stage: select, hover, drag; and never navigate ──────────────────────── */

  useEffect(() => {
    const document = doc();
    if (!ready || !document) return;
    let press: { id: string; x: number; y: number; dragging: boolean } | undefined;
    /* The click the browser sends after a drop is the end of the drag, not a new selection. */
    let swallowClick = false;
    const offset = () => frameRef.current!.getBoundingClientRect();

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element;
      /* Navigation and submission are always blocked: the stage is not a browser tab. In interact
         mode a link to a page of this site opens that page, which is what following it means here. */
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (anchor) {
        event.preventDefault();
        if (live.current.mode === "interact") {
          const path = (anchor.getAttribute("href") ?? "").split(/[?#]/)[0]!.replace(/\/$/, "") || "/";
          const page = live.current.maker.site.pages.find((entry) => entry.path === path);
          if (page) live.current.maker.setView({ page: page.id, selected: undefined });
        }
      }
      if (live.current.mode !== "edit") return;
      if (target.closest("[data-maker-editing]")) return;
      event.preventDefault();
      event.stopPropagation();
      if (swallowClick) {
        swallowClick = false;
        return;
      }
      /* A click on the page where no node is (below the last section, in a margin) selects the page's
         Main: the one place that means "the page itself", and where an insert goes to the end. */
      const id = nodeIdAt(target) ?? live.current.maker.site.pages.find((entry) => entry.id === live.current.pageId)?.root.id;
      /* On another page's artboard, the click opens that page, with what was clicked selected. */
      if (!live.current.active) live.current.maker.setView({ page: live.current.pageId, selected: id });
      else if (id) {
        if (event.metaKey || event.ctrlKey || event.shiftKey) live.current.maker.setView(toggleSelection(live.current.selectedIds, id));
        else live.current.maker.setView({ selected: id });
      }
    };
    const onSubmit = (event: Event) => event.preventDefault();
    /* Double-click edits text in place when the node has one clear text field; otherwise the
       inspector's text field remains the fallback. */
    const onDoubleClick = (event: MouseEvent) => {
      if (live.current.mode !== "edit") return;
      event.preventDefault();
      const id = nodeIdAt(event.target as Element);
      if (!id) return;
      live.current.maker.setView({ page: live.current.pageId, selected: id });
      requestAnimationFrame(() => {
        if (!startInlineTextEdit(document, live.current.root, id, live.current.maker, event.target as Element)) window.dispatchEvent(new CustomEvent(EDIT_TEXT));
      });
    };
    let marquee: { x: number; y: number; additive: boolean } | undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (live.current.mode !== "edit" || event.button !== 0 || !live.current.active) return;
      if ((event.target as Element).closest("[data-maker-editing]")) return;
      const id = nodeIdAt(event.target as Element);
      if (!id || id === live.current.root.id) {
        marquee = { x: event.clientX, y: event.clientY, additive: event.shiftKey || event.metaKey || event.ctrlKey };
        return;
      }
      if (event.shiftKey || event.metaKey || event.ctrlKey) return;
      /* Only what is already selected drags, so a click that wanders a little is still a click. */
      const selectedNow = live.current.selected;
      const dragId = selectedNow && isWithin(live.current.root, id, selectedNow) ? selectedNow : undefined;
      if (!dragId) return;
      event.preventDefault();
      event.stopPropagation();
      press = { id: dragId, x: event.clientX, y: event.clientY, dragging: false };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (press) {
        if (!press.dragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) > DRAG_THRESHOLD) {
          const child = findChild(live.current.root, press.id);
          if (child) {
            press.dragging = true;
            live.current.drag.begin(child, false);
          }
        }
        if (press.dragging) {
          const box = offset();
          const k = live.current.scale;
          live.current.drag.move(box.left + event.clientX * k, box.top + event.clientY * k);
        }
        return;
      }
      if (marquee) {
        event.preventDefault();
        const rect = normalizedRect(marquee.x, marquee.y, event.clientX, event.clientY);
        setOverlay((current) => ({ ...current, marquee: rect }));
        return;
      }
      if (live.current.mode === "edit" && live.current.active) setHovered(nodeIdAt(event.target as Element));
    };
    const onPointerUp = (event: PointerEvent) => {
      if (marquee) {
        const rect = normalizedRect(marquee.x, marquee.y, event.clientX, event.clientY);
        const hit = idsInRect(document, live.current.root, rect);
        const selectedIds = marquee.additive ? mergeIds(live.current.selectedIds, hit) : hit;
        live.current.maker.setView({ selected: selectedIds.at(-1), selectedIds });
        setOverlay((current) => ({ ...current, marquee: undefined }));
        marquee = undefined;
        swallowClick = hit.length > 0;
        return;
      }
      if (press?.dragging) {
        live.current.drag.end(true);
        swallowClick = true;
      }
      press = undefined;
    };
    const onLeave = () => setHovered(undefined);
    const onKey = (event: KeyboardEvent) => {
      /* Delete, ⌘C, ⌘X, ⌘V and ⌘D inside the page are the canvas's commands (CanvasMenu.tsx), not
         the frame's: never while text is being edited in place, and ⌘C leaves a real text selection
         to the browser's own copy. */
      const command = live.current.mode === "edit" && live.current.active ? canvasKeyCommand(event) : undefined;
      const editing = (event.target as Element | null)?.closest?.("[data-maker-editing], [contenteditable], input, textarea, select");
      if (command && !editing && !(command === "copy" && document.getSelection()?.toString())) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent(CANVAS_COMMAND, { detail: command }));
        return;
      }
      if (event.key === "Escape" && press?.dragging) {
        live.current.drag.end(false);
        press = undefined;
      } else if (event.key === "Escape" && live.current.mode === "edit" && live.current.active) {
        selectParent(live.current.maker);
      }
      const target = event.target as HTMLElement | null;
      if (event.code === "Space" && !event.repeat && live.current.mode === "edit" && !target?.closest("[contenteditable], input, textarea, select")) {
        event.preventDefault();
        live.current.onPanKey(true);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") live.current.onPanKey(false);
    };
    /*
     * THE MIDDLE BUTTON PANS, over the page as over the empty canvas. A press inside the page is this
     * document's, and the canvas never hears of it, so it is started from here in the canvas's own
     * coordinates (the point on screen: the frame's box plus the offset scaled by the zoom, the same
     * conversion the wheel uses). While the button is held, the pointer's moves may arrive here or
     * in the Maker's window (the canvas turns this frame's pointer events off while it pans, and a
     * browser may keep sending them to the frame the press started in anyway), so both feed the
     * same pan; they name the same point, so a move heard twice changes nothing.
     */
    const toCanvas = (event: MouseEvent) => {
      const box = offset();
      const k = live.current.scale;
      return { x: box.left + event.clientX * k, y: box.top + event.clientY * k };
    };
    const onMiddleDown = (event: PointerEvent) => {
      if (event.button !== 1) return;
      event.preventDefault();
      event.stopPropagation();
      const from = toCanvas(event);
      const pan = live.current.onPanStart(from.x, from.y);
      document.documentElement.setAttribute("data-maker-panning", "");
      const parent = window;
      const moveHere = (next: PointerEvent) => {
        const at = toCanvas(next);
        pan.move(at.x, at.y);
      };
      const moveThere = (next: PointerEvent) => pan.move(next.clientX, next.clientY);
      const up = (next: PointerEvent) => {
        if (next.button !== 1) return;
        pan.end();
        document.documentElement.removeAttribute("data-maker-panning");
        document.removeEventListener("pointermove", moveHere, true);
        document.removeEventListener("pointerup", up, true);
        parent.removeEventListener("pointermove", moveThere, true);
        parent.removeEventListener("pointerup", up, true);
      };
      document.addEventListener("pointermove", moveHere, true);
      document.addEventListener("pointerup", up, true);
      parent.addEventListener("pointermove", moveThere, true);
      parent.addEventListener("pointerup", up, true);
    };
    /* A middle press's defaults are the browser's autoscroll, and on a link, a new tab. Neither here. */
    const onMiddleDefault = (event: MouseEvent) => {
      if (event.button === 1) event.preventDefault();
    };

    /*
     * A RIGHT CLICK selects what is under the pointer (the page's Main where there is nothing) and
     * opens the canvas's context menu there, in the Maker's coordinates: the menu lives in the
     * Maker's document (CanvasMenu.tsx), and a right click in this frame is never heard there.
     */
    const onContextMenu = (event: MouseEvent) => {
      if (live.current.mode !== "edit") return;
      if ((event.target as Element).closest("[data-maker-editing]")) return;
      event.preventDefault();
      const id = nodeIdAt(event.target as Element) ?? live.current.maker.site.pages.find((entry) => entry.id === live.current.pageId)?.root.id;
      live.current.maker.setView({ page: live.current.pageId, selected: id });
      const at = toCanvas(event);
      window.dispatchEvent(new CustomEvent(CANVAS_CONTEXT_MENU, { detail: at }));
    };

    /* The page does not scroll (the artboard is as tall as it is): a wheel over it moves the canvas. */
    const onWheelInside = (event: WheelEvent) => {
      event.preventDefault();
      const box = offset();
      const k = live.current.scale;
      live.current.onWheel({
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        zoom: event.ctrlKey || event.metaKey,
        clientX: box.left + event.clientX * k,
        clientY: box.top + event.clientY * k,
      });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerdown", onMiddleDown, true);
    document.addEventListener("mousedown", onMiddleDefault, true);
    document.addEventListener("auxclick", onMiddleDefault, true);
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("keyup", onKeyUp, true);
    document.addEventListener("wheel", onWheelInside, { passive: false });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerdown", onMiddleDown, true);
      document.removeEventListener("mousedown", onMiddleDefault, true);
      document.removeEventListener("auxclick", onMiddleDefault, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("keyup", onKeyUp, true);
      document.removeEventListener("wheel", onWheelInside);
    };
  }, [ready]);

  /* The stage as a drop surface for drags that started anywhere. */
  useEffect(
    () =>
      drag.register(`stage:${pageId}`, (x, y, allowed) => {
        const frame = frameRef.current;
        const document = doc();
        /* Drops land on the open page only: an operation belongs to one page. */
        if (!frame || !document || !live.current.active) return undefined;
        const box = frame.getBoundingClientRect();
        if (x < box.left || x > box.right || y < box.top || y > box.bottom) return undefined;
        const k = live.current.scale;
        const found = placeAt(document, live.current.root, allowed, (x - box.left) / k, (y - box.top) / k);
        if (!found) return undefined;
        const r = found.indicator.rect;
        return {
          place: found.place,
          surface: "stage",
          indicator: { kind: found.indicator.kind, rect: { left: box.left + r.left * k, top: box.top + r.top * k, width: r.width * k, height: r.height * k } },
        };
      }),
    [drag.register, pageId],
  );

  const indicator = active && drag.session?.target?.surface === "stage" ? drag.session.target.indicator : undefined;
  const frameBox = frameRef.current?.getBoundingClientRect();

  return (
    <div className="maker-artboard" data-active={active ? "" : undefined} data-page={page.id}>
      <button
        type="button"
        className="maker-artboard__label"
        style={{ transform: `scale(${1 / zoom})` }}
        onClick={() => maker.setView({ page: page.id, selected: undefined })}
        aria-current={active ? "page" : undefined}
      >
        <span className="maker-artboard__name">{page.name}</span>
        <span className="maker-artboard__path">{page.path}</span>
      </button>
      <div className="maker-stage__frame" style={{ inlineSize: targetPx, blockSize: frameHeight }}>
        <iframe ref={frameRef} src="/stage.html" title={`Page ${page.name}`} className="maker-stage__iframe" onLoad={checkReady} />
        <div className="maker-stage__overlays" aria-hidden="true">
          {overlay.hovered ? <div className="maker-overlay maker-overlay--hover" style={box(overlay.hovered)} /> : null}
          {overlay.selectedMany?.map((rect, index) => <div key={index} className="maker-overlay maker-overlay--selected maker-overlay--multi" style={{ ...box(rect), borderWidth: 1 / zoom }} />)}
          {overlay.selected ? (
            <div className="maker-overlay maker-overlay--selected" style={{ ...box(overlay.selected), borderWidth: 2 / zoom }}>
              <span className="maker-overlay__label" style={{ transform: `scale(${1 / zoom})` }}>
                {overlay.label}
              </span>
            </div>
          ) : null}
          {overlay.marquee ? <div className="maker-overlay maker-overlay--marquee" style={box(overlay.marquee)} /> : null}
          {indicator && frameBox ? (
            <div
              className={`maker-overlay maker-overlay--drop-${indicator.kind}`}
              style={box({
                left: (indicator.rect.left - frameBox.left) / scale,
                top: (indicator.rect.top - frameBox.top) / scale,
                width: indicator.rect.width / scale,
                height: indicator.rect.height / scale,
              })}
            />
          ) : null}
        </div>
      </div>
      {active ? (
        <p className="maker-stage__meta" style={{ transform: `scale(${1 / zoom})` }}>
          {+(frameWidth / REM).toFixed(1)}rem ·{" "}
          <span title={frameWidth >= EXPANDED_PX ? "At 52rem or wider: *Expanded options apply" : "Under 52rem: *Expanded options do not apply"}>
            {frameWidth >= EXPANDED_PX ? "expanded" : "compact"}
          </span>
        </p>
      ) : null}
      {renderError ? (
        <p className="maker-stage__error" role="alert">
          The stage could not render this page: {renderError}
        </p>
      ) : null}
    </div>
  );
}

function box(rect: Rect): React.CSSProperties {
  return { insetInlineStart: rect.left, insetBlockStart: rect.top, inlineSize: rect.width, blockSize: rect.height };
}

type InlineTextTarget = {
  readonly element: string;
  readonly operationNode: string;
  readonly slot: string;
  readonly value: string;
  readonly fallback: string;
};

function startInlineTextEdit(document: Document, root: MakerNode, id: string, maker: Maker, clicked: Element): boolean {
  const target = inlineTextTarget(root, id);
  if (!target) return false;
  const owner = elementFor(document, target.element);
  if (!owner) return false;

  const previous = target.value.trim() === "" ? target.fallback : target.value;
  const element = editableTextElement(owner, clicked, previous);
  if (!element) return false;
  element.textContent = previous;
  element.setAttribute("contenteditable", "plaintext-only");
  element.setAttribute("data-maker-editing", "");
  element.focus();
  const selection = document.defaultView?.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  selection?.removeAllRanges();
  selection?.addRange(range);

  let done = false;
  const finish = (commit: boolean) => {
    if (done) return;
    done = true;
    element.removeEventListener("blur", onBlur);
    element.removeEventListener("keydown", onKeyDown);
    element.removeEventListener("input", onInput);
    element.removeAttribute("contenteditable");
    element.removeAttribute("data-maker-editing");
    const next = (element.textContent ?? "").trim() || previous || target.fallback;
    if (commit && next !== target.value) maker.gesture([{ type: "setText", node: target.operationNode, slot: target.slot, text: next }], target.operationNode);
    else element.textContent = previous;
  };
  const onBlur = () => finish(true);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      finish(true);
    }
  };
  const onInput = () => {
    window.parent.dispatchEvent(
      new CustomEvent("maker:inline-text-draft", {
        detail: { key: `${target.operationNode}:${target.slot}`, value: element.textContent ?? "" },
      }),
    );
  };
  element.addEventListener("blur", onBlur);
  element.addEventListener("keydown", onKeyDown);
  element.addEventListener("input", onInput);
  onInput();
  return true;
}

function editableTextElement(owner: HTMLElement, clicked: Element, text: string): HTMLElement | undefined {
  const needle = text.trim();
  const insideOwner = owner.contains(clicked) ? clicked : owner;
  let current: Element | null = insideOwner;
  while (current && current !== owner.parentElement) {
    if (current instanceof HTMLElement && owner.contains(current)) {
      const content = (current.textContent ?? "").trim();
      const hasNestedMakerNodes = Boolean(current.querySelector("[data-maker-node]"));
      if (!hasNestedMakerNodes && (!needle || content === needle || (content.includes(needle) && current !== owner))) return current;
    }
    if (current === owner) break;
    current = current.parentElement;
  }
  return owner.children.length === 0 || !owner.querySelector("[data-maker-node]") ? owner : undefined;
}

function inlineTextTarget(root: MakerNode, id: string): InlineTextTarget | undefined {
  const child = findChild(root, id);
  if (!child) return undefined;
  if (!("signature" in child)) {
    const at = locate(root, id);
    if (!at) return undefined;
    return { element: at.parent.id, operationNode: id, slot: at.slot, value: child.text, fallback: fallbackText(at.parent.signature, at.slot) };
  }
  for (const [slot, held] of Object.entries(child.slots)) {
    if (held.kind === "text") return { element: child.id, operationNode: child.id, slot, value: held.text, fallback: fallbackText(child.signature, slot) };
    const children = childrenOf(child, slot);
    if (held.kind === "nodes" && children.length === 1 && !("signature" in children[0]!)) {
      const run = children[0]!;
      return { element: child.id, operationNode: run.id, slot, value: run.text, fallback: fallbackText(child.signature, slot) };
    }
  }
  return undefined;
}

function fallbackText(signature: string, slot: string): string {
  if (slot === "children") return humanizeSignature(signature);
  return slot.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/-/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function humanizeSignature(signature: string): string {
  const parts = signature.split(".");
  const last = parts.at(-1) ?? signature;
  const name = /^[a-z]/.test(last) && parts.length > 1 ? parts[0]! : last;
  return name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function isWithin(root: MakerNode, id: string, container: string): boolean {
  if (id === container) return true;
  const node = findNode(root, container);
  if (!node) return false;
  const stack = [node];
  while (stack.length) {
    const current = stack.pop()!;
    for (const held of Object.values(current.slots)) {
      if (held.kind !== "nodes") continue;
      for (const child of held.children) {
        if (child.id === id) return true;
        if ("signature" in child) stack.push(child);
      }
    }
  }
  return false;
}

function normalizedRect(x1: number, y1: number, x2: number, y2: number): Rect {
  return { left: Math.min(x1, x2), top: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) };
}

function intersects(a: Rect, b: Rect): boolean {
  return a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
}

function idsInRect(document: Document, root: MakerNode, rect: Rect): readonly string[] {
  if (rect.width < DRAG_THRESHOLD && rect.height < DRAG_THRESHOLD) return [];
  const ids: string[] = [];
  for (const node of walkNodes(root)) {
    if (node.id === root.id) continue;
    const element = elementFor(document, node.id);
    if (!element) continue;
    const box = element.getBoundingClientRect();
    if (intersects(rect, { left: box.left, top: box.top, width: box.width, height: box.height })) ids.push(node.id);
  }
  return ids;
}

function mergeIds(current: readonly string[], next: readonly string[]): readonly string[] {
  return [...current, ...next.filter((id) => !current.includes(id))];
}

function toggleSelection(current: readonly string[], id: string): { selected?: string; selectedIds: readonly string[] } {
  const selectedIds = current.includes(id) ? current.filter((each) => each !== id) : [...current, id];
  return { selected: selectedIds.at(-1), selectedIds };
}

function* walkNodes(root: MakerNode): Generator<MakerNode> {
  yield root;
  for (const held of Object.values(root.slots)) {
    if (held.kind !== "nodes") continue;
    for (const child of held.children) if ("signature" in child) yield* walkNodes(child);
  }
}

function ownerOf(root: MakerNode, textId: string): string | undefined {
  const stack = [root];
  while (stack.length) {
    const current = stack.pop()!;
    for (const held of Object.values(current.slots)) {
      if (held.kind !== "nodes") continue;
      for (const child of held.children) {
        if (child.id === textId) return current.id;
        if ("signature" in child) stack.push(child);
      }
    }
  }
  return undefined;
}
