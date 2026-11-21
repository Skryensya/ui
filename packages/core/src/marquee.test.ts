import { describe, expect, it } from "vitest";
import { marqueeCadenceMilliseconds, marqueeDurationSeconds, marqueeRevealTime } from "./marquee.js";

describe("marqueeCadenceMilliseconds", () => {
  it("reads a cadence in either unit, which is how the minified token ships (`.96s`)", () => {
    expect(marqueeCadenceMilliseconds("960ms")).toBe(960);
    expect(marqueeCadenceMilliseconds(" .96s")).toBe(960);
    expect(marqueeCadenceMilliseconds("1.44S")).toBeCloseTo(1440);
    expect(marqueeCadenceMilliseconds("640")).toBe(640);
  });

  it("gives up on anything that is not a time, which the duration then ignores", () => {
    for (const value of ["", "auto", "1min", "var(--x)"]) {
      expect(marqueeCadenceMilliseconds(value)).toBeNaN();
      expect(marqueeDurationSeconds(1000, marqueeCadenceMilliseconds(value))).toBe(0);
    }
  });

  it("gives the same duration for the same cadence in both units", () => {
    expect(marqueeDurationSeconds(1200, marqueeCadenceMilliseconds(".96s"))).toBe(
      marqueeDurationSeconds(1200, marqueeCadenceMilliseconds("960ms")),
    );
  });
});

describe("marqueeRevealTime", () => {
  const base = { run: 1000, duration: 10_000, reverse: false };

  it("moves forward by the delta, as time on a left-running strip", () => {
    expect(marqueeRevealTime({ ...base, offset: -200, delta: 100 })).toBe(3000);
    expect(marqueeRevealTime({ ...base, offset: -200, delta: -100 })).toBe(1000);
  });

  it("maps the same offset to mirrored time on a reversed strip", () => {
    expect(marqueeRevealTime({ ...base, reverse: true, offset: -300, delta: 0 })).toBe(7000);
  });

  it("clamps to the real run, never wrapping onto the hidden copy", () => {
    expect(marqueeRevealTime({ ...base, offset: -100, delta: -500 })).toBe(0);
    expect(marqueeRevealTime({ ...base, offset: -900, delta: 500 })).toBeLessThan(base.duration);
  });

  it("gives 0 for a strip it cannot measure", () => {
    expect(marqueeRevealTime({ ...base, run: 0, offset: 0, delta: 10 })).toBe(0);
  });
});
