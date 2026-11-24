import {
  MAGNIFIER_FOLLOW_SPRING,
  MAGNIFIER_LEAVE_SPRING,
  MAGNIFIER_OUTSIDE_LINGER_MS,
  MAGNIFIER_PRESS_SCALE,
  MAGNIFIER_PRESS_SPRING,
  MAGNIFIER_RELEASE_SPRING,
  MAGNIFIER_SCALE_SPRING,
  MAGNIFIER_ZOOM_SPRING,
  magnifierAttrs,
  magnifierClampZoom,
  magnifierContentBox,
  magnifierParts,
  magnifierPlace,
  magnifierSpringSettled,
  magnifierSpringStep,
  type MagnifierBox,
  type MagnifierPlacement,
  type MagnifierSpring,
} from "./magnifier.js";

/*
 * HOW A MAGNIFIER FOLLOWS THE POINTER AND DRAWS ITS LENS, shared by both bindings so they cannot draw it differently. The
 * bindings only find the elements and hand over the zoom; the listeners, the GPU and the fallback all live here.
 *
 * Nothing is set up until the pointer first enters: a page with twenty product photos asks the GPU for nothing until one is
 * hovered. Then:
 *   - WEBGPU when the browser has it and the media is readable by the GPU. The glass is the shader from
 *     arya3d/liquid-glass-webgpu (MIT, Copyright (c) arya3d), cut from a pill to a circle and given a zoom.
 *   - 2D CANVAS otherwise: no WebGPU, or an image from another origin without CORS, which the GPU refuses (the first upload
 *     throws, and that is how it is found out). A plain zoomed circle, still a lens.
 * An image is uploaded once per source; a video or canvas is uploaded every frame the lens is showing, since it changes.
 */

/* The look: the original shader's numbers, with a thinner rim and a narrower bend at the edge, both in lens pixels where the
   original scaled them with the lens (on a 10rem lens its rim was ~7px and its bend took 30% of the radius). */
