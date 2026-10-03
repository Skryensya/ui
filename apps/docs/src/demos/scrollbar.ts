import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Ten rows of filler, long enough that the box actually scrolls: that is the whole point, because a
 * scrollbar demo with nothing to scroll shows nothing. The two trees differ only in the class, which
 * is what the page is comparing (always-visible against reveal-on-hover).
 */
const rows = (t: Translate): readonly string[] => [
  t("demo.scrollbar.length"),
  t("demo.scrollbar.state"),
  "Render: vanilla",
  "Binding: React",
  t("demo.scrollbar.contract"),
  t("demo.scrollbar.gate"),
  t("demo.scrollbar.sourceHash"),
  t("demo.scrollbar.preview"),
  t("demo.scrollbar.scroll"),
  "Thumb: visible",
];

/*
 * A LINE IS A `Text` NODE, NOT A BARE STRING. `children` takes one string or an array of nodes: strings
 * inside an array were accepted by the validator but drawn by no renderer, so every rail on this page
 * rendered as an empty box and there was nothing to scroll.
 */
const line = (text: string): UsageTree => ({ contract: "typography", signature: "Text", options: { size: "sm" }, children: text });

const scrollDemo = (t: Translate, className: string): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { class: className, tabindex: "0", "aria-label": t("demo.scrollbar.label") },
  children: rows(t).map(line),
});

export const scrollbarAlwaysTree = (t: Translate): UsageTree =>
  scrollDemo(t, "sk-scrollbar demo-scroll");

export const scrollbarRevealTree = (t: Translate): UsageTree =>
  scrollDemo(t, "sk-scrollbar demo-scroll sk-scrollbar--reveal");

/*
 * THE DEMO RAILS' OWN CSS. A preview is an iframe that copies only the system's stylesheets, so rules in
 * the page's `<style>` never reached it: the boxes had no height, nothing overflowed, and there was no
 * scrollbar to look at. This string is handed to `UsagePreview`'s `css` (the frame) and, for the Do/Don't
 * halves, which live in the page itself, inlined once in a global style by the page.
 */
export const scrollbarDemoCss = `
.demo-scroll {
  box-sizing: border-box;
  inline-size: min(100%, 26rem);
  block-size: 11rem;
  overflow: auto;
  padding: var(--space-inset-md);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-surface);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
}
.demo-scroll--x {
  /* The unbroken line must not size the stage it sits in: without this its min-content width (the whole
     line) became the track the box is centered in, and the box ran out of its card. */
  contain: inline-size;
  block-size: auto;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}
.demo-scroll--custom {
  --sk-scrollbar-size: 0.75rem;
  --sk-scrollbar-track-bg: var(--color-bg-surface-sunken);
  --sk-scrollbar-thumb-bg: var(--color-accent-default, var(--color-border-strong));
  --sk-scrollbar-thumb-hover-bg: var(--color-accent-default, var(--color-text-tertiary));
}
.demo-scroll--short {
  block-size: auto;
}
`;

/** Wider than its box, so the horizontal bar is the one that shows. */
export const scrollbarHorizontalTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { class: "sk-scrollbar demo-scroll demo-scroll--x", tabindex: "0", "aria-label": t("demo.scrollbar.label") },
  children: [line(rows(t).join("  ·  "))],
});

/** The same rail with its hooks set from the consumer's CSS: a wider thumb in the accent. */
export const scrollbarCustomTree = (t: Translate): UsageTree =>
  scrollDemo(t, "sk-scrollbar demo-scroll demo-scroll--custom");

/** Don't: `sk-scrollbar` on a box with nothing to scroll. It paints no bar: the class has nothing to color. */
export const scrollbarDontShortTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { class: "sk-scrollbar demo-scroll demo-scroll--short", tabindex: "0", "aria-label": t("demo.scrollbar.label") },
  children: [line(t("demo.scrollbar.length")), line(t("demo.scrollbar.state"))],
});
