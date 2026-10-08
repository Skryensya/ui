import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectResizable, mountResizable, RESIZABLE_CHANGE_EVENT } from "./resizable.js";

/* jsdom lays nothing out, so each panel reports the width it would have at its current weight. */
function build(options: { direction?: "horizontal" | "vertical"; sizes?: (number | undefined)[]; total?: number } = {}) {
  const { direction, sizes = [undefined, undefined], total = 1000 } = options;
  document.body.innerHTML = "";
  const root = document.createElement("div");
  root.className = "sk-resizable";
  root.setAttribute("data-sk-resizable", "");
  if (direction) root.setAttribute("data-direction", direction);
  const panels: HTMLElement[] = [];
  const handles: HTMLElement[] = [];
  sizes.forEach((size, i) => {
    const panel = document.createElement("div");
    panel.className = "sk-resizable__panel";
    if (size !== undefined) panel.setAttribute("data-size", String(size));
    panel.getBoundingClientRect = () => {
      const weight = Number.parseFloat(panel.style.getPropertyValue("--sk-resizable-size")) || 0;
      const extent = (weight / 100) * total;
      return { width: direction === "vertical" ? 0 : extent, height: direction === "vertical" ? extent : 0 } as DOMRect;
    };
    panels.push(panel);
    root.append(panel);
    if (i < sizes.length - 1) {
      const handle = document.createElement("div");
      handle.className = "sk-resizable__handle";
      handle.setAttribute("aria-label", `Resize ${i + 1}`);
      handles.push(handle);
      root.append(handle);
    }
  });
  document.body.append(root);
  return { root, panels, handles };
}

const weight = (panel: HTMLElement) => Number.parseFloat(panel.style.getPropertyValue("--sk-resizable-size"));
const key = (handle: HTMLElement, name: string, init: KeyboardEventInit = {}) =>
  handle.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...init }));
const pointer = (target: HTMLElement, type: string, clientX: number, clientY = 0) =>
  target.dispatchEvent(Object.assign(new MouseEvent(type, { bubbles: true, clientX, clientY, button: 0 }), { pointerId: 1 }));