const GLASS_SHADER = /* wgsl */ `
// bounds: the part of the picture the page shows, in uv (u0, v0, u1, v1). Past it the lens shows bg.
// bg: the colour the picture sits on, which fills the lens past the picture, drawn here so it moves with the picture.
// frame: that part's width and height and corner radius in CSS px, and lens pixels per CSS px of page under the zoom.
// motion: the direction the lens travels (xy) and how fast, 0 at rest to 1 flung (z). It stretches the glass and deepens
// the bend at the edge, so the glass reads as moving, not as a picture moved.
// dispersion: how far colour splits at the edge, 1 for the default fringe.
// tint: the light the glass lets through, per channel (white for clear glass).
struct Uniforms { center: vec2f, span: vec2f, zoom: f32, resolution: f32, dispersion: f32, bounds: vec4f, frame: vec4f, motion: vec4f, bg: vec4f, tint: vec4f };
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var media_sampler: sampler;
@group(0) @binding(2) var media: texture_2d<f32>;

// No bright ring at the edge: the lens is the bend, the colour fringe and the magnification. Its edge reads by the glass
// getting a touch darker where it curves away (EDGE_SHADE over EDGE_SHADE_PX), with the hairline and the shadow in CSS.
const LENS_REFRACTION = 0.18;
const F0 = 0.04;
const DISPERSION = 0.006;
const RIM_STRENGTH = 0.15;
const FRESNEL = 0.3;
const FACE_ON_SPREAD_CUT = 0.909;
const RIM_POWER = 3.0;
const VIEW = vec3f(0.0, 0.0, 1.0);
const STRETCH = 0.14;
const EDGE_SHADE = 0.16;
const EDGE_SHADE_PX = 10.0;
const SLOSH = 0.8;

@vertex
fn vert_main(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  const quad = array<vec2f, 6>(vec2(-1, -1), vec2(1, -1), vec2(1, 1), vec2(-1, -1), vec2(-1, 1), vec2(1, 1));
  return vec4(quad[i], 0.0, 1.0);
}

// The lens is the canvas's inscribed circle; positions run -0.5..0.5 across it. In motion it narrows across its travel, which
// reads as a stretch along it while staying inside the canvas.
fn edge_distance(p: vec2f) -> f32 {
  let along = dot(p, u.motion.xy);
  let across = p - u.motion.xy * along;
  return length(u.motion.xy * along + across / (1.0 - STRETCH * u.motion.z)) - 0.5;
}

// Signed distance to a rounded box centred on the origin (Inigo Quilez), the same one the original pill was cut with.
fn rounded_box_distance(point: vec2f, half_size: vec2f, radius: f32) -> f32 {
  let from_corner = abs(point) - half_size + radius;
  return length(max(from_corner, vec2f(0.0))) + min(max(from_corner.x, from_corner.y), 0.0) - radius;
}

// The picture inside the part the page shows, rounded as the page rounds it, and the surface it sits on (bg) past it: the
// lens is opaque everywhere, and the fill is part of the same draw, so it is always the lens's own size and place. The
// edge between them is anti-aliased over one lens pixel.
fn sample_media(p: vec2f) -> vec4f {
  let uv = u.center + p * u.span / u.zoom;
  let picture = textureSampleLevel(media, media_sampler, uv, 0.0);
  let size = u.frame.xy;
  let page = (uv - u.bounds.xy) / (u.bounds.zw - u.bounds.xy) * size;
  let radius = min(u.frame.z, min(size.x, size.y) / 2.0);
  let outside = rounded_box_distance(page - size / 2.0, size / 2.0, radius) * u.frame.w;
  return vec4f(mix(u.bg.rgb, picture.rgb, saturate(0.5 - outside)), 1.0);
}

fn surface_normal(p: vec2f) -> vec3f {
  let dx = edge_distance(p + vec2f(0.001, 0.0)) - edge_distance(p - vec2f(0.001, 0.0));
  let dy = edge_distance(p + vec2f(0.0, 0.001)) - edge_distance(p - vec2f(0.0, 0.001));
  return normalize(vec3f(dx, dy, 1.0));
}

@fragment
fn frag_main(@builtin(position) coord: vec4f) -> @location(0) vec4f {
  let p = coord.xy / u.resolution - 0.5;
  let d = edge_distance(p);
  // The same distance in lens pixels: the edge is anti-aliased over one, and the rim is a fixed few of them wide.
  let d_px = d * u.resolution;
  let cover = saturate(0.5 - d_px);
  if (cover <= 0.0) { return vec4f(0.0); }

  let normal = surface_normal(p);
  let facing = max(dot(normal, VIEW), 0.0);
  let fresnel = F0 + (1.0 - F0) * pow(1.0 - facing, 5.0);

  // Lens bend: flat in the middle, falling off steeply at the rim.
  let bend = pow(saturate(-d / (LENS_REFRACTION * (1.0 + SLOSH * u.motion.z))), 0.25) * 1.57;
  // Stronger dispersion also reaches further in from the rim: less of it is cut where the glass faces the viewer.
  let spread = DISPERSION * u.dispersion * (1.0 - facing * FACE_ON_SPREAD_CUT / sqrt(u.dispersion));
  let bent = p * sin(bend);
  let offset = bent * spread;
  let split = 0.02 * u.dispersion;
  let red = sample_media((p - offset) * sin(bend * (1.0 - split))).r;
  let middle = sample_media(bent);
  let blue = sample_media((p + offset) * sin(bend * (1.0 + split))).b;

  let rim = pow(1.0 - facing, RIM_POWER) * cover * RIM_STRENGTH;
  // The picture (premultiplied, its coverage in middle.a) and the faint light the glass's curve catches.
  let light_on_glass = saturate(rim);
  // The glass's thickness: a little darker over the last few pixels before its edge, falling off smoothly into the middle.
  let thickness = 1.0 - EDGE_SHADE * (1.0 - smoothstep(0.0, EDGE_SHADE_PX, -d_px));
  let picture = vec3f(red, middle.g, blue) * (1.0 + fresnel * FRESNEL) * thickness;
  let alpha = smoothstep(0.0, 1.0, cover);
  // Coloured glass filters everything it shows, the light it catches included.
  return vec4f((picture + vec3f(light_on_glass)) * u.tint.rgb, saturate(middle.a + light_on_glass)) * alpha;
}
`;

type Media = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

/* shortcut: WebGPU is typed loosely here because TypeScript's DOM lib has no WebGPU types; upgrade to @webgpu/types if more GPU code lands. */
type Gpu = any;

/** How the page frames the picture: the shown part's size and corner radius in CSS px. */
type Frame = { readonly width: number; readonly height: number; readonly radius: number; readonly bg: Rgb };

/** A colour as 0 to 1 channels, straight from the page (sRGB values, which is what the texture and the canvas hold too). */
type Rgb = readonly [number, number, number];

let probe: CanvasRenderingContext2D | null = null;
/** Any CSS colour the browser can paint (`oklch()`, `color-mix()`, a system colour) as RGBA bytes, by painting one pixel of it. */
function cssColor(doc: Document, color: string): [number, number, number, number] {
  probe ??= doc.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe || !color.trim()) return [0, 0, 0, 0];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#0000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r!, g!, b!, a!];
}

/**
 * The colour the picture sits on: `--sk-magnifier-bg` when the page sets one, otherwise what is painted behind the picture,
 * its ancestors' backgrounds (and a modal dialog's backdrop) laid see-through over the first solid one. Read when the lens appears, so a theme switch is
 * picked up on the next hover.
 * shortcut: a background image or gradient counts as its colour only, and an unpainted page as white.
 */
