import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../../i18n";
import { blankImage } from "../../examples/card-data";

/*
 * PRODUCT DETAIL. The ecommerce page before `checkout`: one thing for sale, looked at closely. It
 * is also the template that spends the most button appearances, each on a different job:
 *
 *   - "Add to cart" is `appearance: "tactile"` with the accent tone. It is the page's one commit,
 *     and the physical travel says "this did something" before the cart count does;
 *   - "Save" is `variant: "soft"`: a real action, but a secondary one, so it gets a tinted face
 *     instead of competing with the solid accent beside it;
 *   - "View all photos" sits ON the photo, so it is `variant: "translucent"`, the one variant made
 *     for a surface whose colour nobody knows in advance. It lives in the frame's `MediaCaption`,
 *     with a `MediaGradient` under it so it keeps its contrast whatever the photo turns out to be;
 *   - the long-form detail is `Tabs` with `variant: "hanging"`. Three panels of different content
 *     (description, specs, shipping) are what Tabs is for, and the hanging tabs read as folders
 *     attached to the panel below, which suits a spec sheet better than a thin underline; and
 *   - quantity is a `NumberField` (a bounded integer with steppers), not a free Input.
 */

const spec = (term: string, value: string): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionItem",
  slots: { term, children: value },
});

export const productTree = (t: Translate, locale: "es" | "en"): UsageTree => {
  const money = (amount: string) => (locale === "es" ? `${amount} €` : `$${amount}`);
  return {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
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
        signature: "Stack",
        options: { gap: "none" },
        attrs: { class: "page-shell" },
        children: {
          contract: "layout",
          signature: "Main",
          attrs: { class: "page-shell__main" },
          children: {
            contract: "wrapper",
            signature: "Wrapper",
            options: { wrapperSize: "lg" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "xl" },
              children: [
                {
                  contract: "layout",
                  signature: "Grid",
                  options: { columns: "2", gap: "lg", multicol: true },
                  children: [
                    {
                      contract: "image-frame",
                      signature: "ImageFrame",
                      options: {
                        aspect: "1/1",
                        src: blankImage(800, 800, "a8a29e"),
                        alt: t("demo.product.imageAlt"),
                      },
                      slots: {
                        caption: {
                          contract: "media-gradient",
                          signature: "MediaCaption",
                          children: [
                            { contract: "media-gradient", signature: "MediaGradient" },
                            {
                              contract: "button",
                              signature: "Button.action",
                              options: { variant: "translucent", size: "sm" },
                              children: [
                                {
                                  contract: "icon",
                                  signature: "Icon",
                                  options: { name: "maximize", size: "sm" },
                                },
                                t("demo.product.gallery"),
                              ],
                            },
                          ],
                        },
                      },
                    },
                    {
                      contract: "layout",
                      signature: "Stack",
                      options: { gap: "md", align: "start" },
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
                          options: { value: 4.6, label: t("demo.product.ratingLabel") },
                          slots: {
                            valueText: locale === "es" ? "4,6" : "4.6",
                            count: t("demo.product.ratingCount"),
                          },
                        },
                        {
                          contract: "typography",
                          signature: "Text",
                          options: { size: "lg", weight: "emphasis" },
                          children: money("89"),
                        },
                        {
                          contract: "typography",
                          signature: "Text",
                          options: { tone: "secondary" },
                          children: t("demo.product.summary"),
                        },
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
                          slots: { label: t("demo.product.quantity") },
                        },
                        {
                          contract: "layout",
                          signature: "Inline",
                          options: { gap: "sm", wrap: true },
                          children: [
                            {
                              contract: "button",
                              signature: "Button.action",
                              options: { appearance: "tactile", tone: "accent", size: "lg" },
                              children: t("demo.product.addToCart"),
                            },
                            {
                              contract: "button",
                              signature: "Button.action",
                              options: { variant: "soft", size: "lg" },
                              children: [
                                {
                                  contract: "icon",
                                  signature: "Icon",
                                  options: { name: "like", size: "sm" },
                                },
                                t("demo.product.save"),
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
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
                              spec(t("demo.product.specLayout"), "65 %"),
                              spec(t("demo.product.specSwitches"), t("demo.product.specSwitchesValue")),
                              spec(t("demo.product.specWeight"), "780 g"),
                              spec(t("demo.product.specConnection"), "USB-C · Bluetooth 5.1"),
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
      },
    ],
  };
};
