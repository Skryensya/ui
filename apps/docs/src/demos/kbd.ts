import type { UsageTree } from "@skryensya/core/usage-tree";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import type { Translate } from "../i18n";

/*
 * Four keys. A constant, not a factory: there is nothing here to translate; a glyph and the words
 * printed on a physical keyboard are the same in both languages, so a `t` argument would only be a
 * parameter nobody uses.
 */
export const kbdTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    { contract: "kbd", signature: "Kbd", children: "⌘" },
    { contract: "kbd", signature: "Kbd", children: "K" },
    { contract: "kbd", signature: "Kbd", children: "Esc" },
    { contract: "kbd", signature: "Kbd", children: "↵" },
  ],
};

export const kbdAccentTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "⌘" },
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "K" },
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "Esc" },
    { contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: "↵" },
  ],
};

/*
 * One part, and a combination is several of it side by side: `⌘` and `K` are two `<kbd>`, not one
 * with a plus sign in it. Ringing every key rather than the row says that.
 */
export const kbdAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("kbdPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "xs" },
      children: [
        { contract: "kbd", signature: "Kbd", children: "⌘" },
        { contract: "kbd", signature: "Kbd", children: "K" },
      ],
    },
    items: [
      namePart(".sk-kbd", "block-start", { match: "all", ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/* The one key every property preview on the page varies: `tone` and `appearance` played on it. */
export const kbdSingleTree: UsageTree = { contract: "kbd", signature: "Kbd", children: "K" };

/* Do: a shortcut named in the sentence that teaches it. */
export const kbdDoInlineTree = (t: Translate): UsageTree => ({
  contract: "typography",
  signature: "Text",
  children: [
    t("demo.kbd.dd.pressPrefix"),
    { contract: "kbd", signature: "Kbd", children: "⌘" },
    " ",
    { contract: "kbd", signature: "Kbd", children: "K" },
    t("demo.kbd.dd.pressSuffix"),
  ],
});

/* Don't: a key as the only way to say what it does. */
export const kbdDontAloneTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "xs" },
  children: [
    { contract: "kbd", signature: "Kbd", children: "⌘" },
    { contract: "kbd", signature: "Kbd", children: "K" },
  ],
};

/* Don't: one kbd holding the whole chord, plus signs and all. */
export const kbdDontChordTree: UsageTree = {
  contract: "kbd",
  signature: "Kbd",
  children: "⌘ + Shift + K",
};

/* Do: one key per kbd. */
export const kbdDoChordTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "xs" },
  children: [
    { contract: "kbd", signature: "Kbd", children: "⌘" },
    { contract: "kbd", signature: "Kbd", children: "⇧" },
    { contract: "kbd", signature: "Kbd", children: "K" },
  ],
};

/* Don't: every key painted accent, so none of them is the one to notice. */
export const kbdDontAccentTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: ["⌘", "K", "Esc", "↵"].map((key) => ({ contract: "kbd", signature: "Kbd", options: { tone: "accent" }, children: key })),
};