function surfaceColor(root: HTMLElement, lens: HTMLElement): Rgb {
  const win = root.ownerDocument.defaultView;
  if (!win) return [1, 1, 1];
  const set = cssColor(root.ownerDocument, win.getComputedStyle(lens).getPropertyValue("--sk-magnifier-bg"));
  const layers: [number, number, number, number][] = set[3] > 0 ? [set] : [];
  /* One layer more; true once it is solid, since nothing under a solid layer shows. */
  const add = (color: string): boolean => {
    const layer = cssColor(root.ownerDocument, color);
    if (layer[3] > 0) layers.push(layer);
    return layer[3] === 255;
  };
  for (let node: HTMLElement | null = root; node && set[3] < 255; node = node.parentElement) {
    if (add(win.getComputedStyle(node).backgroundColor)) break;
    /* A modal dialog (a Lightbox) sits over its own backdrop, which is not an ancestor: the scrim over the page. Count it,
       over whatever the page paints below, so the lens past the photo shows the page with the overlay on top. */
    if (node instanceof HTMLDialogElement && node.matches(":modal") && add(win.getComputedStyle(node, "::backdrop").backgroundColor)) break;
  }
  let rgb: [number, number, number] = [255, 255, 255];
  for (const [r, g, b, a] of layers.reverse()) {
    const alpha = a / 255;
    rgb = [r * alpha + rgb[0] * (1 - alpha), g * alpha + rgb[1] * (1 - alpha), b * alpha + rgb[2] * (1 - alpha)];
  }
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

/** How the lens is moving: the unit direction of travel, and its speed from 0 (at rest) to 1 (flung). */
type Motion = { readonly dx: number; readonly dy: number; readonly amount: number };
/* What the glass is made of: how far it splits colour (1, the default fringe) and the light it lets through per channel. */
type Look = { dispersion: number; tint: readonly [number, number, number] };

/** `draw` returns false while the media has no pixels yet (an image still loading), so the caller tries again next frame. */
type Painter = {
  readonly kind: "webgpu" | "2d";
  draw(place: MagnifierPlacement, zoom: number, frame: Frame, motion: Motion, look: Look): boolean;
  destroy(): void;
};

/**
 * The corner radius the picture is shown with: its own, or the nearest one an ancestor inside the magnifier clips it to (an
 * ImageFrame rounds its frame, not the image).
 * shortcut: one radius for all four corners, read from the top-left one, in px; percentages and elliptical corners read as 0.
 */
function cornerRadius(media: Element, root: Element): number {
  const win = root.ownerDocument.defaultView;
  for (let node: Element | null = media; node && win; node = node === root ? null : node.parentElement) {
    const radius = Number.parseFloat(win.getComputedStyle(node).borderTopLeftRadius);
    if (radius > 0 && win.getComputedStyle(node).borderTopLeftRadius.endsWith("px")) return radius;
  }
  return 0;
}

const MEDIA_SELECTOR = `:is(img, video, canvas):not(.${magnifierParts.lens})`;

function mediaSize(media: Media): [number, number] {
  if (media instanceof HTMLImageElement) return [media.naturalWidth, media.naturalHeight];
  if (media instanceof HTMLVideoElement) return [media.videoWidth, media.videoHeight];
  return [media.width, media.height];
}

/** The pixel side the lens canvas should have: its CSS size at the device's density, and at the size a press grows it to, so
    the grown lens is as sharp as the resting one (scaled up, a canvas drawn at the resting size would blur). */
function sizeCanvas(lens: HTMLCanvasElement): number {
  const density = lens.ownerDocument.defaultView?.devicePixelRatio ?? 1;
  const side = Math.max(1, Math.round(lens.clientWidth * density * Math.max(MAGNIFIER_PRESS_SCALE, 1)));
  if (lens.width !== side) lens.width = side;
  if (lens.height !== side) lens.height = side;
  return side;
}

function create2dPainter(lens: HTMLCanvasElement, media: Media): Painter {
  const ctx = lens.getContext("2d");
  return {
    kind: "2d",
    draw(place, zoom, frame, _motion, look) {
      const [width, height] = mediaSize(media);
      if (!ctx || !width || !height) return false;
      const side = sizeCanvas(lens);
      /* Lens pixels per unit of uv on each axis, and the uv at the lens's top-left corner. */
      const scaleX = (side * zoom) / place.spanU;
      const scaleY = (side * zoom) / place.spanV;
      const left = place.u - place.spanU / zoom / 2;
      const top = place.v - place.spanV / zoom / 2;
      const [u0, v0, u1, v1] = place.bounds;
      ctx.clearRect(0, 0, side, side);
      ctx.save();
      ctx.beginPath();
      ctx.arc(side / 2, side / 2, side / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = `rgb(${frame.bg.map((channel) => Math.round(channel * 255)).join(" ")})`;
      ctx.fillRect(0, 0, side, side);
      /* The whole picture, placed and scaled; the clip keeps the part the page shows, rounded as the page rounds it. */
      ctx.beginPath();
      const radius = frame.width > 0 ? frame.radius * ((u1 - u0) * scaleX) / frame.width : 0;
      ctx.roundRect((u0 - left) * scaleX, (v0 - top) * scaleY, (u1 - u0) * scaleX, (v1 - v0) * scaleY, radius);
      ctx.clip();
      ctx.drawImage(media, -left * scaleX, -top * scaleY, scaleX, scaleY);
      ctx.restore();
      if (look.tint.some((channel) => channel < 1)) {
        /* Coloured glass: multiply by the light it lets through, inside the lens only. */
        ctx.save();
        ctx.beginPath();
        ctx.arc(side / 2, side / 2, side / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = `rgb(${look.tint.map((channel) => Math.round(channel * 255)).join(" ")})`;
        ctx.fillRect(0, 0, side, side);
        ctx.restore();
      }
      return true;
    },
    destroy() {},
  };
}

/* One device for every magnifier on the page: a browser hands out few, and a page of product photos would run out. */
let sharedDevice: Promise<Gpu> | null = null;
function gpuDevice(): Promise<Gpu> {
  return (sharedDevice ??= (async () => {
    const adapter = await (navigator as { gpu?: Gpu }).gpu?.requestAdapter();
    const device: Gpu = (await adapter?.requestDevice()) ?? null;
    /* A lost device (driver reset, tab in the background too long) is asked for again by the next magnifier that starts. */
    device?.lost.then(() => {
      sharedDevice = null;
    });
    return device;
  })());
}

async function createGpuPainter(lens: HTMLCanvasElement, media: Media, cancelled: () => boolean): Promise<Painter | null> {
  const gpu: Gpu = (navigator as { gpu?: Gpu }).gpu;
  const device: Gpu = await gpuDevice();
  /* A view torn down while the device was on its way must not touch the canvas: a reconnected view may own it by now. */
  if (!device || cancelled()) return null;

  let texture: Gpu = null;
  let bindGroup: Gpu = null;
  let uploadedFrom = "";
  let uploadedFrame = "";
  const isStill = media instanceof HTMLImageElement;
  /* Returns false when the media is not ready yet. Throws when the GPU may not read it (cross-origin without CORS). */
  const upload = (): boolean => {
    const [width, height] = mediaSize(media);
    if (!width || !height) return false;
    const key = `${isStill ? (media as HTMLImageElement).currentSrc : ""}|${width}x${height}`;
    if (isStill && key === uploadedFrom) return true;
    /* A paused video shows the same frame: uploading it again every frame is work nobody sees. */
    const frameId = media instanceof HTMLVideoElement ? `${media.currentTime}` : "";
    if (media instanceof HTMLVideoElement && key === uploadedFrom && frameId === uploadedFrame) return true;
    uploadedFrame = frameId;
    if (key !== uploadedFrom) {
      texture?.destroy();
      texture = device.createTexture({
        size: [width, height],
        format: "rgba8unorm",
        usage: 0x04 | 0x02 | 0x10, // TEXTURE_BINDING | COPY_DST | RENDER_ATTACHMENT
      });
      bindGroup = null;
      uploadedFrom = key;
    }
    device.queue.copyExternalImageToTexture({ source: media }, { texture }, [width, height]);
    return true;
  };

  /* The first upload decides: if the GPU refuses this media, the caller falls back to 2D before the canvas is claimed. */
  try {
    upload();
  } catch {
    return null;
  }

  const context: Gpu = lens.getContext("webgpu");
  if (!context) {
    texture?.destroy();
    return null;
  }
  const format = gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: "premultiplied" });
  const module = device.createShaderModule({ code: GLASS_SHADER });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module, entryPoint: "vert_main" },
    fragment: { module, entryPoint: "frag_main", targets: [{ format }] },
  });
  const sampler = device.createSampler({ magFilter: "linear", minFilter: "linear" });
  const uniforms = device.createBuffer({ size: 112, usage: 0x40 | 0x08 }); // UNIFORM | COPY_DST
  const values = new Float32Array(28);

  return {
    kind: "webgpu",
    draw(place, zoom, frame, motion, look) {
      try {
        if (!upload()) return false;
      } catch {
        return true; // shortcut: a source swapped to an unreadable one after setup draws nothing; reconnect to fall back to 2D.
      }
      const side = sizeCanvas(lens);
      /* Laid out as the WGSL struct: two vec2s and three floats, padding to 16 bytes, then the five vec4s. */
      const lensPixelsPerPagePixel = lens.clientWidth > 0 ? (side / lens.clientWidth) * zoom : zoom;
      values.set([place.u, place.v, place.spanU, place.spanV, zoom, side, look.dispersion, 0, ...place.bounds, frame.width, frame.height, frame.radius, lensPixelsPerPagePixel, motion.dx, motion.dy, motion.amount, 0, ...frame.bg, 1, ...look.tint, 1]);
      device.queue.writeBuffer(uniforms, 0, values);
      bindGroup ??= device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniforms } },
          { binding: 1, resource: sampler },
          { binding: 2, resource: texture.createView() },
        ],
      });
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{ view: context.getCurrentTexture().createView(), loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 0] }],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(6);
      pass.end();
      device.queue.submit([encoder.finish()]);
      return true;
    },
    destroy() {
      texture?.destroy();
      uniforms.destroy();
    },
  };
}

