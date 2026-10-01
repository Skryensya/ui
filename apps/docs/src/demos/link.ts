import { PLACEHOLDER_HREF } from "../lib/placeholder-hrefs";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/* Link demos shared by both locales. Locale-owned hrefs come from the pages. */

export const linkSingleTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Link",
  options: { href },
  children: t("demo.link.neutral"),
});

/** Two links in a paragraph: underline always, tone optional. */
export const linkTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [
    t("demo.link.before"),
    {
      contract: "typography",
      signature: "Link",
      options: { href },
      children: t("demo.link.neutral"),
    },
    t("demo.link.middle"),
    {
      contract: "typography",
      signature: "Link",
      options: { href, linkTone: "accent" },
      children: t("demo.link.accent"),
    },
    t("demo.link.after"),
  ],
});

export const tileLinkTree = (_t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "tile",
  signature: "TileLink",
  options: { href },
  children: {
    contract: "tile",
    signature: "TileContent",
    slots: {
      title: "Usage details",
      description: "Open the account usage report.",
    },
  },
});

/*
 * One part, and it only means something inside a sentence: the paragraph is `sk-text`, the anchor in
 * it is `sk-link`. Both are ringed so the reader sees which of the two the link class belongs to.
 */
export const linkAnatomyTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("linkPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "typography",
      signature: "Text",
      attrs: { style: "max-inline-size: 26rem;" },
      children: [
        t("demo.link.before"),
        { contract: "typography", signature: "Link", options: { href }, children: t("demo.link.neutral") },
        t("demo.link.after"),
      ],
    },
    items: [
      namePart(".sk-text", "inline-start", { mark: "bracket" }),
      namePart(".sk-link", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/* Usage guide: a sentence whose link text says where it goes, against one whose link says "here". */
const sentence = (t: Translate, before: string, link: string, after: string, href: string): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [t(before as Parameters<Translate>[0]), { contract: "typography", signature: "Link", options: { href }, children: t(link as Parameters<Translate>[0]) }, t(after as Parameters<Translate>[0])],
});

export const linkDoDescriptiveTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree =>
  sentence(t, "demo.link.doBefore", "demo.link.doLink", "demo.link.doAfter", href);

export const linkDontHereTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree =>
  sentence(t, "demo.link.dontBefore", "demo.link.dontLink", "demo.link.dontAfter", href);

export const linkDoTargetWordsTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [
    t("demo.link.targetBefore"),
    { contract: "typography", signature: "Link", options: { href }, children: t("demo.link.targetLink") },
    t("demo.link.targetAfter"),
  ],
});

export const linkDontWholeSentenceTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Link",
  options: { href },
  children: t("demo.link.wholeSentence"),
});

export const linkDoExternalTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Link",
  options: { href },
  attrs: { target: "_blank", rel: "noopener noreferrer" },
  children: [
    t("demo.link.externalReport"),
    " ",
    { contract: "icon", signature: "Icon", options: { name: "external-link", label: t("demo.link.newTab") } },
  ],
});

export const linkDontExternalTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Link",
  options: { href },
  attrs: { target: "_blank", rel: "noopener noreferrer" },
  children: t("demo.link.externalReport"),
});

export const linkDoActionTree = (t: Translate): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { tone: "accent" },
  children: t("demo.link.saveChanges"),
});

export const linkDontActionTree = (t: Translate, href: string = PLACEHOLDER_HREF): UsageTree => ({
  contract: "typography",
  signature: "Link",
  options: { href, linkTone: "accent" },
  children: t("demo.link.saveChanges"),
});
