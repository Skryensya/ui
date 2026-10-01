import type { UsageTree } from "@skryensya/core/usage-tree";
import type { CardCopy } from "../examples/card-data";

/*
 * THE CARD PAGE'S USAGE-GUIDE SPECIMEN, kept out of `demos/card.ts` on purpose: that module is the
 * ladder of labelled examples (`card-sources.test.ts` counts it tree for tree), and a "don't" is not
 * a rung. It reuses the link cards' own content, on a static Box with a small link inside: the whole
 * card goes to one place, yet only the word does.
 */
export const cardDontInnerLinkTree = (c: CardCopy, cta: string): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "md", responsive: true },
  attrs: { "aria-label": c.labels.link },
  children: c.link.map((card) => ({
    contract: "box",
    signature: "Box",
    options: { surface: "surface", border: "subtle", padding: "lg" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm" },
        children: [
          { contract: "typography", signature: "Heading", options: { headingSize: "h4", flush: true }, children: card.title },
          { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: card.body },
          { contract: "typography", signature: "Link", options: { href: "#" }, slots: { children: cta } },
        ],
      },
    ],
  })),
});
