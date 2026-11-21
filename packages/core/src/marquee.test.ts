import { describe, expect, it } from "vitest";
import { marqueeCadenceMilliseconds, marqueeDurationSeconds } from "./marquee.js";

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
