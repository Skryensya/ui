import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
import { Resizable, type ResizableApi } from "./resizable.js";

const weight = (el: Element) => Number.parseFloat((el as HTMLElement).style.getPropertyValue("--sk-resizable-size"));
const panelsOf = (container: HTMLElement) => Array.from(container.querySelectorAll(".sk-resizable__panel"));
const handleOf = (container: HTMLElement, i = 0) => container.querySelectorAll<HTMLElement>(".sk-resizable__handle")[i]!;

function pair(props: Record<string, unknown> = {}) {
  return (
    <Resizable {...props}>
      <Resizable.Panel>One</Resizable.Panel>
      <Resizable.Handle label="Resize one" />
      <Resizable.Panel>Two</Resizable.Panel>
    </Resizable>
  );
}

describe("Resizable", () => {
  it("splits equally and describes the bar as a separator", () => {
    const { container } = render(pair());
    expect(panelsOf(container).map(weight)).toEqual([50, 50]);
    const handle = handleOf(container);
    expect(handle.getAttribute("role")).toBe("separator");
    expect(handle.getAttribute("aria-label")).toBe("Resize one");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.getAttribute("aria-controls")).toBe(panelsOf(container)[0]!.id);
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    expect(handle.getAttribute("aria-valuemin")).toBe("10");
    expect(handle.getAttribute("aria-valuemax")).toBe("90");
    expect(handle.tabIndex).toBe(0);
    expect(container.firstElementChild!.getAttribute("data-direction")).toBe("horizontal");
  });

  it("announces the opposite orientation when stacked", () => {
    const { container } = render(pair({ direction: "vertical" }));
    expect(handleOf(container).getAttribute("aria-orientation")).toBe("horizontal");
    expect(container.firstElementChild!.getAttribute("data-direction")).toBe("vertical");
  });

  it("honours authored sizes and bounds", () => {
    const { container } = render(
      <Resizable>
        <Resizable.Panel size={30} minSize={20}>A</Resizable.Panel>
        <Resizable.Handle label="a" />
        <Resizable.Panel>B</Resizable.Panel>
        <Resizable.Handle label="b" />
        <Resizable.Panel>C</Resizable.Panel>
      </Resizable>,
    );
    expect(panelsOf(container).map(weight)).toEqual([30, 35, 35]);
    expect(handleOf(container, 0).getAttribute("aria-valuemin")).toBe("20");
  });

  it("moves the boundary with the arrows, further with Shift, and reports it", () => {
    const onSizesChange = vi.fn();
    const { container } = render(pair({ onSizesChange }));
    const handle = handleOf(container);
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(panelsOf(container).map(weight)).toEqual([51, 49]);
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(panelsOf(container).map(weight)).toEqual([61, 39]);
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(panelsOf(container).map(weight)).toEqual([60, 40]);
    expect(onSizesChange).toHaveBeenLastCalledWith([60, 40]);
    expect(handle.getAttribute("aria-valuenow")).toBe("60");
  });

  it("uses Up and Down for stacked panels and ignores the other axis", () => {
    const { container } = render(pair({ direction: "vertical" }));
    const handle = handleOf(container);
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(panelsOf(container).map(weight)).toEqual([50, 50]);
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(panelsOf(container).map(weight)).toEqual([51, 49]);
  });

  it("jumps with Home and End, resets with Enter and double click", () => {
    const { container } = render(pair());
    const handle = handleOf(container);
    fireEvent.keyDown(handle, { key: "End" });
    expect(panelsOf(container).map(weight)).toEqual([90, 10]);
    fireEvent.keyDown(handle, { key: "Home" });
    expect(panelsOf(container).map(weight)).toEqual([10, 90]);
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(panelsOf(container).map(weight)).toEqual([50, 50]);
    fireEvent.keyDown(handle, { key: "End" });
    fireEvent.doubleClick(handle);
    expect(panelsOf(container).map(weight)).toEqual([50, 50]);
  });

  it("drags by the pointer's travel as a share of the panels' room", () => {
    const { container } = render(pair());
    const panels = panelsOf(container) as HTMLElement[];
    // jsdom lays nothing out: each panel reports the width its weight would give it in 1000px.
    for (const panel of panels) {
      panel.getBoundingClientRect = () => ({ width: (weight(panel) / 100) * 1000, height: 0 }) as DOMRect;
    }
    const handle = handleOf(container);
    fireEvent.pointerDown(handle, { clientX: 500, pointerId: 1, button: 0 });
    fireEvent.pointerMove(handle, { clientX: 600, pointerId: 1 });
    expect(panels.map(weight)).toEqual([60, 40]);
    expect(handle.hasAttribute("data-dragging")).toBe(true);
    expect(container.firstElementChild!.hasAttribute("data-dragging")).toBe(true);
    fireEvent.pointerUp(handle, { clientX: 600, pointerId: 1 });
    expect(handle.hasAttribute("data-dragging")).toBe(false);
    expect(container.firstElementChild!.hasAttribute("data-dragging")).toBe(false);
  });

  it("does not start a drag for a press that barely moves", () => {
    const { container } = render(pair());
    const handle = handleOf(container);
    fireEvent.pointerDown(handle, { clientX: 500, pointerId: 1, button: 0 });
    fireEvent.pointerMove(handle, { clientX: 502, pointerId: 1 });
    expect(handle.hasAttribute("data-dragging")).toBe(false);
    expect(panelsOf(container).map(weight)).toEqual([50, 50]);
  });

  it("keeps a resized layout across a re-render with the same bounds", () => {
    const { container, rerender } = render(pair());
    fireEvent.keyDown(handleOf(container), { key: "End" });
    rerender(pair());
    expect(panelsOf(container).map(weight)).toEqual([90, 10]);
  });

  it("starts over when the authored sizes change", () => {
    const { container, rerender } = render(pair());
    fireEvent.keyDown(handleOf(container), { key: "End" });
    rerender(
      <Resizable>
        <Resizable.Panel size={70}>One</Resizable.Panel>
        <Resizable.Handle label="Resize one" />
        <Resizable.Panel>Two</Resizable.Panel>
      </Resizable>,
    );
    expect(panelsOf(container).map(weight)).toEqual([70, 30]);
  });

  it("merges className, forwards the ref and keeps a caller's style", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(
      <Resizable ref={ref} className="extra">
        <Resizable.Panel style={{ background: "red" }}>One</Resizable.Panel>
        <Resizable.Handle label="x" />
        <Resizable.Panel>Two</Resizable.Panel>
      </Resizable>,
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current!.className).toBe("sk-resizable extra");
    expect((panelsOf(container)[0] as HTMLElement).style.background).toBe("red");
  });
});

