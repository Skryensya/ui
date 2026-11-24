import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { lightboxLabels } from "./lightbox";

/* The Olivo lamp's four photos, the same ones the Product template shows: the whole lamp first, then its details. */
const PHOTOS = ["desk", "shade", "base", "room"] as const;
type Photo = (typeof PHOTOS)[number];
type Placement = "bottom" | "top" | "start" | "end";

const photo = (t: Translate, name: Photo): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: { aspect: "4/5", src: `/demos/lamp/lamp-${name}.webp`, alt: t(`demo.product.photo.${name}` as Parameters<Translate>[0]) },
});

const thumb = (src: string, alt: string, aspect = "1/1"): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: { frameElement: "span", aspect, radius: "control", src, alt },
});

/* Its own small file: 200px, square, ~4 KB, where the full photo is 1122px and up to 165 KB. A thumbnail never needs the detail. */
const lampThumb = (t: Translate, name: Photo) => thumb(`/demos/lamp/lamp-${name}-thumb.webp`, t(`demo.product.thumb.${name}` as Parameters<Translate>[0]));

/* A product column's width, not the docs column's: at full width the photo is taller than the screen. */
const width = (rem: number) => ({ style: `max-inline-size: ${rem}rem; inline-size: 100%;` });

const lampGallery = (
  t: Translate,
  name: string,
  { placement, view = (n: Photo) => photo(t, n), order = PHOTOS, thumbOf = (n: Photo) => lampThumb(t, n) }: {
    placement?: Placement;
    view?: (name: Photo) => UsageTree;
    order?: readonly Photo[];
    thumbOf?: (name: Photo, index: number) => UsageTree;
  } = {},
): UsageTree => ({
  contract: "gallery",
  signature: "Gallery",
  options: { name, label: t("gallery.label"), value: order[0], ...(placement ? { placement } : {}) },
  attrs: width(placement === "start" || placement === "end" ? 28 : 24),
  slots: { items: order.map((photoName, index) => ({ options: { value: photoName }, slots: { view: view(photoName), thumb: thumbOf(photoName, index) } })) },
});

const lens = (t: Translate) => (name: Photo): UsageTree => ({ contract: "magnifier", signature: "Magnifier", options: { zoom: 2.5 }, children: photo(t, name) });

/** Each large photo in a Magnifier: the lens on the photo, never on a thumbnail. */
export const galleryProductTree = (t: Translate): UsageTree => lampGallery(t, "gallery-product", { view: lens(t) });

/** Just the photos: an ImageFrame as each view. */
export const galleryPlainTree = (t: Translate): UsageTree => lampGallery(t, "gallery-plain");

/**
 * The large photo opens a Lightbox. Each view is a `Lightbox.Trigger` (a link to the full photo, so it opens even with no
 * script) around the lens: hovering looks through the lens, a click opens the viewer on that photo, and stepping through
 * the viewer moves the gallery's choice with it. The thumbnails only choose. One Lightbox for the whole gallery.
 */
export const galleryLightboxTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    lampGallery(t, "gallery-lightbox", {
      view: (name) => ({
        contract: "lightbox",
        signature: "Lightbox.Trigger",
        options: { opens: "gallery-lightbox-viewer", triggerSrc: `/demos/lamp/lamp-${name}.webp`, triggerWidth: 1122, triggerHeight: 1402 },
        slots: { children: lens(t)(name) },
      }),
    }),
    { contract: "lightbox", signature: "Lightbox", options: { lightboxId: "gallery-lightbox-viewer", ...lightboxLabels(t), label: t("gallery.label") } },
  ],
});

/** The thumbnails over the photo. */
export const galleryTopTree = (t: Translate): UsageTree => lampGallery(t, "gallery-top", { placement: "top" });

/** The thumbnails stacked in a column on the photo's start side. */
export const galleryStartTree = (t: Translate): UsageTree => lampGallery(t, "gallery-start", { placement: "start", view: lens(t) });

/** The thumbnails stacked in a column on the photo's end side. */
export const galleryEndTree = (t: Translate): UsageTree => lampGallery(t, "gallery-end", { placement: "end" });

/*
 * A satin scarf in six colours (the Lightbox demo's photos are these swatches). In a narrow column that is more than
 * the row holds at its thumbnails' minimum, so the row scrolls; in a column beside the photo, the column scrolls.
 */
const COLOURS = [
  ["coast", "graphite"],
  ["fjord", "lavender"],
  ["waterfall", "mint"],
  ["snow-camp", "pearl"],
  ["street", "sand"],
  ["puppy", "lilac"],
] as const;

const scarfGallery = (t: Translate, name: string, placement?: Placement): UsageTree => ({
  contract: "gallery",
  signature: "Gallery",
  options: { name, label: t("gallery.scarfLabel"), value: COLOURS[0][1], ...(placement ? { placement } : {}) },
  attrs: width(placement === "start" || placement === "end" ? 22 : 18),
  slots: {
    items: COLOURS.map(([file, colour]) => {
      const alt = t(`gallery.colour.${colour}` as Parameters<Translate>[0]);
      return {
        options: { value: colour },
        slots: {
          view: { contract: "image-frame", signature: "ImageFrame", options: { aspect: "4/3", src: `/demos/lightbox/${file}.jpg`, alt } },
          thumb: thumb(`/demos/lightbox/${file}-thumb.jpg`, alt),
        },
      };
    }),
  },
});

/** Six colours under the photo, in a narrow column: the thumbnails shrink to their minimum, then the row scrolls sideways. */
export const galleryManyTree = (t: Translate): UsageTree => scarfGallery(t, "gallery-many");

/** The same six in a column beside the photo: as tall as the photo, and it scrolls down. */
export const galleryManyStartTree = (t: Translate): UsageTree => scarfGallery(t, "gallery-many-start", "start");

/* ── Do / Don't ─────────────────────────────────────────────────────────────────────────────────── */

/** Do: the lens on the large photo, where the detail is. */
export const galleryDoLensTree = (t: Translate): UsageTree => lampGallery(t, "gallery-do-lens", { view: lens(t) });

/** Don't: a lens on each thumbnail. A thumbnail is a control: the lens fights the press, and there is no detail to see at that size. */
export const galleryDontLensTree = (t: Translate): UsageTree =>
  lampGallery(t, "gallery-dont-lens", {
    thumbOf: (name) => ({ contract: "magnifier", signature: "Magnifier", options: { zoom: 3 }, children: lampThumb(t, name) }),
  });

/** Do: every thumbnail cut the same way, so the row reads as one set. */
export const galleryDoCropTree = (t: Translate): UsageTree => lampGallery(t, "gallery-do-crop");

/** Don't: thumbnails in their own shapes, so the row is ragged and the chosen edge jumps size. */
export const galleryDontCropTree = (t: Translate): UsageTree =>
  lampGallery(t, "gallery-dont-crop", {
    thumbOf: (name, index) => thumb(`/demos/lamp/lamp-${name}.webp`, t(`demo.product.thumb.${name}` as Parameters<Translate>[0]), ["1/1", "4/5", "16/9", "3/4"][index]),
  });

/** Do: the whole lamp first, then its details: the order someone coming closer sees it in. */
export const galleryDoOrderTree = (t: Translate): UsageTree => lampGallery(t, "gallery-do-order");

/** Don't: a close-up first. The first photo is the one most people see, and a shade alone does not say "lamp". */
export const galleryDontOrderTree = (t: Translate): UsageTree => lampGallery(t, "gallery-dont-order", { order: ["shade", "base", "room", "desk"] });
