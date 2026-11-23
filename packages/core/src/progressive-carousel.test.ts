import { describe, expect, it } from "vitest";
import { forwardDistance, progressiveGaps, progressiveHover, progressiveSlot, progressiveWidths } from "./progressive-carousel.js";

describe("the progressive row", () => {
  it("is the active slide, three that shrink, then the narrowest strips, filling the width gaps included", () => {
    const widths = progressiveWidths(1000, 4, 10);
    // Eight on show (four large, four narrowest); the others wait off-stage.
    expect(widths).toHaveLength(8);
    for (let k = 1; k < 4; k++) expect(widths[k]!).toBeLessThan(widths[k - 1]!);
    expect(widths[4]!).toBeLessThan(widths[3]!);
    expect(new Set(widths.slice(4).map((w) => w.toFixed(3))).size).toBe(1);
    const gaps = progressiveGaps(8, 4);
    expect(widths.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0)).toBeCloseTo(1000);
  });

  it("halves the gap among the narrowest strips and from the last large slide to them", () => {
    expect(progressiveGaps(8, 4)).toEqual([4, 4, 4, 2, 2, 2, 2]);
    expect(progressiveGaps(3, 4)).toEqual([4, 4]);
  });

  it("keeps one slide off-stage, and is a plain carousel when narrow", () => {
    expect(progressiveWidths(1000, 4, 6)).toHaveLength(5);
    expect(progressiveWidths(360, 3, 6)).toEqual([360]);
    expect(progressiveWidths(800, 4, 1)).toEqual([800]);
  });

  it("is circular: past the last comes the first, the one just left waits past the start edge", () => {
    expect(forwardDistance(5, 0, 6)).toBe(1);
    expect(progressiveSlot(0, 10, 5)).toEqual({ kind: "visible", place: 0 });
    expect(progressiveSlot(9, 10, 5)).toEqual({ kind: "before" });
    expect(progressiveSlot(5, 10, 5)).toEqual({ kind: "after" });
  });

  it("grows a larger slide more but by less of itself, and keeps the row as wide", () => {
    const widths = progressiveWidths(1000, 8, 10);
    const growth = [0, 2, 6].map((place) => {
      const grown = progressiveHover(widths, place, 1.6);
      expect(grown.reduce((a, b) => a + b, 0)).toBeCloseTo(widths.reduce((a, b) => a + b, 0));
      return { by: grown[place]! - widths[place]!, share: grown[place]! / widths[place]! };
    });
    expect(growth[0]!.by).toBeGreaterThan(growth[1]!.by);
    expect(growth[1]!.by).toBeGreaterThan(growth[2]!.by);
    expect(growth[2]!.share).toBeGreaterThan(growth[1]!.share);
    expect(growth[1]!.share).toBeGreaterThan(growth[0]!.share);
  });
});