describe("Resizable, collapsible panels", () => {
  const sidebar = (extra: Record<string, unknown> = {}) => (
    <Resizable {...extra}>
      <Resizable.Panel size={30} minSize={20} collapsible>
        <button>Inside</button>
      </Resizable.Panel>
      <Resizable.Handle label="Resize sidebar" />
      <Resizable.Panel>Main</Resizable.Panel>
    </Resizable>
  );

  it("has no way to disappear without `collapsible`: the floor holds on Home", () => {
    const { container } = render(pair());
    fireEvent.keyDown(handleOf(container), { key: "Home" });
    expect(panelsOf(container).map(weight)).toEqual([10, 90]);
  });

  it("closes on Home, marks itself, leaves the bar reachable and takes its content out of reach", () => {
    const { container, getByRole } = render(sidebar());
    const handle = handleOf(container);
    fireEvent.keyDown(handle, { key: "Home" });
    expect(panelsOf(container).map(weight)).toEqual([0, 100]);
    const [first, second] = panelsOf(container);
    expect(first!.hasAttribute("data-collapsed")).toBe(true);
    expect(first!.hasAttribute("inert")).toBe(true);
    expect(second!.hasAttribute("data-collapsed")).toBe(false);
    expect(handle.hasAttribute("data-collapsed")).toBe(true);
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.tabIndex).toBe(0);
    /* A browser leaves `inert` content out of the tab order and the reading order; jsdom does not model that. */
    expect(getByRole("button", { name: "Inside" }).closest("[inert]")).toBe(first);
  });

  it("opens again with Enter, which resets, and with a double click", () => {
    const { container } = render(sidebar());
    const handle = handleOf(container);
    fireEvent.keyDown(handle, { key: "Home" });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(panelsOf(container).map(weight)).toEqual([30, 70]);
    fireEvent.keyDown(handle, { key: "Home" });
    fireEvent.doubleClick(handle);
    expect(panelsOf(container).map(weight)).toEqual([30, 70]);
    expect(panelsOf(container)[0]!.hasAttribute("data-collapsed")).toBe(false);
  });

  it("toggles on Ctrl+Enter and on Cmd+Enter, back to the size it had", () => {
    const { container } = render(sidebar());
    const handle = handleOf(container);
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(panelsOf(container).map(weight)).toEqual([40, 60]);
    fireEvent.keyDown(handle, { key: "Enter", ctrlKey: true });
    expect(panelsOf(container).map(weight)).toEqual([0, 100]);
    fireEvent.keyDown(handle, { key: "Enter", metaKey: true });
    expect(panelsOf(container).map(weight)).toEqual([40, 60]);
  });

  it("does nothing on Ctrl+Enter when neither side can collapse, and keeps Enter as the reset", () => {
    const { container } = render(pair());
    const handle = handleOf(container);
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(handle, { key: "Enter", ctrlKey: true });
    expect(panelsOf(container).map(weight)).toEqual([60, 40]);
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(panelsOf(container).map(weight)).toEqual([50, 50]);
  });

  it("can be driven from outside: collapse, expand, toggle and reset through apiRef", () => {
    const api = createRef<ResizableApi>();
    const onSizesChange = vi.fn();
    const { container } = render(sidebar({ apiRef: api, onSizesChange }));
    act(() => api.current!.collapse(0));
    expect(panelsOf(container).map(weight)).toEqual([0, 100]);
    expect(api.current!.sizes()).toEqual([0, 100]);
    expect(onSizesChange).toHaveBeenLastCalledWith([0, 100]);
    act(() => api.current!.expand(0));
    expect(panelsOf(container).map(weight)).toEqual([30, 70]);
    act(() => api.current!.toggle(0));
    act(() => api.current!.reset());
    expect(panelsOf(container).map(weight)).toEqual([30, 70]);
  });

  it("answers the same commands as an event on the group, for a trigger with no reference to it", () => {
    const { container } = render(sidebar());
    const root = container.firstElementChild!;
    act(() => {
      root.dispatchEvent(new CustomEvent("sk:resizablecommand", { detail: { action: "collapse", panel: 0 } }));
    });
    expect(panelsOf(container).map(weight)).toEqual([0, 100]);
    act(() => {
      root.dispatchEvent(new CustomEvent("sk:resizablecommand", { detail: { action: "reset" } }));
    });
    expect(panelsOf(container).map(weight)).toEqual([30, 70]);
  });

  it("keeps a rail's content when it collapses to a size above zero", () => {
    const { container } = render(
      <Resizable>
        <Resizable.Panel size={30} minSize={20} collapsible collapsedSize={6}>
          Rail
        </Resizable.Panel>
        <Resizable.Handle label="Resize rail" />
        <Resizable.Panel>Main</Resizable.Panel>
      </Resizable>,
    );
    fireEvent.keyDown(handleOf(container), { key: "Home" });
    expect(panelsOf(container).map(weight)).toEqual([6, 94]);
    expect(panelsOf(container)[0]!.hasAttribute("data-collapsed")).toBe(true);
    expect(panelsOf(container)[0]!.hasAttribute("inert")).toBe(false);
  });
});
