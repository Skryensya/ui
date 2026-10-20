import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Kbd } from "./kbd.js";

describe("Kbd", () => {
  it("serializes its appearance beside its tone, plain by default", () => {
    const ui = render(
      <>
        <Kbd>Esc</Kbd>
        <Kbd appearance="brutalist">K</Kbd>
      </>,
    );
    expect(ui.getByText("Esc").getAttribute("data-appearance")).toBe("plain");
    expect(ui.getByText("K").getAttribute("data-appearance")).toBe("brutalist");
  });

  it("renders a native <kbd> carrying the part class", () => {
    const ui = render(<Kbd>⌘K</Kbd>);
    const el = ui.container.querySelector("kbd");
    expect(el).not.toBeNull();
    expect(el?.classList.contains("sk-kbd")).toBe(true);
    expect(el?.textContent).toBe("⌘K");
  });

  it("keeps a consumer className alongside the part", () => {
    const ui = render(<Kbd className="mine">Esc</Kbd>);
    const el = ui.container.querySelector("kbd")!;
    expect(el.classList.contains("sk-kbd")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
  });

  it("passes through native attributes", () => {
    const ui = render(<Kbd aria-hidden="true">↵</Kbd>);
    expect(ui.container.querySelector("kbd")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("marks arrow and enter legends for icon drawing", () => {
    const ui = render(
      <>
        <Kbd>↑</Kbd>
        <Kbd>Enter</Kbd>
      </>,
    );
    expect(ui.getByText("↑").getAttribute("data-key")).toBe("arrowup");
    expect(ui.getByText("Enter").getAttribute("data-key")).toBe("enter");
  });

  it("defaults to the neutral tone and opts into accent", () => {
    const rest = render(<Kbd>K</Kbd>);
    expect(rest.container.querySelector("kbd")?.getAttribute("data-tone")).toBe("neutral");

    const accent = render(<Kbd tone="accent">K</Kbd>);
    expect(accent.container.querySelector("kbd")?.getAttribute("data-tone")).toBe("accent");
  });

  it("warns in development when a key legend is empty, and marks it visually too", () => {
    // A platform-computed legend (an OS-specific shortcut absent on this one) can come up empty:
    // the keycap still renders, at its full square size, with nothing to announce. Same shared
    // `[data-sk-a11y-warn]` signal as Button's own empty-content case.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const ui = render(<Kbd>{""}</Kbd>);
    expect(spy.mock.calls.at(-1)?.[0]).toMatch(/renders nothing/i);
    expect(ui.container.querySelector("kbd")?.getAttribute("data-sk-a11y-warn")).toBe("");
    spy.mockRestore();
  });

  it("does not warn when there is a real legend", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Kbd>Esc</Kbd>);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
