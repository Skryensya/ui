import type { RawCapture, CapturedNode } from "@skryensya/reference-model";
/** Serialized into the isolated world by scripting.executeScript; no module state or page scripts. */
export async function captureDocument(
  mode: "page" | "selection",
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
  let captureMode: RawCapture["mode"] = "page";
  if (mode === "selection") {
    const picked = await pick();
    captureMode = picked.mode;
    element = picked.element;
    bounds = picked.bounds;
  }
  /*
   * One gesture picks either shape: a click takes the element under the pointer, a drag takes the
   * area. The choice is shown on the page and nothing is captured until it is confirmed.
   */
  async function pick(): Promise<{
    mode: "element" | "region";
    element: Element;
    bounds: typeof bounds;
  }> {
    const accent = "#1a5cff";
    const style = (el: HTMLElement, values: Record<string, string>) => {
      for (const [property, value] of Object.entries(values))
        el.style.setProperty(property, value, "important");
    };
    const make = (tag: string, values: Record<string, string>, text = "") => {
      const el = document.createElement(tag);
      style(el, values);
      el.textContent = text;
      return el;
    };
    const overlay = document.createElement("div");
    // Isolate capture controls from the website's selectors and inherited layout.
    style(overlay, {
      all: "initial",
      display: "block",
      position: "fixed",
      inset: "0",
      "z-index": "2147483647",
      cursor: "crosshair",
      background: "transparent",
      "pointer-events": "auto",
      "touch-action": "none",
    });
    const ui = overlay.attachShadow({ mode: "closed" });
    const font = "500 13px/1.4 system-ui, -apple-system, sans-serif";
    // The spotlight: everything outside the box is dimmed, so what is inside is what gets captured.
    const box = make("div", {
      position: "fixed",
      display: "none",
      border: `2px solid ${accent}`,
      "border-radius": "4px",
      "box-shadow": "0 0 0 200vmax rgba(15, 23, 42, 0.45)",
      "pointer-events": "none",
      "box-sizing": "border-box",
    });
    const pill = {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      "align-items": "center",
      gap: "8px",
      "max-width": "calc(100vw - 32px)",
      "box-sizing": "border-box",
      padding: "8px 8px 8px 14px",
      background: "#ffffff",
      color: "#14171f",
      font,
      "border-radius": "10px",
      "box-shadow": "0 8px 24px rgba(15, 23, 42, 0.25)",
      cursor: "default",
    };
    const hint = make(
      "div",
      { ...pill, top: "16px", padding: "10px 14px", "pointer-events": "none" },
      "Click an element or drag an area · Esc to cancel",
    );
    const bar = make("div", { ...pill, bottom: "24px", display: "none" });
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Capture selection");
    const summary = make("span", { "white-space": "nowrap", overflow: "hidden", "text-overflow": "ellipsis" });
    const button = (action: string, text: string, primary = false) => {
      const b = make(
        "button",
        {
          font,
          padding: "6px 12px",
          "border-radius": "7px",
          border: primary ? `1px solid ${accent}` : "1px solid #d5d8de",
          background: primary ? accent : "#ffffff",
          color: primary ? "#ffffff" : "#14171f",
          cursor: "pointer",
        },
        text,
      );
      b.dataset.action = action;
      return b;
    };
    const confirmButton = button("confirm", "Capture", true) as HTMLButtonElement;
    bar.append(summary, button("reselect", "Reselect"), button("cancel", "Cancel"), confirmButton);
    ui.append(box, hint, bar);
    document.documentElement.append(overlay);

    type Rect = { x: number; y: number; width: number; height: number };
    let state: "picking" | "confirm" = "picking";
    let start: { x: number; y: number } | undefined;
    let chosen: { mode: "element" | "region"; element: Element; bounds: Rect } | undefined;
    const draw = (r: Rect | undefined) => {
      if (!r) return style(box, { display: "none" });
      style(box, {
        display: "block",
        left: `${r.x}px`,
        top: `${r.y}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
      });
    };
    const underneath = (x: number, y: number) => {
      overlay.style.setProperty("pointer-events", "none", "important");
      const found = document.elementFromPoint(x, y);
      overlay.style.setProperty("pointer-events", "auto", "important");
      return found;
    };
    const dragged = (x: number, y: number) =>
      !!start && Math.hypot(x - start.x, y - start.y) > 4;
    const area = (x: number, y: number): Rect => ({
      x: Math.min(start!.x, x),
      y: Math.min(start!.y, y),
      width: Math.abs(x - start!.x),
      height: Math.abs(y - start!.y),
    });
    // The confirmed box lives in document coordinates, so it stays on its content while scrolling.
    const redraw = () => {
      if (state === "confirm" && chosen)
        draw({ ...chosen.bounds, x: chosen.bounds.x - scrollX, y: chosen.bounds.y - scrollY });
    };
    const repick = () => {
      state = "picking";
      chosen = undefined;
      start = undefined;
      draw(undefined);
      style(bar, { display: "none" });
      style(hint, { display: "flex" });
      style(overlay, { cursor: "crosshair" });
    };
    const confirm = (next: NonNullable<typeof chosen>) => {
      chosen = next;
      state = "confirm";
      const dpr = devicePixelRatio || 1;
      const w = Math.round(next.bounds.width),
        h = Math.round(next.bounds.height);
      const tooLarge =
        w * dpr > 32767 || h * dpr > 32767 || w * h * dpr * dpr > 100_000_000;
      const name =
        next.mode === "element"
          ? `<${next.element.tagName.toLowerCase()}>`
          : "Area";
      summary.textContent = tooLarge
        ? `${name} · ${w} × ${h} px is too large. Reselect a smaller part.`
        : `${name} · ${w} × ${h} px`;
      confirmButton.disabled = tooLarge;
      style(confirmButton, { opacity: tooLarge ? "0.4" : "1", cursor: tooLarge ? "not-allowed" : "pointer" });
      style(hint, { display: "none" });
      style(bar, { display: "flex" });
      style(overlay, { cursor: "default" });
      redraw();
      confirmButton.focus();
    };
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
    let act: (action: string) => void = () => {};
    const inBar = (x: number, y: number) => {
      const r = bar.getBoundingClientRect();
      return state === "confirm" && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const intercept = (event: Event) => {
      if (event.target !== overlay) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const e = event as PointerEvent;
      /* The bar's buttons sit in a closed shadow root, behind this capture-phase guard, so their
       * clicks are resolved here: by hit-testing for a pointer, by focus for the keyboard. */
      if (event.type === "click") {
        const hit = e.detail === 0 ? ui.activeElement : ui.elementFromPoint?.(e.clientX, e.clientY);
        const action = (hit as HTMLElement | null)?.closest?.<HTMLElement>("[data-action]")?.dataset.action;
        if (action && state === "confirm") act(action);
        return;
      }
      if (inBar(e.clientX, e.clientY)) return;
      if (event.type === "pointerdown") overlay.onpointerdown?.(e);
      else if (event.type === "pointermove") overlay.onpointermove?.(e);
      else if (event.type === "pointerup") overlay.onpointerup?.(e);
    };
    for (const event of events) window.addEventListener(event, intercept, true);
    window.addEventListener("scroll", redraw, true);
    let key: (e: KeyboardEvent) => void = () => {};
    try {
      return await new Promise((resolve, reject) => {
        act = (action) => {
          if (action === "cancel") reject(new Error("Capture cancelled"));
          else if (action === "reselect") repick();
          else if (action === "confirm" && chosen && !confirmButton.disabled) resolve(chosen);
        };
        key = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopImmediatePropagation();
            act("cancel");
          } else if (e.key === "Enter" && state === "confirm") {
            e.preventDefault();
            e.stopImmediatePropagation();
            act(ui.activeElement instanceof HTMLElement && ui.activeElement.dataset.action ? ui.activeElement.dataset.action : "confirm");
          }
        };
        document.addEventListener("keydown", key, true);
        overlay.onpointerdown = (e) => {
          e.preventDefault();
          // Pressing outside the bar after choosing starts a new choice.
          if (state === "confirm") repick();
          start = { x: e.clientX, y: e.clientY };
          overlay.setPointerCapture?.(e.pointerId);
        };
        overlay.onpointermove = (e) => {
          if (state !== "picking") return;
          if (dragged(e.clientX, e.clientY)) return draw(area(e.clientX, e.clientY));
          if (start) return;
          draw(underneath(e.clientX, e.clientY)?.getBoundingClientRect());
        };
        overlay.onpointerup = (e) => {
          if (state !== "picking" || !start) return;
          if (dragged(e.clientX, e.clientY)) {
            const r = area(e.clientX, e.clientY);
            start = undefined;
            if (r.width < 2 || r.height < 2) return;
            confirm({
              mode: "region",
              element: document.body,
              bounds: { ...r, x: r.x + scrollX, y: r.y + scrollY },
            });
            return;
          }
          start = undefined;
          const found = underneath(e.clientX, e.clientY);
          if (!found) return;
          const r = geometry(found.getBoundingClientRect());
          if (r.width < 2 || r.height < 2) return;
          confirm({ mode: "element", element: found, bounds: r });
        };
      });
    } finally {
      document.removeEventListener("keydown", key, true);
      for (const event of events)
        window.removeEventListener(event, intercept, true);
      window.removeEventListener("scroll", redraw, true);
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
      if (captureMode === "region" && !relevant(child, depth + 1)) continue;
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
      mode: captureMode,
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
