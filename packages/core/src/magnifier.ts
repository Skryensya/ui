import type { ComponentContract } from "./contract.js";

/*
 * MAGNIFIER, a round glass lens that follows the pointer over a picture and shows it larger: a product photo, a map, a frame
 * of video.
 *
 * ONLY OVER MEDIA. The lens reads pixels, and a page can hand the GPU pixels only from an `img`, a `video` or a `canvas`. A
 * lens over arbitrary markup would need a screenshot of the page (html2canvas), which is a still picture that goes stale
 * on the first hover, animation or theme change; so the slot holds one media element, bare or wrapped (an ImageFrame), and
 * the lens reads the first one it finds.
 *
 * THE LENS IS PAINT. It is a `canvas` with `aria-hidden`: everything it shows is already in the media under it, which keeps
 * its own `alt` or label. It shows while a mouse or pen hovers the media, and while a finger is pressed on it.
 *
 * The glass (bend, rainbow edge, rim) is a WebGPU shader (`magnifier-view.ts`), adapted from arya3d/liquid-glass-webgpu
 * (MIT). Without WebGPU, or over an image the GPU may not read (cross-origin without CORS), the lens is a plain zoomed
 * circle drawn with 2D canvas.
 */

export const magnifierAttrs = {
  root: "data-sk-magnifier",
  zoom: "data-zoom",
  active: "data-active",
  /** Written once the lens is first set up: `webgpu` for the glass, `2d` for the plain fallback. */
  renderer: "data-renderer",
  dispersion: "data-dispersion",
  filter: "data-filter",
} as const;

export const magnifierParts = {
  root: "sk-magnifier",
  /** The lens: a `canvas` the binding draws into and moves over the media. `aria-hidden`. */
  lens: "sk-magnifier__lens",
} as const;

export const MAGNIFIER_DEFAULT_ZOOM = 2;
export const MAGNIFIER_MIN_ZOOM = 1;
export const MAGNIFIER_MAX_ZOOM = 8;

export type MagnifierDispersion = "subtle" | "strong";
/** How far the glass splits colour at its edge, against the default fringe. */
export const MAGNIFIER_DISPERSION_STRENGTH: Readonly<Record<MagnifierDispersion, number>> = { subtle: 1, strong: 5 };
export type MagnifierFilter = "none" | "red" | "green" | "blue" | "cyan" | "magenta" | "yellow";
/** The light each filter glass lets through, per channel: the additive primaries pass one channel, the subtractive two. */
export const MAGNIFIER_FILTER_COLOR: Readonly<Record<MagnifierFilter, readonly [number, number, number]>> = {
  none: [1, 1, 1],
  red: [1, 0, 0],
  green: [0, 1, 0],
  blue: [0, 0, 1],
  cyan: [0, 1, 1],
  magenta: [1, 0, 1],
  yellow: [1, 1, 0],
};
/** A filter's colour; anything unknown is clear glass. */
export function magnifierFilterColor(value: string | null | undefined): readonly [number, number, number] {
  return MAGNIFIER_FILTER_COLOR[value as MagnifierFilter] ?? MAGNIFIER_FILTER_COLOR.none;
}

/** A dispersion's strength; anything unknown is the default, `subtle`. */
export function magnifierDispersionStrength(value: string | null | undefined): number {
  return MAGNIFIER_DISPERSION_STRENGTH[value as MagnifierDispersion] ?? MAGNIFIER_DISPERSION_STRENGTH.subtle;
}

/** A zoom held inside the range. Anything that is not a finite number falls back to the default. */
export function magnifierClampZoom(zoom: number): number {
  return Number.isFinite(zoom) ? Math.min(Math.max(zoom, MAGNIFIER_MIN_ZOOM), MAGNIFIER_MAX_ZOOM) : MAGNIFIER_DEFAULT_ZOOM;
}

export type MagnifierBox = { readonly left: number; readonly top: number; readonly width: number; readonly height: number };

/**
 * The box the picture is actually DRAWN in, for an element `box` showing a picture of `natural` size under `object-fit`.
 * `cover` overflows the box, `contain` sits inside it, anything else stretches to it. Centred, the default `object-position`.
 */
