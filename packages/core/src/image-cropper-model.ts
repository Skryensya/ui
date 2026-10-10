/*
 * IMAGE CROPPER, THE MODEL. Pure geometry, no DOM and no Cropper.js: what a crop IS, in numbers, and the rules that keep
 * it valid. Both bindings reach the same answers because both reach them through here.
 *
 * THE MODEL IS A WINDOW OVER AN IMAGE. A fixed `frame` (the crop window, in stage pixels) and an image that is panned,
 * zoomed and rotated underneath it, the way an avatar picker works. Four numbers place the image:
 *
 *   scale     stage pixels per natural pixel
 *   rotation  radians, clockwise on the screen (the stage is y-down)
 *   center    where the image's own centre lies on the stage
 *
 * and a window is valid when it lies entirely INSIDE the rotated image, so a crop can never contain an empty corner.
 * That one rule is the whole of `clampToCover`; zoom, drag and rotation can all be combined freely because each of them
 * is followed by it.
 *
 * THE PUBLIC VALUE IS NOT THOSE FOUR NUMBERS, because those are in pixels of a stage that changes size. It is
 * `{ position, zoom, rotation, frame? }`, all of them ratios or degrees, so a value read at one size draws the same crop
 * at another and can be stored:
 *
 *   zoom      1 is "the image just covers the window with no rotation". Never below that, and never so low that the
 *             rotated image would leave a corner of the window empty: the floor rises with the rotation.
 *   position  where the window sits over the image, as a fraction of how far it can travel along the image's own axes.
 *             0 is one end, 1 the other, 0.5 centred. Fixed at 0.5 when there is no travel (zoom 1 on a matching image).
 *   rotation  degrees, clockwise, in (-180, 180].
 *   frame     the crop window as fractions of the stage. Only meaningful, and only kept, for a free aspect, where the
 *             reader resizes it; a fixed aspect derives the window from the ratio.
 */

export type Size = { readonly width: number; readonly height: number };
export type Point = { readonly x: number; readonly y: number };
export type Rect = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

/** `[a, b, c, d, e, f]`, the CSS and canvas matrix. The image turns about its own centre, which `e` and `f` then move. */
export type Matrix = readonly [number, number, number, number, number, number];

export type ImageCropperFrame = Rect;

export type ImageCropperValue = {
  readonly position: Point;
  readonly zoom: number;
  readonly rotation: number;
  /** The crop window as fractions of the stage. Present only for a free aspect. */
  readonly frame?: ImageCropperFrame;
};

export type ImageCropperShape = "rectangle" | "circle";

/** What an `aspect` option can say: a ratio (width over height), the image's own, or no constraint at all. */
export type ImageCropperAspect = number | "free" | "original";

export const IMAGE_CROPPER_MIN_ZOOM = 1;
export const IMAGE_CROPPER_MAX_ZOOM = 4;
/** How much of the stage the window may take: the rest is the margin that makes the crop edge readable. */
export const IMAGE_CROPPER_FRAME_FILL = 0.88;
/** The smallest a free window can be made, as a share of the stage's shorter side. */
export const IMAGE_CROPPER_MIN_FRAME = 0.1;
/** One keyboard step moves the image by this share of the window's shorter side; Shift multiplies it. */
export const IMAGE_CROPPER_NUDGE = 0.02;
export const IMAGE_CROPPER_NUDGE_LARGE = 0.2;
export const IMAGE_CROPPER_ZOOM_STEP = 0.1;
export const IMAGE_CROPPER_ROTATE_STEP = 1;
export const IMAGE_CROPPER_ROTATE_STEP_LARGE = 15;

const EPSILON = 1e-6;
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Rotation wrapped into (-180, 180]. */
export function normalizeRotation(degrees: number): number {
  if (!Number.isFinite(degrees)) return 0;
  let wrapped = ((degrees % 360) + 360) % 360;
  if (wrapped > 180) wrapped -= 360;
  /* -0 and 180 are the two ways to say a half turn; 180 is the one this range keeps. */
  return Object.is(wrapped, -0) ? 0 : wrapped;
}

