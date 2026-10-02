import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * THE PERSON'S AVATAR. An Avatar, because that is what the person already is everywhere else in this
 * system: it carries the name as its accessible name and shows initials. Here it is always initials, and
 * that is deliberate: a real product swaps the same slot for a photo (`Avatar.image`) and nothing else
 * changes, so the docs show the plain case and say so.
 */
const avatar = (
  name: string,
  initials: string,
  size: "sm" | "md" | "lg" = "md",
): UsageTree => ({
  contract: "avatar",
  signature: "Avatar.initials",
  options: { size, name },
  children: initials,
});

/** The figure, the blockquote inside it, the caption outside it, and the picture and author inside that. */
export const quoteAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("quotePage.anatomyLabel"),
    inert: true,
  },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "quote",
      signature: "Quote",
      options: { cite: "https://example.org/cuadernos/06" },
      slots: {
        children: t("demo.quote.main.body"),
        attribution: t("demo.quote.main.attribution"),
        source: t("demo.quote.main.source"),
        image: avatar("Camila Rojas", "CR"),
      },
    },
    items: [
      namePart(".sk-quote", "block-start", { mark: "bracket" }),
      namePart(".sk-quote__body", "inline-start", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
      namePart(".sk-quote__attribution", "inline-start", {
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-quote__media", "block-end", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
      namePart(".sk-quote__author", "inline-end", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
      namePart(".sk-quote__source", "block-end", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
    ],
  },
});

/*
 * THE CASE THE COMPONENT WAS BUILT FOR: a quotation inside a text, with a person and a work beside
 * it. The two fields are filled from different data on purpose - the name is a person, the cite is
 * the essay it came from - because that is the distinction the markup is making.
 */
export const quoteTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  options: { cite: "https://example.org/cuadernos/06" },
  slots: {
    children: t("demo.quote.main.body"),
    attribution: t("demo.quote.main.attribution"),
    source: t("demo.quote.main.source"),
    image: avatar("Camila Rojas", "CR"),
  },
});

/** The same attribution without a picture: the caption is exactly what it always was. */
export const quoteTextTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  options: { cite: "https://example.org/cuadernos/06" },
  slots: {
    children: t("demo.quote.main.body"),
    attribution: t("demo.quote.main.attribution"),
    source: t("demo.quote.main.source"),
  },
});

/** The avatar beside the name, with and without a work: the picture is the same slot either way. */
export const quoteAvatarTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  children: [
    {
      contract: "quote",
      signature: "Quote",
      slots: {
        children: t("demo.quote.portrait.photo.body"),
        attribution: t("demo.quote.portrait.photo.attribution"),
        source: t("demo.quote.portrait.photo.source"),
        image: avatar("Tomás Vera", "TV"),
      },
    },
    {
      contract: "quote",
      signature: "Quote",
      slots: {
        children: t("demo.quote.portrait.initials.body"),
        attribution: t("demo.quote.portrait.initials.attribution"),
        image: avatar("Ana Pizarro", "AP"),
      },
    },
  ],
});

/** Pull, with a larger avatar: lifted out of the text, the person is part of what is being lifted. */
export const quotePullAvatarTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  options: { variant: "pull" },
  slots: {
    children: t("demo.quote.portrait.pull.body"),
    attribution: t("demo.quote.portrait.pull.attribution"),
    image: avatar("Inés Duarte", "ID", "lg"),
  },
});

/** The same passage with nobody to credit: the caption does not render at all. */
export const quoteBareTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  slots: { children: t("demo.quote.anonymous.body") },
});

/*
 * PULL. Lifted out of the text to be read on its own, which is why it loses the rule instead of
 * gaining a bigger one: it is not inside anything any more.
 */
export const quotePullTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  options: { variant: "pull" },
  slots: {
    children: t("demo.quote.pull.body"),
    attribution: t("demo.quote.pull.attribution"),
  },
});

/*
 * A testimonial: the quotation is the content, and everything around it is the page's own voice.
 * Composed inside a Tile so the two are told apart by surface, not by quotation marks.
 */
export const quoteTestimonialTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", padding: "lg", border: "subtle" },
  children: [
    {
      contract: "quote",
      signature: "Quote",
      slots: {
        children: t("demo.quote.testimonial.body"),
        attribution: t("demo.quote.testimonial.attribution"),
        source: t("demo.quote.testimonial.source"),
        image: avatar("Inés Duarte", "ID"),
      },
    },
  ],
});