/** How long a finger has to hold still on the picture before it means "magnify" rather than "scroll". */
const TOUCH_HOLD_MS = 250;
/* A mouse press held longer than this grew the lens: its release is not a click. */
const MAGNIFIER_PRESS_CLICK_MS = 250;
/* How long after a long press's release its click may still arrive (a touch's click can lag the lift). */
const MAGNIFIER_CLICK_WINDOW_MS = 400;
/** How far a finger may drift during that hold, in CSS px, and still count as holding still. */
const TOUCH_SLOP = 10;
/** How far above the finger the lens floats, as a share of its size: enough to clear a fingertip. */
const TOUCH_LIFT = 0.75;
/** The speed, in CSS px a second, at which the glass shows all the motion it will: stretch and bend at their most. */
const FLUNG_SPEED = 3000;

export type MagnifierView = {
  setZoom(zoom: number): void;
  /** How far colour splits at the glass's edge: `magnifierDispersionStrength`, 1 for the default fringe. */
  setDispersion(strength: number): void;
  /** The light the glass lets through, per channel 0 to 1: `magnifierFilterColor`, white for clear glass. */
  setFilter(tint: readonly [number, number, number]): void;
  destroy(): void;
};

/**
 * Wires a magnifier: `root` holds the media (the first `img`, `video` or `canvas` inside it, at any depth) and `lens`, the
 * canvas the glass is drawn into. Mouse and pen show the lens while they hover the media, and a press zooms deeper; a finger
 * shows it after a short hold.
 */
