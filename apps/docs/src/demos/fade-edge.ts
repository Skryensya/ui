import type { UsageTree } from "@skryensya/core/usage-tree";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { useTranslations, type Translate } from "../i18n";

/*
 * THE FADE-EDGE EXAMPLES, AS USAGE TREES.
 *
 * These were six hand-written HTML strings on the page, which made FadeEdge the last family whose
 * docs had a Vanilla stage and no React one at all: `ComponentPreview` derives BOTH bindings from a
 * tree, and there was nothing to derive from. Nothing about the pattern was blocking that; it is
 * paint-only, every piece it composes is published, and the one option the activity feed needed
 * (`List`'s `dividers`) was declared in the contract and simply not exposed by its signature.
 *
 * Horizontal agenda examples use localized copy; the legacy vertical specimens retain their
 * literal Spanish copy.
 */

/** Scroll geometry the two vertical demos share. `attrs.style`, because these are the CONSUMER's
 *  dimensions: how tall a clipped region is belongs to the layout around it, not to the pattern. */
const VERTICAL_SCROLL = "max-block-size: 11rem; overflow-y: auto;";
const HORIZONTAL_SCROLL = "overflow-x: auto;";

/*
 * THE SCROLLER REACHES THE CARD'S EDGE. A card that holds a scroll region has no padding of its own;
 * the scroller carries it instead, so its scrollbar runs along the card's very edge rather than
 * floating a padding's width inside it, and the content still sits inset. The card clips its own
 * corners so the bar follows the radius.
 */
const SCROLL_INSET = "padding: var(--space-inset-md);";
const SCROLL_CARD = "overflow: hidden;";
/** What sits above or below the scroller keeps the card's inset on the three sides it does not share. */
const CARD_HEAD = "padding: var(--space-inset-md) var(--space-inset-md) 0;";
const CARD_FOOT = "padding: 0 var(--space-inset-md) var(--space-inset-md);";

/** The card every vertical demo sits in: a raised, bordered Box at a realistic column width. */
const card = (children: UsageTree): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "none" },
  attrs: { style: `inline-size: 22rem; max-inline-size: 100%; box-sizing: border-box; ${SCROLL_CARD}` },
  children: [children],
});

type Activity = {
  readonly initials: string;
  readonly palette: string;
  readonly name: string;
  readonly action: string;
  readonly time: string;
};

/*
 * Seven rows deep, on purpose: the box is capped at 11rem (about three rows), so the feed has real
 * content to scroll THROUGH rather than a static clip. That is what makes the effect legible  -
 * `mask-image` paints against the element's own box, not its content, so the faded band stays
 * pinned to the edge while the rows travel underneath it.
 */
const ACTIVITY: readonly Activity[] = [
  { initials: "AL", palette: "blue-600", name: "Ada Lovelace", action: 'Comentó en "Rediseño del dashboard"', time: "2m" },
  { initials: "GH", palette: "emerald-600", name: "Grace Hopper", action: "Aprobó el pull request #482", time: "15m" },
  { initials: "AT", palette: "sky-600", name: "Alan Turing", action: 'Creó el ticket "Migrar auth a OAuth2"', time: "1h" },
  { initials: "MH", palette: "red-600", name: "Margaret Hamilton", action: "Cerró 3 issues en el sprint actual", time: "2h" },
  { initials: "DK", palette: "amber-600", name: "Donald Knuth", action: "Subió una nueva build a staging", time: "5h" },
  { initials: "KP", palette: "emerald-600", name: "Katherine Johnson", action: 'Editó la página "Roadmap Q3"', time: "8h" },
  { initials: "BL", palette: "blue-600", name: "Barbara Liskov", action: "Invitó a 2 personas al equipo", time: "1d" },
];

const activityList = (label: string): UsageTree => ({
  contract: "list",
  signature: "List",
  options: { dividers: false },
  attrs: { "aria-label": label },
  children: ACTIVITY.map((row) => ({
    contract: "list",
    signature: "ListItem",
    slots: {
      leading: {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { size: "sm", name: row.name },
        attrs: {
          style: `--sk-avatar-bg: var(--palette-${row.palette}); --sk-avatar-fg: var(--palette-white);`,
        },
        children: row.initials,
      },
      title: row.name,
      description: row.action,
      trailing: {
        contract: "typography",
        signature: "Text",
        // A span: ListItem's trailing slot is a <span>, and a <p> inside it is invalid HTML.
        options: { tone: "tertiary", size: "sm", textElement: "span" },
        children: row.time,
      },
    },
  })),
});

