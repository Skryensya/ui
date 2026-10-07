import type { RawCapture, CapturedNode } from "@skryensya/reference-model";
/** Serialized into the isolated world by scripting.executeScript; no module state or page scripts. */
export async function captureDocument(
  mode: "page" | "region" | "element",
): Promise<{
  raw: RawCapture;
  source: { url: string; hostname: string; title: string };
  scroll: { x: number; y: number };
}> {
  const originalScroll = { x: scrollX, y: scrollY };
  const geometry = (r: DOMRect) => ({
    x: r.x + scrollX,
    y: r.y + scrollY,
    width: r.width,
    height: r.height,
  });
  let element: Element = document.body;
  let bounds = {
    x: 0,
    y: 0,
    width: Math.max(document.documentElement.scrollWidth, innerWidth),
    height: Math.max(document.documentElement.scrollHeight, innerHeight),
  };
  if (mode !== "page") {
    const overlay = document.createElement("div");
    // Isolate capture controls from the website's selectors and inherited layout.
    for (const [property, value] of Object.entries({
      all: "initial",
      display: "block",
      position: "fixed",
      inset: "0",
      "z-index": "2147483647",
      cursor: "crosshair",
      background: "rgba(0,0,0,.08)",
      "pointer-events": "auto",
      "touch-action": "none",
    }))
      overlay.style.setProperty(property, value, "important");
    const controls = overlay.attachShadow({ mode: "closed" });
    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed",
      border: "2px solid #2563eb",
      pointerEvents: "none",
    });
    controls.append(box);
    const label = document.createElement("div");
    label.textContent =
      mode === "element"
        ? "Click an element · Esc to cancel"
        : "Drag a region · Esc to cancel";
    Object.assign(label.style, {
      position: "absolute",
      top: "8px",
      left: "8px",
      background: "white",
      color: "black",
      padding: "8px",
      font: "14px sans-serif",
      pointerEvents: "none",
    });
    controls.append(label);
    document.documentElement.append(overlay);
    // Stop ordinary website handlers from treating a selection as an outside click.
    const events = [
      "pointerdown",
      "pointermove",
      "pointerup",
      "mousedown",
      "mouseup",
      "click",
      "dblclick",
      "contextmenu",
    ];
    const intercept = (event: Event) => {
      if (event.target !== overlay) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const handler =
        event.type === "pointerdown"
          ? overlay.onpointerdown
          : event.type === "pointermove"
            ? overlay.onpointermove
            : event.type === "pointerup"
              ? overlay.onpointerup
              : undefined;
      handler?.call(overlay, event as PointerEvent);
    };
    for (const event of events) window.addEventListener(event, intercept, true);
    try {
      await new Promise<void>((resolve, reject) => {
        let start: { x: number; y: number } | undefined;
        const underneath = (x: number, y: number) => {
          overlay.style.setProperty("pointer-events", "none", "important");
          const found = document.elementFromPoint(x, y);
          overlay.style.setProperty("pointer-events", "auto", "important");
          return found;
        };
        const key = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            document.removeEventListener("keydown", key, true);
            reject(new Error("Capture cancelled"));
          }
        };
        document.addEventListener("keydown", key, true);
        overlay.onpointerdown = (e) => {
          e.preventDefault();
          start = { x: e.clientX, y: e.clientY };
          overlay.setPointerCapture(e.pointerId);
        };
        overlay.onpointermove = (e) => {
          const r =
            mode === "element"
              ? underneath(e.clientX, e.clientY)?.getBoundingClientRect()
              : start
                ? {
                    x: Math.min(start.x, e.clientX),
                    y: Math.min(start.y, e.clientY),
                    width: Math.abs(e.clientX - start.x),
                    height: Math.abs(e.clientY - start.y),
                  }
                : undefined;
          if (r)
            Object.assign(box.style, {
              left: `${r.x}px`,
              top: `${r.y}px`,
              width: `${r.width}px`,
              height: `${r.height}px`,
            });
        };
        overlay.onpointerup = (e) => {
          if (!start) return;
          const found = underneath(e.clientX, e.clientY);
          if (!found) return;
          element = found;
          if (mode === "element")
            bounds = geometry(element.getBoundingClientRect());
          else {
            bounds = {
              x: Math.min(start.x, e.clientX) + scrollX,
              y: Math.min(start.y, e.clientY) + scrollY,
              width: Math.abs(e.clientX - start.x),
              height: Math.abs(e.clientY - start.y),
            };
            element = document.body;
          }
          if (bounds.width < 2 || bounds.height < 2) return;
          document.removeEventListener("keydown", key, true);
          resolve();
        };
      });
    } finally {
      for (const event of events)
        window.removeEventListener(event, intercept, true);
      overlay.remove();
    }
  }
  let count = 0,
    truncated = false;
  const properties = [
    "display",
    "position",
    "flex-direction",
    "flex-wrap",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "align-items",
    "align-self",
    "justify-content",
    "justify-self",
    "order",
    "grid-template-columns",
    "grid-template-rows",
    "grid-auto-flow",
    "grid-auto-columns",
    "grid-auto-rows",
    "grid-column",
    "grid-row",
    "gap",
    "row-gap",
    "column-gap",
    "padding",
    "margin",
    "width",
    "height",
    "max-width",
    "box-sizing",
    "overflow",
    "background-color",
    "background-image",
    "border",
    "border-top",
    "border-right",
    "border-bottom",
    "border-left",
    "border-radius",
    "font-size",
    "font-weight",
    "line-height",
    "color",
  ];
  const intersects = (r: DOMRect) =>
    r.x + scrollX + r.width > bounds.x &&
    r.y + scrollY + r.height > bounds.y &&
    r.x + scrollX < bounds.x + bounds.width &&
    r.y + scrollY < bounds.y + bounds.height;
  const relevance = new WeakMap<Element, boolean>();
  let inspected = 0;
  function relevant(el: Element, depth: number): boolean {
    const cached = relevance.get(el);
    if (cached !== undefined) return cached;
    let found = false;
    if (inspected++ >= 10000 || depth > 40) truncated = true;
    else if (intersects(el.getBoundingClientRect())) found = true;
    else if (getComputedStyle(el).display !== "none") {
      for (const child of el.children) {
        if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(child.tagName))
          continue;
        if (relevant(child, depth + 1)) {
          found = true;
          break;
        }
      }
    }
    relevance.set(el, found);
    return found;
  }
  function collect(el: Element, depth: number): CapturedNode {
    count++;
    const r = el.getBoundingClientRect(),
      style = getComputedStyle(el);
    const attributes = Object.fromEntries(
      [...el.attributes]
        .filter(
          (a) =>
            a.name.startsWith("aria-") ||
            [
              "href",
              "type",
              "alt",
              "title",
              "for",
              "id",
              "name",
              "placeholder",
              "disabled",
              "required",
              "checked",
            ].includes(a.name),
        )
        .map((a) => [a.name, a.value.slice(0, 4096)]),
    );
    if (/^h[1-6]$/i.test(el.tagName))
      attributes["heading-level"] = el.tagName.slice(1);
    const children: CapturedNode[] = [];
    for (const child of el.children) {
      if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(child.tagName))
        continue;
      if (count >= 10000 || depth >= 40 || children.length >= 5000) {
        truncated = true;
        break;
      }
      if (mode === "region" && !relevant(child, depth + 1)) continue;
      children.push(collect(child, depth + 1));
    }
    return {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role") ?? undefined,
      attributes,
      text: [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent)
        .join(" ")
        .trim()
        .slice(0, 10000),
      styles: Object.fromEntries(
        properties.map((p) => [p, style.getPropertyValue(p).slice(0, 1024)]),
      ),
      rect: geometry(r),
      children,
    };
  }
  return {
    raw: {
      mode,
      pageTitle: document.title.slice(0, 500),
      viewport: {
        width: innerWidth,
        height: innerHeight,
        deviceScaleFactor: devicePixelRatio,
      },
      bounds,
      root: collect(element, 0),
      truncated,
    },
    source: {
      url: location.href,
      hostname: location.hostname,
      title: document.title.slice(0, 500),
    },
    scroll: originalScroll,
  };
}
