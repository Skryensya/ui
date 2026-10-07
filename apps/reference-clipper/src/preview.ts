/*
 * What the popup's choice will capture, drawn on the page while the popup is open. Both functions
 * are serialized by scripting.executeScript, so each stands alone: no imports, no shared helpers.
 * The preview never takes pointer events, so the page stays usable underneath it.
 */
export function showPreview(mode: "page" | "selection") {
  const attribute = "data-sk-clipper-preview";
  document.querySelector(`[${attribute}]`)?.remove();
  const style = (el: HTMLElement, values: Record<string, string>) => {
    for (const [property, value] of Object.entries(values))
      el.style.setProperty(property, value, "important");
  };
  const host = document.createElement("div");
  host.setAttribute(attribute, "");
  style(host, {
    all: "initial",
    display: "block",
    position: "fixed",
    inset: "0",
    "z-index": "2147483647",
    "pointer-events": "none",
  });
  const ui = host.attachShadow({ mode: "closed" });
  const accent = "#1a5cff";
  if (mode === "page") {
    const frame = document.createElement("div");
    style(frame, {
      position: "fixed",
      inset: "0",
      border: `3px solid ${accent}`,
      background: "rgba(26, 92, 255, 0.06)",
    });
    ui.append(frame);
  }
  const width = Math.max(document.documentElement.scrollWidth, innerWidth),
    height = Math.max(document.documentElement.scrollHeight, innerHeight);
  const pill = document.createElement("div");
  pill.textContent =
    mode === "page"
      ? `Full page · ${width} × ${height} px will be captured`
      : "Press Select on page, then click an element or drag an area";
  style(pill, {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    "max-width": "calc(100vw - 32px)",
    "box-sizing": "border-box",
    padding: "10px 14px",
    background: mode === "page" ? accent : "#ffffff",
    color: mode === "page" ? "#ffffff" : "#14171f",
    font: "500 13px/1.4 system-ui, -apple-system, sans-serif",
    "border-radius": "10px",
    "box-shadow": "0 8px 24px rgba(15, 23, 42, 0.25)",
  });
  ui.append(pill);
  document.documentElement.append(host);
}

export function hidePreview() {
  document.querySelector("[data-sk-clipper-preview]")?.remove();
}