const TAGS = [
  ["Diseño", undefined],
  ["Frontend", "accent"],
  ["Aprobado", "success"],
  ["En revisión", "warning"],
  ["Bloqueado", "danger"],
  ["Backend", undefined],
  ["Accesibilidad", undefined],
  ["Performance", undefined],
  ["Documentación", undefined],
  ["QA", "accent"],
] as const;

/** A real sequence to browse: two complete sessions and part of the next one at rest. */
export const fadeHorizontalAgendaTree = (t: Translate, directionOrHref: "to-right" | "to-left" | string = "to-right"): UsageTree => {
  const direction = directionOrHref === "to-left" ? "to-left" : "to-right";

  return {
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "none" },
  attrs: { style: `inline-size: 28rem; max-inline-size: 100%; min-inline-size: 0; box-sizing: border-box; ${SCROLL_CARD}` },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      {
        contract: "typography",
        signature: "Heading",
        options: { headingSize: "h4", flush: true },
        attrs: { style: CARD_HEAD },
        children: t("demo.fadeEdge.agenda.title"),
      },
      {
        contract: "fade-edge",
        signature: "FadeEdge",
        options: { direction, scrollAware: true, size: "3rem" },
        attrs: {
          ...(direction === "to-left" ? { id: "fade-left-scroll" } : {}),
          class: "sk-scrollbar",
          style: `${HORIZONTAL_SCROLL} ${SCROLL_INSET}`,
          tabindex: "0",
          role: "region",
          "aria-label": t("demo.fadeEdge.agenda.region"),
        },
        children: {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", wrap: false },
          attrs: { style: "inline-size: max-content;" },
          children: [1, 2, 3, 4].map((session) => ({
            contract: "box",
            signature: "Box",
            options: { surface: "surface", border: "subtle", padding: "md" },
            attrs: { style: "inline-size: 11rem; flex: 0 0 11rem; box-sizing: border-box;" },
            children: {
              contract: "layout",
              signature: "Stack",
              options: { gap: "sm" },
              children: [
                { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: t(`demo.fadeEdge.agenda.day${session}` as "demo.fadeEdge.agenda.day1") },
                { contract: "typography", signature: "Strong", children: t(`demo.fadeEdge.agenda.session${session}` as "demo.fadeEdge.agenda.session1") },
                { contract: "typography", signature: "Text", options: { size: "sm", tone: "secondary" }, children: ["10:00", "11:30", "14:00", "16:00"][session - 1] },
              ],
            },
          })),
        },
      },
      {
        contract: "typography",
        signature: "Text",
        options: { size: "caption", tone: "secondary" },
        attrs: { style: CARD_FOOT },
        children: t("demo.fadeEdge.agenda.hint"),
      },
    ],
  },
};
};

/** 1. The default direction: a clipped list whose bottom edge says there are more rows below. */
export const fadeBottomTree: UsageTree = card({
  contract: "fade-edge",
  signature: "FadeEdge",
  attrs: { class: "sk-scrollbar", style: `${VERTICAL_SCROLL} ${SCROLL_INSET}` },
  children: [activityList("Actividad reciente")],
});

/** 2. The same feed, started at the end, so what is missing is above and the fade says so. */
export const fadeTopTree: UsageTree = card({
  contract: "fade-edge",
  signature: "FadeEdge",
  options: { direction: "to-top" },
  attrs: { id: "fade-top-scroll", class: "sk-scrollbar", style: `${VERTICAL_SCROLL} ${SCROLL_INSET}` },
  children: [activityList("Actividad reciente, scrolleada hacia abajo")],
});

/** Storybook keeps the same agenda as the docs, in its default Spanish locale. */
export const fadeRightTree: UsageTree = fadeHorizontalAgendaTree(useTranslations("es"));
export const fadeLeftTree: UsageTree = fadeHorizontalAgendaTree(useTranslations("es"), "to-left");

