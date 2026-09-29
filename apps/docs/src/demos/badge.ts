import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { annotationDemoCss } from "./annotation";
import { genericIcon } from "./anatomy-subject";

const tones = ["neutral", "accent", "success", "warning", "danger"] as const;

/*
 * TWO SPECIMENS, because `sk-badge` is one class with two shapes and a diagram that draws one of
 * them is making a claim about the part that is false.
 *
 * A pulsing dot in a holder's corner and a standalone tag with text are the same root class,
 * `BadgeDot` and `Badge`: one has no content and borrows its position from the holder, the other is
 * a pill in the flow that holds whatever it is given. Shown alone, either one teaches that
 * `sk-badge` means that one. Side by side, with `match: "all"` sending a leader to each, the name
 * covers what it actually covers, and the pair carries the second lesson for free: the tag needs no
 * holder, the dot is the one that does.
 *
 * `sk-badge-holder` stays SINGULAR, and the contrast is the point of putting them in one drawing: a
 * holder is a corner to hang a dot on, so only the left specimen has one, and its single leader
 * says which of the two is being talked about. Two kinds of name, told apart by how many lines
 * leave the bubble.
 */
export const badgeAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("badge.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "layout",
      signature: "Inline",
      /* `lg` rather than the `md` the tone rows use: these two are far enough apart that the leaders
         fanning out to them read as two separate destinations, not as one wide box. `end` so the
         tag sits on the control's baseline edge instead of floating level with its middle. */
      options: { gap: "lg", inlineAlign: "end" },
      children: [
        {
          contract: "badge",
          signature: "BadgeHolder",
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { iconOnly: true, variant: "ghost" },
              attrs: { "aria-label": t("anatomy.label") },
              children: genericIcon(),
            },
            {
              contract: "badge",
              signature: "BadgeDot",
              options: { tone: "danger", label: t("demo.badge.unread"), pulse: true },
            },
          ],
        },
        {
          contract: "badge",
          signature: "Badge",
          options: { tone: "accent" },
          children: t("anatomy.label"),
        },
      ],
    },
    items: [
      namePart(".sk-badge-holder", "inline-start", { mark: "bracket" }),
      /*
       * FROM ABOVE, so both leaders come DOWN onto what they name. Which edge a leader leaves and
       * which edge it enters are both decided by the gutter the label is in (`leaderTarget`), so
       * naming the pair from an inline gutter means entering each ring from its side: the dot, which
       * is a circle at the holder's top corner with a tag sitting a row below it, then gets a line
       * arriving at its lower corner after passing the tag, and the reader has to work out which of
       * the two the line stopped at. From the block-start gutter both leaders drop out of the
       * bubble's underside onto the top edge of each ring, and neither one goes near the other's.
       *
       * OUTSIDE, because one of the two things this name covers is 8px across. An inset ring on the
       * dot is a 4px square drawn inside a circle barely twice its size: at a hairline stroke that
       * is a smudge on the dot rather than a mark around it, and the leader appears to end at
       * nothing. Outside, both shapes get a ring that reads as one, which is the point of the label
       * covering both.
       */
      namePart(".sk-badge", "block-start", { match: "all", ringPlacement: "offset", ringDistance: 3 }),
    ],
  },
});


/*
 * BADGE'S ANATOMY IS NOT A 4:3 FRAME. Every other anatomy is (site.css), so a page of them reads as
 * one set; this drawing is a dot on a button and one short label side by side, wide and low, and in
 * a 4:3 frame it sat small in the middle of a box twice as tall as itself. Here the ratio is
 * released and the canvas takes its own fitted height instead: the drawing scaled to the width it
 * has, and the frame exactly as tall as that, at every viewport. `[class]` adds one notch of
 * specificity: this sheet lands in the preview frame BEFORE the site's own, so at equal weight the
 * site's 4:3 rule came later and won (measured).
 */
export const badgeAnatomyCss = `${annotationDemoCss}

.sk-annotated-figure[class] > .sk-canvas[data-fit-only] > .sk-canvas__viewport {
  aspect-ratio: auto;
  block-size: var(--sk-canvas-fit-block-size, auto);
}`;

