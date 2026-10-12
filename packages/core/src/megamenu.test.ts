import { describe, expect, it } from "vitest";
import { resolveMegamenuEvent, type MegamenuState } from "./megamenu.js";

const closed: MegamenuState = { openIndex: null, pinned: false };
const hovered = (openIndex: number): MegamenuState => ({ openIndex, pinned: false });
const pinned = (openIndex: number): MegamenuState => ({ openIndex, pinned: true });

describe("resolveMegamenuEvent. Activate (click / Enter / Space)", () => {
  it("opens a closed trigger", () => {
    expect(resolveMegamenuEvent(closed, { kind: "activate", index: 0 })).toEqual(pinned(0));
  });

  it("closes the SAME trigger when it was already pinned open. A toggle", () => {
    expect(resolveMegamenuEvent(pinned(0), { kind: "activate", index: 0 })).toEqual(closed);
  });

  it("clicking a hover-opened trigger closes it. The button does what aria-expanded says", () => {
    expect(resolveMegamenuEvent(hovered(0), { kind: "activate", index: 0 })).toEqual(closed);
  });

  it("a click right after the hover opened it (justOpened) pins it instead of undoing it", () => {
    expect(resolveMegamenuEvent(hovered(0), { kind: "activate", index: 0, justOpened: true })).toEqual(pinned(0));
  });

  it("justOpened never keeps a pinned panel open: a second click still closes", () => {
    expect(resolveMegamenuEvent(pinned(0), { kind: "activate", index: 0, justOpened: true })).toEqual(closed);
  });

  it("switches to a DIFFERENT trigger, closing whichever was open. Exclusivity", () => {
    expect(resolveMegamenuEvent(hovered(0), { kind: "activate", index: 2 })).toEqual(pinned(2));
  });
});

describe("resolveMegamenuEvent. Hover intent", () => {
  it("opens a trigger once the open-intent delay elapses", () => {
    expect(resolveMegamenuEvent(closed, { kind: "hoverIntentOpen", index: 1 })).toEqual(hovered(1));
  });

  it("hover-intent open also closes whichever other trigger was open", () => {
    expect(resolveMegamenuEvent(hovered(0), { kind: "hoverIntentOpen", index: 1 })).toEqual(hovered(1));
  });

  it("hover-switching keeps a pin: the user chose to browse with this menu open", () => {
    expect(resolveMegamenuEvent(pinned(0), { kind: "hoverIntentOpen", index: 1 })).toEqual(pinned(1));
  });

  it("closes the open trigger once its close-intent delay elapses", () => {
    expect(resolveMegamenuEvent(hovered(1), { kind: "hoverIntentClose", index: 1 })).toEqual(closed);
  });

  it("a pinned panel ignores the pointer leaving", () => {
    expect(resolveMegamenuEvent(pinned(1), { kind: "hoverIntentClose", index: 1 })).toEqual(pinned(1));
  });

  it("a STALE close-intent timer (for a trigger the user already left) is a no-op", () => {
    // The user hovered 0, then 1, before 0's own close timer fired. 0's timer must not close 1.
    expect(resolveMegamenuEvent(hovered(1), { kind: "hoverIntentClose", index: 0 })).toEqual(hovered(1));
  });

  it("a close-intent timer with nothing open is a no-op", () => {
    expect(resolveMegamenuEvent(closed, { kind: "hoverIntentClose", index: 0 })).toEqual(closed);
  });
});

describe("resolveMegamenuEvent. Escape / blur", () => {
  it("Escape closes whichever panel is open", () => {
    expect(resolveMegamenuEvent(pinned(2), { kind: "escape" })).toEqual(closed);
  });

  it("Escape with nothing open is a no-op (returns the same state)", () => {
    expect(resolveMegamenuEvent(closed, { kind: "escape" })).toBe(closed);
  });

  it("blur (focus leaves the bar+panel subtree) closes whichever panel is open", () => {
    expect(resolveMegamenuEvent(pinned(1), { kind: "blur" })).toEqual(closed);
  });

  it("blur with nothing open is a no-op (returns the same state)", () => {
    expect(resolveMegamenuEvent(closed, { kind: "blur" })).toBe(closed);
  });
});
