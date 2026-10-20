import { satin, type SatinPaleTint, type SatinTint } from "../lib/satin";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * The four page demos share the same Carousel contract. Authored options cover both former gaps:
 * `slideSize` writes the root custom property, `autoplayDelay` preserves the exact timer, and
 * `mounted: false` deliberately leaves the zero-JS baseline to native scroll controls.
 */

/* Each feature has its own satin, so a row of slides reads as different cards, not one picture repeated. */
const featureTint = {
  productivity: "blue",
  context: "graphite",
  analytics: "sage",
  collaboration: "lilac",
  security: "sand",
  automation: "slate",
  reports: "blush",
  integrations: "mist",
} as const satisfies Record<string, SatinTint | SatinPaleTint>;
/* Pale tints share the 16x9 shape, so the overload that wants one tint kind takes both here. */
const demoSrc = (feature: keyof typeof featureTint) => satin(featureTint[feature] as SatinTint);

const features = [
  ["productivity", "top"],
  ["context", "center"],
  ["analytics", "bottom"],
  ["collaboration", "left"],
  ["security", "right"],
  ["automation", "top"],
  ["reports", "center"],
  ["integrations", "bottom"],
] as const;

type Feature = (typeof features)[number][0];
type Position = (typeof features)[number][1];

function featureSlide(
  t: Translate,
  feature: Feature,
  position: Position,
  /** Adds a real, focusable "Read more" link inside the card; see `carouselFocusableTree` below. */
  href?: string,
): UsageTree {
  return {
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "none" },
      children: [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: {
            src: demoSrc(feature),
            alt: "",
            aspect: "16/9",
            radius: "top",
            position,
          },
        },
        {
          contract: "box",
          signature: "Box",
          options: { padding: "md" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Text",
                options: { size: "caption", tone: "tertiary", weight: "label" },
                children: t(`demo.carousel.${feature}.eyebrow` as never),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "lg", weight: "label" },
                children: t(`demo.carousel.${feature}.title` as never),
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "sm", tone: "secondary" },
                children: t(`demo.carousel.${feature}.body` as never),
              },
              href
                ? {
                    contract: "typography",
                    signature: "Link",
                    options: { href },
                    children: t("demo.carousel.readMore"),
                  }
                : undefined,
            ].filter((node): node is Exclude<typeof node, undefined> => node !== undefined),
          },
        },
      ],
    },
  };
}

/*
 * Autoplay on, so the enhancer draws controls, dots AND the pause button. Two slides keep the
 * specimen readable under a dense set of labels; individual dot thumbs stay out of the densest cut.
 */
export const carouselAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("carousel.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "carousel",
      signature: "Carousel",
      options: { mounted: true, autoplayDelay: 3500, slideSize: "min(70%, 18rem)" },
      attrs: { "aria-label": t("demo.carousel.label") },
      children: features.slice(0, 2).map(([feature, position]) => featureSlide(t, feature, position)),
    },
    items: [
      namePart(".sk-carousel", "block-start", { mark: "bracket" }),
      namePart(".sk-carousel__track", "inline-start"),
      namePart(".sk-carousel__slide", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-carousel__controls", "block-end"),
      namePart(".sk-carousel__button", "inline-start"),
      namePart(".sk-carousel__autoplay", "inline-end"),
      namePart(".sk-carousel__dots", "inline-end"),
      namePart(".sk-carousel__dot", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** Four feature cards over the same scroll-snap track; controls remain enhancer-owned. */
export const carouselCardsTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, fade: true },
  attrs: { "aria-label": t("demo.carousel.label") },
  children: features.map(([feature, position]) =>
    featureSlide(t, feature, position),
  ),
});

/** A narrower multi-up track advancing every 3.5 seconds. */
export const carouselAutoplayTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, autoplayDelay: 3500, slideSize: "min(65%, 22rem)" },
  attrs: { "aria-label": t("demo.carousel.label") },
  children: features.map(([feature, position]) => featureSlide(t, feature, position)),
});

/*
 * Every card is ALSO its own destination: WAI-ARIA's Carousel pattern says focus anywhere inside
 * the carousel pauses rotation, "including the next and previous slide elements". That phrasing
 * is easy to read as "only the chrome", so this demo is the case that proves it also covers a
 * slide's OWN content. Tab into "Leer más" on any card and the rotation stops; Tab or Shift+Tab
 * back out and it resumes (unless the mouse happens to be hovering too).
 */
export const carouselFocusableTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, autoplayDelay: 3500, slideSize: "min(65%, 22rem)" },
  attrs: { "aria-label": t("demo.carousel.focusLabel") },
  children: features.map(([feature, position]) =>
    featureSlide(t, feature, position, `#${feature}`),
  ),
});

/*
 * The people track. Names are written here rather than translated (a name reads the same in every
 * language) while the roles beside them are words and come from the dictionary, keyed by POSITION
 * so renaming a person never touches a key. The initials are the names' own, which is why they are
 * written beside them instead of derived: two words do not always give two letters.
 */
const people = [
  ["first", "Ada Lovelace", "AL"],
  ["second", "Grace Hopper", "GH"],
  ["third", "Radia Perlman", "RP"],
  ["fourth", "Barbara McClintock", "BM"],
  ["fifth", "Karen Spärck Jones", "KS"],
  ["sixth", "Margaret Hamilton", "MH"],
  ["seventh", "Katherine Johnson", "KJ"],
  ["eighth", "Hedy Lamarr", "HL"],
] as const;

function personSlide(
  t: Translate,
  [position, name, initials]: (typeof people)[number],
): UsageTree {
  return {
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { size: "lg", name },
            children: initials,
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Text",
                options: { weight: "label" },
                children: name,
              },
              {
                contract: "typography",
                signature: "Text",
                options: { size: "sm", tone: "secondary" },
                children: t(`demo.carousel.person.${position}.role` as never),
              },
            ],
          },
        ],
      },
    },
  };
}

