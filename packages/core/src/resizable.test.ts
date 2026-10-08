import { describe, expect, it } from "vitest";
import {
  resizableCollapseTarget,
  resizableHandleOrientation,
  resizableHandleRange,
  resizableIsCollapsed,
  resizablePercentFromPixels,
  resolveInitialSizes,
  resolvePanelResize,
  resolveResizableCommand,
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

describe("collapsible panels", () => {
  const collapsible = (minSize = 20, collapsedSize = 0, maxSize = 100): ResizablePanelSpec => ({ minSize, maxSize, collapsible: true, collapsedSize });
  const plain = (minSize = 10): ResizablePanelSpec => ({ minSize, maxSize: 100 });
  const panels = [collapsible(), plain()];

  it("stops at the floor like any panel until it is dragged well past it", () => {
    /* 30 -> 15 is nearer the floor (20) than to collapsed (0): it rests on the floor, not in between. */
    expect(resolvePanelResize({ sizes: [30, 70], panels, index: 0, delta: -15 })).toEqual([20, 80]);
  });

  it("snaps shut past the midpoint between its floor and its collapsed size", () => {
    expect(resolvePanelResize({ sizes: [30, 70], panels, index: 0, delta: -25 })).toEqual([0, 100]);
    expect(resolvePanelResize({ sizes: [30, 70], panels, index: 0, delta: -Infinity })).toEqual([0, 100]);
  });

  it("is never in between: collapsed or at least its floor", () => {
    for (let delta = -30; delta <= 30; delta += 1) {
      const [size] = resolvePanelResize({ sizes: [30, 70], panels, index: 0, delta });
      expect(size === 0 || size! >= 20).toBe(true);
    }
  });

  it("snaps back open to the floor once dragged out past the same midpoint", () => {
    expect(resolvePanelResize({ sizes: [0, 100], panels, index: 0, delta: 4 })).toEqual([0, 100]);
    expect(resolvePanelResize({ sizes: [0, 100], panels, index: 0, delta: 12 })).toEqual([20, 80]);
    expect(resolvePanelResize({ sizes: [0, 100], panels, index: 0, delta: 45 })).toEqual([45, 55]);
  });

  it("works from the other side of the bar, and keeps a rail when collapsedSize is above zero", () => {
    const rail = [plain(), collapsible(20, 5)];
    expect(resolvePanelResize({ sizes: [70, 30], panels: rail, index: 0, delta: Infinity })).toEqual([95, 5]);
    /* Dragging it back out: a little still reads as shut, enough opens it to its floor, more follows the pointer. */
    expect(resolvePanelResize({ sizes: [95, 5], panels: rail, index: 0, delta: -5 })).toEqual([95, 5]);
    expect(resolvePanelResize({ sizes: [95, 5], panels: rail, index: 0, delta: -12 })).toEqual([80, 20]);
    expect(resolvePanelResize({ sizes: [95, 5], panels: rail, index: 0, delta: -40 })).toEqual([55, 45]);
  });

  it("leaves a panel without `collapsible` exactly as it was: the floor holds", () => {
    expect(resolvePanelResize({ sizes: [30, 70], panels: [plain(), plain()], index: 0, delta: -Infinity })).toEqual([10, 90]);
  });

  it("does not collapse when the neighbour cannot take the room", () => {
    const capped = [collapsible(), { minSize: 10, maxSize: 60 }];
    expect(resolvePanelResize({ sizes: [40, 60], panels: capped, index: 0, delta: -Infinity })).toEqual([40, 60]);
  });

  it("reports the whole travel, collapsed end included", () => {
    expect(resizableHandleRange({ sizes: [30, 70], panels, index: 0 })).toEqual({ now: 30, min: 0, max: 90 });
    expect(resizableHandleRange({ sizes: [30, 70], panels: [plain(), plain()], index: 0 })).toEqual({ now: 30, min: 10, max: 90 });
  });

  it("says whether a panel is collapsed, and only a collapsible one can be", () => {
    expect(resizableIsCollapsed(0, collapsible())).toBe(true);
    expect(resizableIsCollapsed(5, collapsible(20, 5))).toBe(true);
    expect(resizableIsCollapsed(30, collapsible())).toBe(false);
    expect(resizableIsCollapsed(0, plain())).toBe(false);
  });
});

describe("resizable commands", () => {
  const panels: ResizablePanelSpec[] = [
    { minSize: 20, maxSize: 100, collapsible: true, collapsedSize: 0 },
    { minSize: 10, maxSize: 100 },
    { minSize: 10, maxSize: 100, collapsible: true, collapsedSize: 0 },
  ];
  const initial = [30, 40, 30];
  const run = (sizes: number[], command: Parameters<typeof resolveResizableCommand>[0]["command"], restore?: (number | undefined)[]) =>
    resolveResizableCommand({ sizes, panels, initial, restore, command });

  it("collapses a panel and gives its room to the neighbour across the bar", () => {
    expect(run([30, 40, 30], { action: "collapse", panel: 0 })).toEqual([0, 70, 30]);
    /* The last panel has no bar after it: its room goes back across the one before. */
    expect(run([30, 40, 30], { action: "collapse", panel: 2 })).toEqual([30, 70, 0]);
  });

  it("expands to what it had before, or to its initial size, never below its floor", () => {
    expect(run([0, 70, 30], { action: "expand", panel: 0 }, [45])).toEqual([45, 25, 30]);
    expect(run([0, 70, 30], { action: "expand", panel: 0 })).toEqual([30, 40, 30]);
    expect(run([0, 70, 30], { action: "expand", panel: 0 }, [5])).toEqual([20, 50, 30]);
  });

  it("toggles, and changes nothing when asked for what is already so", () => {
    const closed = run([30, 40, 30], { action: "toggle", panel: 0 });
    expect(closed).toEqual([0, 70, 30]);
    expect(run([...closed], { action: "toggle", panel: 0 })).toEqual([30, 40, 30]);
    const sizes = [30, 40, 30];
    expect(run(sizes, { action: "expand", panel: 0 })).toBe(sizes);
    const shut = [0, 70, 30];
    expect(run(shut, { action: "collapse", panel: 0 })).toBe(shut);
  });

  it("ignores a panel that is not collapsible", () => {
    const sizes = [30, 40, 30];
    expect(run(sizes, { action: "collapse", panel: 1 })).toBe(sizes);
  });

  it("resets every size, which also opens whatever was closed", () => {
    expect(run([0, 70, 30], { action: "reset" })).toEqual(initial);
  });

  it("picks the panel a collapse key acts on: a closed neighbour first, else the one before the bar", () => {
    expect(resizableCollapseTarget({ sizes: [30, 40, 30], panels, index: 0 })).toBe(0);
    expect(resizableCollapseTarget({ sizes: [30, 40, 30], panels, index: 1 })).toBe(2);
    expect(resizableCollapseTarget({ sizes: [30, 40, 0], panels, index: 1 })).toBe(2);
    expect(resizableCollapseTarget({ sizes: [30, 40, 30], panels: [{ minSize: 10, maxSize: 100 }, { minSize: 10, maxSize: 100 }], index: 0 })).toBeUndefined();
  });
});
