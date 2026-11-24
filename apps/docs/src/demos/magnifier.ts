import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { productOverview } from "./templates/product";

type UIKey = Parameters<Translate>[0];

/*
 * MAGNIFIER DEMOS. Each one is a Magnifier around an ImageFrame: a usage tree cannot carry a bare `<img>`, and the lens finds
 * the picture at any depth and reads its `object-fit`. Photos are the lamp's (`public/demos/lamp/`), full size: a lens is only
 * as good as the detail under it, and the docs' satin placeholders magnify into black grain.
 */

const k = (name: string) => `demo.magnifier.${name}` as UIKey;

/* A single photo stays small in its preview: a lens over a picture that fills the page shows less of what it is for. */
const SINGLE = "max-inline-size: 22rem;";

const magnifier = (
  name: string,
  alt: string,
  options: { zoom?: number; aspect?: string; lens?: string; dispersion?: "strong"; filter?: string } = {},
): UsageTree => ({
  contract: "magnifier",
  signature: "Magnifier",
  options: {
    ...(options.zoom ? { zoom: options.zoom } : {}),
    ...(options.dispersion ? { dispersion: options.dispersion } : {}),
    ...(options.filter ? { filter: options.filter } : {}),
  },
  attrs: { style: `${SINGLE}${options.lens ? ` --sk-magnifier-size: ${options.lens};` : ""}` },
  children: {
    contract: "image-frame",
    signature: "ImageFrame",
    options: { src: `/demos/lamp/lamp-${name}.webp`, alt, aspect: options.aspect ?? "4/5", fit: "cover" },
  },
});

/*
 * THE EXAMPLES, simplest first: a photo, then what the options change (more zoom, a crop, the glass's colour), then the lens
 * in a whole product page. No video: a picture that moves on its own carries the detail away from under the lens.
 */

/** 1. The default: a photo, a 10rem lens, twice as large. */
export const magnifierTree = (t: Translate): UsageTree => magnifier("room", t(k("room.alt")));

/** 2. Fine detail: four times as large and a bigger lens, over the screws and the powder coat of the base. */
export const magnifierDetailTree = (t: Translate): UsageTree => magnifier("base", t(k("base.alt")), { zoom: 4, lens: "14rem" });

/** 3. A cropped frame: a square crop of the shade, which the lens still maps onto the spot under the pointer. */
export const magnifierCroppedTree = (t: Translate): UsageTree => magnifier("shade", t(k("shade.alt")), { zoom: 3, aspect: "1/1" });

/** 4. The glass as part of the look: a wider rainbow at its edge, clearest over the lit bulb's hard edges. */
export const magnifierStrongTree = (t: Translate): UsageTree =>
  magnifier("shade", t(k("shade.alt")), { zoom: 2.5, lens: "13rem", dispersion: "strong" });

/** 5. Coloured glass, one filter at a time: the docs switch it between the primaries of light and of ink. */
export const magnifierFilterTree = (t: Translate): UsageTree =>
  magnifier("room", t(k("room.alt")), { lens: "13rem", filter: "red" });

/**
 * 6. Where it earns its place: a product page. The Product template's gallery and buy box, the same function the template
 * uses, so this example is the template and cannot drift from it.
 */
export const magnifierProductTree = (t: Translate): UsageTree => productOverview(t);

/*
 * DO / DON'T. Each pair is the same lens over a picture, once used well and once not; they are interactive, so the reader
 * feels the difference by hovering both.
 */
const lensOver = (src: string, alt: string, options: { zoom?: number; aspect?: string; lens?: string } = {}): UsageTree => ({
  contract: "magnifier",
  signature: "Magnifier",
  options: { zoom: options.zoom ?? 2.5 },
  ...(options.lens ? { attrs: { style: `--sk-magnifier-size: ${options.lens};` } } : {}),
  children: { contract: "image-frame", signature: "ImageFrame", options: { src, alt, aspect: options.aspect ?? "4/3", fit: "cover" } },
});

/** Detail: a full-size photo has something to show under the glass; a thumbnail-sized one only shows its own pixels. */
export const magnifierDoDetailTree = (t: Translate): UsageTree => lensOver("/demos/lamp/lamp-shade.webp", t(k("dd.shadeAlt")));
export const magnifierDontDetailTree = (t: Translate): UsageTree => lensOver("/demos/lightbox/puppy.jpg", t(k("dd.smallAlt")));

/** Size: a lens smaller than its picture shows a spot of it; one bigger than the picture hides what it magnifies. */
export const magnifierDoSizeTree = (t: Translate): UsageTree =>
  lensOver("/demos/lamp/lamp-base.webp", t(k("dd.baseAlt")), { aspect: "1/1", lens: "5rem", zoom: 3 });
export const magnifierDontSizeTree = (t: Translate): UsageTree =>
  lensOver("/demos/lamp/lamp-base.webp", t(k("dd.baseAlt")), { aspect: "1/1", lens: "16rem", zoom: 3 });

/** Zoom: enough to read the detail; past what the photo holds, the lens shows blur, not more. */
export const magnifierDoZoomTree = (t: Translate): UsageTree => lensOver("/demos/lamp/lamp-desk.webp", t(k("dd.deskAlt")), { zoom: 2.5 });
export const magnifierDontZoomTree = (t: Translate): UsageTree => lensOver("/demos/lamp/lamp-desk.webp", t(k("dd.deskAlt")), { zoom: 8 });