/*
 * THE USAGE PAIRS. One person, one passage and one width through all of them (Camila Rojas, the same
 * sentence), so what differs between a Do and its Don't is the rule and nothing else. Every Do follows
 * every rule at once: a concrete name, an avatar of that name, the variant that fits where it sits.
 */
type DdKey = Parameters<Translate>[0];
const dd = (t: Translate, key: string) => t(`demo.quote.dd.${key}` as DdKey);
const DD_WIDTH = "max-inline-size: 22rem;";

const ddQuote = (
  t: Translate,
  body: string,
  attribution: string | undefined,
  extra: {
    variant?: "pull";
    avatar?: boolean | [string, string];
    source?: boolean;
  } = {},
): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  ...(extra.variant ? { options: { variant: extra.variant } } : {}),
  attrs: { style: DD_WIDTH },
  slots: {
    children: body,
    ...(attribution ? { attribution } : {}),
    ...(extra.source ? { source: t("demo.quote.main.source") } : {}),
    ...(extra.avatar
      ? {
          image: Array.isArray(extra.avatar)
            ? avatar(...extra.avatar)
            : avatar("Camila Rojas", "CR"),
        }
      : {}),
  },
});

/* Pull: one sentence that stands alone, against a paragraph set in display type. */
export const quoteDoPullTree = (t: Translate): UsageTree =>
  ddQuote(t, t("demo.quote.pull.body"), dd(t, "person"), { variant: "pull" });
export const quoteDontLongPullTree = (t: Translate): UsageTree =>
  ddQuote(t, dd(t, "long"), dd(t, "person"), { variant: "pull" });

/* Notice: a quotation is only for words somebody said; an interface notice is a Callout. */
export const quoteDontNoticeTree = (t: Translate): UsageTree => ({
  contract: "quote",
  signature: "Quote",
  attrs: { style: DD_WIDTH },
  slots: { children: t("demo.quote.dd.notice") },
});

export const quoteDoNoticeTree = (t: Translate): UsageTree => ({
  contract: "callout",
  signature: "Callout",
  options: { tone: "info" },
  attrs: { style: DD_WIDTH },
  children: t("demo.quote.dd.notice"),
});

/* Place: a quotation inside a text keeps the text's size; pull belongs outside it. */
const inText = (t: Translate, variant?: "pull"): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: DD_WIDTH },
  children: [
    {
      contract: "typography",
      signature: "Text",
      children: dd(t, "flow.before"),
    },
    {
      contract: "quote",
      signature: "Quote",
      ...(variant ? { options: { variant } } : {}),
      slots: {
        children: t("demo.quote.main.body"),
        attribution: dd(t, "person"),
      },
    },
    {
      contract: "typography",
      signature: "Text",
      children: dd(t, "flow.after"),
    },
  ],
});
export const quoteDoInTextTree = (t: Translate): UsageTree => inText(t);
export const quoteDontPullInTextTree = (t: Translate): UsageTree =>
  inText(t, "pull");

/* Who: a name a reader can place, against a label that says nothing. */
export const quoteDoNamedTree = (t: Translate): UsageTree =>
  ddQuote(t, t("demo.quote.main.body"), dd(t, "who.do"), { avatar: true });
export const quoteDontVagueTree = (t: Translate): UsageTree =>
  ddQuote(t, t("demo.quote.main.body"), dd(t, "who.dont"), {
    avatar: [dd(t, "who.dont"), dd(t, "who.dontInitials")],
  });

/* Avatar: the initials are the speaker's own, against initials that belong to someone else. */
export const quoteDoAvatarTree = (t: Translate): UsageTree =>
  ddQuote(t, t("demo.quote.main.body"), t("demo.quote.main.attribution"), {
    avatar: true,
    source: true,
  });

export const quoteDontInitialsTree = (t: Translate): UsageTree => ({
  ...quoteDoAvatarTree(t),
  slots: {
    children: t("demo.quote.main.body"),
    attribution: t("demo.quote.main.attribution"),
    source: t("demo.quote.main.source"),
    image: avatar("Tomás Vera", "TV"),
  },
});
