import type { Snippet } from "../snippet.js";
import { badge, band, box, button, field, grid, heading, iconButton, inline, itemList, link, main, navbar, skipLink, stack, text } from "./kit.js";

const product = (name: string, price: string, rating: string, tone?: string) => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", boxElement: "article" },
  attrs: { "aria-label": name },
  children: stack(
    [
      {
        contract: "image-frame",
        signature: "ImageFrame",
        options: { aspect: "4/3", radius: "top", src: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3Crect width='4' height='3' fill='%23cbd5e0'/%3E%3C/svg%3E", alt: "" },
      },
      box(
        stack(
          [
            heading(link(name, "#product"), "h3", "h2"),
            text(rating, { size: "sm", tone: "secondary" }),
            inline([text(price, { weight: "emphasis" }), ...(tone ? [badge(tone, "accent")] : [])], { gap: "sm", inlineAlign: "center" }),
            button(`Add ${name} to cart`, { size: "sm", variant: "soft" }),
          ],
          { gap: "xs" },
        ),
        { padding: "md" },
      ),
    ],
    { gap: "none" },
  ),
});

/*
 * PATTERN: a product listing with filters (what every store converges on): breadcrumb, a results heading
 * with a count, a filter column and a grid of cards.
 */
export const storeListingPattern: Snippet = {
  id: "page-store-listing",
  level: "page",
  intent: "A product listing: breadcrumb, a results heading with its count, a filter column, a sort control and a grid of product cards.",
  notes: [
    "Pattern: faceted browsing. The filters sit in their own column so the grid keeps its width, and the sort control sits with the results because it changes what the grid shows, not the filters.",
    "Accessibility, kept over style: each card is an `article` named by its product, with ONE link (the product name as an h2 sized like an h3: the level follows the outline, the size follows the card) and one button whose label names the product (`Add Trail jacket to cart`), so a list of buttons is not eight identical `Add to cart`; the product image carries an empty `alt` because the name beside it already says what it is; the price is plain text beside a Badge that states the offer in words; the filters are a labelled group of checkboxes.",
    "What the pattern does not do: no whole-card link wrapping a button (nested interactive content), and no rating shown as stars alone: the value is written (`4.6 out of 5, 128 reviews`).",
  ],
  tree: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      skipLink(),
      navbar("Outpost", [iconButton("search", "Search products"), button("Cart (2)", { size: "sm", variant: "soft" })]),
      main(
        band(
            [
              {
                contract: "breadcrumb",
                signature: "Breadcrumb",
                options: { label: "Breadcrumb", collapsedLabel: "Show hidden levels" },
                slots: { items: [{ options: { href: "#home" }, slots: { label: "Home" } }, { options: { href: "#outerwear" }, slots: { label: "Outerwear" } }, { options: { current: true }, slots: { label: "Jackets" } }] },
              },
              heading("Jackets", "h1", "h1"),
              text("24 products", { tone: "secondary" }),
              inline(
                [
                  {
                    ...box(
                      stack(
                        [
                          {
                            contract: "checkbox",
                            signature: "CheckboxGroup",
                            options: { name: "size" },
                            slots: { label: "Size", items: itemList([["s", "Small"], ["m", "Medium"], ["l", "Large"]]) },
                          },
                          {
                            contract: "checkbox",
                            signature: "CheckboxGroup",
                            options: { name: "feature" },
                            slots: { label: "Features", items: itemList([["waterproof", "Waterproof"], ["insulated", "Insulated"]]) },
                          },
                        ],
                        { gap: "lg" },
                      ),
                      { padding: "md", border: "subtle", boxElement: "aside" },
                      { "aria-label": "Filters" },
                    ),
                  },
                  {
                    ...stack(
                      [
                        inline(
                          [
                            {
                              contract: "select",
                              signature: "Select",
                              options: { name: "sort", value: "popular" },
                              slots: { label: "Sort by", items: itemList([["popular", "Most popular"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"]]) },
                            },
                          ],
                          { justify: "end" },
                        ),
                        grid(
                          [
                            product("Trail jacket", "$129", "4.6 out of 5, 128 reviews", "Sale"),
                            product("Ridge shell", "$189", "4.8 out of 5, 64 reviews"),
                            product("City parka", "$219", "4.4 out of 5, 41 reviews"),
                            product("Packable windbreaker", "$89", "4.5 out of 5, 212 reviews", "New"),
                          ],
                          { columns: "2", gap: "md" },
                        ),
                        {
                          contract: "pagination",
                          signature: "Pagination",
                          options: { page: 1, total: 6, label: "Product pages", previousLabel: "Previous page", nextLabel: "Next page" },
                        },
                      ],
                      { gap: "md" },
                      { "data-sizing": "fill" },
                    ),
                  },
                ],
                { gap: "xl", wrap: false, inlineAlign: "start" },
              ),
            ],
            { gap: "lg" },
        ),
      ),
    ],
  },
};
void field;
