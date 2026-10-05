import type { Snippet } from "../snippet.js";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { band, box, button, field, grid, heading, input, itemList, link, main, navbar, skipLink, stack, text } from "./kit.js";

/*
 * PATTERN: a checkout (what Stripe Checkout and Shopify converge on): the form in sections that read in the
 * order they are asked, the order summary beside it, and one primary action that says what it will do.
 */
const required = (label: string, control: UsageTree, hint?: string): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  options: { required: true },
  slots: { label, ...(hint ? { hint } : {}), children: control } as UsageTree["slots"],
});

const typed = (type: string, name: string, autocomplete: string): UsageTree => ({
  ...input({ type, name }),
  attrs: { autocomplete, required: "" },
});

const section = (id: string, title: string, children: UsageTree[]): UsageTree =>
  box(stack([{ ...heading(title, "h3", "h2"), attrs: { id } }, ...children], { gap: "md" }), { boxElement: "section", padding: "md", border: "subtle", surface: "raised", radius: "surface" }, { "aria-labelledby": id });

const row = (term: string, value: string): UsageTree => ({
  contract: "description-list",
  signature: "DescriptionItem",
  slots: { term, children: value },
});

export const checkoutPattern: Snippet = {
  id: "page-checkout-form",
  level: "page",
  intent: "A checkout: contact, delivery and payment in order, the order summary beside them, and a Pay button that states the amount.",
  notes: [
    "Pattern: sections in the order they are asked, and the order beside them. Contact, delivery and payment are three named sections, each with its own h2, so a long form has landmarks to move between; the order summary stays next to the form so the total is never a surprise; the primary action says what it will do and how much: 'Pay $48.00', not 'Submit'.",
    "Accessibility, kept over style: every field has a visible label, says that it is required in the same place a label does, and carries its `autocomplete` token (`email`, `name`, `street-address`, `cc-number`, `cc-exp`, `cc-csc`...), which is what lets a browser fill a long form in one gesture (WCAG 1.3.5) and spares a person with a motor or memory limitation from retyping it (WCAG 3.3.7, Redundant Entry). The payment method is a radio group with a name, the summary is a description list (term and value), and the form reads top to bottom in the same order it is tabbed.",
    "Compared with Stripe and Shopify: it keeps the stacked sections, the persistent summary and the verb-and-amount button, which are what make those checkouts easy to finish. It changes how errors and hints arrive: a hint sits under its field as text and an error would replace it in text, naming the field and how to fix it (see `form-field-hint-and-error`), never a red border alone. Card details here are plain fields so the pattern is self-contained: a real checkout renders a payment provider's own fields in their place and keeps this structure around them.",
    "What the pattern does not do: no placeholder standing in for a label, no field that is validated and cleared as you type, no countdown, no pre-ticked upsell and no second primary action (the way back to the cart is a link). The contract has no `form` element, so a real page wraps the sections and the Pay button in a `<form>` of its own; and `Input` does not forward `inputmode`, so the card fields cannot ask a phone for the numeric keypad here (a real checkout gets that from its payment provider's fields).",
  ],
  tree: stack(
    [
      skipLink("Skip to the checkout form"),
      navbar("Widgets", [link("Back to cart", "#cart")]),
      main(
        band(
          [
            heading("Checkout", "h1", "h1"),
            grid(
              [
                stack(
                  [
                    section("contact-title", "Contact", [required("Email", typed("email", "email", "email"), "We send your receipt here.")]),
                    section("delivery-title", "Delivery address", [
                      required("Full name", typed("text", "name", "name")),
                      required("Street address", typed("text", "street", "street-address")),
                      required("City", typed("text", "city", "address-level2")),
                      required("Postal code", typed("text", "postal", "postal-code")),
                      {
                        contract: "select",
                        signature: "Select",
                        options: { name: "country", value: "us", required: true },
                        slots: { label: "Country", items: itemList([["us", "United States"], ["ca", "Canada"], ["mx", "Mexico"]]) },
                      },
                    ]),
                    section("payment-title", "Payment", [
                      {
                        contract: "radio-group",
                        signature: "RadioGroup",
                        options: { name: "method", value: "card", label: "Payment method", orientation: "vertical" },
                        slots: { items: itemList([["card", "Credit or debit card"], ["transfer", "Bank transfer"]]) },
                      },
                      required("Card number", typed("text", "cc-number", "cc-number")),
                      required("Expiry date", typed("text", "cc-exp", "cc-exp"), "Month and year, like 08/29."),
                      required("Security code", typed("text", "cc-csc", "cc-csc")),
                    ]),
                    button("Pay $48.00", { variant: "solid", tone: "accent", size: "lg", type: "submit" }),
                    text("Your card is charged when you press Pay.", { size: "sm", tone: "secondary" }),
                  ],
                  { gap: "lg" },
                ),
                box(
                  stack(
                    [
                      { ...heading("Order summary", "h3", "h2"), attrs: { id: "summary-title" } },
                      { contract: "description-list", signature: "DescriptionList", options: { layout: "columns", dividers: true }, children: [row("Widget Pro × 2", "$40.00"), row("Shipping", "$5.00"), row("Tax", "$3.00"), row("Total", "$48.00")] },
                    ],
                    { gap: "md" },
                  ),
                  { boxElement: "aside", padding: "md", border: "subtle", surface: "sunken", radius: "surface" },
                  { "aria-labelledby": "summary-title" },
                ),
              ],
              { minColumn: "lg", gap: "lg" },
            ),
          ],
          { gap: "lg" },
        ),
      ),
    ],
    { gap: "none" },
  ),
};