/* ---------------------------------------------------------------------------------------------- *
 * Aspect ratios
 * ---------------------------------------------------------------------------------------------- */

export const imageCropperRatios = [
  { id: "1:1", ratio: 1 },
  { id: "4:3", ratio: 4 / 3 },
  { id: "3:2", ratio: 3 / 2 },
  { id: "16:9", ratio: 16 / 9 },
  { id: "9:16", ratio: 9 / 16 },
] as const;

/**
 * Reads an aspect the way an attribute or an author writes it: `free`, `original`, a number (`1.5`), or a ratio
 * (`16:9`, `16/9`). Anything else is `free`, never a crop that cannot be drawn.
 */
export function parseAspect(input: unknown): ImageCropperAspect {
  if (typeof input === "number") return Number.isFinite(input) && input > 0 ? input : "free";
  if (typeof input !== "string") return "free";
  const text = input.trim().toLowerCase();
  if (text === "free" || text === "original") return text;
  const ratio = /^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/.exec(text);
  if (ratio) {
    const value = Number(ratio[1]) / Number(ratio[2]);
    return Number.isFinite(value) && value > 0 ? value : "free";
  }
  const number = Number(text);
  return text !== "" && Number.isFinite(number) && number > 0 ? number : "free";
}

/** The ratio a crop is held to, or `null` when it is free. A circle is always 1:1, whatever was asked. */
export function resolveAspect(aspect: ImageCropperAspect, shape: ImageCropperShape, image: Size): number | null {
  if (shape === "circle") return 1;
  if (aspect === "free") return null;
  if (aspect === "original") return image.width / image.height;
  return aspect;
}

/** The aspect option as an attribute value, the inverse of `parseAspect`. */
export const serializeAspect = (aspect: ImageCropperAspect): string => (typeof aspect === "number" ? String(Number(aspect.toFixed(4))) : aspect);

/* ---------------------------------------------------------------------------------------------- *
 * The window
 * ---------------------------------------------------------------------------------------------- */

/** The largest rectangle of `ratio` that fits in `stage` with the margin, centred. */
export function fitFrame(stage: Size, ratio: number): Rect {
  const maxWidth = stage.width * IMAGE_CROPPER_FRAME_FILL;
  const maxHeight = stage.height * IMAGE_CROPPER_FRAME_FILL;
  const width = Math.min(maxWidth, maxHeight * ratio);
  const height = width / ratio;
  return { x: (stage.width - width) / 2, y: (stage.height - height) / 2, width, height };
}

/** The window at the start: the image's own shape for a free crop (so it begins as the whole image), the ratio otherwise. */
export function defaultFrame(stage: Size, ratio: number | null, image: Size): Rect {
  return fitFrame(stage, ratio ?? image.width / image.height);
}

/** Fractions of the stage, for storing; and back. */
export const frameToFractions = (frame: Rect, stage: Size): ImageCropperFrame => ({
  x: frame.x / stage.width,
  y: frame.y / stage.height,
  width: frame.width / stage.width,
  height: frame.height / stage.height,
});

export function frameFromFractions(frame: ImageCropperFrame, stage: Size): Rect {
  const minSide = Math.min(stage.width, stage.height) * IMAGE_CROPPER_MIN_FRAME;
  const width = clamp(frame.width * stage.width, minSide, stage.width);
  const height = clamp(frame.height * stage.height, minSide, stage.height);
  return {
    x: clamp(frame.x * stage.width, 0, stage.width - width),
    y: clamp(frame.y * stage.height, 0, stage.height - height),
    width,
    height,
  };
}

/* ---------------------------------------------------------------------------------------------- *
 * The image under the window
 * ---------------------------------------------------------------------------------------------- */

/** Where the image is: the three numbers the matrix and the value are both made of. */
export type Placement = { readonly scale: number; readonly rotation: number; readonly center: Point };