/*
 * ONE BADGE, the specimen every property preview on the page varies: `tone`, `size` and
 * `appearance` are played on this one label, so what changes between two values is the value and
 * nothing else. Its options are the contract's defaults; the preview writes the one it varies.
 */
export const badgeLabelTree = (t: Translate): UsageTree => ({
  contract: "badge",
  signature: "Badge",
  children: t("demo.badge.sample"),
});

/* The same, for the dot: `pulse` is played on it. `label` is required, a dot has no text to be named by. */
export const badgeLoneDotTree = (t: Translate): UsageTree => ({
  contract: "badge",
  signature: "BadgeDot",
  options: { tone: "accent", label: t("demo.badge.unread") },
});

export const badgeTagTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children: [
    { contract: "badge", signature: "Badge", options: { tone: "neutral" }, children: "Neutral" },
    { contract: "badge", signature: "Badge", options: { tone: "accent" }, children: "Accent" },
    { contract: "badge", signature: "Badge", options: { tone: "success" }, children: "Success" },
    { contract: "badge", signature: "Badge", options: { tone: "warning" }, children: "Warning" },
    { contract: "badge", signature: "Badge", options: { tone: "danger" }, children: "Danger" },
  ],
});

export const badgeDotsTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md" },
  children: tones.map((tone) => ({
    contract: "badge",
    signature: "BadgeDot",
    options: { tone, label: tone },
  })),
});

export const badgeSmallTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center" },
  children: [
    { contract: "badge", signature: "Badge", options: { tone: "neutral" }, children: "Default" },
    { contract: "badge", signature: "Badge", options: { tone: "neutral", size: "sm" }, children: "Small" },
  ],
});

export const badgePulseTree = (_t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md" },
  children: tones.map((tone) => ({
    contract: "badge",
    signature: "BadgeDot",
    options: { tone, label: tone, pulse: true },
  })),
});

export const badgeHoldersTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "lg", inlineAlign: "end" },
  children: [
    {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true, variant: "ghost" },
          attrs: { "aria-label": t("demo.badge.settings") },
          children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
        },
        {
          contract: "badge",
          signature: "BadgeDot",
          options: { tone: "danger", label: t("demo.badge.unread"), pulse: true },
        },
      ],
    },
    {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { name: "Ana Solís" },
          children: "AS",
        },
        {
          contract: "badge",
          signature: "BadgeDot",
          options: { tone: "success", label: t("demo.badge.online"), pulse: true },
        },
      ],
    },
    {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true, variant: "ghost" },
          attrs: { "aria-label": t("demo.badge.settings") },
          children: { contract: "icon", signature: "Icon", options: { name: "menu" } },
        },
        {
          contract: "badge",
          signature: "Badge",
          options: { tone: "danger", size: "sm" },
          children: "9",
        },
      ],
    },
  ],
});

/* ─── do's and don'ts (the Usage tab) ────────────────────────────────────────────────────────────── */

const label = (tone: (typeof tones)[number], text: string, size?: "sm"): UsageTree => ({
  contract: "badge",
  signature: "Badge",
  options: size ? { tone, size } : { tone },
  children: text,
});

const row = (children: readonly UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm", inlineAlign: "center" },
  children: [...children],
});

/* The tone says what the state MEANS: paid is good, pending wants attention, overdue is a problem. */
export const badgeDoToneTree = (t: Translate): UsageTree =>
  row([label("success", t("demo.badge.dd.paid")), label("warning", t("demo.badge.dd.pending")), label("danger", t("demo.badge.dd.overdue"))]);

/* The same three states, with tones picked for variety: every one of them now says the wrong thing. */
export const badgeDontToneTree = (t: Translate): UsageTree =>
  row([label("danger", t("demo.badge.dd.paid")), label("accent", t("demo.badge.dd.pending")), label("success", t("demo.badge.dd.overdue"))]);

export const badgeDoShortTree = (t: Translate): UsageTree => label("neutral", t("demo.badge.dd.draft"));

export const badgeDontLongTree = (t: Translate): UsageTree => label("neutral", t("demo.badge.dd.sentence"));

