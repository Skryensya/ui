import { describe, expect, it } from "vitest";
import { bandPlacement, glideDuration, ringPerspective, ringPlacement, ringRadius, ringStep, wrapDelta } from "./curve-ring.js";

describe("the wheel's geometry", () => {
  it("takes the shortest way round a loop: the infinite roll", () => {
    expect(wrapDelta(0, 7, 8)).toBe(-1);
    expect(wrapDelta(7, 0, 8)).toBe(1);
    expect(wrapDelta(2, 5, 8)).toBe(3);
    expect(wrapDelta(0.4, 0, 8)).toBeCloseTo(-0.4);
  });

  it("spaces the slides so five are in view, and spreads few slides just enough to hide the hand-off", () => {
    expect((ringStep("concave", 8) * 180) / Math.PI).toBeCloseTo(26);
    expect((ringStep("convex", 12) * 180) / Math.PI).toBeCloseTo(32);
    expect((ringStep("concave", 4) * 180) / Math.PI).toBeCloseTo(42.5); // the hand-off at ±2 stays at 85°
    const step = ringStep("concave", 8);
    // neighbours just meet: the chord between them is one pitch
    expect(2 * ringRadius(step, 200) * Math.sin(step / 2)).toBeCloseTo(200);
  });

  it("shows five slides: the front one and two each side, the third out of sight", () => {
    for (const curve of ["concave", "convex"] as const) {
      const step = ringStep(curve, 8);
      const r = ringRadius(step, 200);
      const visible = [-3, -2, -1, 0, 1, 2, 3].filter((d) => ringPlacement(d, curve, step, r).opacity > 0.5);
      expect(visible).toEqual([-2, -1, 0, 1, 2]);
    }
  });

  it("puts the front slide flat at the front, and turns neighbours along the tangent", () => {
    const step = Math.PI / 4;
    const r = ringRadius(step, 200);
    expect(ringPlacement(0, "concave", step, r)).toMatchObject({ x: 0, z: 0, angle: -0, opacity: 1 });
    const right = ringPlacement(1, "concave", step, r);
    expect(right.x).toBeGreaterThan(0);
    expect(right.z).toBeGreaterThan(0); // inside the ring the sides come towards the camera
    expect(right.angle).toBeCloseTo(-45);
    const out = ringPlacement(1, "convex", step, r);
    expect(out.z).toBeLessThan(0); // outside it they go back
    expect(out.angle).toBeCloseTo(45);
  });

  it("hides what is round the back of the wheel", () => {
    const step = Math.PI / 4;
    const r = ringRadius(step, 200);
    expect(ringPlacement(3, "convex", step, r).opacity).toBe(0); // 135°
    expect(ringPlacement(2, "concave", step, r).opacity).toBe(0); // 90°, beside the camera
    expect(ringPlacement(4, "convex", step, r).zIndex).toBeLessThan(ringPlacement(0, "convex", step, r).zIndex);
  });

  it("fades a side slide inside the ring by how much it has grown, so a strong lens never paints it huge", () => {
    const step = Math.PI / 6;
    const r = ringRadius(step, 200);
    const strong = ringPerspective("concave", r, 2.5);
    // 52.5° is inside the angle limit: only the growth (about 2× with the strong lens) fades it.
    expect(ringPlacement(1.75, "concave", step, r, strong).opacity).toBeLessThan(1);
    expect(ringPlacement(1.75, "concave", step, r, ringPerspective("concave", r, 1)).opacity).toBe(1);
  });

  it("brings the camera closer with strength, within its bounds", () => {
    expect(ringPerspective("concave", 100, 2)).toBe(100);
    expect(ringPerspective("concave", 100, 99)).toBe(ringPerspective("concave", 100, 2.5));
    expect(ringPerspective("convex", 100, 1)).toBe(300);
  });

  it("bends a band onto the same circle, relative to its slide", () => {
    expect(bandPlacement(0, "concave", 300)).toMatchObject({ x: 0, z: 0 });
    const edge = bandPlacement(60, "concave", 300);
    expect(edge.z).toBeGreaterThan(0);
    expect(edge.x).toBeLessThan(0); // the arc is shorter than the flat offset
  });

  it("glides for longer the faster and farther it was thrown, within bounds", () => {
    expect(glideDuration(2, 0.01)).toBe(600);
    expect(glideDuration(0, 0)).toBe(320);
    expect(glideDuration(50, 0.001)).toBe(1800);
  });
});
