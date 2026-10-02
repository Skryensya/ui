import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * The two directions of one contract, in the order the page argues them: the reading first, because
 * it is what a visitor sees on a product page, then the control that produces it.
 */

/** The display: an average, its number and what it is an average of. */
export const ratingDisplayTree = (t: Translate): UsageTree => ({
  contract: "rating",
  signature: "RatingDisplay",
  options: { value: 4.3, label: t("demo.rating.displayLabel") },
  slots: { valueText: "4,3", count: t("demo.rating.count") },
});

/** The input: five steps, nothing chosen yet. */
export const ratingInputTree = (t: Translate): UsageTree => ({
  contract: "rating",
  signature: "Rating",
  options: { label: t("demo.rating.inputLabel"), name: "score" },
});

/*
 * THE FRACTION, shown three times rather than described once. A rating that rounds 4.3 to 4 and 3.8
 * to 4 draws the same picture for two different products, which is the whole argument for painting
 * the exact percentage.
 */
export const ratingFractionsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 3.8, label: t("demo.rating.fraction38") },
      slots: { valueText: "3,8" },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4.3, label: t("demo.rating.fraction43") },
      slots: { valueText: "4,3" },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 5, label: t("demo.rating.fraction50") },
      slots: { valueText: "5,0" },
    },
  ],
});

/** A read-only input is still a control a reader can move through; a display is not. */
export const ratingSizesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4, label: t("demo.rating.sizeSm"), symbolSize: "sm" },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4, label: t("demo.rating.sizeMd") },
    },
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4, label: t("demo.rating.sizeLg"), symbolSize: "lg" },
    },
  ],
});

/*
 * ONE LABEL, because the contract publishes one symbol and what matters is that BOTH signatures
 * wear it: the strip the display paints and the glyph inside a radio are the same mask, which is
 * why swapping `--sk-rating-symbol` changes both at once.
 */
export const ratingAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("ratingPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "rating",
          signature: "RatingDisplay",
          options: { value: 4.3, label: t("demo.rating.displayLabel") },
          slots: { valueText: "4,3" },
        },
        {
          contract: "rating",
          signature: "Rating",
          options: { label: t("demo.rating.inputLabel"), name: "anatomy", defaultValue: 3 },
        },
      ],
    },
    items: [
      namePart(".sk-rating__symbols", "inline-end"),
      namePart(".sk-rating__item", "block-end", { match: "all" }),
    ],
  },
});

/* Don't: an average with no count, so a single review reads like a thousand. */
export const ratingDontNoCountTree = (t: Translate): UsageTree => ({
  contract: "rating",
  signature: "RatingDisplay",
  options: { value: 4.3, label: t("demo.rating.displayLabel") },
  slots: { valueText: "4,3" },
});

/* Don't: an average drawn with the input, which invites a click that changes nothing it should. */
export const ratingDontInputAverageTree = (t: Translate): UsageTree => ({
  contract: "rating",
  signature: "Rating",
  options: { label: t("demo.rating.displayLabel"), name: "average", defaultValue: 4 },
});

/* The input with something already chosen, for the cards that vary how it behaves. */
const chosen = (t: Translate, extra: Record<string, unknown> = {}): UsageTree => ({
  contract: "rating",
  signature: "Rating",
  options: { label: t("demo.rating.inputLabel"), name: "score", defaultValue: 4, ...extra },
});
export const ratingPlaygroundTree = (t: Translate): UsageTree => chosen(t);

/* How many steps the scale has: three, five (the usual) or ten. One export each, with 3 chosen. */
export const ratingThreeStepsTree = (t: Translate): UsageTree => chosen(t, { max: 3, defaultValue: 2 });
export const ratingFiveStepsTree = (t: Translate): UsageTree => chosen(t, { max: 5, defaultValue: 4 });
export const ratingTenStepsTree = (t: Translate): UsageTree => chosen(t, { max: 10, defaultValue: 8 });

/*
 * ANOTHER SYMBOL, drawn live: the star is a mask behind one custom property, set here to a heart. It
 * is the same property for the display and for the input, so one rule changes both.
 */
export const ratingHeartsCss = `.sk-rating {
  --sk-rating-symbol: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.3 5c2 0 3.7 1.1 4.7 2.8C12 6.1 13.7 5 15.7 5 19 5 21 8.4 19.5 11.8 19.5 16.4 12 21 12 21z'/%3E%3C/svg%3E");
}`;

export const ratingHeartsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: [
    {
      contract: "rating",
      signature: "RatingDisplay",
      options: { value: 4.3, label: t("demo.rating.displayLabel") },
      slots: { valueText: "4,3", count: t("demo.rating.count") },
    },
    chosen(t, { defaultValue: 3 }),
  ],
});

/* A product, as a shop shows it: the name, the price and the average with how many agree. */
export const ratingProductTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "lg" },
  attrs: { style: "inline-size: 20rem; max-inline-size: 100%;" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      { contract: "typography", signature: "Heading", options: { headingSize: "h5", flush: true }, children: t("demo.rating.product") },
      {
        contract: "rating",
        signature: "RatingDisplay",
        options: { value: 4.3, label: t("demo.rating.displayLabel") },
        slots: { valueText: "4,3", count: t("demo.rating.count") },
      },
      { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: t("demo.rating.productPrice") },
    ],
  },
});

/* A review form: the rating is one field among others, with the words that explain it. */
export const ratingReviewTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "lg" },
  attrs: { style: "inline-size: 24rem; max-inline-size: 100%;" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      { contract: "typography", signature: "Heading", options: { headingSize: "h4", flush: true }, children: t("demo.rating.reviewTitle") },
      chosen(t, { defaultValue: 0, name: "review-score" }),
      {
        contract: "form-field",
        signature: "FormField",
        slots: { label: t("demo.rating.reviewLabel") },
        children: { contract: "input", signature: "Textarea", options: { name: "review" } },
      },
      { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.rating.reviewSubmit") },
    ],
  },
});