export function matrixOf(placement: Placement, image: Size): Matrix {
  const a = placement.scale * Math.cos(placement.rotation);
  const b = placement.scale * Math.sin(placement.rotation);
  return [a, b, -b, a, placement.center.x - image.width / 2, placement.center.y - image.height / 2];
}

export function placementOf(matrix: readonly number[], image: Size): Placement {
  const [a = 1, b = 0, , , e = 0, f = 0] = matrix;
  return {
    scale: Math.hypot(a, b) || 1,
    rotation: Math.atan2(b, a),
    center: { x: image.width / 2 + e, y: image.height / 2 + f },
  };
}

/** The half-extents, in image axes, that the window reaches from its own centre: what the image has to contain. */
function reach(frame: Rect, rotation: number): { x: number; y: number } {
  const cos = Math.abs(Math.cos(rotation));
  const sin = Math.abs(Math.sin(rotation));
  const a = frame.width / 2;
  const b = frame.height / 2;
  return { x: a * cos + b * sin, y: a * sin + b * cos };
}

/** The smallest scale at which the rotated image still contains the whole window. */
export function coverScale(frame: Rect, image: Size, rotation: number): number {
  const need = reach(frame, rotation);
  return Math.max(need.x / (image.width / 2), need.y / (image.height / 2));
}

/** What `zoom` 1 means for this window: the image just covering it, with no rotation. */
export const baseScale = (frame: Rect, image: Size): number => coverScale(frame, image, 0);

const rotate = (point: Point, angle: number): Point => ({
  x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
  y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
});

export type CropLimits = { readonly minZoom: number; readonly maxZoom: number };

/** The zoom range actually available: the author's, raised wherever the rotation needs more image to cover the window. */
export function zoomRange(frame: Rect, image: Size, rotation: number, limits: CropLimits): { min: number; max: number } {
  const floor = coverScale(frame, image, rotation) / baseScale(frame, image);
  const min = Math.max(limits.minZoom, floor);
  return { min, max: Math.max(limits.maxZoom, min) };
}

/**
 * THE RULE. Takes any placement and returns the nearest one whose window lies inside the image: the scale is lifted to the
 * floor and capped at the ceiling, then the image's centre is moved just far enough, along the image's own axes, that no
 * corner of the window is outside it.
 */
export function clampToCover(placement: Placement, frame: Rect, image: Size, limits: CropLimits): Placement {
  const rotation = placement.rotation;
  const base = baseScale(frame, image);
  const range = zoomRange(frame, image, rotation, limits);
  const scale = clamp(placement.scale, range.min * base, range.max * base);

  const windowCenter: Point = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
  const offset = rotate({ x: windowCenter.x - placement.center.x, y: windowCenter.y - placement.center.y }, -rotation);
  const need = reach(frame, rotation);
  const travelX = Math.max(0, (scale * image.width) / 2 - need.x);
  const travelY = Math.max(0, (scale * image.height) / 2 - need.y);
  const clamped = rotate({ x: clamp(offset.x, -travelX, travelX), y: clamp(offset.y, -travelY, travelY) }, rotation);
  return { scale, rotation, center: { x: windowCenter.x - clamped.x, y: windowCenter.y - clamped.y } };
}

/* ---------------------------------------------------------------------------------------------- *
 * Value <-> placement
 * ---------------------------------------------------------------------------------------------- */

export const defaultValue: ImageCropperValue = { position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 };

