import { describe, expect, it } from "vitest";
import {
  resizableHandleOrientation,
  resizableHandleRange,
  resizablePercentFromPixels,
  resolveInitialSizes,
  resolvePanelResize,
  type ResizablePanelSpec,
} from "./resizable.js";

const spec = (size?: number, minSize = 10, maxSize = 100): ResizablePanelSpec => ({ size, minSize, maxSize });
const sum = (sizes: readonly number[]) => sizes.reduce((a, b) => a + b, 0);

describe("resolveInitialSizes", () => {
  it("splits equally when nothing is authored", () => {
    expect(resolveInitialSizes([spec(), spec()])).toEqual([50, 50]);
    expect(resolveInitialSizes([spec(), spec(), spec(), spec()])).toEqual([25, 25, 25, 25]);
  });

  it("keeps authored sizes and shares the rest among the unsized", () => {
    expect(resolveInitialSizes([spec(30), spec(), spec()])).toEqual([30, 35, 35]);
  });

  it("scales authored sizes that do not add up to 100", () => {
    expect(resolveInitialSizes([spec(25), spec(25)])).toEqual([50, 50]);
    expect(resolveInitialSizes([spec(80), spec(80)])).toEqual([50, 50]);
  });

  it("holds every size inside its bounds and still fills the box", () => {
    const sizes = resolveInitialSizes([spec(5, 20, 100), spec(95, 10, 60)]);
    expect(sizes[0]).toBeGreaterThanOrEqual(20);
    expect(sizes[1]).toBeLessThanOrEqual(60);
    expect(sum(sizes)).toBeCloseTo(100);
  });

  it("is empty for no panels", () => {
    expect(resolveInitialSizes([])).toEqual([]);
  });
});

describe("resolvePanelResize", () => {
  const panels = [spec(), spec(), spec()];

  it("moves the boundary and conserves the pair", () => {
    const next = resolvePanelResize({ sizes: [40, 30, 30], panels, index: 0, delta: 10 });
    expect(next).toEqual([50, 20, 30]);
  });

  it("never touches a panel that is not part of the pair", () => {
    const next = resolvePanelResize({ sizes: [40, 30, 30], panels, index: 1, delta: -5 });
    expect(next[0]).toBe(40);
    expect(sum(next)).toBe(100);
  });

  it("clamps at either panel's bounds", () => {
    expect(resolvePanelResize({ sizes: [40, 30, 30], panels, index: 0, delta: 1000 })).toEqual([60, 10, 30]);
    expect(resolvePanelResize({ sizes: [40, 30, 30], panels, index: 0, delta: -1000 })).toEqual([10, 60, 30]);
  });

  it("saturates for Home and End", () => {
    expect(resolvePanelResize({ sizes: [40, 30, 30], panels, index: 0, delta: Infinity })[1]).toBe(10);
    expect(resolvePanelResize({ sizes: [40, 30, 30], panels, index: 0, delta: -Infinity })[0]).toBe(10);
  });

  it("respects a maxSize", () => {
    const capped = [spec(undefined, 10, 45), spec(), spec()];
    expect(resolvePanelResize({ sizes: [40, 30, 30], panels: capped, index: 0, delta: 20 })[0]).toBe(45);
  });

  it("returns the sizes untouched for an index with no pair", () => {
    const sizes = [60, 40];
    expect(resolvePanelResize({ sizes, panels: [spec(), spec()], index: 1, delta: 5 })).toBe(sizes);
  });
});

describe("handle helpers", () => {
  it("reports the panel before the bar and its travel", () => {
    const range = resizableHandleRange({ sizes: [40, 60], panels: [spec(), spec()], index: 0 });
    expect(range).toEqual({ now: 40, min: 10, max: 90 });
  });

  it("announces the opposite orientation to the layout axis", () => {
    expect(resizableHandleOrientation("horizontal")).toBe("vertical");
    expect(resizableHandleOrientation("vertical")).toBe("horizontal");
  });

  it("converts pixels to a percentage and survives an empty group", () => {
    expect(resizablePercentFromPixels(50, 500)).toBe(10);
    expect(resizablePercentFromPixels(50, 0)).toBe(0);
  });
});