/*
 * 5. The scrim: a photo whose caption has to stay legible over whatever the image happens to show.
 * `mode: "color"` paints an opaque gradient instead of revealing the surface behind, which is the
 * whole point here  -  there is no flat backdrop under a photograph to fade into.
 *
 * The "photo" is a CSS gradient rather than an ImageFrame: the subject is the WASH, and a real
 * image would put the reader's attention on whether the picture is nice. Same reason the media
 * placeholders elsewhere in these docs spell out their own dimensions.
 */
export const fadeColorTree: UsageTree = {
  contract: "box",
  signature: "Box",
  options: { border: "subtle" },
  attrs: { style: "inline-size: 20rem;" },
  children: [
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { style: "position: relative;" },
      children: [
        {
          contract: "fade-edge",
          signature: "FadeEdge",
          options: { mode: "color", color: "rgb(15 23 42 / 85%)", size: "7rem" },
          attrs: {
            style:
              "block-size: 12rem; background: linear-gradient(135deg, var(--palette-blue-600), var(--palette-sky-400));",
          },
          children: [""],
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none" },
          attrs: { style: "position: absolute; inset: auto 0 0 0; padding: var(--space-inset-md);" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { size: "lg", weight: "label" },
              attrs: { style: "color: var(--palette-white);" },
              children: "Vista desde el mirador",
            },
            {
              contract: "typography",
              signature: "Text",
              options: { size: "sm" },
              attrs: { style: "color: rgb(255 255 255 / 85%);" },
              children: "Patagonia, Argentina",
            },
          ],
        },
      ],
    },
  ],
};

/*
 * 6. The size hook, driven live by a real range input over the SAME feed as the first demo.
 *
 * Pixels on the input and rem in the readout: `<input type="range">` has no unit, and converting on
 * read keeps the label honest about the unit `--sk-fade-edge-size` is actually documented in.
 */
export const fadeIntensityTree: UsageTree = {
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 22rem;" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { surface: "raised", border: "subtle", padding: "none" },
      attrs: { style: SCROLL_CARD },
      children: [
        {
          contract: "fade-edge",
          signature: "FadeEdge",
          options: { size: "64px" },
          attrs: { id: "fade-intensity-region", class: "sk-scrollbar", style: `${VERTICAL_SCROLL} ${SCROLL_INSET}` },
          children: [activityList("Actividad reciente")],
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          children: [
            "Intensidad del desvanecido: ",
            { contract: "typography", signature: "Strong", attrs: { id: "fade-intensity-value" }, children: "4.0rem" },
          ],
        },
        /*
         * `NativeInput`, and NOT the system's own `Slider`, which is the control this demo would
         * otherwise reach for.
         *
         * The stage runs ONE script for both bindings, and it drives the control through the DOM.
         * Both bindings now dispatch `sk:slidervaluechange`, but a native range input still fires
         * `input` in both without needing the kit's machine, which keeps this demo's shared script
         * trivial.
         */
        {
          contract: "input",
          signature: "NativeInput",
          options: { type: "range" },
          attrs: {
            id: "fade-intensity-range",
            min: "8",
            max: "88",
            step: "4",
            value: "64",
            "aria-label": "Ajustar el tamaño del desvanecido",
            style: "inline-size: 100%;",
          },
        },
      ],
    },
  ],
};

/*
 * 7. The same feed as the first demo, scroll-aware: the fade retires once the last row is in view,
 * and comes back the moment the reader scrolls up. Nothing about the feed changes; the option is
 * the whole difference, which is why it reuses the first demo's list verbatim.
 */
export const fadeScrollAwareTree: UsageTree = card({
  contract: "fade-edge",
  signature: "FadeEdge",
  options: { scrollAware: true },
  attrs: { class: "sk-scrollbar", style: `${VERTICAL_SCROLL} ${SCROLL_INSET}` },
  children: [activityList("Actividad reciente, con el fundido atento al scroll")],
});

/*
 * One part, and the fade is not a second one: in the default mode it is a `mask-image` on the root
 * itself, so the element that scrolls IS the element that fades. The bracket is that element; the
 * ring is what scrolls inside it, which is free composition.
 */
export const fadeEdgeAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("fadeEdge.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: fadeBottomTree,
    items: [
      namePart(".sk-fade-edge", "inline-start", { mark: "bracket" }),
      namePart(".sk-fade-edge > *", "inline-end"),
    ],
  },
});

