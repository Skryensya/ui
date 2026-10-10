import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScrollHint } from "./scroll-hint.js";

function scroller({ horizontal = false, fits = false, initial = 0 } = {}) {
  const node = document.createElement("div");
  node.id = "scroll-hint-test-region";
  Object.defineProperties(node, {
    clientHeight: { value: 100, configurable: true }, scrollHeight: { value: horizontal || fits ? 100 : 400, configurable: true },
    clientWidth: { value: 100, configurable: true }, scrollWidth: { value: !horizontal || fits ? 100 : 400, configurable: true },
  });
  if (horizontal) node.scrollLeft = initial; else node.scrollTop = initial;
  document.body.append(node);
  return node;
}

// Scrollers are outside React's tree, like an existing page region addressed by selector.
function cleanup(node: HTMLElement) { node.remove(); }

describe("ScrollHint", () => {
  it("shows a named, non-interactive cue only when content overflows", () => {
    const node = scroller();
    const ui = render(<ScrollHint scroller="#scroll-hint-test-region">Scroll for more</ScrollHint>);
    const hint = ui.container.firstElementChild as HTMLElement;
    expect(hint.hidden).toBe(false);
    expect(hint.textContent).toBe("Scroll for more");
    expect(hint.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(hint.getAttribute("tabindex")).toBeNull();
    cleanup(node);
  });

  it("dismisses permanently after actual vertical scroll, not a wheel gesture", () => {
    const node = scroller();
    const ui = render(<ScrollHint scroller="#scroll-hint-test-region">Scroll</ScrollHint>);
    const hint = ui.container.firstElementChild as HTMLElement;
    fireEvent.wheel(node, { deltaY: 10 });
    expect(hint.hidden).toBe(false);
    node.scrollTop = 12; fireEvent.scroll(node);
    expect(hint.hidden).toBe(true);
    node.scrollTop = 0; fireEvent.scroll(node);
    expect(hint.hidden).toBe(true);
    cleanup(node);
  });

  it("ignores movement in the other axis and handles negative RTL horizontal offsets", () => {
    const node = scroller({ horizontal: true });
    const ui = render(<ScrollHint axis="horizontal" scroller="#scroll-hint-test-region">Swipe</ScrollHint>);
    const hint = ui.container.firstElementChild as HTMLElement;
    node.scrollTop = 15; fireEvent.scroll(node);
    expect(hint.hidden).toBe(false);
    node.scrollLeft = -12; fireEvent.scroll(node);
    expect(hint.hidden).toBe(true);
    cleanup(node);
  });

  it("stays hidden when the content fits or has already scrolled", () => {
    for (const options of [{ fits: true }, { initial: 20 }]) {
      const node = scroller(options);
      const ui = render(<ScrollHint scroller="#scroll-hint-test-region">Scroll</ScrollHint>);
      expect((ui.container.firstElementChild as HTMLElement).hidden).toBe(true);
      ui.unmount(); cleanup(node);
    }
  });

  it("stays hidden for missing or invalid targets and cleans up its listener", () => {
    const missing = render(<ScrollHint scroller="[">Scroll</ScrollHint>);
    expect((missing.container.firstElementChild as HTMLElement).hidden).toBe(true);
    missing.unmount();
    const node = scroller();
    const remove = vi.spyOn(node, "removeEventListener");
    const ui = render(<ScrollHint scroller="#scroll-hint-test-region">Scroll</ScrollHint>);
    ui.unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    cleanup(node);
  });
});