export function createMagnifierView(
  root: HTMLElement,
  lens: HTMLCanvasElement,
  options: {
    zoom: number;
    /** How far colour splits at the glass's edge (`magnifierDispersionStrength`). 1, the default fringe, when left out. */
    dispersion?: number;
    /** The light the glass lets through, per channel 0 to 1 (`magnifierFilterColor`). Clear glass when left out. */
    filter?: readonly [number, number, number];
    /** Which media inside `root` the lens reads, when it is not simply the first one (a Lightbox's stage holds several). */
    media?: string;
    /** Holding the mouse button grows the lens. Off where a press already means something else (a Lightbox's pan and swipe). */
    pressToGrow?: boolean;
    /**
     * The media moves on its own (a Lightbox flies the photo in from its thumbnail, zooms and pans it), so its box is read
     * again every frame instead of once per pointer arrival. One layout read a frame; off by default, where media sits still.
     */
    trackMedia?: boolean;
  },
): MagnifierView {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  let zoom = magnifierClampZoom(options.zoom);
  const look: Look = { dispersion: options.dispersion && options.dispersion > 0 ? options.dispersion : 1, tint: options.filter ?? [1, 1, 1] };
  let painter: Painter | null = null;
  let starting: Promise<void> | null = null;
  let destroyed = false;

  /* The pointer's latest coordinates (null: it let go or left), and the lens's own state, which chases them. */
  let pointer: { x: number; y: number } | null = null;
  let active = false;
  let leaving = false;
  let pressed = false;
  let reduced = false;
  let x: MagnifierSpring = { x: 0, v: 0 };
  let y: MagnifierSpring = { x: 0, v: 0 };
  /* Presence, 0 (gone) to 1 (here): one spring for growing out of the pointer and shrinking back into it. */
  let presence: MagnifierSpring = { x: 0, v: 0 };
  /* Whether the lens has a drawn frame yet. Until it does it stays at nothing: an empty canvas would show only its CSS
     background, a flat disc, for the moment the GPU takes to get ready on the first hover. */
  let drawn = false;
  let depth: MagnifierSpring = { x: 1, v: 0 };
  /* How far the press has grown the lens, 0 (resting) to 1 (MAGNIFIER_PRESS_SCALE). */
  let press: MagnifierSpring = { x: 0, v: 0 };
  let place: MagnifierPlacement | null = null;
  let framing: Frame = { width: 0, height: 0, radius: 0, bg: [1, 1, 1] };
  let frame = 0;
  let lastTime = 0;
  let written = "";
  /* How far above the pointer the lens floats: 0 for a mouse or pen, most of a lens for a finger, which would cover it. */
  let lift = 0;
  /* A finger that went down on the picture and has not yet held still long enough to mean "magnify". */
  let hold: { timer: number; x: number; y: number } | null = null;
  /* Counts the time the pointer spends off the picture while the lens shows; when it runs out the lens closes. A timer, not
     the frame loop: a pointer resting off the picture schedules no frames, so the loop would never notice the time pass. */
  let outsideTimer = 0;
  const stopOutsideTimer = (): void => {
    if (outsideTimer) win?.clearTimeout(outsideTimer);
    outsideTimer = 0;
  };
  let holding = false;
  /*
   * THE CLICK A LONG PRESS ENDS WITH IS NOT A CLICK. Inside a link (a Lightbox trigger, a product card), holding the mouse
   * down to grow the lens, or holding a finger still to magnify, ends in a `click` the browser dispatches on release, which
   * would open or follow what the reader was only looking at. That one click is swallowed; a quick press is still a click.
   */
  let swallowClick = false;
  let swallowTimer = 0;
  let pressedAt = 0;
  const swallowNextClick = (): void => {
    swallowClick = true;
    if (swallowTimer) win?.clearTimeout(swallowTimer);
    /* A click that never comes (the pointer let go off the picture) must not eat a later, real one. */
    swallowTimer = win?.setTimeout(() => (swallowClick = false), MAGNIFIER_CLICK_WINDOW_MS) ?? 0;
  };

  /*
   * THE GEOMETRY IS MEASURED, NOT READ PER MOVE. Every box, the `object-fit` and the lens size are read once when the pointer
   * arrives, and again only after something that can move them: a scroll, a resize of the magnifier, the picture loading. A
   * frame then reads nothing from layout, so a pointer at 120 Hz over a busy page forces no style or layout work at all.
   */
  type Geometry = { target: Media; visible: DOMRect; content: MagnifierBox; root: DOMRect; lensSize: number; topLimit: number };
  let geometry: Geometry | null = null;
  const measure = (): Geometry | null => {
    if (geometry?.target.isConnected) return geometry;
    const target = root.querySelector<Media>(options.media ?? MEDIA_SELECTOR);
    if (!target || !win) return (geometry = null);
    const visible = target.getBoundingClientRect();
    const content = magnifierContentBox(visible, mediaSize(target), win.getComputedStyle(target).objectFit);
    /* A page with a sticky header says how tall it is with `scroll-padding-top`; a lens lifted above a finger stays below it. */
    const topLimit = Number.parseFloat(win.getComputedStyle(doc.documentElement).scrollPaddingTop) || 0;
    return (geometry = { target, visible, content, root: root.getBoundingClientRect(), lensSize: lens.offsetWidth, topLimit });
  };
  const remeasure = (): void => {
    geometry = null;
  };

  const start = (target: Media): Promise<void> =>
    (starting ??= (async () => {
      const gpuPainter = await createGpuPainter(lens, target, () => destroyed).catch(() => null);
      if (destroyed) return gpuPainter?.destroy();
      painter = gpuPainter ?? create2dPainter(lens, target);
      root.setAttribute(magnifierAttrs.renderer, painter.kind);
      schedule();
    })());

  const activate = (g: Geometry, at: { x: number; y: number }): void => {
    active = true;
    leaving = false;
    /* Read per appearance, so a change of the setting is honoured on the next hover. */
    reduced = win?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    x = { x: at.x, v: 0 };
    y = { x: at.y, v: 0 };
    /* Out of the cursor, and the picture swelling from life size: unless motion is reduced, then it is simply there. */
    presence = { x: reduced ? 1 : 0, v: 0 };
    depth = { x: reduced ? zoom : 1, v: 0 };
    press = { x: 0, v: 0 };
    framing = { width: g.visible.width, height: g.visible.height, radius: cornerRadius(g.target, root), bg: surfaceColor(root, lens) };
    root.setAttribute(magnifierAttrs.active, "");
    void start(g.target);
  };
  const finish = (): void => {
    stopOutsideTimer();
    active = false;
    leaving = false;
    place = null;
    written = "";
    root.removeAttribute(magnifierAttrs.active);
    lens.style.removeProperty("scale");
  };

  /*
   * ONE FRAME. The springs take a step towards the pointer, the zoom wanted and the size wanted; the lens is moved and drawn
   * where they are. It asks for another frame only while a spring is still moving, the picture is still loading, or the media
   * is a video or a canvas: a lens at rest over a photo costs nothing.
   */
  const render = (now: number): void => {
    frame = 0;
    if (options.trackMedia) remeasure();
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 1 / 20) : 1 / 60;
    lastTime = now;
    const g = measure();
    if (!g) return;

    if (pointer) {
      const test = magnifierPlace({ pointerX: pointer.x, pointerY: pointer.y, root: g.root, visible: g.visible, content: g.content, lensSize: g.lensSize });
      /* The lens starts over the picture, and lives on through the grace past its edge, where it has shrunk to nothing. */
      if (!active) {
        if (!test.inside) return;
        activate(g, pointer);
      } else if (leaving ? test.inside : !test.near) {
        leaving = !leaving;
      }
      /* Off the picture, even within the grace where the lens still shows, it closes after a moment; back on it, it stays. */
      if (test.inside) stopOutsideTimer();
      else if (active && !leaving && !outsideTimer && win) {
        outsideTimer = win.setTimeout(() => {
          outsideTimer = 0;
          if (active && !leaving) {
            leaving = true;
            schedule();
          }
        }, MAGNIFIER_OUTSIDE_LINGER_MS);
      }
    }
    if (!active) return;

    const targetX = pointer && !leaving ? pointer.x : x.x;
    const targetY = pointer && !leaving ? pointer.y : y.x;
    const targetPresence = leaving || !drawn ? 0 : 1;
    const targetZoom = zoom;
    const targetPress = pressed ? 1 : 0;
    if (reduced) {
      x = { x: targetX, v: 0 };
      y = { x: targetY, v: 0 };
      presence = { x: targetPresence, v: 0 };
      depth = { x: targetZoom, v: 0 };
      press = { x: targetPress, v: 0 };
    } else {
      x = magnifierSpringStep(x, targetX, dt, MAGNIFIER_FOLLOW_SPRING);
      y = magnifierSpringStep(y, targetY, dt, MAGNIFIER_FOLLOW_SPRING);
      presence = magnifierSpringStep(presence, targetPresence, dt, leaving ? MAGNIFIER_LEAVE_SPRING : MAGNIFIER_SCALE_SPRING);
      depth = magnifierSpringStep(depth, targetZoom, dt, MAGNIFIER_ZOOM_SPRING);
      press = magnifierSpringStep(press, targetPress, dt, pressed ? MAGNIFIER_PRESS_SPRING : MAGNIFIER_RELEASE_SPRING);
    }
    if (leaving && (reduced || presence.x < 0.02)) return finish();

    place = magnifierPlace({ pointerX: x.x, pointerY: y.x, root: g.root, visible: g.visible, content: g.content, lensSize: g.lensSize, lift, topLimit: g.topLimit });
    /*
     * Size: grown out of the pointer (presence), shrinking towards the picture's edge with grace (fit, measured at the lens's
     * own sprung position, so it follows the lens even while it trails), and growing while the mouse button is held.
     * The fit is a pure function of where the lens is, already smooth, so it needs no spring of its own.
     */
    const p = Math.min(Math.max(presence.x, 0), 1);
    const grow = 1 + (MAGNIFIER_PRESS_SCALE - 1) * Math.max(press.x, 0);
    const size = p * place.fit * grow;
    const style = `${place.x.toFixed(1)}px ${place.y.toFixed(1)}px|${size.toFixed(3)}`;
    if (style !== written) {
      written = style;
      lens.style.translate = `${place.x.toFixed(1)}px ${place.y.toFixed(1)}px`;
      lens.style.scale = size.toFixed(3);
    }

    const speed = Math.hypot(x.v, y.v);
    const motion: Motion = reduced || speed < 1 ? { dx: 0, dy: 0, amount: 0 } : { dx: x.v / speed, dy: y.v / speed, amount: Math.min(speed / FLUNG_SPEED, 1) };
    /* The lens grows by CSS scale, which would magnify its picture by as much: the drawn zoom is divided back, so a held lens
       keeps the same magnification and simply shows more of the picture. */
    const ready = painter ? painter.draw(place, Math.max(depth.x, 1) / grow, framing, motion, look) : false;
    /* The first drawn frame lets the lens grow in; ask for the frame that starts it, since nothing else is moving yet. */
    if (ready && !drawn) {
      drawn = true;
      schedule();
    }
    const moving =
      !magnifierSpringSettled(x, targetX, MAGNIFIER_FOLLOW_SPRING) ||
      !magnifierSpringSettled(y, targetY, MAGNIFIER_FOLLOW_SPRING) ||
      !magnifierSpringSettled(presence, targetPresence, leaving ? MAGNIFIER_LEAVE_SPRING : MAGNIFIER_SCALE_SPRING) ||
      !magnifierSpringSettled(depth, targetZoom, MAGNIFIER_ZOOM_SPRING) ||
      !magnifierSpringSettled(press, targetPress, pressed ? MAGNIFIER_PRESS_SPRING : MAGNIFIER_RELEASE_SPRING);
    if (moving || !ready || !(g.target instanceof HTMLImageElement)) schedule();
  };
  const schedule = (): void => {
    if (!frame && win) {
      if (!active) lastTime = 0;
      frame = win.requestAnimationFrame(render);
    }
  };

  const follow = (event: PointerEvent): void => {
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  };
  /* Let go, or left: the lens shrinks back into where it is, and is gone once it has. */
  const hide = (): void => {
    pointer = null;
    pressed = false;
    holding = false;
    if (hold) win?.clearTimeout(hold.timer);
    hold = null;
    if (active) {
      leaving = true;
      schedule();
    }
  };

  /*
   * Moves are heard on the document, not the root, so the lens can follow past the picture's edge, out of the root. A move
   * that is neither over the root nor following an active lens costs one `contains` and nothing else.
   */
  const onMove = (event: PointerEvent): void => {
    if (event.pointerType === "touch") {
      /* A finger that moves before the hold is up is a scroll: let the page have it. */
      if (hold && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > TOUCH_SLOP) hide();
      else if (holding) follow(event);
      return;
    }
    if (!active && !root.contains(event.target as Node)) return;
    lift = 0;
    follow(event);
  };
  /* The pointer left the window: nothing will say where it went. */
  const onOut = (event: PointerEvent): void => {
    if (!event.relatedTarget) hide();
  };
  /*
   * HOLD TO GROW. Holding the mouse button down on the lens grows it to MAGNIFIER_PRESS_SCALE, at the same magnification, so
   * it shows more of the picture around the spot; letting go springs it back.
   *
   * ON TOUCH, HOLD TO MAGNIFY. A swipe over the picture has to keep scrolling the page, so a finger only starts the lens once
   * it has held still for `TOUCH_HOLD_MS`, with a tap of vibration where the device has one. From then on the finger drives
   * the lens and the page does not scroll (the `touchmove` below is cancelled), the lens floats above the finger, and lifting
   * it ends the lens.
   */
  const onDown = (event: PointerEvent): void => {
    if (event.pointerType !== "touch") {
      if (event.button === 0 && active && options.pressToGrow !== false) {
        pressed = true;
        pressedAt = event.timeStamp;
        schedule();
      }
      return;
    }
    if (!event.isPrimary) return;
    hide();
    const at = { x: event.clientX, y: event.clientY };
    hold = {
      ...at,
      timer:
        win?.setTimeout(() => {
          hold = null;
          holding = true;
          lift = (measure()?.lensSize ?? 0) * TOUCH_LIFT;
          pointer = at;
          /* Android vibrates; iOS has no Vibration API and simply shows the lens. */
          (win.navigator as { vibrate?: (pattern: number) => boolean }).vibrate?.(8);
          schedule();
        }, TOUCH_HOLD_MS) ?? 0,
    };
  };
  const onUp = (event: PointerEvent): void => {
    if (event.pointerType === "touch") {
      if (holding) swallowNextClick();
      return hide();
    }
    if (pressed) {
      if (event.timeStamp - pressedAt > MAGNIFIER_PRESS_CLICK_MS) swallowNextClick();
      pressed = false;
      schedule();
    }
  };
  /* Capture, on the root: it runs before a link's own handler and before a Lightbox's listener on the document. */
  const onClick = (event: MouseEvent): void => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
  };
  /* Touch events stay with the element they started on, so this hears the whole drag; cancelling it is what stops the scroll. */
  const onTouchMove = (event: TouchEvent): void => {
    if (holding && event.cancelable) event.preventDefault();
  };
  /* A long press on an image opens the system's menu (save, share): not while it means "magnify". */
  const onContextMenu = (event: Event): void => {
    if (hold || holding) event.preventDefault();
  };
  /* A press on the picture is a deeper zoom, not the start of dragging the image out of the page. */
  const onDragStart = (event: Event): void => {
    if (active) event.preventDefault();
  };
  /*
   * A scroll moves the page under a pointer that stays put: measure again and draw what is under it now. If the picture
   * scrolled out from under the lens, the next frame finds it no longer near and lets it go.
   */
  const onScroll = (): void => {
    remeasure();
    if (pointer) schedule();
  };

  /* A new picture (a Lightbox's next photo, a source swapped under the lens): measure again, and draw it now rather than
     on the next pointer move, or the lens keeps showing the old picture over the new one. */
  const onMediaChange = (): void => {
    remeasure();
    if (active) schedule();
  };

  const passive = { passive: true } as const;
  const resizes = win && typeof win.ResizeObserver === "function" ? new win.ResizeObserver(remeasure) : null;
  resizes?.observe(root);
  doc.addEventListener("pointermove", onMove, passive);
  doc.addEventListener("pointerout", onOut, passive);
  doc.addEventListener("pointerup", onUp, passive);
  win?.addEventListener("scroll", onScroll, { passive: true, capture: true });
  root.addEventListener("pointerdown", onDown, passive);
  root.addEventListener("click", onClick, { capture: true });
  root.addEventListener("pointercancel", hide, passive);
  root.addEventListener("touchmove", onTouchMove, { passive: false });
  root.addEventListener("contextmenu", onContextMenu);
  root.addEventListener("dragstart", onDragStart);
  /* A picture that loads, or changes source, changes its natural size and so its drawn box under `object-fit`. */
  root.addEventListener("load", onMediaChange, { capture: true });
  root.addEventListener("loadedmetadata", onMediaChange, { capture: true });

  return {
    setZoom(next) {
      zoom = magnifierClampZoom(next);
      schedule();
    },
    setDispersion(strength) {
      look.dispersion = strength > 0 ? strength : 1;
      schedule();
    },
    setFilter(tint) {
      look.tint = tint;
      schedule();
    },
    destroy() {
      destroyed = true;
      hide();
      if (frame) win?.cancelAnimationFrame(frame);
      frame = 0;
      finish();
      resizes?.disconnect();
      doc.removeEventListener("pointermove", onMove);
      doc.removeEventListener("pointerout", onOut);
      doc.removeEventListener("pointerup", onUp);
      win?.removeEventListener("scroll", onScroll, { capture: true });
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("click", onClick, { capture: true });
      if (swallowTimer) win?.clearTimeout(swallowTimer);
      root.removeEventListener("pointercancel", hide);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("contextmenu", onContextMenu);
      root.removeEventListener("dragstart", onDragStart);
      root.removeEventListener("load", onMediaChange, { capture: true });
      root.removeEventListener("loadedmetadata", onMediaChange, { capture: true });
      lens.style.removeProperty("translate");
      painter?.destroy();
    },
  };
}
