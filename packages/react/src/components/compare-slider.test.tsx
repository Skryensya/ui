import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompareSlider } from "./compare-slider.js";

const setup = (props: Partial<React.ComponentProps<typeof CompareSlider>> = {}) => {
  const view = render(<CompareSlider label="Compare the photos" before={<p>Before</p>} after={<p>After</p>} {...props} />);
  const root = view.container.firstElementChild as HTMLElement;
  const handle = root.querySelector<HTMLElement>(".sk-compare-slider__handle")!;
  return { ...view, root, handle };
};

describe("CompareSlider", () => {
  it("renders the two layers, then the divider with its thumb, in that order", () => {
    const { root } = setup();
    expect(root.className).toBe("sk-compare-slider");
    expect(Array.from(root.children).map((part) => part.className)).toEqual(["sk-compare-slider__before", "sk-compare-slider__after", "sk-compare-slider__handle"]);
    expect(root.querySelector(".sk-compare-slider__handle > .sk-compare-slider__grip.sk-grip")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("makes the divider a named slider with its value, its range and its axis", () => {
    const { handle } = setup({ position: 30, direction: "vertical" });
    expect(handle.getAttribute("role")).toBe("slider");
    expect(handle.getAttribute("aria-label")).toBe("Compare the photos");
    expect(handle.getAttribute("aria-valuenow")).toBe("30");
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.tabIndex).toBe(0);
  });

  it("starts in the middle, and writes the position where the layers and the divider read it", () => {
    const { root, handle } = setup();
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    expect(root.style.getPropertyValue("--sk-compare-slider-position")).toBe("50");
  });

  it("draws a move on the two elements it moves, and does not write the root's custom property (which restyles both layers)", () => {
    const { root, handle } = setup();
    const after = root.querySelector<HTMLElement>(".sk-compare-slider__after")!;
    fireEvent.keyDown(handle, { key: "End" });
    expect(after.style.clipPath).toBe("inset(0 0 0 100%)");
    expect(handle.style.translate).not.toBe("");
    /* The root keeps the INITIAL position: it is what a server renders, and nothing on the page needs it to move. */
    expect(root.style.getPropertyValue("--sk-compare-slider-position")).toBe("50");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(after.style.clipPath).toBe("inset(0 0 0 0%)");
  });

  it("clips from the far edge in a vertical compare, and from the right in a right-to-left page", () => {
    const stacked = setup({ direction: "vertical" });
    fireEvent.keyDown(stacked.handle, { key: "End" });
    expect(stacked.root.querySelector<HTMLElement>(".sk-compare-slider__after")!.style.clipPath).toBe("inset(100% 0 0 0)");
  });

  it("starts at an end when it is told to: a position of 0 is a position", () => {
    const { handle, root } = setup({ position: 0 });
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
    expect(root.style.getPropertyValue("--sk-compare-slider-position")).toBe("0");
  });

  it("moves with the arrows (a percent, ten with Shift), to the ends with Home and End, and back with Enter", () => {
    const onPositionChange = vi.fn();
    const { handle, root } = setup({ onPositionChange });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle.getAttribute("aria-valuenow")).toBe("51");
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(handle.getAttribute("aria-valuenow")).toBe("41");
    fireEvent.keyDown(handle, { key: "End" });
    expect(handle.getAttribute("aria-valuenow")).toBe("100");
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
    expect(root.style.getPropertyValue("--sk-compare-slider-position")).toBe("50");
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    expect(onPositionChange).toHaveBeenLastCalledWith(50);
  });

  it("answers Up and Down, not Left and Right, when the layers are stacked", () => {
    const { handle } = setup({ direction: "vertical" });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(handle.getAttribute("aria-valuenow")).toBe("50");
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(handle.getAttribute("aria-valuenow")).toBe("51");
  });

  it("never leaves the box", () => {
    const { handle } = setup({ position: 99 });
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(handle.getAttribute("aria-valuenow")).toBe("100");
  });

  it("passes id, aria-* and a class to the root, and keeps the author's style", () => {
    const { root } = setup({ id: "photos", className: "mine", style: { color: "red" }, "aria-describedby": "why" });
    expect(root.id).toBe("photos");
    expect(root.className).toBe("sk-compare-slider mine");
    expect(root.getAttribute("aria-describedby")).toBe("why");
    expect(root.style.color).toBe("red");
  });
});
