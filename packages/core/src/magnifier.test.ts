import { describe, expect, it } from "vitest";
import {
  MAGNIFIER_FOLLOW_SPRING,
  MAGNIFIER_SCALE_SPRING,
  magnifierClampZoom,
  magnifierContentBox,
  magnifierPlace,
  magnifierSpringSettled,
  magnifierSpringStep,
} from "./magnifier.js";

const box = { left: 100, top: 50, width: 400, height: 200 };
const root = { left: 90, top: 40, width: 420, height: 220 };

describe("magnifierPlace", () => {
  it("centres the lens on the pointer, in the root, and maps the pointer onto the picture", () => {
    const place = magnifierPlace({ pointerX: 300, pointerY: 100, root, visible: box, content: box, lensSize: 80 });
    expect(place).toEqual({ inside: true, near: true, fit: 1, x: 170, y: 20, u: 0.5, v: 0.25, spanU: 0.2, spanV: 0.4, bounds: [0, 0, 1, 1] });
  });

  it("is whole anywhere over the picture, corners included, and shrinks only past the edge", () => {
    /* A 100px lens (grace 35px) over a picture from (100, 50) to (500, 250). */
    const at = (pointerX: number, pointerY = 150) => magnifierPlace({ pointerX, pointerY, root, visible: box, content: box, lensSize: 100 });
    expect(at(450).fit).toBe(1);
    expect(at(500).fit).toBe(1);
    expect(at(500, 250).fit).toBe(1);
    expect(at(100, 50).fit).toBe(1);
    expect(at(517.5)).toMatchObject({ inside: false, near: true });
    expect(at(517.5).fit).toBeCloseTo(0.5);
    expect(at(505).fit).toBeGreaterThan(0.9);
    expect(at(535).fit).toBeCloseTo(0);
    expect(at(536).near).toBe(false);
  });

  it("bounds a cover crop to the part of the picture the page shows", () => {
    /* A square picture covering a 400x200 box: only its middle half, top to bottom, is on the page. */
    const content = magnifierContentBox(box, [100, 100], "cover");
    const place = magnifierPlace({ pointerX: 300, pointerY: 150, root, visible: box, content, lensSize: 80 });
    expect(place.bounds).toEqual([0, 0.25, 1, 0.75]);
  });

  it("raises the lens by the lift and still shows the spot under the pointer", () => {
    const lifted = magnifierPlace({ pointerX: 300, pointerY: 100, root, visible: box, content: box, lensSize: 80, lift: 60 });
    expect(lifted).toMatchObject({ x: 170, y: -40, u: 0.5, v: 0.25 });
  });

  it("drops the lens below the pointer when there is no room above it", () => {
    /* Lifted 60 from y 100, an 80px lens would start at 0: under a 20px sticky header, so it goes below instead. */
    const below = magnifierPlace({ pointerX: 300, pointerY: 100, root, visible: box, content: box, lensSize: 80, lift: 60, topLimit: 20 });
    expect(below.y).toBe(100 - 40 - 40 + 60);
  });

  it("is outside past any edge of the visible box", () => {
    expect(magnifierPlace({ pointerX: 99, pointerY: 100, root, visible: box, content: box, lensSize: 80 }).inside).toBe(false);
    expect(magnifierPlace({ pointerX: 300, pointerY: 251, root, visible: box, content: box, lensSize: 80 }).inside).toBe(false);
  });

  it("never divides by an empty box", () => {
    const empty = { left: 0, top: 0, width: 0, height: 0 };
    const place = magnifierPlace({ pointerX: 0, pointerY: 0, root: empty, visible: empty, content: empty, lensSize: 80 });
    expect(place.inside).toBe(false);
    expect(place.spanU).toBe(0);
  });
});

describe("magnifierContentBox", () => {
  it("overflows the box for cover and fits inside it for contain, centred", () => {
    /* A square picture in a 400x200 box. */
    expect(magnifierContentBox(box, [100, 100], "cover")).toEqual({ left: 100, top: -50, width: 400, height: 400 });
    expect(magnifierContentBox(box, [100, 100], "contain")).toEqual({ left: 200, top: 50, width: 200, height: 200 });
  });

  it("is the box itself for fill, or before the picture has a size", () => {
    expect(magnifierContentBox(box, [100, 100], "fill")).toBe(box);
    expect(magnifierContentBox(box, [0, 0], "cover")).toBe(box);
  });
});

describe("magnifierClampZoom", () => {
  it("holds the zoom in 1..8 and falls back to 2", () => {
    expect(magnifierClampZoom(0.5)).toBe(1);
    expect(magnifierClampZoom(20)).toBe(8);
    expect(magnifierClampZoom(Number.NaN)).toBe(2);
  });
});

describe("magnifierSpringStep", () => {
  const run = (config = MAGNIFIER_FOLLOW_SPRING, seconds = 1, target = 100) => {
    let spring = { x: 0, v: 0 };
    let peak = 0;
    for (let t = 0; t < seconds; t += 1 / 60) {
      spring = magnifierSpringStep(spring, target, 1 / 60, config);
      peak = Math.max(peak, spring.x);
    }
    return { spring, peak };
  };

  it("trails only a little, then arrives and comes to rest at the target", () => {
    const first = magnifierSpringStep({ x: 0, v: 0 }, 100, 1 / 60, MAGNIFIER_FOLLOW_SPRING);
    expect(first.x).toBeGreaterThan(20);
    expect(first.x).toBeLessThan(100);
    const { spring } = run();
    expect(magnifierSpringSettled(spring, 100, MAGNIFIER_FOLLOW_SPRING)).toBe(true);
  });

  it("follows with barely an overshoot, and appears without one", () => {
    expect(run(MAGNIFIER_FOLLOW_SPRING).peak).toBeLessThan(103);
    expect(run(MAGNIFIER_SCALE_SPRING, 1, 1).peak).toBeLessThanOrEqual(1.001);
  });

  it("stays stable through a long frame", () => {
    const spring = magnifierSpringStep({ x: 0, v: 0 }, 100, 2, MAGNIFIER_SCALE_SPRING);
    expect(Number.isFinite(spring.x)).toBe(true);
    expect(Math.abs(spring.x)).toBeLessThan(300);
  });
});

