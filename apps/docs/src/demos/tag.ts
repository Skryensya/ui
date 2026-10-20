import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

const tag = (children: string, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "tag",
  signature: "Tag",
  ...(Object.keys(options).length > 0 ? { options } : {}),
  children,
});

const tagLink = (children: string, href: string, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "tag",
  signature: "Tag.link",
  options: { href, ...options },
  children,
});

const tagToggle = (children: string, selected: boolean, options: Record<string, string | boolean> = {}): UsageTree => ({
  contract: "tag",
  signature: "Tag.toggle",
  options: { selected, ...options },
  children,
});


/** Chip, label and remove control: the removable tag shows every Tag part. */
export const tagAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("tagPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "tag",
      signature: "Tag",
      options: {
        tone: "accent",
        removable: true,
        removeLabel: t("demo.tag.remove", { name: "react" }),
      },
      children: "react",
    },
    items: [
      namePart(".sk-tag", "block-start", { mark: "bracket", ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-tag__label", "inline-start"),
      namePart(".sk-tag__remove", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/* The smallest honest tag: a keyword attached to content, no status semantics and no action. */
export const tagSimpleTree = (t: Translate): UsageTree => tag(t("demo.tag.design"));

const tagArticleCard = (title: string, summary: string, tags: UsageTree[]): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "lg" },
  children: [{
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      { contract: "typography", signature: "Heading", options: { headingSize: "h4", flush: true }, children: title },
      { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: summary },
      { contract: "layout", signature: "Inline", options: { gap: "sm" }, children: tags },
    ],
  }],
});

/* Categories are Tags even when they are labels, not controls; the card context makes that role clear. */
export const tagCategoriesTree = (t: Translate): UsageTree =>
  tagArticleCard(t("demo.tag.articleTitle"), t("demo.tag.articleSummary"), [
    tag(t("demo.tag.design")),
    tag(t("demo.tag.accessibility")),
    tag(t("demo.tag.performance")),
  ]);

/* Accent emphasizes a category; it does not mean selected or communicate a status. */
export const tagTonesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    tag(t("demo.tag.design")),
    tag(t("demo.tag.accessibility"), { tone: "accent" }),
    tag(t("demo.tag.performance")),

  ],
});

/*
 * Linked keywords: each chip is one navigation target. It cannot also be dismissible; removable tags
 * use a separate button instead of nesting a button inside an anchor.
 */
export const tagLinksTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    tagLink(t("demo.tag.design"), "/components/heading"),
    tagLink(t("demo.tag.accessibility"), "/components/skip-link", { tone: "accent" }),
    tagLink(t("demo.tag.performance"), "/motion"),
  ],
});

/*
 * Choice chips: a real button each, `aria-pressed` carries selection and the component styles that
 * state persistently. The mode changes only the initial selection; the docs property owns the behavior.
 */
export const tagToggleTree = (t: Translate, mode: "single" | "multiple" = "multiple"): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    tagToggle(t("demo.tag.design"), true),
    tagToggle("frontend", mode === "multiple"),
    tagToggle(t("demo.tag.accessibility"), false),
  ],
});

/* Beta is a status, not a category. Used only by the DoDont pair below. */
export const tagStatusMisuseTree = (): UsageTree => tag("Beta");

/*
 * Complete filter bar: removable applied facets. The remove button's accessible name names the exact
 * facet it clears, because the visible X is decorative and every tag owns a different action.
 */
export const tagRemovableTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    tag("react", {
      tone: "accent",
      removable: true,
      removeLabel: t("demo.tag.remove", { name: "react" }),
    }),
    tag("frontend", {
      removable: true,
      removeLabel: t("demo.tag.remove", { name: "frontend" }),
    }),
    tag(t("demo.tag.accessibility"), {
      removable: true,
      removeLabel: t("demo.tag.remove", { name: t("demo.tag.accessibility") }),
    }),
  ],
});
