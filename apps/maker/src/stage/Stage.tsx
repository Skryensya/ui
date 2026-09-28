import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { findChild, findNode, type MakerNode } from "@skryensya/maker-model";
import { DRAG_THRESHOLD, type Drag } from "../drag";
import { stageTree, type Maker, type StageWidth } from "../state";
import { elementFor, nodeIdAt, placeAt, type Rect } from "./geometry";
import { EDIT_TEXT } from "../Inspector";

/*
 * THE STAGE: an iframe the maker page renders in, as wide as the chosen stage width and not a
 * pixel different, so the page's own media queries and container widths answer to that width
 * exactly as they will in a real browser. Changing the width changes the room the browser has and
 * nothing in the page.
 *
 * Overlays (hover, selection, the drop indicator) are painted over the iframe in this document,
 * from rects read out of the stage's DOM the moment they are needed. They take no pointer events
 * and add no box to the page, so they cannot move what they outline.
 */

const REM = 16;
const EXPANDED_PX = 52 * REM;

function widthStyle(width: StageWidth): string {
  if (width === "fit") return "100%";
  if (typeof width === "number") return `${width}rem`;
  return `${width.px}px`;
}

type Overlay = { selected?: Rect; hovered?: Rect; label?: string };

export function Stage({ maker, drag }: { maker: Maker; drag: Drag }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<string>();
  const [overlay, setOverlay] = useState<Overlay>({});
  const [frameWidth, setFrameWidth] = useState(0);
  /* The room the stage column has, and how much the preview is shrunk to fit it. */
  const [space, setSpace] = useState({ width: 0, height: 0 });
  const [renderError, setRenderError] = useState<string>();
  const root = maker.page.root;
  const { selected, mode } = maker.view;

  /*
   * A WIDTH WIDER THAN THE COLUMN IS SHOWN SMALLER, NEVER NARROWER. The frame keeps the exact CSS
   * width chosen, so the page's media queries and container widths answer to that number, and the
   * whole frame (iframe and overlays together) is scaled down to fit, the way a browser's responsive
   * mode does. Everything that turns a pointer into a place divides by the scale.
   */
  const targetPx = maker.view.width === "fit" ? space.width : typeof maker.view.width === "number" ? maker.view.width * REM : maker.view.width.px;
  const scale = targetPx > 0 && space.width > 0 ? Math.min(1, space.width / targetPx) : 1;
  const frameHeight = Math.max(320, (space.height - 32) / scale);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const read = () => setSpace({ width: shell.clientWidth, height: shell.clientHeight });
    read();
    const observer = new ResizeObserver(() => requestAnimationFrame(read));
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  /* Latest values for listeners that live on the stage's document across renders. */
  const live = useRef({ root, selected, mode, drag, maker, scale });
  live.current = { root, selected, mode, drag, maker, scale };

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
      .render(stageTree(root, mode === "edit" ? selected : undefined))
      .then(() => {
        if (cancelled) return;
        setRenderError(undefined);
        setTick((t) => t + 1);
      })
      .catch((error: unknown) => setRenderError(error instanceof Error ? error.message : String(error)));
    return () => {
      cancelled = true;
    };
  }, [ready, root, selected, mode]);

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
    setOverlay({
      selected: mode === "edit" ? rectOf(selected) : undefined,
      hovered: mode === "edit" && hovered !== selected ? rectOf(hovered) : undefined,
      label: selectedNode && "signature" in selectedNode ? selectedNode.signature : selectedNode ? "Text" : undefined,
    });
    setFrameWidth(frameRef.current?.clientWidth ?? 0);
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
      event.preventDefault();
      event.stopPropagation();
      if (swallowClick) {
        swallowClick = false;
        return;
      }
      const id = nodeIdAt(target);
      if (id) live.current.maker.setView({ selected: id });
    };
    const onSubmit = (event: Event) => event.preventDefault();
    /* Double-click: select, and go straight to its text in the inspector. */
    const onDoubleClick = (event: MouseEvent) => {
      if (live.current.mode !== "edit") return;
      event.preventDefault();
      const id = nodeIdAt(event.target as Element);
      if (!id) return;
      live.current.maker.setView({ selected: id });
      window.dispatchEvent(new CustomEvent(EDIT_TEXT));
    };
    const onPointerDown = (event: PointerEvent) => {
      if (live.current.mode !== "edit" || event.button !== 0) return;
      const id = nodeIdAt(event.target as Element);
      if (!id || id === live.current.root.id) return;
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
      if (live.current.mode === "edit") setHovered(nodeIdAt(event.target as Element));
    };
    const onPointerUp = () => {
      if (press?.dragging) {
        live.current.drag.end(true);
        swallowClick = true;
      }
      press = undefined;
    };
    const onLeave = () => setHovered(undefined);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && press?.dragging) {
        live.current.drag.end(false);
        press = undefined;
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [ready]);

  /* The stage as a drop surface for drags that started anywhere. */
  useEffect(
    () =>
      drag.register("stage", (x, y, allowed) => {
        const frame = frameRef.current;
        const document = doc();
        if (!frame || !document) return undefined;
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
    [drag.register],
  );

  /* ─── the stage width handle ─────────────────────────────────────────────────────────────── */

  const onHandleDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const shell = shellRef.current;
    if (!shell) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const left = frameRef.current?.getBoundingClientRect().left ?? shell.getBoundingClientRect().left;
    const k = scale;
    const onMove = (move: PointerEvent) => maker.setView({ width: { px: Math.max(240, Math.round((move.clientX - left) / k)) } });
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const indicator = drag.session?.target?.surface === "stage" ? drag.session.target.indicator : undefined;
  const frameBox = frameRef.current?.getBoundingClientRect();

  return (
    <div className="maker-stage" ref={shellRef}>
      {/* Outside the frame, so it reads at full size however small the stage is shown. */}
      {root.slots.children?.kind === "nodes" && root.slots.children.children.length === 0 && mode === "edit" ? (
        <p className="maker-stage__empty">
          Empty page. Add a <strong>Wrapper</strong> from Insert for a page column, or drag a section here.
        </p>
      ) : null}
      <div className="maker-stage__sizer" style={{ inlineSize: targetPx * scale || undefined, blockSize: frameHeight * scale }}>
      <div
        className="maker-stage__frame"
        style={{
          inlineSize: maker.view.width === "fit" ? "100%" : widthStyle(maker.view.width),
          blockSize: frameHeight,
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        <iframe ref={frameRef} src="/stage.html" title="Page stage" className="maker-stage__iframe" onLoad={checkReady} />
        <div className="maker-stage__overlays" aria-hidden="true">
          {overlay.hovered ? <div className="maker-overlay maker-overlay--hover" style={box(overlay.hovered)} /> : null}
          {overlay.selected ? (
            <div className="maker-overlay maker-overlay--selected" style={box(overlay.selected)}>
              <span className="maker-overlay__label">{overlay.label}</span>
            </div>
          ) : null}
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
        <div
          className="maker-stage__handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Stage width"
          onPointerDown={onHandleDown}
        />
      </div>
      </div>
      <p className="maker-stage__meta">
        {Math.round(frameWidth)}px · {(frameWidth / REM).toFixed(1)}rem ·{" "}
        {frameWidth >= EXPANDED_PX ? "expanded (≥ 52rem): *Expanded options apply" : "compact: *Expanded options do not apply"}
        {scale < 1 ? ` · shown at ${Math.round(scale * 100)}% to fit` : ""}
      </p>
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