/** The placement a value stands for in a given window, already inside the rule. */
export function placementFromValue(value: ImageCropperValue, frame: Rect, image: Size, limits: CropLimits): Placement {
  const rotation = toRadians(normalizeRotation(value.rotation));
  const base = baseScale(frame, image);
  const range = zoomRange(frame, image, rotation, limits);
  const scale = clamp(Number.isFinite(value.zoom) ? value.zoom : 1, range.min, range.max) * base;

  const need = reach(frame, rotation);
  const travelX = Math.max(0, (scale * image.width) / 2 - need.x);
  const travelY = Math.max(0, (scale * image.height) / 2 - need.y);
  const px = clamp(Number.isFinite(value.position.x) ? value.position.x : 0.5, 0, 1);
  const py = clamp(Number.isFinite(value.position.y) ? value.position.y : 0.5, 0, 1);
  const offset = rotate({ x: (px - 0.5) * 2 * travelX, y: (py - 0.5) * 2 * travelY }, rotation);
  const windowCenter: Point = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
  return { scale, rotation, center: { x: windowCenter.x - offset.x, y: windowCenter.y - offset.y } };
}

const round = (value: number, places = 4): number => {
  const factor = 10 ** places;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
};

/** The value a placement stands for, rounded so that it is stable to store and to compare. */
export function valueFromPlacement(placement: Placement, frame: Rect, image: Size, stage: Size, keepFrame: boolean): ImageCropperValue {
  const base = baseScale(frame, image);
  const windowCenter: Point = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
  const offset = rotate({ x: windowCenter.x - placement.center.x, y: windowCenter.y - placement.center.y }, -placement.rotation);
  const need = reach(frame, placement.rotation);
  const travelX = (placement.scale * image.width) / 2 - need.x;
  const travelY = (placement.scale * image.height) / 2 - need.y;
  const position: Point = {
    x: travelX > EPSILON ? clamp(0.5 + offset.x / (2 * travelX), 0, 1) : 0.5,
    y: travelY > EPSILON ? clamp(0.5 + offset.y / (2 * travelY), 0, 1) : 0.5,
  };
  const value: ImageCropperValue = {
    position: { x: round(position.x), y: round(position.y) },
    zoom: round(placement.scale / base),
    rotation: round(normalizeRotation(toDegrees(placement.rotation)), 2),
  };
  if (!keepFrame) return value;
  const fractions = frameToFractions(frame, stage);
  return { ...value, frame: { x: round(fractions.x), y: round(fractions.y), width: round(fractions.width), height: round(fractions.height) } };
}

/* ---------------------------------------------------------------------------------------------- *
 * What the crop is, in the image's own pixels
 * ---------------------------------------------------------------------------------------------- */

export type ImageCropperCrop = {
  /** The axis-aligned box, in natural pixels, that contains the cropped region. Exact when the rotation is a quarter turn. */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** The rotation the crop is taken at, in degrees. The region is the window turned by this, about the image's centre. */
  readonly rotation: number;
  /** The window's own size in natural pixels: the exact size of the exported image at its natural resolution. */
  readonly outputWidth: number;
  readonly outputHeight: number;
};

export function cropOf(placement: Placement, frame: Rect, image: Size): ImageCropperCrop {
  const windowCenter: Point = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
  const offset = rotate({ x: windowCenter.x - placement.center.x, y: windowCenter.y - placement.center.y }, -placement.rotation);
  const half = { x: frame.width / 2, y: frame.height / 2 };
  const corners = [
    { x: -half.x, y: -half.y },
    { x: half.x, y: -half.y },
    { x: half.x, y: half.y },
    { x: -half.x, y: half.y },
  ].map((corner) => {
    const inImage = rotate(corner, -placement.rotation);
    return { x: image.width / 2 + (offset.x + inImage.x) / placement.scale, y: image.height / 2 + (offset.y + inImage.y) / placement.scale };
  });
  const minX = clamp(Math.min(...corners.map((c) => c.x)), 0, image.width);
  const maxX = clamp(Math.max(...corners.map((c) => c.x)), 0, image.width);
  const minY = clamp(Math.min(...corners.map((c) => c.y)), 0, image.height);
  const maxY = clamp(Math.max(...corners.map((c) => c.y)), 0, image.height);
  return {
    x: round(minX, 2),
    y: round(minY, 2),
    width: round(maxX - minX, 2),
    height: round(maxY - minY, 2),
    rotation: round(normalizeRotation(toDegrees(placement.rotation)), 2),
    outputWidth: Math.max(1, Math.round(frame.width / placement.scale)),
    outputHeight: Math.max(1, Math.round(frame.height / placement.scale)),
  };
}

