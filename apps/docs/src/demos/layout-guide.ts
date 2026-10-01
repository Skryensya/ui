import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * USAGE-GUIDE SPECIMENS FOR THE LAYOUT PRIMITIVES (Grid, Stack, Inline, Wrapper), kept apart from
 * `demos/layout.ts` so the examples module stays the list of examples. Each is the wrong primitive
 * for its content, next to a page that shows the right one.
 */

const button = (label: string): UsageTree => ({ contract: "button", signature: "Button.action", children: label });

const inlineText = (children: string, options: Record<string, string> = {}): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { textElement: "span", ...options },
  children,
});

const badge = (children: string): UsageTree => ({ contract: "badge", signature: "Badge", children });

const projectCard = (name: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: name,
});

const dataCard = (title: string, lines: readonly string[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "xs" },
    children: [
      { contract: "typography", signature: "Text", options: { weight: "label" }, children: title },
      ...lines.map((line) => ({ contract: "typography", signature: "Text", options: { tone: "secondary", size: "sm" }, children: line })),
    ],
  },
});

const stepCard = (number: string, title: string): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: {
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", inlineAlign: "center" },
    children: [
      { contract: "badge", signature: "Badge", children: number },
      { contract: "typography", signature: "Text", children: title },
    ],
  },
});

/* The same project cards stacked: nothing uses the horizontal space, so comparison is slower. */
export const gridDontStackCardsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { "aria-label": t("demo.grid.label") },
  children: [projectCard("Atlas"), projectCard("Brisa"), projectCard("Cauce")],
});

/* Plan data forced into cards: the shared fields are repeated instead of becoming columns. */
export const gridDontDataCardsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "md" },
  children: [
    dataCard(t("demo.table.starter"), [t("demo.table.starterUsage"), t("demo.table.active")]),
    dataCard(t("demo.table.team"), [t("demo.table.teamUsage"), t("demo.table.trial")]),
  ],
});

/* A sequence belongs in one reading column, not split into lanes. */
export const gridDoSequenceTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  children: [stepCard("1", "Brief"), stepCard("2", "Draft"), stepCard("3", "Review"), stepCard("4", "Publish")],
});

/* Multicol fills down each lane: fine for independent cards, confusing for steps. */
export const gridDontSequenceTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "sm", multicol: true },
  children: [stepCard("1", "Brief"), stepCard("2", "Draft"), stepCard("3", "Review"), stepCard("4", "Publish")],
});

/* Three actions in equal columns: every button stretches to its column and the row reads as tiles. */
export const gridDontButtonsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "3", gap: "sm" },
  attrs: { style: "inline-size: 100%;" },
  children: [button(t("demo.layoutGuide.cancel")), button(t("demo.layoutGuide.saveDraft")), button(t("demo.layoutGuide.publish"))],
});

/* The same three actions where they belong: a row that takes only the room each label needs. */
export const inlineButtonsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [button(t("demo.layoutGuide.cancel")), button(t("demo.layoutGuide.saveDraft")), button(t("demo.layoutGuide.publish"))],
});

export const inlineDoWrapTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "xs", wrap: true },
  attrs: { style: "inline-size: 13rem;" },
  children: [badge(t("demo.inline.tag.design")), badge(t("demo.inline.tag.research")), badge(t("demo.inline.tag.frontend"))],
});

export const inlineDontWrapTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "xs", wrap: false },
  attrs: { style: "inline-size: 13rem; overflow: hidden;" },
  children: [badge(t("demo.inline.tag.design")), badge(t("demo.inline.tag.research")), badge(t("demo.inline.tag.frontend"))],
});

export const inlineDoMetadataTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "xs", inlineAlign: "center", wrap: true },
  attrs: { style: "inline-size: 14rem;" },
  children: [
    badge(t("demo.inline.statusValue")),
    inlineText(t("demo.inline.owner"), { tone: "secondary" }),
    inlineText(t("demo.inline.updated"), { tone: "secondary" }),
  ],
});

export const inlineDontMetadataTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  options: { size: "sm", tone: "secondary" },
  attrs: { style: "inline-size: 14rem;" },
  children: t("demo.inline.metadataSentence"),
});

export const inlineDoBetweenTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { justify: "between", inlineAlign: "center" },
  attrs: { style: "inline-size: 22rem;" },
  children: [inlineText(t("demo.inline.plan"), { weight: "label" }), button(t("demo.inline.manage"))],
});

export const inlineDontBetweenTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  options: { columns: "2", gap: "sm" },
  attrs: { style: "inline-size: 22rem; align-items: center;" },
  children: [inlineText(t("demo.inline.plan"), { weight: "label" }), button(t("demo.inline.manage"))],
});

/* Hero with four actions of equal weight: nothing says which one is the point of the page. */
export const heroDontActionsTree = (t: Translate): UsageTree => ({
  contract: "hero",
  signature: "Hero",
  children: [
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md", align: "start" },
      children: [
        { contract: "typography", signature: "Heading", options: { headingSize: "display-sm", flush: true }, children: t("demo.hero.title") },
        { contract: "typography", signature: "Text", options: { tone: "secondary", size: "lg" }, children: t("demo.hero.body") },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: ["demo.layoutGuide.heroA", "demo.layoutGuide.heroB", "demo.layoutGuide.heroC", "demo.layoutGuide.heroD"].map((key) => ({
            contract: "button",
            signature: "Button.action",
            options: { tone: "accent" },
            children: t(key as Parameters<Translate>[0]),
          })),
        },
      ],
    },
  ],
});

/* The form's three actions piled in a column: each claims a line of its own on a wide screen. */
export const stackDontButtonsTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm", align: "start" },
  children: [button(t("demo.layoutGuide.cancel")), button(t("demo.layoutGuide.saveDraft")), button(t("demo.layoutGuide.publish"))],
});
