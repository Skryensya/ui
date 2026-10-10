import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { COMPARE_SLIDER_CHANGE_EVENT, connectCompareSlider, mountCompareSlider } from "./compare-slider.js";

/* jsdom lays nothing out, so the box reports a fixed rect: 1000 wide, 400 tall, at the origin. */
function build(options: { direction?: "horizontal" | "vertical"; position?: number } = {}) {
  const { direction, position } = options;
  document.body.innerHTML = "";
  const root = document.createElement("div");
  root.className = "sk-compare-slider";
  root.setAttribute("data-sk-compare-slider", "");
  if (direction) root.setAttribute("data-direction", direction);
  if (position !== undefined) root.setAttribute("data-position", String(position));
  root.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1000, bottom: 400, width: 1000, height: 400 }) as DOMRect;
  root.innerHTML = `
    <div class="sk-compare-slider__before">Before</div>
    <div class="sk-compare-slider__after">After</div>
    <div class="sk-compare-slider__handle" aria-label="Compare"><span class="sk-compare-slider__grip sk-grip" aria-hidden="true"></span></div>`;
  document.body.append(root);
  const handle = root.querySelector<HTMLElement>(".sk-compare-slider__handle")!;
  return { root, handle };
}

/* The position is read where it is announced: the divider's `aria-valuenow`. The root's `--sk-compare-slider-position` is only the INITIAL position now (moving it restyled both layers on every pointer move). */
const at = (root: HTMLElement) => Number(root.querySelector(".sk-compare-slider__handle")!.getAttribute("aria-valuenow"));
const key = (handle: HTMLElement, name: string, init: KeyboardEventInit = {}) =>
  handle.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...init }));
const pointer = (target: HTMLElement, type: string, clientX: number, clientY = 0) =>
  target.dispatchEvent(Object.assign(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY, button: 0 }), { pointerId: 1 }));

describe("connectCompareSlider", () => {
  let cleanup: () => void;
  beforeEach(() => {
    cleanup = () => {};
  });
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("makes the divider a named slider and writes where it starts", () => {
    const { root, handle } = build({ position: 30 });
    cleanup = connectCompareSlider(root);
    expect(handle.getAttribute("role")).toBe("slider");
    expect(handle.getAttribute("aria-valuenow")).toBe("30");
    expect(handle.getAttribute("aria-valuemin")).toBe("0");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    expect(handle.getAttribute("aria-orientation")).toBe("horizontal");
    expect(at(root)).toBe(30);
  });

  it("starts at an end when it is told to: a position of 0 is a position, not a missing one", () => {
    const { root, handle } = build({ position: 0 });
    cleanup = connectCompareSlider(root);
    expect(at(root)).toBe(0);
    expect(handle.getAttribute("aria-valuenow")).toBe("0");
    key(handle, "Enter");
    expect(at(root)).toBe(0);
  });

  it("starts in the middle with no position", () => {
    const { root } = build();
    cleanup = connectCompareSlider(root);
    expect(at(root)).toBe(50);
  });

  it("moves with the arrows, Shift for ten, Home and End for the ends, Enter back to the start", () => {
    const { root, handle } = build({ position: 40 });
    cleanup = connectCompareSlider(root);
    key(handle, "ArrowRight");
    expect(at(root)).toBe(41);
    key(handle, "ArrowLeft", { shiftKey: true });
    expect(at(root)).toBe(31);
    key(handle, "End");
    expect(at(root)).toBe(100);
    key(handle, "Home");
    expect(at(root)).toBe(0);
    key(handle, "Enter");
    expect(at(root)).toBe(40);
  });

  it("uses Up and Down, and the vertical axis of a pointer, when the layers are stacked", () => {
    const { root, handle } = build({ direction: "vertical" });
    cleanup = connectCompareSlider(root);
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    key(handle, "ArrowRight");
    expect(at(root)).toBe(50);
    key(handle, "ArrowDown");
    expect(at(root)).toBe(51);
    pointer(root, "pointerdown", 0, 100);
    expect(at(root)).toBe(25);
  });

  it("jumps to a press anywhere on the box, and follows the pointer until it is released", () => {
    const { root } = build();
    cleanup = connectCompareSlider(root);
    pointer(root, "pointerdown", 250);
    expect(at(root)).toBe(25);
    expect(root.hasAttribute("data-dragging")).toBe(true);
    pointer(root, "pointermove", 800);
    expect(at(root)).toBe(80);
    pointer(root, "pointerup", 800);
    expect(root.hasAttribute("data-dragging")).toBe(false);
    pointer(root, "pointermove", 100);
    expect(at(root)).toBe(80);
  });

  it("never leaves the box", () => {
    const { root } = build();
    cleanup = connectCompareSlider(root);
    pointer(root, "pointerdown", 5000);
    expect(at(root)).toBe(100);
    pointer(root, "pointermove", -400);
    expect(at(root)).toBe(0);
  });

  it("announces every change on the root", () => {
    const { root, handle } = build();
    cleanup = connectCompareSlider(root);
    const seen: number[] = [];
    root.addEventListener(COMPARE_SLIDER_CHANGE_EVENT, (event) => seen.push((event as CustomEvent<{ position: number }>).detail.position));
    key(handle, "ArrowRight");
    key(handle, "ArrowRight", { shiftKey: true });
    expect(seen).toEqual([51, 61]);
  });

  it("stops listening once cleaned up", () => {
    const { root, handle } = build();
    const stop = connectCompareSlider(root);
    stop();
    key(handle, "ArrowRight");
    pointer(root, "pointerdown", 900);
    expect(at(root)).toBe(50);
  });

  it("mounts from the data attribute", async () => {
    const { root } = build({ position: 70 });
    mountCompareSlider(document.body);
    await Promise.resolve();
    expect(at(root)).toBe(70);
  });
});
