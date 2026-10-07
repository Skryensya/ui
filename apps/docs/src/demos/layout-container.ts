import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * DECISION 35 ON THE PRIMITIVES' OWN PAGES: what a Stack does with height it is given, a row that exists on
 * one side of the expanded line, and uneven columns as a span of even ones. Each tree is the smallest
 * composition the option is visible in, not a page.
 */

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({ contract: "typography", signature: "Text", options, children });

/*
 * A Stack only has height to spend when its parent gives it some, so the specimen stands in a card with a
 * height of its own. The card is a grid so the Stack, its one item, stretches to that height: the same
 * thing an AppShell's row does for a Main.
 */
export const stackJustifyTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "md", border: "subtle" },
  attrs: { style: "display: grid; min-block-size: 16rem" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm", stackJustify: "center" },
    children: [
      { contract: "typography", signature: "Heading", options: { headingSize: "h4", flush: true }, children: t("demo.layoutContainer.signInTitle") },
      text(t("demo.layoutContainer.signInBody"), { tone: "secondary" }),
      { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.layoutContainer.signInAction") },
    ],
  },
});

/*
 * A header's row with both sides written once: the links where there is room, a menu button where there is
 * not. Shown in a phone's frame and a wide one, since the line is measured on the room the row has.
 */
export const inlineShowTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "md", border: "subtle" },
  /* A header row spans its page; the preview stage centres a specimen at its own size, so it is given the frame's width. */
  attrs: { style: "inline-size: 100%" },
  children: {
    contract: "layout",
    signature: "Inline",
    options: { justify: "between", inlineAlign: "center", wrap: false },
    children: [
      text("Lumen", { weight: "emphasis" }),
      {
        contract: "layout",
        signature: "Inline",
        options: { show: "expanded", gap: "lg", inlineAlign: "center" },
        children: [text(t("demo.layoutContainer.linkProduct")), text(t("demo.layoutContainer.linkPricing")), text(t("demo.layoutContainer.linkDocs"))],
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { show: "compact" },
        children: {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost", iconOnly: true },
          attrs: { "aria-label": t("demo.layoutContainer.menu") },
          children: { contract: "icon", signature: "Icon", options: { name: "menu" } },
        },
      },
    ],
  },
});

const cell = (label: string, lines: number, span?: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "md", surface: "surface", border: "subtle" },
  ...(span ? { attrs: { "data-span": span } } : {}),
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "xs" },
    /* The cell's content is beside the point, so it is the shape of content: lines of different counts make the heights differ. */
    children: [text(label, { weight: "label" }), { contract: "placeholder", signature: "Placeholder.paragraph", options: { lines: lines, shimmer: false } }],
  },
});

/** Two thirds and one third: three even lanes, and a child that takes two of them. */
export const gridSpanTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", align: "start" },
  /* A grid takes its parent's width on a page; the preview stage centres a specimen at its own size, so it is given one. */
  attrs: { "aria-label": t("demo.layoutContainer.spanLabel"), style: "inline-size: min(36rem, 100%)" },
  children: [cell(t("demo.layoutContainer.spanWide"), 4, "2"), cell(t("demo.layoutContainer.spanNarrow"), 2)],
});
