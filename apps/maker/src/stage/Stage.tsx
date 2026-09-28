import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { findChild, findNode, type MakerNode } from "@skryensya/maker-model";
import { DRAG_THRESHOLD, type Drag } from "../drag";
import { stageTree, type Maker, type StageWidth } from "../state";
import { elementFor, nodeIdAt, placeAt, type Rect } from "./geometry";

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
  const [renderError, setRenderError] = useState<string>();
  const root = maker.page.root;
  const { selected, mode } = maker.view;

  /* Latest values for listeners that live on the stage's document across renders. */
  const live = useRef({ root, selected, mode, drag, maker });
  live.current = { root, selected, mode, drag, maker };

  const doc = () => frameRef.current?.contentDocument ?? null;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.data?.type === "maker-stage-ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
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
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    observer.observe(frameRef.current!);
    frameWindow.addEventListener("scroll", measure);
    return () => {
      observer.disconnect();
      frameWindow.removeEventListener("scroll", measure);
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
      /* Navigation and submission are always blocked: the stage is not a browser tab. */
      if (target.closest("a[href]")) event.preventDefault();
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
          live.current.drag.move(event.clientX + box.left, event.clientY + box.top);
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
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
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
        const found = placeAt(document, live.current.root, allowed, x - box.left, y - box.top);
        if (!found) return undefined;
        const r = found.indicator.rect;
        return {
          place: found.place,
          surface: "stage",
          indicator: { kind: found.indicator.kind, rect: { left: r.left + box.left, top: r.top + box.top, width: r.width, height: r.height } },
        };
      }),
    [drag.register],
  );

  /* ─── the stage width handle ─────────────────────────────────────────────────────────────── */

  const onHandleDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const shell = shellRef.current;
    if (!shell) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const left = shell.getBoundingClientRect().left;
    const onMove = (move: PointerEvent) => maker.setView({ width: { px: Math.max(240, Math.round(move.clientX - left)) } });
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
      <div className="maker-stage__frame" style={{ inlineSize: widthStyle(maker.view.width) }}>
        <iframe ref={frameRef} src="/stage.html" title="Page stage" className="maker-stage__iframe" />
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
              style={box({ ...indicator.rect, left: indicator.rect.left - frameBox.left, top: indicator.rect.top - frameBox.top })}
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
      <p className="maker-stage__meta">
        {Math.round(frameWidth)}px · {(frameWidth / REM).toFixed(1)}rem ·{" "}
        {frameWidth >= EXPANDED_PX ? "expanded (≥ 52rem): *Expanded options apply" : "compact: *Expanded options do not apply"}
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
