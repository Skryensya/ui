import { describe, expect, it } from "vitest";
import {
  baseScale,
  clampToCover,
  coverScale,
  covers,
  cropOf,
  defaultFrame,
  defaultValue,
  fitFrame,
  frameFromFractions,
  frameToFractions,
  imageCropperKeyAction,
  matrixOf,
  normalizeRotation,
  nudge,
  outputSize,
  parseAspect,
  placementFromValue,
  placementOf,
  resolveAspect,
  rotateAbout,
  rotatedBy,
  sameValue,
  serializeAspect,
  valueFromPlacement,
  zoomAbout,
  zoomRange,
  type ImageCropperValue,
  type Placement,
  type Rect,
  type Size,
} from "./image-cropper-model.js";

const image: Size = { width: 800, height: 600 };
const stage: Size = { width: 600, height: 400 };
const limits = { minZoom: 1, maxZoom: 4 };

/* A deterministic generator, so a failure names the exact numbers that broke the rule. */
function lcg(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("aspect", () => {
  it("reads free, original, a number and a ratio", () => {
    expect(parseAspect("free")).toBe("free");
    expect(parseAspect("original")).toBe("original");
    expect(parseAspect(1.5)).toBe(1.5);
    expect(parseAspect("16:9")).toBeCloseTo(16 / 9, 6);
    expect(parseAspect("16/9")).toBeCloseTo(16 / 9, 6);
    expect(parseAspect("1.25")).toBe(1.25);
  });

  it("falls back to free for anything that is not a positive ratio", () => {
    for (const bad of ["", "abc", "0", "-1", "4:0", 0, -2, Number.NaN, undefined, null, {}]) expect(parseAspect(bad)).toBe("free");
  });

  it("holds a circle to 1:1 whatever aspect was asked, and resolves original to the image's own", () => {
    expect(resolveAspect(16 / 9, "circle", image)).toBe(1);
    expect(resolveAspect("free", "circle", image)).toBe(1);
    expect(resolveAspect("free", "rectangle", image)).toBeNull();
    expect(resolveAspect("original", "rectangle", image)).toBeCloseTo(4 / 3, 6);
    expect(resolveAspect(2, "rectangle", image)).toBe(2);
  });

  it("round-trips through its attribute form", () => {
    for (const aspect of [1, 4 / 3, 16 / 9, "free", "original"] as const) {
      const back = parseAspect(serializeAspect(aspect));
      if (typeof aspect === "number") expect(back as number).toBeCloseTo(aspect, 3);
      else expect(back).toBe(aspect);
    }
  });
});

describe("window", () => {
  it("fits the ratio inside the stage with a margin, centred", () => {
    for (const ratio of [1, 4 / 3, 16 / 9, 9 / 16, 3]) {
      const frame = fitFrame(stage, ratio);
      expect(frame.width / frame.height).toBeCloseTo(ratio, 6);
      expect(frame.x).toBeGreaterThan(0);
      expect(frame.y).toBeGreaterThan(0);
      expect(frame.x + frame.width).toBeLessThan(stage.width);
      expect(frame.y + frame.height).toBeLessThan(stage.height);
      expect(frame.x + frame.width / 2).toBeCloseTo(stage.width / 2, 6);
      expect(frame.y + frame.height / 2).toBeCloseTo(stage.height / 2, 6);
    }
  });

  it("starts a free window as the image's own shape", () => {
    const frame = defaultFrame(stage, null, image);
    expect(frame.width / frame.height).toBeCloseTo(image.width / image.height, 6);
  });

  it("stores a window as fractions and reads it back, held inside the stage and above a minimum", () => {
    const frame: Rect = { x: 60, y: 40, width: 300, height: 200 };
    const back = frameFromFractions(frameToFractions(frame, stage), stage);
    expect(back.x).toBeCloseTo(frame.x, 6);
    expect(back.width).toBeCloseTo(frame.width, 6);
    const tiny = frameFromFractions({ x: 5, y: 5, width: 0, height: 0 }, stage);
    expect(tiny.width).toBeGreaterThan(0);
    expect(tiny.x + tiny.width).toBeLessThanOrEqual(stage.width);
  });
});

describe("placement and matrix", () => {
  it("round-trips a placement through its matrix", () => {
    const placement: Placement = { scale: 0.8, rotation: 0.4, center: { x: 280, y: 190 } };
    const back = placementOf(matrixOf(placement, image), image);
    expect(back.scale).toBeCloseTo(placement.scale, 9);
    expect(back.rotation).toBeCloseTo(placement.rotation, 9);
    expect(back.center.x).toBeCloseTo(placement.center.x, 9);
    expect(back.center.y).toBeCloseTo(placement.center.y, 9);
  });

  it("places the image centre where the translation says, in the matrix Cropper.js uses", () => {
    /* Verified in a browser: a 800x600 image centred in a 600x400 stage at scale 2/3 has [2/3, 0, 0, 2/3, -100, -100]. */
    const placement = placementOf([2 / 3, 0, 0, 2 / 3, -100, -100], image);
    expect(placement.center).toEqual({ x: 300, y: 200 });
  });
});

describe("cover rule", () => {
  const frame = fitFrame(stage, 1);

  it("needs no extra scale at a quarter turn on a matching image, and more at 45 degrees", () => {
    const square: Size = { width: 400, height: 400 };
    const square_frame = fitFrame({ width: 400, height: 400 }, 1);
    expect(coverScale(square_frame, square, 0)).toBeCloseTo(square_frame.width / 400, 9);
    expect(coverScale(square_frame, square, Math.PI / 2)).toBeCloseTo(coverScale(square_frame, square, 0), 9);
    expect(coverScale(square_frame, square, Math.PI / 4)).toBeCloseTo(coverScale(square_frame, square, 0) * Math.SQRT2, 9);
  });

  it("raises the zoom floor with the rotation, and lifts the ceiling when the floor passes it", () => {
    const flat = zoomRange(frame, image, 0, { minZoom: 1, maxZoom: 4 });
    expect(flat.min).toBeCloseTo(1, 9);
    expect(flat.max).toBe(4);
    const turned = zoomRange(frame, image, Math.PI / 4, { minZoom: 1, maxZoom: 1 });
    expect(turned.min).toBeGreaterThan(1);
    expect(turned.max).toBe(turned.min);
  });

  it("leaves a placement that already covers the window exactly as it was", () => {
    const placement: Placement = { scale: baseScale(frame, image) * 1.5, rotation: 0, center: { x: 300, y: 200 } };
    expect(clampToCover(placement, frame, image, limits)).toEqual(placement);
  });

  it("pulls a dragged image back until its edge meets the window's edge, never past it", () => {
    const scale = baseScale(frame, image) * 1.5;
    const dragged = clampToCover({ scale, rotation: 0, center: { x: 5000, y: 5000 } }, frame, image, limits);
    expect(dragged.center.x - (scale * image.width) / 2).toBeCloseTo(frame.x, 6);
    expect(dragged.center.y - (scale * image.height) / 2).toBeCloseTo(frame.y, 6);
  });

  it("never lets the scale fall below the cover, so a zoom out stops at the window", () => {
    const out = clampToCover({ scale: 0.001, rotation: 0, center: { x: 300, y: 200 } }, frame, image, limits);
    expect(out.scale).toBeCloseTo(baseScale(frame, image), 9);
  });

  it("holds for every combination of zoom, drag and rotation: the window is always inside the image", () => {
    const random = lcg(1234);
    const frames: Rect[] = [fitFrame(stage, 1), fitFrame(stage, 16 / 9), fitFrame(stage, 9 / 16), { x: 100, y: 60, width: 230, height: 150 }];
    for (let i = 0; i < 600; i += 1) {
      const win = frames[i % frames.length]!;
      const img: Size = random() > 0.5 ? image : { width: 300 + random() * 900, height: 300 + random() * 900 };
      const proposed: Placement = {
        scale: random() * 4,
        rotation: (random() - 0.5) * Math.PI * 2,
        center: { x: random() * 1200 - 300, y: random() * 900 - 250 },
      };
      const clamped = clampToCover(proposed, win, img, limits);
      expect(covers(clamped, win, img, 1e-6), `case ${i}`).toBe(true);
      /* Idempotent: a valid placement is its own nearest valid placement. */
      const again = clampToCover(clamped, win, img, limits);
      expect(again.scale).toBeCloseTo(clamped.scale, 6);
      expect(again.center.x).toBeCloseTo(clamped.center.x, 6);
      expect(again.center.y).toBeCloseTo(clamped.center.y, 6);
    }
  });
});

describe("value", () => {
  const frame = fitFrame(stage, 4 / 3);

  it("starts centred at zoom 1 with no rotation, and the image just covers the window", () => {
    const placement = placementFromValue(defaultValue, frame, image, limits);
    expect(placement.scale).toBeCloseTo(baseScale(frame, image), 9);
    expect(placement.center.x).toBeCloseTo(stage.width / 2, 6);
    expect(placement.center.y).toBeCloseTo(stage.height / 2, 6);
    expect(valueFromPlacement(placement, frame, image, stage, false)).toEqual(defaultValue);
  });

  it("round-trips any valid value through a placement and back", () => {
    const random = lcg(99);
    for (let i = 0; i < 300; i += 1) {
      const value: ImageCropperValue = {
        position: { x: random(), y: random() },
        zoom: 1 + random() * 3,
        rotation: (random() - 0.5) * 340,
      };
      const placement = placementFromValue(value, frame, image, limits);
      const back = valueFromPlacement(placement, frame, image, stage, false);
      const again = placementFromValue(back, frame, image, limits);
      expect(again.scale).toBeCloseTo(placement.scale, 3);
      /* A stored value is rounded (a hundredth of a degree, four places of position), so within half a pixel is exact. */
      expect(Math.abs(again.center.x - placement.center.x)).toBeLessThan(0.5);
      expect(Math.abs(again.center.y - placement.center.y)).toBeLessThan(0.5);
    }
  });

  it("puts position 0 and 1 at the two ends of the travel: the window touches the image's opposite edges", () => {
    const zoom = 2;
    const scale = baseScale(frame, image) * zoom;
    const left = placementFromValue({ position: { x: 0, y: 0.5 }, zoom, rotation: 0 }, frame, image, limits);
    const right = placementFromValue({ position: { x: 1, y: 0.5 }, zoom, rotation: 0 }, frame, image, limits);
    /* The window's left edge is the image's left edge at 0, and its right edge is the image's right edge at 1. */
    expect(left.center.x - (scale * image.width) / 2).toBeCloseTo(frame.x, 6);
    expect(right.center.x + (scale * image.width) / 2).toBeCloseTo(frame.x + frame.width, 6);
  });

  it("holds position at the middle when there is no travel at all", () => {
    const tight = fitFrame({ width: 400, height: 300 }, 4 / 3);
    const placement = placementFromValue({ position: { x: 0.9, y: 0.1 }, zoom: 1, rotation: 0 }, tight, { width: 400, height: 300 }, limits);
    const value = valueFromPlacement(placement, tight, { width: 400, height: 300 }, { width: 400, height: 300 }, false);
    expect(value.position).toEqual({ x: 0.5, y: 0.5 });
  });

  it("keeps the frame in the value only when asked, as fractions", () => {
    const placement = placementFromValue(defaultValue, frame, image, limits);
    expect(valueFromPlacement(placement, frame, image, stage, false).frame).toBeUndefined();
    const kept = valueFromPlacement(placement, frame, image, stage, true).frame!;
    expect(kept.width).toBeCloseTo(frame.width / stage.width, 3);
  });

  it("clamps a value that asks for more than there is, instead of drawing an empty corner", () => {
    const placement = placementFromValue({ position: { x: 9, y: -4 }, zoom: 100, rotation: 400 }, frame, image, limits);
    expect(covers(placement, frame, image, 1e-6)).toBe(true);
    expect(placement.scale / baseScale(frame, image)).toBeLessThanOrEqual(limits.maxZoom + 1e-9);
  });

  it("normalizes rotation into (-180, 180]", () => {
    expect(normalizeRotation(190)).toBe(-170);
    expect(normalizeRotation(-190)).toBe(170);
    expect(normalizeRotation(360)).toBe(0);
    expect(normalizeRotation(180)).toBe(180);
    expect(normalizeRotation(-180)).toBe(180);
    expect(normalizeRotation(Number.NaN)).toBe(0);
    expect(rotatedBy({ ...defaultValue, rotation: 170 }, 20).rotation).toBe(-170);
  });

  it("tells a change from a no-op", () => {
    expect(sameValue(defaultValue, { ...defaultValue })).toBe(true);
    expect(sameValue(defaultValue, { ...defaultValue, zoom: 1.5 })).toBe(false);
    expect(sameValue(defaultValue, { ...defaultValue, rotation: 360 })).toBe(true);
    expect(sameValue(defaultValue, { ...defaultValue, frame: { x: 0, y: 0, width: 1, height: 1 } })).toBe(false);
  });
});

describe("crop in natural pixels", () => {
  const frame = fitFrame(stage, 4 / 3);

  it("is the whole image at zoom 1 with no rotation on a matching image", () => {
    const placement = placementFromValue(defaultValue, frame, image, limits);
    const crop = cropOf(placement, frame, image);
    expect(crop.x).toBeCloseTo(0, 1);
    expect(crop.y).toBeCloseTo(0, 1);
    expect(crop.width).toBeCloseTo(800, 1);
    expect(crop.height).toBeCloseTo(600, 1);
    expect(crop.outputWidth).toBe(800);
    expect(crop.outputHeight).toBe(600);
  });

  it("halves the box and the output at zoom 2, and shifts it with the position", () => {
    const placement = placementFromValue({ position: { x: 1, y: 1 }, zoom: 2, rotation: 0 }, frame, image, limits);
    const crop = cropOf(placement, frame, image);
    expect(crop.width).toBeCloseTo(400, 1);
    expect(crop.height).toBeCloseTo(300, 1);
    expect(crop.x + crop.width).toBeCloseTo(800, 1);
    expect(crop.y + crop.height).toBeCloseTo(600, 1);
    expect(crop.outputWidth).toBe(400);
  });

  it("swaps width and height for a quarter turn: the box is exact", () => {
    const square: Size = { width: 600, height: 600 };
    const win = fitFrame({ width: 400, height: 400 }, 1);
    const placement = placementFromValue({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 90 }, win, square, limits);
    const crop = cropOf(placement, win, square);
    expect(crop.rotation).toBe(90);
    expect(crop.width).toBeCloseTo(600, 1);
    expect(crop.height).toBeCloseTo(600, 1);
  });

  it("never reports a box outside the image, whatever the rotation", () => {
    const random = lcg(7);
    for (let i = 0; i < 200; i += 1) {
      const placement = placementFromValue({ position: { x: random(), y: random() }, zoom: 1 + random() * 3, rotation: (random() - 0.5) * 340 }, frame, image, limits);
      const crop = cropOf(placement, frame, image);
      expect(crop.x).toBeGreaterThanOrEqual(0);
      expect(crop.y).toBeGreaterThanOrEqual(0);
      expect(crop.x + crop.width).toBeLessThanOrEqual(image.width + 0.01);
      expect(crop.y + crop.height).toBeLessThanOrEqual(image.height + 0.01);
    }
  });

  it("sizes an export from one dimension and keeps the window's ratio, or from both as asked", () => {
    const crop = cropOf(placementFromValue(defaultValue, frame, image, limits), frame, image);
    expect(outputSize(crop, {})).toEqual({ width: 800, height: 600 });
    expect(outputSize(crop, { width: 400 })).toEqual({ width: 400, height: 300 });
    expect(outputSize(crop, { height: 150 })).toEqual({ width: 200, height: 150 });
    /* Both: the largest size of the window's ratio inside the box, never a stretched or padded crop. */
    expect(outputSize(crop, { width: 100, height: 100 })).toEqual({ width: 100, height: 75 });
    expect(outputSize(crop, { width: 400, height: 600 })).toEqual({ width: 400, height: 300 });
    expect(outputSize(crop, { width: 1000, height: 300 })).toEqual({ width: 400, height: 300 });
    expect(outputSize(crop, { width: 0, height: -3 })).toEqual({ width: 800, height: 600 });
  });
});

describe("gestures", () => {
  const frame = fitFrame(stage, 1);
  const start: Placement = { scale: baseScale(frame, image) * 2, rotation: 0, center: { x: 300, y: 200 } };

  it("keeps the point under the pointer still while zooming", () => {
    const anchor = { x: 250, y: 150 };
    const zoomed = zoomAbout(start, 1.5, anchor);
    /* The image point that was under the anchor is under it still: its distance from the centre scaled by the factor. */
    expect(anchor.x - zoomed.center.x).toBeCloseTo((anchor.x - start.center.x) * 1.5, 9);
    expect(zoomed.scale).toBeCloseTo(start.scale * 1.5, 9);
  });

  it("keeps the point under the pointer still while rotating", () => {
    const anchor = { x: 250, y: 150 };
    const turned = rotateAbout(start, Math.PI / 6, anchor);
    expect(Math.hypot(turned.center.x - anchor.x, turned.center.y - anchor.y)).toBeCloseTo(Math.hypot(start.center.x - anchor.x, start.center.y - anchor.y), 9);
    expect(turned.rotation).toBeCloseTo(Math.PI / 6, 9);
  });

  it("nudges by a share of the window's shorter side, and the rule then bounds it", () => {
    const moved = nudge(start, frame, 0.02, 0);
    expect(moved.center.x - start.center.x).toBeCloseTo(0.02 * Math.min(frame.width, frame.height), 9);
    const bounded = clampToCover(nudge(start, frame, 50, 50), frame, image, limits);
    expect(covers(bounded, frame, image, 1e-6)).toBe(true);
  });
});

describe("keyboard", () => {
  it("maps the documented keys", () => {
    expect(imageCropperKeyAction({ key: "ArrowLeft" })).toEqual({ type: "move", dx: -0.02, dy: 0 });
    expect(imageCropperKeyAction({ key: "ArrowDown", shiftKey: true })).toEqual({ type: "move", dx: 0, dy: 0.2 });
    expect(imageCropperKeyAction({ key: "+" })).toEqual({ type: "zoom", delta: 0.1 });
    expect(imageCropperKeyAction({ key: "-" })).toEqual({ type: "zoom", delta: -0.1 });
    expect(imageCropperKeyAction({ key: "]" })).toEqual({ type: "rotate", degrees: 1 });
    expect(imageCropperKeyAction({ key: "[", shiftKey: true })).toEqual({ type: "rotate", degrees: -15 });
    expect(imageCropperKeyAction({ key: "r" })).toEqual({ type: "rotate", degrees: 90 });
    expect(imageCropperKeyAction({ key: "R" })).toEqual({ type: "rotate", degrees: -90 });
    expect(imageCropperKeyAction({ key: "0" })).toEqual({ type: "reset" });
  });

  it("leaves the browser's and the system's shortcuts alone", () => {
    for (const key of ["+", "-", "0", "ArrowLeft", "r"]) {
      expect(imageCropperKeyAction({ key, ctrlKey: true })).toBeNull();
      expect(imageCropperKeyAction({ key, metaKey: true })).toBeNull();
      expect(imageCropperKeyAction({ key, altKey: true })).toBeNull();
    }
    expect(imageCropperKeyAction({ key: "Tab" })).toBeNull();
    expect(imageCropperKeyAction({ key: "Enter" })).toBeNull();
  });
});