/*
 * Usage guide, "only when there is more": ONE specimen, both halves. Two chips that fit, in a card as
 * wide as they are, so the edge the fade sits on is the last chip itself. Faded anyway, that chip
 * loses contrast for nothing; with `scrollAware`, the row has nothing left to scroll, so there is no
 * fade at all. Same chips, same card, same height: the only difference is the one the caption names.
 */
const fitsTree = (scrollAware: boolean): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "md" },
  attrs: { style: "inline-size: max-content;" },
  children: [
    {
      contract: "fade-edge",
      signature: "FadeEdge",
      options: scrollAware ? { direction: "to-right", scrollAware: true } : { direction: "to-right" },
      attrs: scrollAware ? { class: "sk-scrollbar", style: HORIZONTAL_SCROLL } : {},
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", wrap: false },
          children: TAGS.slice(0, 2).map(([label, tone]) => ({
            contract: "tag",
            signature: "Tag",
            ...(tone ? { options: { tone } } : {}),
            children: label,
          })),
        },
      ],
    },
  ],
});

export const fadeDoFitsTree: UsageTree = fitsTree(true);
export const fadeDontFitsTree: UsageTree = fitsTree(false);

/*
 * A matched specimen for the direction guide: the same row, opened at its MIDDLE (`data-dd-middle`,
 * set by the page before it paints), so there are more chips on both sides. Only the fade differs:
 * the Do fades both ends and lets each retire with the scroll, the Don't fades one side and cuts the
 * other dry. Real scrollers with their scrollbars showing, because the bar is the proof of where the
 * content continues. The row is `max-content` wide so the chips keep their full labels and really
 * overflow; a Tag shrinks and ellipsizes inside a row it does not fit.
 */
const directionGuideTree = (fade: { direction: "horizontal"; scrollAware: true } | { direction: "to-right" }): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "raised", border: "subtle", padding: "none" },
  attrs: { style: `inline-size: 100%; min-inline-size: 0; ${SCROLL_CARD}` },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "none" },
    children: [
      { contract: "typography", signature: "Heading", options: { headingSize: "h4", flush: true }, attrs: { style: CARD_HEAD }, children: "Etiquetas" },
      {
        contract: "fade-edge",
        signature: "FadeEdge",
        options: fade,
        attrs: {
          "data-dd-middle": "",
          class: "sk-scrollbar",
          style: `${HORIZONTAL_SCROLL} ${SCROLL_INSET} --sk-fade-edge-size: 5rem;`,
          tabindex: "0",
          role: "region",
          "aria-label": "Etiquetas",
        },
        children: [
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", wrap: false },
            attrs: { style: "inline-size: max-content;" },
            children: TAGS.map(([label, tone]) => ({
              contract: "tag",
              signature: "Tag",
              ...(tone ? { options: { tone } } : {}),
              children: label,
            })),
          },
        ],
      },
    ],
  },
});

export const fadeDirectionGuideTree = directionGuideTree({ direction: "horizontal", scrollAware: true });
/** More content on both sides, but only the right edge fades: the left one cuts dry. */
export const fadeDontDirectionTree = directionGuideTree({ direction: "to-right" });

/** Transparent masking fades the photo itself; color mode lets it blend into the caption surface. */
export const fadeDontModeTree: UsageTree = {
  contract: "box",
  signature: "Box",
  options: { border: "subtle" },
  attrs: { style: "inline-size: 20rem;" },
  children: {
    contract: "fade-edge",
    signature: "FadeEdge",
    attrs: {
      style: "block-size: 12rem; background: linear-gradient(135deg, var(--palette-blue-600), var(--palette-sky-400));",
    },
    children: [""],
  },
};

/** scrollAware cannot follow scrolling when overflow belongs to a nested child, not FadeEdge. */
export const fadeDontNestedScrollTree: UsageTree = card({
  contract: "fade-edge",
  signature: "FadeEdge",
  options: { scrollAware: true },
  children: [
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { class: "sk-scrollbar", style: `${VERTICAL_SCROLL} ${SCROLL_INSET}` },
      children: [activityList("Actividad reciente")],
    },
  ],
});
