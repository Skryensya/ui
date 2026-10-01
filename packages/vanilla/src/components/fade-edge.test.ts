import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountFadeEdge } from "./fade-edge.js";

/* jsdom lays nothing out, so every scroll dimension is whatever the test says it is. */
function scroller(attrs: string, metrics: { scrollHeight: number; clientHeight: number }) {
  document.body.innerHTML = `<div class="sk-fade-edge" data-sk-fade-edge ${attrs}><p>Contenido</p></div>`;
  const root = document.body.firstElementChild as HTMLElement;
  Object.defineProperty(root, "scrollHeight", { configurable: true, value: metrics.scrollHeight });
  Object.defineProperty(root, "clientHeight", { configurable: true, value: metrics.clientHeight });
  return root;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("mountFadeEdge", () => {
  it("measures a plain FadeEdge's scrollbars, but never marks it at its edge", () => {
    const root = scroller('data-direction="to-bottom"', { scrollHeight: 100, clientHeight: 100 });
    Object.defineProperty(root, "offsetHeight", { configurable: true, value: 112 });
    // jsdom gives no element a box; a shown one has at least one client rect.
    root.getClientRects = () => [new DOMRect()] as unknown as DOMRectList;
    expect(mountFadeEdge()).toBe(1);
    expect(root.style.getPropertyValue("--sk-fade-edge-gutter-block")).toBe("12px");
    expect(root.hasAttribute("data-measured")).toBe(true);
    expect(root.hasAttribute("data-at-edge")).toBe(false);
  });

  it("waits to mark a hidden FadeEdge measured: it has no box to measure yet", () => {
    const root = scroller('data-direction="to-bottom"', { scrollHeight: 100, clientHeight: 100 });
    mountFadeEdge();
    expect(root.hasAttribute("data-measured")).toBe(false);
  });

  it("marks content that fits as already at its edge", () => {
    const root = scroller('data-direction="to-bottom" data-scroll-aware', { scrollHeight: 100, clientHeight: 100 });
    mountFadeEdge();
    expect(root.hasAttribute("data-at-edge")).toBe(true);
  });

  it("keeps the fade while there is more, and retires it once the scroll reaches the edge", () => {
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const root = scroller('data-direction="to-bottom" data-scroll-aware', { scrollHeight: 300, clientHeight: 100 });
    mountFadeEdge();
    expect(root.hasAttribute("data-at-edge")).toBe(false);

    root.scrollTop = 200;
    root.dispatchEvent(new Event("scroll"));
    expect(root.hasAttribute("data-at-edge")).toBe(true);
  });

  it("removes the attribute and the gutters on destroy, so the fade paints again unwatched", () => {
    const root = scroller('data-direction="to-bottom" data-scroll-aware', { scrollHeight: 100, clientHeight: 100 });
    mountFadeEdge();
    destroyMount(root);
    expect(root.hasAttribute("data-at-edge")).toBe(false);
    expect(root.style.getPropertyValue("--sk-fade-edge-gutter-block")).toBe("");
  });
});
