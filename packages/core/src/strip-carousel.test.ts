import { describe, expect, it } from "vitest";
import { STRIP_MAX_DISTANCE, stripDistance } from "./strip-carousel.js";

describe("the strips' distances", () => {
  it("counts away from the open item on both sides, capped where the widths stop differing", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((i) => stripDistance(i, 2))).toEqual([2, 1, 0, 1, 2, 3, 4, 4]);
    expect(stripDistance(20, 0)).toBe(STRIP_MAX_DISTANCE);
  });
});
