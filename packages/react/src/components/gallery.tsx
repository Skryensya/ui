import { galleryContract, galleryParts } from "@skryensya/core/gallery";
import { linkGalleryLightbox } from "@skryensya/core/gallery-lightbox";
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

/* Derived, never restated: the values and the default live in the contract. */
const { placement: placementOption } = galleryContract.options;
export type GalleryPlacement = (typeof placementOption.values)[number];

/*
 * GALLERY: the same markup the contract's template writes for Vanilla, and nothing more, because there is no state to
 * hold. The thumbnails are native radios (one `name`), so React owns no "selected" value: the browser keeps the choice
 * and gallery.css shows the view beside it. `defaultValue` only says which radio starts checked. The one effect is for a
 * Lightbox on the large photos, which has to move the choice when the reader steps through the viewer.
 */

export type GalleryItem = {
  /** This photo's key, unique in the gallery: what `defaultValue` names. */
  value: string;
  /** The large view: an ImageFrame, or a Magnifier around one. */
  view: ReactNode;
  /** The thumbnail: an ImageFrame with `frameElement="span"`, whose `alt` names the choice. */
  thumb: ReactNode;
};

export type GalleryProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue"> & {
  items: readonly GalleryItem[];
  /** The radio group's shared name: unique on the page. */
  name: string;
  /** Names the row of thumbnails for a screen reader. */
  label: string;
  /** The photo shown first, by `value`. Absent: the first. */
  defaultValue?: string;
  /** Where the thumbnails sit: under, over, or in a column beside the photo. */
  placement?: GalleryPlacement;
};

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

export function Gallery({ items, name, label, defaultValue, placement = placementOption.default, className, ...props }: GalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  /* Views holding a Lightbox trigger: the viewer and the thumbnails stay one choice (core's linkGalleryLightbox). */
  useEffect(() => (root.current ? linkGalleryLightbox(root.current) : undefined), [items]);
  return (
    <div {...props} ref={root} className={cx(galleryParts.root, className)} data-default-value={defaultValue} data-placement={placement}>
      <div className={galleryParts.views}>
        {items.map((item) => (
          <div className={galleryParts.view} key={item.value}>
            {item.view}
          </div>
        ))}
      </div>
      <div className={galleryParts.thumbs} role="radiogroup" aria-label={label}>
        {items.map((item) => (
          <label className={`${galleryParts.thumb} sk-interactive`} key={item.value}>
            <input
              className={galleryParts.thumbInput}
              type="radio"
              name={name}
              value={item.value}
              defaultChecked={item.value === defaultValue}
            />
            <span className={galleryParts.thumbFace}>{item.thumb}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