/**
 * The size an export has. One dimension asked for: the other follows the window's own ratio. Both: the largest size of the window's
 * ratio that fits inside them, since a file of another ratio could only be the crop stretched or padded, which is not the crop.
 * Neither: the window's size in the picture's own pixels.
 */
export function outputSize(crop: ImageCropperCrop, request: { width?: number; height?: number }): Size {
  const ratio = crop.outputWidth / crop.outputHeight;
  const width = request.width && request.width > 0 ? request.width : undefined;
  const height = request.height && request.height > 0 ? request.height : undefined;
  if (width && height) {
    const fitted = Math.min(width, height * ratio);
    return { width: Math.max(1, Math.round(fitted)), height: Math.max(1, Math.round(fitted / ratio)) };
  }
  if (width) return { width: Math.round(width), height: Math.max(1, Math.round(width / ratio)) };
  if (height) return { width: Math.max(1, Math.round(height * ratio)), height: Math.round(height) };
  return { width: crop.outputWidth, height: crop.outputHeight };
}

/* ---------------------------------------------------------------------------------------------- *
 * Edits: each one is a new value, never a mutation, and each is followed by the rule on its way back in
 * ---------------------------------------------------------------------------------------------- */

export const withZoom = (value: ImageCropperValue, zoom: number): ImageCropperValue => ({ ...value, zoom });
export const withRotation = (value: ImageCropperValue, degrees: number): ImageCropperValue => ({ ...value, rotation: normalizeRotation(degrees) });
export const rotatedBy = (value: ImageCropperValue, degrees: number): ImageCropperValue => withRotation(value, value.rotation + degrees);

/** Moves the image by a share of the window's shorter side, in screen directions; `dx` > 0 slides the picture to the right. */
export function nudge(placement: Placement, frame: Rect, dx: number, dy: number): Placement {
  const unit = Math.min(frame.width, frame.height);
  return { ...placement, center: { x: placement.center.x + dx * unit, y: placement.center.y + dy * unit } };
}

/** The scale after zooming by `factor` about a point of the stage, which stays where it was under the pointer. */
export function zoomAbout(placement: Placement, factor: number, anchor: Point): Placement {
  return {
    ...placement,
    scale: placement.scale * factor,
    center: { x: anchor.x - (anchor.x - placement.center.x) * factor, y: anchor.y - (anchor.y - placement.center.y) * factor },
  };
}

/** Turns the image by `radians` about a point of the stage, which stays where it was. */
export function rotateAbout(placement: Placement, radians: number, anchor: Point): Placement {
  const moved = rotate({ x: placement.center.x - anchor.x, y: placement.center.y - anchor.y }, radians);
  return { ...placement, rotation: placement.rotation + radians, center: { x: anchor.x + moved.x, y: anchor.y + moved.y } };
}

/** Grows or shrinks a free window's edge by a handle drag, as the new window, held inside the stage and above a minimum. */
export function resizedFrame(frame: Rect, next: Rect, stage: Size): Rect {
  const minSide = Math.min(stage.width, stage.height) * IMAGE_CROPPER_MIN_FRAME;
  const width = clamp(next.width, minSide, stage.width);
  const height = clamp(next.height, minSide, stage.height);
  /* Anchored where the drag anchored it: the edge that did not move stays. */
  const left = Math.abs(next.x - frame.x) < EPSILON && Math.abs(next.width - frame.width) >= EPSILON ? frame.x : next.x;
  const top = Math.abs(next.y - frame.y) < EPSILON && Math.abs(next.height - frame.height) >= EPSILON ? frame.y : next.y;
  return { x: clamp(left, 0, stage.width - width), y: clamp(top, 0, stage.height - height), width, height };
}