describe("connectResizable", () => {
  let cleanup: () => void;
  beforeEach(() => {
    cleanup = () => {};
  });
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("splits equally and describes each bar as a separator", () => {
    const { root, panels, handles } = build();
    cleanup = connectResizable(root);
    expect(panels.map(weight)).toEqual([50, 50]);
    expect(handles[0]!.getAttribute("role")).toBe("separator");
    expect(handles[0]!.getAttribute("aria-orientation")).toBe("vertical");
    expect(handles[0]!.getAttribute("aria-controls")).toBe(panels[0]!.id);
    expect(handles[0]!.getAttribute("aria-valuenow")).toBe("50");
    expect(handles[0]!.getAttribute("aria-valuemin")).toBe("10");
    expect(handles[0]!.getAttribute("aria-valuemax")).toBe("90");
    expect(handles[0]!.tabIndex).toBe(0);
  });

  it("announces the opposite orientation when the panels are stacked", () => {
    const { root, handles } = build({ direction: "vertical" });
    cleanup = connectResizable(root);
    expect(handles[0]!.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("honours authored sizes", () => {
    const { root, panels } = build({ sizes: [30, undefined, undefined] });
    cleanup = connectResizable(root);
    expect(panels.map(weight)).toEqual([30, 35, 35]);
  });

  it("moves the boundary with the arrows, further with Shift, and reports it", () => {
    const { root, panels, handles } = build();
    const change = vi.fn();
    root.addEventListener(RESIZABLE_CHANGE_EVENT, (event) => change((event as CustomEvent).detail.sizes));
    cleanup = connectResizable(root);
    key(handles[0]!, "ArrowRight");
    expect(panels.map(weight)).toEqual([51, 49]);
    key(handles[0]!, "ArrowRight", { shiftKey: true });
    expect(panels.map(weight)).toEqual([61, 39]);
    key(handles[0]!, "ArrowLeft");
    expect(panels.map(weight)).toEqual([60, 40]);
    expect(change).toHaveBeenLastCalledWith([60, 40]);
    expect(handles[0]!.getAttribute("aria-valuenow")).toBe("60");
  });

  it("ignores the arrows of the other axis and keys it does not own", () => {
    const { root, panels, handles } = build();
    cleanup = connectResizable(root);
    expect(key(handles[0]!, "ArrowDown")).toBe(true);
    expect(key(handles[0]!, "a")).toBe(true);
    expect(panels.map(weight)).toEqual([50, 50]);
  });

  it("uses Up and Down for stacked panels", () => {
    const { root, panels, handles } = build({ direction: "vertical" });
    cleanup = connectResizable(root);
    key(handles[0]!, "ArrowDown");
    expect(panels.map(weight)).toEqual([51, 49]);
    key(handles[0]!, "ArrowRight");
    expect(panels.map(weight)).toEqual([51, 49]);
  });

  it("jumps to the ends with Home and End, and resets with Enter", () => {
    const { root, panels, handles } = build();
    cleanup = connectResizable(root);
    key(handles[0]!, "End");
    expect(panels.map(weight)).toEqual([90, 10]);
    key(handles[0]!, "Home");
    expect(panels.map(weight)).toEqual([10, 90]);
    key(handles[0]!, "Enter");
    expect(panels.map(weight)).toEqual([50, 50]);
  });

  it("resets on double click", () => {
    const { root, panels, handles } = build();
    cleanup = connectResizable(root);
    key(handles[0]!, "End");
    handles[0]!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(panels.map(weight)).toEqual([50, 50]);
  });

  it("drags the boundary by the pointer's travel as a share of the panels' room", () => {
    const { root, panels, handles } = build({ total: 1000 });
    cleanup = connectResizable(root);
    pointer(handles[0]!, "pointerdown", 500);
    pointer(handles[0]!, "pointermove", 600);
    expect(panels.map(weight)).toEqual([60, 40]);
    expect(handles[0]!.hasAttribute("data-dragging")).toBe(true);
    expect(root.hasAttribute("data-dragging")).toBe(true);
    pointer(handles[0]!, "pointerup", 600);
    expect(handles[0]!.hasAttribute("data-dragging")).toBe(false);
    expect(root.hasAttribute("data-dragging")).toBe(false);
  });

  it("does not start a drag for a press that barely moves", () => {
    const { root, panels, handles } = build();
    cleanup = connectResizable(root);
    pointer(handles[0]!, "pointerdown", 500);
    pointer(handles[0]!, "pointermove", 502);
    expect(panels.map(weight)).toEqual([50, 50]);
    expect(handles[0]!.hasAttribute("data-dragging")).toBe(false);
  });

  it("clamps a drag at the panel's minimum", () => {
    const { root, panels, handles } = build();
    cleanup = connectResizable(root);
    pointer(handles[0]!, "pointerdown", 500);
    pointer(handles[0]!, "pointermove", -5000);
    expect(panels.map(weight)).toEqual([10, 90]);
  });

  it("moves only the pair a bar separates", () => {
    const { root, panels, handles } = build({ sizes: [undefined, undefined, undefined] });
    cleanup = connectResizable(root);
    const before = weight(panels[0]!);
    key(handles[1]!, "ArrowRight", { shiftKey: true });
    expect(weight(panels[0]!)).toBe(before);
    expect(weight(panels[1]!) + weight(panels[2]!)).toBeCloseTo(100 - before);
  });

  it("stops responding after cleanup", () => {
    const { root, panels, handles } = build();
    connectResizable(root)();
    key(handles[0]!, "ArrowRight");
    expect(panels.map(weight)).toEqual([50, 50]);
  });
});

describe("connectResizable, collapsible panels", () => {
  let cleanup: () => void = () => {};
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  const collapsibleSidebar = () => {
    const built = build({ sizes: [30, undefined] });
    built.panels[0]!.setAttribute("data-min-size", "20");
    built.panels[0]!.setAttribute("data-collapsible", "");
    cleanup = connectResizable(built.root);
    return built;
  };

  it("closes on Home, marks the panel and the bar, and takes the closed content out of reach", () => {
    const { panels, handles } = collapsibleSidebar();
    key(handles[0]!, "Home");
    expect(panels.map(weight)).toEqual([0, 100]);
    expect(panels[0]!.hasAttribute("data-collapsed")).toBe(true);
    expect(panels[0]!.hasAttribute("inert")).toBe(true);
    expect(handles[0]!.hasAttribute("data-collapsed")).toBe(true);
    expect(handles[0]!.getAttribute("aria-valuenow")).toBe("0");
    expect(handles[0]!.getAttribute("aria-valuemin")).toBe("0");
  });

  it("opens again with Enter, which resets, and with a double click", () => {
    const { panels, handles } = collapsibleSidebar();
    key(handles[0]!, "Home");
    key(handles[0]!, "Enter");
    expect(panels.map(weight)).toEqual([30, 70]);
    expect(panels[0]!.hasAttribute("data-collapsed")).toBe(false);
    expect(panels[0]!.hasAttribute("inert")).toBe(false);
    key(handles[0]!, "Home");
    handles[0]!.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect(panels.map(weight)).toEqual([30, 70]);
  });

  it("toggles on Ctrl+Enter and Cmd+Enter, back to the size it had", () => {
    const { panels, handles } = collapsibleSidebar();
    key(handles[0]!, "ArrowRight", { shiftKey: true });
    expect(panels.map(weight)).toEqual([40, 60]);
    key(handles[0]!, "Enter", { ctrlKey: true });
    expect(panels.map(weight)).toEqual([0, 100]);
    key(handles[0]!, "Enter", { metaKey: true });
    expect(panels.map(weight)).toEqual([40, 60]);
  });

  it("keeps the floor of a panel that is not collapsible, and leaves Ctrl+Enter alone", () => {
    const { root, panels, handles } = build();
    cleanup = connectResizable(root);
    key(handles[0]!, "Home");
    expect(panels.map(weight)).toEqual([10, 90]);
    expect(key(handles[0]!, "Enter", { ctrlKey: true })).toBe(true);
    expect(panels.map(weight)).toEqual([10, 90]);
  });

  it("answers commands sent as an event on the group", () => {
    const { root, panels } = collapsibleSidebar();
    const send = (detail: unknown) => root.dispatchEvent(new CustomEvent("sk:resizablecommand", { detail }));
    send({ action: "collapse", panel: 0 });
    expect(panels.map(weight)).toEqual([0, 100]);
    send({ action: "expand", panel: 0 });
    expect(panels.map(weight)).toEqual([30, 70]);
    send({ action: "toggle", panel: 0 });
    send({ action: "reset" });
    expect(panels.map(weight)).toEqual([30, 70]);
  });

  it("keeps a rail's content when it collapses to a size above zero", () => {
    const { root, panels, handles } = build({ sizes: [30, undefined] });
    panels[0]!.setAttribute("data-min-size", "20");
    panels[0]!.setAttribute("data-collapsible", "");
    panels[0]!.setAttribute("data-collapsed-size", "6");
    cleanup = connectResizable(root);
    key(handles[0]!, "Home");
    expect(panels.map(weight)).toEqual([6, 94]);
    expect(panels[0]!.hasAttribute("data-collapsed")).toBe(true);
    expect(panels[0]!.hasAttribute("inert")).toBe(false);
  });
});

describe("mountResizable", () => {
  it("mounts authored roots once", () => {
    const { root } = build();
    expect(mountResizable(document)).toBe(1);
    expect(mountResizable(document)).toBe(0);
    expect(root.querySelector(".sk-resizable__handle")?.getAttribute("role")).toBe("separator");
  });
});
