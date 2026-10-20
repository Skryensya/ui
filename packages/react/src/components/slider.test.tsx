import { fireEvent, render, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Slider, SliderRange } from "./slider.js";

describe("Slider", () => {
  it("uses the Zag slider machine anatomy and value state", () => {
    const ui = render(<Slider aria-label="Volume" defaultValue={20} max={100} min={0} />);
    const thumb = ui.getByRole("slider", { name: "Volume" });

    expect(thumb.getAttribute("aria-valuenow")).toBe("20");
    expect(thumb.getAttribute("aria-valuemin")).toBe("0");
    expect(thumb.getAttribute("aria-valuemax")).toBe("100");
    expect(ui.container.querySelector(".sk-slider__track")).not.toBeNull();
    expect(ui.container.querySelector(".sk-slider__range")).not.toBeNull();
    expect(ui.container.querySelector("[data-sk-slider]")?.getAttribute("data-sk-slider-ready")).toBe("true");
  });

  it("leaves inherited direction intact in server-rendered markup", () => {
    const html = renderToString(
      <div dir="rtl">
        <Slider aria-label="Volume" defaultValue={60} max={100} min={0} />
        <SliderRange defaultHighValue={80} defaultLowValue={20} highLabel="High" lowLabel="Low" />
      </div>,
    );

    expect(html).not.toContain('dir="ltr"');
  });

  it("inherits RTL direction for the thumb position and keyboard movement", async () => {
    const ui = render(
      <div dir="rtl">
        <Slider aria-label="Volume" defaultValue={60} max={100} min={0} />
      </div>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-slider")!;
    const thumb = ui.getByRole("slider", { name: "Volume" });

    await waitFor(() => expect(getComputedStyle(root).direction).toBe("rtl"));
    expect(root.style.getPropertyValue("--slider-thumb-transform")).toBe("translateX(50%)");
    fireEvent.focus(thumb);
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    await waitFor(() => expect(thumb.getAttribute("aria-valuenow")).toBe("61"));
  });

  it("inherits RTL direction for range thumb positioning and keyboard movement", async () => {
    const ui = render(
      <div dir="rtl">
        <SliderRange defaultHighValue={80} defaultLowValue={20} highLabel="High" lowLabel="Low" />
      </div>,
    );
    const root = ui.container.querySelector<HTMLElement>(".sk-slider-range")!;
    const thumb = ui.getByRole("slider", { name: "Low" });

    await waitFor(() => expect(getComputedStyle(root).direction).toBe("rtl"));
    expect(root.style.getPropertyValue("--slider-thumb-transform")).toBe("translateX(50%)");
    fireEvent.focus(thumb);
    fireEvent.keyDown(thumb, { key: "ArrowLeft" });
    await waitFor(() => expect(thumb.getAttribute("aria-valuenow")).toBe("21"));
  });

  it("dispatches sk:slidervaluechange with the same detail vanilla does", async () => {
    const onDom = vi.fn();
    const onValueChange = vi.fn();
    const ui = render(
      <Slider aria-label="Volume" defaultValue={20} max={100} min={0} step={1} onValueChange={onValueChange} />,
    );
    const root = ui.container.querySelector("[data-sk-slider]")!;
    const thumb = ui.getByRole("slider", { name: "Volume" });
    root.addEventListener("sk:slidervaluechange", onDom);

    // Zag only steps from the keyboard once the thumb is focused (same NumberField pattern).
    fireEvent.focus(thumb);
    await waitFor(() => expect(root.hasAttribute("data-focus")).toBe(true));

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    expect(onDom).toHaveBeenCalled();
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      value: onValueChange.mock.calls[0]![0],
    });
  });

  it("warns in development when there is no accessible name", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Slider defaultValue={20} max={100} min={0} />);

    expect(spy.mock.calls.at(-1)?.[0]).toMatch(/no accessible name/i);
    spy.mockRestore();
  });

  it("does not warn when named by aria-labelledby alone", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <>
        <span id="volume-label">Volume</span>
        <Slider aria-labelledby="volume-label" defaultValue={20} max={100} min={0} />
      </>,
    );

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