/** Whether the window lies inside the image at this placement: `clampToCover` would leave it as it is. */
export function covers(placement: Placement, frame: Rect, image: Size, tolerance = 0.5): boolean {
  const windowCenter: Point = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
  const offset = rotate({ x: windowCenter.x - placement.center.x, y: windowCenter.y - placement.center.y }, -placement.rotation);
  const need = reach(frame, placement.rotation);
  return (
    Math.abs(offset.x) + need.x <= (placement.scale * image.width) / 2 + tolerance &&
    Math.abs(offset.y) + need.y <= (placement.scale * image.height) / 2 + tolerance
  );
}

/* ---------------------------------------------------------------------------------------------- *
 * Keyboard
 * ---------------------------------------------------------------------------------------------- */

export type ImageCropperKeyAction =
  | { readonly type: "move"; readonly dx: number; readonly dy: number }
  | { readonly type: "zoom"; readonly delta: number }
  | { readonly type: "rotate"; readonly degrees: number }
  | { readonly type: "reset" };

type KeyLike = { readonly key: string; readonly shiftKey?: boolean; readonly ctrlKey?: boolean; readonly metaKey?: boolean; readonly altKey?: boolean };

/**
 * What a key does on the crop area. Arrows move the picture (Shift: ten times as far), plus and minus zoom, the brackets
 * turn it a degree (Shift: fifteen), `r` turns it a quarter, and `0` starts over. A key held with Ctrl, Meta or Alt is the
 * browser's or the system's, never this component's.
 */
export function imageCropperKeyAction(event: KeyLike): ImageCropperKeyAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  const step = event.shiftKey ? IMAGE_CROPPER_NUDGE_LARGE : IMAGE_CROPPER_NUDGE;
  switch (event.key) {
    case "ArrowLeft":
      return { type: "move", dx: -step, dy: 0 };
    case "ArrowRight":
      return { type: "move", dx: step, dy: 0 };
    case "ArrowUp":
      return { type: "move", dx: 0, dy: -step };
    case "ArrowDown":
      return { type: "move", dx: 0, dy: step };
    case "+":
    case "=":
      return { type: "zoom", delta: IMAGE_CROPPER_ZOOM_STEP };
    case "-":
    case "_":
      return { type: "zoom", delta: -IMAGE_CROPPER_ZOOM_STEP };
    case "[":
    case "{":
      return { type: "rotate", degrees: -(event.shiftKey ? IMAGE_CROPPER_ROTATE_STEP_LARGE : IMAGE_CROPPER_ROTATE_STEP) };
    case "]":
    case "}":
      return { type: "rotate", degrees: event.shiftKey ? IMAGE_CROPPER_ROTATE_STEP_LARGE : IMAGE_CROPPER_ROTATE_STEP };
    case "r":
      return { type: "rotate", degrees: 90 };
    case "R":
      return { type: "rotate", degrees: -90 };
    case "0":
      return { type: "reset" };
    default:
      return null;
  }
}

/** Two values are the same crop: used to tell a change from a no-op, so an event never fires for nothing. */
export function sameValue(a: ImageCropperValue, b: ImageCropperValue): boolean {
  const frameSame =
    (a.frame === undefined && b.frame === undefined) ||
    (a.frame !== undefined &&
      b.frame !== undefined &&
      Math.abs(a.frame.x - b.frame.x) < 1e-3 &&
      Math.abs(a.frame.y - b.frame.y) < 1e-3 &&
      Math.abs(a.frame.width - b.frame.width) < 1e-3 &&
      Math.abs(a.frame.height - b.frame.height) < 1e-3);
  return (
    frameSame &&
    Math.abs(a.position.x - b.position.x) < 1e-3 &&
    Math.abs(a.position.y - b.position.y) < 1e-3 &&
    Math.abs(a.zoom - b.zoom) < 1e-3 &&
    Math.abs(normalizeRotation(a.rotation - b.rotation)) < 1e-2
  );
}
