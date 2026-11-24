import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { siteFooter } from "./shared";
import { lightboxLabels } from "../lightbox";

/*
 * PRODUCT DETAIL. The ecommerce page before `checkout`: one thing for sale, looked at closely. The thing is the Olivo desk
 * lamp, photographed four ways (on the desk, the shade, the base, the room), and the page spends its components on looking:
 *
 *   - the gallery is a `Gallery`: one large photo over a row of thumbnails that share the row. The thumbnails are a native
 *     radio group (arrows move between photos, the current one is announced as selected) and CSS shows the large photo
 *     beside the checked one, so it works with no script. Only the large photo has a `Magnifier`: a thumbnail is a
 *     control, and a lens over a control would fight the press. The photos are WebP at full size (`public/demos/lamp/`,
 *     ~360 KB for all four): the lens needs the detail;
 *   - "Add to cart" is `appearance: "tactile"` with the accent tone. It is the page's one commit, and the physical travel
 *     says "this did something" before the cart count does;
 *   - "Save" is `variant: "soft"` with a heart (`favorite`) in its leading slot: a real action, but a secondary one, so it
 *     gets a tinted face under the solid accent instead of competing beside it;
 *   - the long-form detail is `Tabs` with `variant: "hanging"`. Three panels of different content (description, specs,
 *     shipping) are what Tabs is for, and the hanging tabs read as folders attached to the panel below; and
 *   - quantity is a `NumberField` (a bounded integer with steppers), not a free Input.
 */

/** The four photos, the whole lamp first: what a shopper sees before choosing to look closer. */
const PHOTOS = ["desk", "shade", "base", "room"] as const;

/** The large photo, in its lens: the only one with a magnifier, in the photos' own 4/5 shape. */
const mainPhoto = (t: Translate, name: (typeof PHOTOS)[number]): UsageTree => ({
  contract: "magnifier",
  signature: "Magnifier",
  options: { zoom: 2.5 },
  children: {
    contract: "image-frame",
    signature: "ImageFrame",
    /* The photos' own shape, given up front: the box is reserved before the image arrives, so nothing below it jumps. */
    options: { aspect: "4/5", src: `/demos/lamp/lamp-${name}.webp`, alt: t(`demo.product.photo.${name}` as Parameters<Translate>[0]) },
  },
});

/** A thumbnail: a span frame, since a label only holds phrasing content. Its alt is the radio's name; the gallery sizes it. */
const thumbnail = (t: Translate, name: (typeof PHOTOS)[number]): UsageTree => ({
  contract: "image-frame",
  signature: "ImageFrame",
  options: {
    frameElement: "span",
    aspect: "1/1",
    radius: "control",
    /* Its own small file (200px, ~4 KB): only the large photo needs the full size, for the lens. */
    src: `/demos/lamp/lamp-${name}-thumb.webp`,
    alt: t(`demo.product.thumb.${name}` as Parameters<Translate>[0]),
  },
});

const spec = (term: string, value: string): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionItem",
  slots: { term, children: value },
});

/**
 * The top of the page: the gallery beside what a shopper needs to decide. Exported because the Magnifier's docs page shows
 * it too (`demos/magnifier.ts`), and one function keeps the template and that example from drifting apart.
 */