/* Beside what it describes, read as part of it. */
export const badgeDoBesideTree = (t: Translate): UsageTree =>
  row([
    { contract: "typography", signature: "Heading", options: { headingSize: "h4", flush: true }, children: t("demo.badge.dd.invoice") },
    label("success", t("demo.badge.dd.paid")),
  ]);

/* Badges standing in for a filter: they look pressable and are not. */
export const badgeDontControlTree = (t: Translate): UsageTree =>
  row([label("accent", t("demo.badge.dd.all")), label("neutral", t("demo.badge.dd.active")), label("neutral", t("demo.badge.dd.archived"))]);

/* One live thing, pulsing: a person who is online right now. */
export const badgeDoPulseTree = (t: Translate): UsageTree => ({
  contract: "badge",
  signature: "BadgeHolder",
  children: [
    { contract: "avatar", signature: "Avatar.initials", options: { name: "Ana Solís" }, children: "AS" },
    { contract: "badge", signature: "BadgeDot", options: { tone: "success", label: t("demo.badge.online"), pulse: true } },
  ],
});

/* Everything pulsing at once: none of it stands out any more. */
export const badgeDontPulseTree = (t: Translate): UsageTree =>
  row(
    (["accent", "success", "warning", "danger"] as const).map((tone) => ({
      contract: "badge",
      signature: "BadgeDot",
      options: { tone, label: t("demo.badge.unread"), pulse: true },
    })),
  );

/* One label stands out because the others do not: accent is spent on the one thing that is new. */
export const badgeDoAccentOnceTree = (t: Translate): UsageTree =>
  row([label("neutral", t("demo.badge.dd.design")), label("neutral", "Frontend"), label("accent", t("demo.badge.sample"))]);

/* Accent on everything: the one that is new no longer looks any different. */
export const badgeDontAccentAllTree = (t: Translate): UsageTree =>
  row([label("accent", t("demo.badge.dd.design")), label("accent", "Frontend"), label("accent", t("demo.badge.sample"))]);

const countOn = (t: Translate, count: string): UsageTree => ({
  contract: "badge",
  signature: "BadgeHolder",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true, variant: "ghost" },
      attrs: { "aria-label": t("demo.badge.dd.inbox") },
      children: { contract: "icon", signature: "Icon", options: { name: "menu" } },
    },
    label("danger", count, "sm"),
  ],
});

/* A count with a ceiling: read at a glance, and it fits the corner it sits in. */
export const badgeDoCountTree = (t: Translate): UsageTree => countOn(t, "99+");

/* The exact number: it outgrows the control it counts for, and nobody reads it as a number anyway. */
export const badgeDontCountTree = (t: Translate): UsageTree => countOn(t, "1284");

/* The state in words, the tone on top: it reads the same to someone who cannot tell the colours apart. */
export const badgeDoWordsTree = (t: Translate): UsageTree =>
  row([label("success", t("demo.badge.online")), label("warning", t("demo.badge.dd.away")), label("neutral", t("demo.badge.dd.offline"))]);

/* The same three states as bare dots: only the colour tells them apart. */
export const badgeDontColorOnlyTree = (t: Translate): UsageTree =>
  row(
    (
      [
        ["success", t("demo.badge.online")],
        ["warning", t("demo.badge.dd.away")],
        ["neutral", t("demo.badge.dd.offline")],
      ] as const
    ).map(([tone, name]) => ({ contract: "badge", signature: "BadgeDot", options: { tone, label: name } })),
  );

/* A dot on the thing it is about: unread messages, on the inbox. */
export const badgeDoAnchoredDotTree = (t: Translate): UsageTree => ({
  contract: "badge",
  signature: "BadgeHolder",
  children: [
    {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true, variant: "ghost" },
      attrs: { "aria-label": t("demo.badge.dd.inbox") },
      children: { contract: "icon", signature: "Icon", options: { name: "menu" } },
    },
    { contract: "badge", signature: "BadgeDot", options: { tone: "danger", label: t("demo.badge.unread") } },
  ],
});

/* The same dot on its own: unread what? */
export const badgeDontLoneDotTree = (t: Translate): UsageTree => ({
  contract: "badge",
  signature: "BadgeDot",
  options: { tone: "danger", label: t("demo.badge.unread") },
});