/**
 * The bare track: `controls: "none"` turns off BOTH layers, the enhancer's buttons and dots and the
 * native pseudo-elements, and what is left is still a scroller with snap.
 *
 * It runs at the default slide size instead of the narrower one its hand-written version set inline,
 * because that width is the knob no tree can reach (see the header). Nothing of the lesson goes with
 * it (the peek, the drag and the snap are all still there), which is exactly why this demo converts
 * and its multi-up neighbour does not.
 */
export const carouselBareTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, controls: "none" },
  attrs: { "aria-label": t("demo.carousel.team.label") },
  children: people.map((person) => personSlide(t, person)),
});

/*
 * OTHER KINDS OF CARD. The feature card above is one typology (image, eyebrow, title, body). A track
 * holds anything that is a self-contained unit: a figure with its delta, a quote with its author, a
 * product with its price. Each is its own tree, keyed by position so copy never moves with a rename.
 */
const stats = [
  ["first", "positive", "up"],
  ["second", "positive", "up"],
  ["third", "danger", "down"],
  ["fourth", "neutral", "flat"],
] as const;

/** Metric cards: a label, one large figure, its change as a Badge, and what it is measured against. */
export const carouselStatsTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, fade: true, slideSize: "min(60%, 15rem)" },
  attrs: { "aria-label": t("demo.carousel.stats.label") },
  children: stats.map(([position, tone]) => ({
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "sm", align: "start" },
        children: [
          { contract: "typography", signature: "Text", options: { size: "caption", tone: "tertiary", weight: "label" }, children: t(`demo.carousel.stat.${position}.label` as never) },
          { contract: "typography", signature: "Text", options: { size: "xl", weight: "label" }, children: t(`demo.carousel.stat.${position}.value` as never) },
          { contract: "badge", signature: "Badge", options: { tone: tone === "danger" ? "danger" : tone === "positive" ? "success" : "neutral" }, children: t(`demo.carousel.stat.${position}.delta` as never) },
          { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: t(`demo.carousel.stat.${position}.note` as never) },
        ],
      },
    },
  })),
});

const quotes = [
  ["first", "Ada Lovelace", "AL"],
  ["second", "Grace Hopper", "GH"],
  ["third", "Radia Perlman", "RP"],
  ["fourth", "Karen Spärck Jones", "KS"],
] as const;

/** Testimonial cards: the quote first and large, then who said it, with their avatar. */
export const carouselQuotesTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, fade: true, slideSize: "min(80%, 22rem)" },
  attrs: { "aria-label": t("demo.carousel.quotes.label") },
  children: quotes.map(([position, name, initials]) => ({
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "sunken", border: "subtle", padding: "lg" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "lg" },
        children: [
          { contract: "typography", signature: "Text", children: t(`demo.carousel.quote.${position}.text` as never) },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center" },
            children: [
              { contract: "avatar", signature: "Avatar.initials", options: { size: "md", name }, children: initials },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "xs" },
                children: [
                  { contract: "typography", signature: "Text", options: { size: "sm", weight: "label" }, children: name },
                  { contract: "typography", signature: "Text", options: { size: "caption", tone: "tertiary" }, children: t(`demo.carousel.person.${position}.role` as never) },
                ],
              },
            ],
          },
        ],
      },
    },
  })),
});

const products = [
  ["first", "sage", true],
  ["second", "sand", false],
  ["third", "slate", false],
  ["fourth", "blush", true],
  ["fifth", "lilac", false],
] as const;

/** Product cards: a tall image, name and price on one line, and a Badge only where it earns it. */
export const carouselProductsTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, fade: true, slideSize: "min(55%, 14rem)" },
  attrs: { "aria-label": t("demo.carousel.products.label") },
  children: products.map(([position, tint, isNew]) => ({
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "none" },
      children: [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: { src: satin(tint as SatinTint), alt: "", aspect: "4/3", radius: "top" },
        },
        {
          contract: "box",
          signature: "Box",
          options: { padding: "md" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs", align: "start" },
            children: [
              ...(isNew ? [{ contract: "badge", signature: "Badge", options: { tone: "accent" }, children: t("demo.carousel.product.new") } as UsageTree] : []),
              { contract: "typography", signature: "Text", options: { weight: "label" }, children: t(`demo.carousel.product.${position}.name` as never) },
              { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: t(`demo.carousel.product.${position}.price` as never) },
            ],
          },
        },
      ],
    },
  })),
});

/** Same scroll-snap markup with the enhancer intentionally absent. */
export const carouselNativeTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: false },
  attrs: { "aria-label": t("demo.carousel.nativeLabel") },
  children: features.slice(0, 3).map(([feature, position]) => ({
    contract: "carousel",
    signature: "CarouselSlide",
    children: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: {
        src: demoSrc(feature),
        alt: "",
        aspect: "16/9",
        position,
      },
      slots: {
        caption: {
          contract: "media-overlay",
          signature: "MediaOverlay",
          children: {
            contract: "typography",
            signature: "Text",
            options: { size: "sm", weight: "label" },
            children: t(`demo.carousel.${feature}.title` as never),
          },
        },
      },
    },
  })),
});

/* Usage guide: two cards that already fit side by side, put behind carousel controls anyway. */
export const carouselDontFewTree = (t: Translate): UsageTree => ({
  contract: "carousel",
  signature: "Carousel",
  options: { mounted: true, slideSize: "48%" },
  attrs: { "aria-label": t("demo.carousel.label") },
  children: features.slice(0, 2).map(([feature, position]) => featureSlide(t, feature, position)),
});