export const productOverview = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "md", gapExpanded: "lg", responsive: true },
  children: [
    {
      contract: "gallery",
      signature: "Gallery",
      options: { name: "product-photos", label: t("demo.product.gallery"), value: PHOTOS[0] },
      slots: {
        items: PHOTOS.map((name) => ({
          options: { value: name },
          slots: {
            /* The large photo opens the viewer on itself; the lens inside it is for a look without leaving the page. */
            view: {
              contract: "lightbox",
              signature: "Lightbox.Trigger",
              options: { opens: "product-photos-viewer", triggerSrc: `/demos/lamp/lamp-${name}.webp`, triggerWidth: 1122, triggerHeight: 1402 },
              slots: { children: mainPhoto(t, name) },
            },
            thumb: thumbnail(t, name),
          },
        })),
      },
    },
    /* One viewer for the gallery: a closed dialog takes no cell in the grid. */
    { contract: "lightbox", signature: "Lightbox", options: { lightboxId: "product-photos-viewer", ...lightboxLabels(t), label: t("demo.product.gallery") } },
    {
      /* The buy box, three groups with their own spacing: what it is (badge, name, rating), what it costs and says, and
         what to do (quantity, add, save), then what comes with it. One gap for everything made it a list of equals. */
      contract: "layout",
      signature: "Stack",
      options: { gap: "lg" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "xs", align: "start" },
          children: [
            {
              contract: "badge",
              signature: "Badge",
              options: { tone: "success" },
              children: t("demo.product.inStock"),
            },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h2", flush: true },
              children: t("demo.product.name"),
            },
            {
              contract: "rating",
              signature: "RatingDisplay",
              options: { value: 4.8, label: t("demo.product.ratingLabel") },
              slots: {
                valueText: t("demo.product.ratingValue"),
                count: t("demo.product.ratingCount"),
              },
            },
          ],
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { size: "lg", weight: "emphasis" },
              children: t("demo.product.price"),
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              children: t("demo.product.summary"),
            },
          ],
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            {
              /* Quantity beside the commit, on its foot: a one-digit field needs a few characters, not the column. */
              contract: "layout",
              signature: "Inline",
              options: { gap: "sm", inlineAlign: "end", wrap: false },
              children: [
                {
                  contract: "number-field",
                  signature: "NumberField",
                  options: {
                    name: "quantity",
                    defaultValue: "1",
                    min: 1,
                    max: 5,
                    step: 1,
                    incrementLabel: t("demo.product.increment"),
                    decrementLabel: t("demo.product.decrement"),
                  },
                  attrs: { style: "inline-size: 8.5rem; flex: none;" },
                  slots: { label: t("demo.product.quantity") },
                },
                {
                  contract: "button",
                  signature: "Button.action",
                  options: { appearance: "tactile", tone: "accent", size: "lg" },
                  attrs: { style: "flex: 1;" },
                  children: t("demo.product.addToCart"),
                },
              ],
            },
            {
              /* Keeping it for later: a heart (`favorite`), in the button's own leading slot, so the kit spaces and sizes it. */
              contract: "button",
              signature: "Button.action",
              options: { variant: "soft", size: "lg" },
              attrs: { style: "inline-size: 100%;" },
              slots: { pre: { contract: "icon", signature: "Icon", options: { name: "favorite" } } },
              children: t("demo.product.save"),
            },
          ],
        },
        {
          contract: "list",
          signature: "List",
          /* Quiet: what comes with the lamp, under the buttons, not a second set of rows to scan. */
          options: { density: "compact", dividers: false },
          children: (["perkShipping", "perkReturns", "perkWarranty"] as const).map((perk) => ({
            contract: "list",
            signature: "ListItem",
            slots: {
              leading: { contract: "icon", signature: "Icon", options: { name: "check", size: "sm" } },
              title: t(`demo.product.${perk}`),
            },
          })),
        },
      ],
    },
  ],
});

export const productTree = (t: Translate): UsageTree => {
  return {
    contract: "layout",
    signature: "AppShell",
    children: [
      {
        contract: "navbar",
        signature: "Navbar",
        children: [
          { contract: "navbar", signature: "NavbarBrand", children: "Lumen Store" },
          {
            contract: "navbar",
            signature: "NavbarActions",
            children: {
              contract: "badge",
              signature: "Badge",
              children: t("demo.product.cartCount"),
            },
          },
        ],
      },
      {
        contract: "layout",
        signature: "Main",
        options: { paddingBlock: "lg", paddingBlockExpanded: "xl" },
        children: {
          contract: "wrapper",
          signature: "Wrapper",
          options: { wrapperSize: "lg", gutter: "md", gutterExpanded: "lg" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "lg", gapExpanded: "xl" },
            children: [
              productOverview(t),
              {
                contract: "tabs",
                signature: "Tabs",
                options: { value: "description", variant: "hanging" },
                attrs: { "aria-label": t("demo.product.detailsLabel") },
                slots: {
                  items: [
                    {
                      options: { value: "description" },
                      slots: {
                        label: t("demo.product.tabDescription"),
                        children: {
                          contract: "typography",
                          signature: "Text",
                          children: t("demo.product.description"),
                        },
                      },
                    },
                    {
                      options: { value: "specs" },
                      slots: {
                        label: t("demo.product.tabSpecs"),
                        children: {
                          contract: "description-list",
                          signature: "DescriptionList",
                          options: { layout: "columns", dividers: true },
                          children: [
                            spec(t("demo.product.specHeight"), "52 cm"),
                            spec(t("demo.product.specMaterial"), t("demo.product.specMaterialValue")),
                            spec(t("demo.product.specBulb"), t("demo.product.specBulbValue")),
                            spec(t("demo.product.specCable"), t("demo.product.specCableValue")),
                          ],
                        },
                      },
                    },
                    {
                      options: { value: "shipping" },
                      slots: {
                        label: t("demo.product.tabShipping"),
                        children: {
                          contract: "typography",
                          signature: "Text",
                          children: t("demo.product.shipping"),
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      siteFooter(t),
    ],
  };
};