export function magnifierContentBox(box: MagnifierBox, natural: readonly [number, number], fit: string): MagnifierBox {
  const [naturalWidth, naturalHeight] = natural;
  if ((fit !== "cover" && fit !== "contain") || !naturalWidth || !naturalHeight || !box.width || !box.height) return box;
  const scale = (fit === "cover" ? Math.max : Math.min)(box.width / naturalWidth, box.height / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return { left: box.left + (box.width - width) / 2, top: box.top + (box.height - height) / 2, width, height };
}

/**
 * Where the lens sits for a pointer, and what of the picture it shows. All boxes in the same (client) coordinates.
 * `root`: the magnifier, which the lens is positioned in. `visible`: the media element's box, where the picture shows.
 * `content`: the box the picture is drawn in (`magnifierContentBox`).
 * Returns:
 *   `x`, `y`: the lens's top-left corner relative to the root: centred on the pointer, raised by `lift` (a finger would
 *     cover a lens under it, so on touch it floats above while still showing the spot under the finger). Where there is no
 *     room above, past `topLimit` (the viewport's top, below any sticky header the page declares), it drops below instead;
 *   `u`, `v`: the pointer over the picture, 0 to 1 (beyond the picture past its edge);
 *   `spanU`, `spanV`: how much of the picture the lens covers, 0 to 1;
 *   `bounds`: `[u0, v0, u1, v1]`, the part of the picture the page actually shows: all of it, or less under a `cover` crop;
 *   `inside`: the pointer is over the picture, which is what starts the lens;
 *   `near`: the pointer is over the picture or within the grace past its edge (`MAGNIFIER_EDGE_GRACE`), which keeps it going;
 *   `fit`: the lens's size here, 0 to 1. Whole anywhere over the picture, its edges and corners included, so the very
 *     corner can be looked at with the full lens; only once the pointer is past the picture does it shrink, eased, to
 *     nothing `MAGNIFIER_EDGE_GRACE` of a lens beyond the edge. Measured at the pointer, before `lift`.
 */
/** 0 to 1 eased at both ends, so a size that follows it starts and stops gently. */
const smoothstep = (value: number): number => {
  const t = Math.min(Math.max(value, 0), 1);
  return t * t * (3 - 2 * t);
};

export function magnifierPlace(params: {
  readonly pointerX: number;
  readonly pointerY: number;
  readonly root: MagnifierBox;
  readonly visible: MagnifierBox;
  readonly content: MagnifierBox;
  readonly lensSize: number;
  readonly lift?: number;
  readonly topLimit?: number;
}) {
  const { pointerX, pointerY, root, visible, content, lensSize, lift: wanted = 0, topLimit = 0 } = params;
  const lift = wanted > 0 && pointerY - wanted - lensSize / 2 < topLimit ? -wanted : wanted;
  const within = (margin: number) =>
    visible.width > 0 &&
    visible.height > 0 &&
    pointerX >= visible.left - margin &&
    pointerY >= visible.top - margin &&
    pointerX <= visible.left + visible.width + margin &&
    pointerY <= visible.top + visible.height + margin;
  const toU = (x: number) => (content.width > 0 ? (x - content.left) / content.width : 0.5);
  const toV = (y: number) => (content.height > 0 ? (y - content.top) / content.height : 0.5);
  const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
  /* Room to the nearest edge: positive inside the picture, negative (the distance to it) outside. */
  const outX = Math.max(visible.left - pointerX, 0, pointerX - (visible.left + visible.width));
  const outY = Math.max(visible.top - pointerY, 0, pointerY - (visible.top + visible.height));
  const room =
    outX > 0 || outY > 0
      ? -Math.hypot(outX, outY)
      : Math.min(pointerX - visible.left, visible.left + visible.width - pointerX, pointerY - visible.top, visible.top + visible.height - pointerY);
  const grace = lensSize * MAGNIFIER_EDGE_GRACE;
  return {
    inside: within(0),
    near: within(grace),
    fit: room >= 0 ? 1 : grace > 0 ? smoothstep(1 + room / grace) : 0,
    x: pointerX - root.left - lensSize / 2,
    y: pointerY - root.top - lensSize / 2 - lift,
    u: toU(pointerX),
    v: toV(pointerY),
    spanU: content.width > 0 ? lensSize / content.width : 0,
    spanV: content.height > 0 ? lensSize / content.height : 0,
    bounds: [
      clamp01(toU(visible.left)),
      clamp01(toV(visible.top)),
      clamp01(toU(visible.left + visible.width)),
      clamp01(toV(visible.top + visible.height)),
    ] as const,
  };
}

export type MagnifierPlacement = ReturnType<typeof magnifierPlace>;

/*
 * THE LENS HAS WEIGHT. Its position, its size and its zoom each move on a spring towards where they should be, so the lens
 * trails the pointer and settles, grows out of the cursor and shrinks back into it, and the picture swells under the glass
 * instead of switching on. A damped spring, integrated in small fixed steps so a long frame cannot make it explode.
 */
export type MagnifierSpring = { readonly x: number; readonly v: number };
export type MagnifierSpringConfig = { readonly stiffness: number; readonly damping: number; readonly epsilon: number };

/** Leaving: the lens shrinks back into the pointer, as quick as it came and with no bounce. */
export const MAGNIFIER_LEAVE_SPRING: MagnifierSpringConfig = { stiffness: 900, damping: 60, epsilon: 0.001 };

/**
 * Following the pointer: stiff and just under critical damping, so the lens stays close (about 25 ms behind at a steady
 * speed) with only a hint of weight, and arrives without overshooting. Softer, it read as dragging behind the mouse.
 */
export const MAGNIFIER_FOLLOW_SPRING: MagnifierSpringConfig = { stiffness: 3600, damping: 110, epsilon: 0.05 };
/**
 * Appearing: the lens grows out of the pointer to the size that fits. Critically damped and quick: it arrives at its size
 * and stops there, an object placed, not a bounce and not a fade.
 */
export const MAGNIFIER_SCALE_SPRING: MagnifierSpringConfig = { stiffness: 900, damping: 60, epsilon: 0.001 };
/** The zoom easing in, and deepening on a press. Close to critical: the picture swells, it does not wobble. */
export const MAGNIFIER_ZOOM_SPRING: MagnifierSpringConfig = { stiffness: 260, damping: 30, epsilon: 0.001 };

/**
 * How far past the picture's edge the lens shrinks away, as a share of the lens. Over the picture it is always whole; past
 * the edge it shrinks over this distance, so the edge and a little of what is beyond it show in the glass, then it is gone.
 */
export const MAGNIFIER_EDGE_GRACE = 0.35;

/**
 * How long the lens lingers once the pointer is off the picture, in ms, before it shrinks away and closes, wherever the
 * pointer is: resting in the grace past the edge is not looking at the picture.
 */
export const MAGNIFIER_OUTSIDE_LINGER_MS = 500;

/**
 * How much larger the lens grows while the mouse button is held on it. The magnification stays the same, so the bigger
 * glass shows more of the picture around the spot: hold to look around without moving.
 */
export const MAGNIFIER_PRESS_SCALE = 1.5;

/* Growing under a press is deliberate, a little slower and barely bouncy; letting go snaps back, quicker and with none. */
export const MAGNIFIER_PRESS_SPRING: MagnifierSpringConfig = { stiffness: 520, damping: 40, epsilon: 0.001 };
export const MAGNIFIER_RELEASE_SPRING: MagnifierSpringConfig = { stiffness: 900, damping: 60, epsilon: 0.001 };

const SPRING_STEP = 1 / 240;

/** The spring after `dt` seconds pulled towards `target`. */
export function magnifierSpringStep(spring: MagnifierSpring, target: number, dt: number, config: MagnifierSpringConfig): MagnifierSpring {
  let { x, v } = spring;
  for (let left = Math.min(Math.max(dt, 0), 0.1); left > 0; left -= SPRING_STEP) {
    const step = Math.min(left, SPRING_STEP);
    v += (config.stiffness * (target - x) - config.damping * v) * step;
    x += v * step;
  }
  return { x, v };
}

/** Whether the spring has come to rest at `target`, close enough that another frame would draw the same pixels. */
export function magnifierSpringSettled(spring: MagnifierSpring, target: number, config: MagnifierSpringConfig): boolean {
  return Math.abs(target - spring.x) < config.epsilon && Math.abs(spring.v) < config.epsilon * 10;
}

export const magnifierContract = {
  id: "magnifier",
  category: "content",
  css: "@skryensya/core/components/magnifier.css",
  parts: magnifierParts,
  hooks: ["--sk-magnifier-bg", "--sk-magnifier-lens-shadow", "--sk-magnifier-size"],

  options: {
    /** How many times larger the lens shows the media, 1 to 8. */
    zoom: { type: "number", default: MAGNIFIER_DEFAULT_ZOOM, min: MAGNIFIER_MIN_ZOOM, max: MAGNIFIER_MAX_ZOOM, attr: "data-zoom" },
    /**
     * How much the glass splits colour toward its edge, the rainbow a real lens gives. `subtle` (default) is a faint fringe at
     * the rim; `strong` spreads it wider and deeper into the lens, for a picture where the glass itself is the point. Drawn by
     * the WebGPU glass only: the plain 2D fallback has no fringe either way.
     */
    dispersion: { type: "enum", values: ["subtle", "strong"], default: "subtle", attr: "data-dispersion" },
    /**
     * Coloured glass: it lets through only its own light, the way a gel over a lamp does. `red`, `green` and `blue` pass one
     * channel of the picture; `cyan`, `magenta` and `yellow` pass two (they hold back red, green and blue). `none` (default) is
     * clear glass. Decorative: the picture under the lens keeps its real colours, so nothing is lost to someone who cannot
     * tell the colours apart.
     */
    filter: { type: "enum", values: ["none", "red", "green", "blue", "cyan", "magenta", "yellow"], default: "none", attr: "data-filter" },
  },

  signatures: {
    Magnifier: {
      intent: ["magnifier", "image-zoom", "loupe", "lens", "product-zoom", "liquid-glass"],
      host: { element: "div" },
      options: ["zoom", "dispersion", "filter"],
      forward: ["id", "aria-*"],
      slots: {
        /** The picture the lens reads: an `img`, `video` or `canvas`, bare or inside one wrapper (an ImageFrame). It keeps its own `alt` or label. */
        children: { accepts: "node", required: true },
      },
      mount: "data-sk-magnifier",
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          { slot: "children" },
          { element: "canvas", part: "lens", attrs: { "aria-hidden": "true" } },
        ],
      },
      react: { from: "@skryensya/react/magnifier", name: "Magnifier" },
    },
  },
} as const satisfies ComponentContract;
