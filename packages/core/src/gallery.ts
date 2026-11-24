import type { ComponentContract } from "./contract.js";

/*
 * GALLERY: one large view and a row of thumbnails that choose it, for a product's photos or a project's shots.
 *
 * NO MACHINE, NO ENHANCER. The thumbnails are a native radio group (one `name`, one `<input type="radio">` per photo
 * inside its `<label>`), so the platform already does what a gallery's picker needs: one chosen at a time, arrows move
 * and choose, the chosen one is announced ("Shade close-up, radio button, 2 of 4, selected"). Which large view shows is
 * CSS (`:has(input:checked)` paired by position, gallery.css), so both bindings render the same DOM and the gallery works
 * before any script, or with none. The cost is a ceiling: the pairing is written out for `GALLERY_MAX` photos.
 *
 * NOT TABS. A gallery's thumbnails are not a strip of panel names: Tabs brought a rule along the strip, a selected bar,
 * and panel semantics around what is one picture. Here the thumbnails are the choice and the large view is its result.
 *
 * Each view takes any node: an `ImageFrame`, or a `Magnifier` around one, so the large photo can be looked at closely.
 * Each thumbnail is a node too, an `ImageFrame` with `frameElement: "span"` (a label holds phrasing content), whose `alt`
 * is the radio's name.
 */

/** How many photos the CSS pairs a thumbnail with its view for. A gallery past this needs a carousel, not a row. */
export const GALLERY_MAX = 12;

export const galleryParts = {
  root: "sk-gallery",
  views: "sk-gallery__views",
  view: "sk-gallery__view",
  thumbs: "sk-gallery__thumbs",
  thumb: "sk-gallery__thumb",
  thumbInput: "sk-gallery__thumb-input",
  thumbFace: "sk-gallery__thumb-face",
} as const;

export type GalleryPart = keyof typeof galleryParts;
export type GalleryPartClass = (typeof galleryParts)[GalleryPart];

export const galleryContract = {
  id: "gallery",
  category: "content",
  css: "@skryensya/core/components/gallery.css",
  parts: galleryParts,
  hooks: [
    "--sk-gallery-gap",
    "--sk-gallery-thumb-gap",
    "--sk-gallery-thumb-min",
    "--sk-gallery-thumb-radius",
    "--sk-gallery-thumb-idle-opacity",
    "--sk-gallery-thumb-border",
    "--sk-gallery-thumb-selected-border",
    "--sk-gallery-thumb-selected-width",
    "--sk-gallery-rail-size",
  ],

  options: {
    /** The photo shown first, by its item's `value`. Absent: the first. Where it STARTS; the reader changes it. */
    value: { type: "string", attr: "data-default-value", prop: "defaultValue", keyOf: { slot: "items" } },
    /** The radio group's shared name: unique on the page, or two galleries would share one choice. */
    name: { type: "string", attr: "name" },
    /** Names the row of thumbnails for a screen reader ("Photos of the Olivo lamp"). */
    label: { type: "string", attr: "aria-label" },
    /**
     * Where the thumbnails sit: under the photo (`bottom`, the default), over it (`top`), or stacked in a column beside it
     * (`start`, `end`). In a row they share its width and scroll once they reach their minimum; in a column they are as
     * tall as the photo and scroll past it. Only the painting moves: the reading and tab order stay photo, then thumbnails.
     */
    placement: { type: "enum", values: ["bottom", "top", "start", "end"], default: "bottom", attr: "data-placement" },
  },

  signatures: {
    Gallery: {
      intent: ["product-gallery", "image-gallery-with-thumbnails", "photo-picker", "main-image-and-thumbnails"],
      host: { element: "div" },
      options: ["value", "name", "label", "placement"],
      requires: ["name", "label"],
      forward: ["id", "aria-*"],
      slots: {
        items: {
          accepts: "items",
          prop: "items",
          required: true,
          minItems: 2,
          maxItems: GALLERY_MAX,
          item: {
            key: "value",
            options: { value: { type: "string", attr: "value" } },
            slots: {
              /** The large view: an ImageFrame, or a Magnifier around one. */
              view: { accepts: "node", required: true },
              /**
               * The thumbnail: an ImageFrame with `frameElement: "span"`; its `alt` names the choice. Give it its own small
               * file (about twice its size on screen, already cut square): only the view needs the full photo.
               */
              thumb: { accepts: "node", required: true },
            },
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "views",
            children: [{ element: "div", part: "view", repeat: "items", itemSlot: "view" }],
          },
          {
            element: "div",
            part: "thumbs",
            attrs: { role: "radiogroup" },
            options: ["label"],
            children: [
              {
                element: "label",
                part: "thumb",
                also: ["sk-interactive"],
                repeat: "items",
                children: [
                  {
                    element: "input",
                    part: "thumbInput",
                    attrs: { type: "radio" },
                    options: ["name"],
                    itemOptions: ["value"],
                    selectedBy: { option: "value", attr: "checked" },
                  },
                  { element: "span", part: "thumbFace", itemSlot: "thumb" },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/gallery", name: "Gallery" },
    },
  },
} as const satisfies ComponentContract;
