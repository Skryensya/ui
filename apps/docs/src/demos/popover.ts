import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureTree } from "./annotation-parts";

export const popoverAnatomyTree = (t: Translate): UsageTree =>
  anatomyFigureTree(t, {
    label: t("popoverPage.anatomyLabel"),
    subject: popoverTree(t),
    parts: [
      {
        for: ".sk-popover",
        side: "block-start",
        mark: "bracket",
        ringPlacement: "offset",
        ringDistance: 8,
      },
      { for: ".sk-popover__trigger", side: "inline-start" },
      { for: ".sk-popover__content", side: "inline-start" },
      { for: ".sk-anchored-arrow", side: "inline-end" },
      {
        for: ".sk-popover__title",
        side: "inline-end",
        ringPlacement: "offset",
        ringDistance: 2,
      },
      {
        for: ".sk-popover__description",
        side: "inline-end",
        ringPlacement: "offset",
        ringDistance: 2,
      },
      { for: ".sk-popover__close", side: "block-end" },
    ],
  });

export const popoverAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-popover {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-md);
  inline-size: min(100%, 16rem);
}

/*
 * Back in flow, same reason as Menu: .sk-anchored is position:fixed, so out of flow the panel
 * contributes nothing to Annotated's measured box and the frame collapses to the trigger alone.
 * relative (not static): still in flow under the trigger, AND a containing block for the
 * absolute arrow below. Plain specificity beats the pattern rule (no !important).
 *
 * OPEN PAINT: .sk-popover__content defaults to opacity 0 / scaled / blurred until
 * :popover-open. This specimen has no popover attribute (UA closed-[popover] would hide it),
 * so the open look has to be forced here the way Menu forces data-state=open on its panel.
 */
.sk-annotated__subject > .sk-popover > .sk-popover__positioner {
  position: relative;
  inline-size: 100%;
  display: grid;
  gap: var(--space-stack-sm);
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: blur(0);
  margin: 0;
  pointer-events: none;
}

/* Absolute against the static panel, not fixed against the viewport (the @supports path in
 * anchored.css). Top-centred on the panel's near edge so it still reads as the tip of the box. */
.sk-annotated__subject > .sk-popover > .sk-popover__positioner > .sk-anchored-arrow {
  /* The arrow is hidden until the popover opens (anchored.css); here it is drawn open. */
  visibility: visible;
  position: absolute;
  inset-block-start: calc(-1 * var(--sk-anchored-arrow-size, 8px) / 2);
  inset-inline-start: 50%;
  translate: -50% 0;
  margin: 0;
}

.sk-annotated__subject {
  text-align: center;
}`;

/*
 * A profile card behind a trigger, from the contract published for it.
 *
 * The authored version this replaces carried two inline anchor names,
 * `style="--sk-anchored-name: --profile-anchor"` on the trigger and on the panel, because until
 * recently nothing else could name an anchor without JS. The stylesheet scopes one static name now,
 * so the composition says nothing about anchoring at all, which is the point: where a panel opens is
 * the component's business, not the page's.
 */
export const popoverTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover",
  options: {
    panelId: "profile-popover",
    arrow: true,
    closeLabel: t("demo.popover.close"),
  },
  slots: {
    trigger: t("demo.popover.trigger"),
    title: "Ada Lovelace",
    description: t("demo.popover.description"),
    children: t("demo.popover.body"),
  },
});

/*
 * The same contract, past the point where `title`/`description` are enough: a header (who), a body
 * (what) and a footer (what to do about it), all inside `children`. The contract has no dedicated
 * header/footer slot, and does not need one, `children` already accepts a node, and a node is
 * composition, not prose. Built entirely from published signatures (Inline/Stack for the rows,
 * Avatar.initials, Text, Button.action), not a single hand-rolled class.
 *
 * `Popover.bare`, not `Popover`: `Popover`'s template renders a "Cerrar" button unconditionally,
 * with no `whenGiven` to opt out of it. A footer that already ends in its own dismiss action
 * ("Ignorar") does not need a second, unrelated close control appended under it. Light-dismiss and
 * Escape still close the panel either way, that part of the contract is the platform's, not the
 * button's. `Popover.bare` renders no title, no description and no close button, which is exactly
 * the shape this composition wants.
 */
export const popoverStructuredTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover.bare",
  options: { panelId: "team-popover", arrow: true, bare: true },
  slots: {
    trigger: t("demo.popoverStructured.trigger"),
    children: [
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm" },
        children: [
          {
            contract: "avatar",
            signature: "Avatar.initials",
            options: { size: "md", name: "Grace Hopper" },
            children: "GH",
          },
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Text",
                options: { weight: "emphasis" },
                children: "Grace Hopper",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "sm" },
                children: t("demo.popoverStructured.role"),
              },
            ],
          },
        ],
      },
      {
        contract: "typography",
        signature: "Text",
        options: { size: "sm" },
        children: t("demo.popoverStructured.body"),
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", justify: "end" },
        children: [
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", size: "sm" },
            children: t("demo.popoverStructured.dismiss"),
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { tone: "accent", size: "sm" },
            children: t("demo.popoverStructured.action"),
          },
        ],
      },
    ],
  },
});

/*
 * The four logical sides at once, `Popover.bare` rather than `Popover`: the point here is
 * `placement`, not chrome, and a title/close button on four panels in a row would be four times the
 * furniture and half the signal. Each trigger's label IS the option value it sets, so reading the
 * row reads the enum.
 *
 * Wrapped in two nested, padded `Box`es: the anchor engine flips a placement to the opposite side
 * when its preferred side has no room, and a trigger sitting flush against the preview stage's top
 * edge has no room above it: `block-start` would silently render as if it were `block-end`. One
 * `xl` Box (the scale's ceiling, 32px) measured 56px above the trigger against a 58px panel, six
 * pixels short; nesting a second one is real, published space, not a magic number chosen to win a
 * pixel count.
 */
export const popoverPlacementTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { padding: "xl" },
  children: {
    contract: "box",
    signature: "Box",
    options: { padding: "xl" },
    children: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "md" },
      children: [
        {
          contract: "popover",
          signature: "Popover.bare",
          options: {
            panelId: "place-block-start",
            placement: "block-start",
            arrow: true,
            bare: true,
          },
          slots: {
            trigger: "block-start",
            children: t("demo.popoverPlacement.blockStart"),
          },
        },
        {
          contract: "popover",
          signature: "Popover.bare",
          options: {
            panelId: "place-block-end",
            placement: "block-end",
            arrow: true,
            bare: true,
          },
          slots: {
            trigger: "block-end",
            children: t("demo.popoverPlacement.blockEnd"),
          },
        },
        {
          contract: "popover",
          signature: "Popover.bare",
          options: {
            panelId: "place-inline-start",
            placement: "inline-start",
            arrow: true,
            bare: true,
          },
          slots: {
            trigger: "inline-start",
            children: t("demo.popoverPlacement.inlineStart"),
          },
        },
        {
          contract: "popover",
          signature: "Popover.bare",
          options: {
            panelId: "place-inline-end",
            placement: "inline-end",
            arrow: true,
            bare: true,
          },
          slots: {
            trigger: "inline-end",
            children: t("demo.popoverPlacement.inlineEnd"),
          },
        },
      ],
    },
  },
});

/* ---------------------------------------------------------------------------------------------
 * THE BARE SURFACE, which this page presents as "Popup".
 *
 * It lived in `demos/popup.ts` beside a page of its own, and that page was the mistake: `Popup` is
 * not a second component, it is `Popover.bare`, the same contract one signature down. Two pages for
 * one contract meant a reader had to find out which of the two described what they already had, and
 * the catalogue counted the family twice. The section merged into the Popover page; these trees
 * moved here with it, so they group under Popover like every other signature.
 * ------------------------------------------------------------------------------------------- */

/*
 * The bare surface, `Popover.bare`, which is what this page calls a popup.
 *
 * It is not a second component and this file is the proof: the same contract, one signature down,
 * with the title, the description and the close control left out. What goes inside is the
 * composition's business, which is the whole reason the surface has no semantics of its own.
 *
 * The authored version carried two inline anchor names. The stylesheet scopes one now, so nothing
 * here mentions anchoring.
 */
export const popupTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover.bare",
  options: { panelId: "filters-popup", bare: true, arrow: true },
  slots: {
    trigger: t("demo.popup.trigger"),
    children: {
      contract: "checkbox",
      signature: "Checkbox",
      options: { name: "active" },
      children: t("demo.popup.onlyActive"),
    },
  },
});

export const popupAnatomyTree = (t: Translate): UsageTree =>
  anatomyFigureTree(t, {
    label: t("popoverPage.popupAnatomyLabel"),
    subject: popoverStructuredTree(t),
    parts: [
      {
        for: ".sk-popover",
        side: "block-start",
        mark: "bracket",
        ringPlacement: "offset",
        ringDistance: 6,
      },
      { for: ".sk-popover__trigger", side: "inline-start" },
      { for: ".sk-popover__content", side: "inline-start" },
      {
        for: ".sk-anchored",
        side: "inline-end",
        ringPlacement: "offset",
        ringDistance: 4,
      },
      {
        for: ".sk-anchored-arrow",
        side: "inline-end",
        ringPlacement: "offset",
        ringDistance: 3,
      },
    ],
  });

/* Lifted from Popover's own anatomy sheet, because the two specimens have the same problem: a fixed
   surface has to come back into flow before it can be measured, and a panel that paints itself
   closed until `:popover-open` has to be told to look open. */
export const popupAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-popover {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-md);
  inline-size: min(100%, 15rem);
}

.sk-annotated__subject > .sk-popover > .sk-popover__positioner {
  position: relative;
  inline-size: 100%;
  display: grid;
  gap: var(--space-stack-sm);
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: blur(0);
  margin: 0;
  pointer-events: none;
}

.sk-annotated__subject > .sk-popover > .sk-popover__positioner > .sk-anchored-arrow {
  /* The arrow is hidden until the popover opens (anchored.css); here it is drawn open. */
  visibility: visible;
  position: absolute;
  inset-block-start: calc(-1 * var(--sk-anchored-arrow-size, 8px) / 2);
  inset-inline-start: 50%;
  translate: -50% 0;
  margin: 0;
}

.sk-annotated__subject {
  text-align: center;
}`;

/*
 * USAGE GUIDE. A frozen popover has no panel to show (it opens on a click), so every half is the live
 * component drawn OPEN by `popoverGuideCss`: the panel back in flow under its trigger, painted as if
 * `:popover-open`.
 *
 * ONE STANDARD FOR ALL FOUR PAIRS, so no Do contradicts another pair's Don't or the page's own rules:
 * every Do is a `Popover` with an arrow and a close control, its trigger is named exactly like its
 * title, and its text is short. Each Don't breaks exactly one of those things and keeps the rest.
 */
type GuideKey = Parameters<Translate>[0];
const g = (t: Translate, key: string) =>
  t(`demo.popover.guide.${key}` as GuideKey);

const guidePopover = (
  t: Translate,
  id: string,
  trigger: string,
  title: string,
  children: UsageTree | string,
  description?: string,
): UsageTree => ({
  contract: "popover",
  signature: "Popover",
  options: {
    panelId: `guide-${id}`,
    arrow: true,
    closeLabel: t("demo.popover.close"),
  },
  slots: { trigger, title, ...(description ? { description } : {}), children },
});

/* Content: something to read, with a title, against a single word that only labels its button. */
export const popoverDoInteractiveTree = (t: Translate): UsageTree =>
  guidePopover(
    t,
    "do-content",
    "Ada Lovelace",
    "Ada Lovelace",
    t("demo.popover.body"),
    t("demo.popover.description"),
  );

/** Don't: one word that only explains its trigger. That is a Tooltip, and it opens on hover or focus. */
export const popoverDontLabelTree = (t: Translate): UsageTree => ({
  contract: "popover",
  signature: "Popover.bare",
  options: { panelId: "guide-dont-label", arrow: true },
  slots: { trigger: g(t, "copy.trigger"), children: g(t, "copy.word") },
});

/* Length: a title and one or two sentences, against a paragraph that has become a page. */
export const popoverDoShortTree = (t: Translate): UsageTree =>
  guidePopover(
    t,
    "do-short",
    t("demo.popover.guideTitle"),
    t("demo.popover.guideTitle"),
    t("demo.popover.guideShort"),
  );

export const popoverDontLongTree = (t: Translate): UsageTree =>
  guidePopover(
    t,
    "dont-long",
    t("demo.popover.guideTitle"),
    t("demo.popover.guideTitle"),
    t("demo.popover.guideLong"),
  );

/* Name: the button and the title say the same thing, against a button that promises one thing and a panel that is another. */
export const popoverDoNameTree = (t: Translate): UsageTree =>
  guidePopover(
    t,
    "do-name",
    g(t, "filters.title"),
    g(t, "filters.title"),
    g(t, "filters.body"),
  );

export const popoverDontNameTree = (t: Translate): UsageTree =>
  guidePopover(
    t,
    "dont-name",
    g(t, "filters.mismatch"),
    g(t, "filters.title"),
    g(t, "filters.body"),
  );

/* Decision: a quick action beside its control, against a question that must be answered before going on. */
const actionRow = (children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "sm" },
  children,
});

export const popoverDoActionTree = (t: Translate): UsageTree =>
  guidePopover(t, "do-action", g(t, "share.title"), g(t, "share.title"), {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      {
        contract: "typography",
        signature: "Text",
        options: { tone: "secondary" },
        children: g(t, "share.body"),
      },
      actionRow([
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent", size: "sm" },
          children: g(t, "share.action"),
        },
      ]),
    ],
  });

export const popoverDontDecisionTree = (t: Translate): UsageTree =>
  guidePopover(t, "dont-decision", g(t, "delete.title"), g(t, "delete.title"), {
    contract: "layout",
    signature: "Stack",
    options: { gap: "sm" },
    children: [
      {
        contract: "typography",
        signature: "Text",
        options: { tone: "secondary" },
        children: g(t, "delete.body"),
      },
      actionRow([
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "danger", size: "sm" },
          children: g(t, "delete.confirm"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { size: "sm" },
          children: g(t, "delete.cancel"),
        },
      ]),
    ],
  });

export const popoverGuideCss = `.sk-do-dont__card .sk-popover {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-sm);
  inline-size: min(100%, 15rem);
}

.sk-do-dont__card .sk-popover > .sk-popover__positioner {
  /* A closed [popover] is display: none; the guide draws it open, in flow under its trigger. */
  display: block;
  position: relative;
  inset: auto;
  inline-size: 100%;
  margin: 0;
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: blur(0);
  pointer-events: none;
}

.sk-do-dont__card .sk-popover > .sk-popover__positioner > .sk-anchored-arrow {
  visibility: visible;
  position: absolute;
  inset-block-start: calc(-1 * var(--sk-anchored-arrow-size, 8px) / 2);
  inset-inline-start: 50%;
  translate: -50% 0;
  margin: 0;
}
`;

/*
 * THE PROFILE POPOVER, FOR A PROPERTY CARD. A popover is wired by id (`popovertarget` on the trigger,
 * `id` on the panel), and every card on a page renders the same specimen, so each needs its own: with a
 * shared one, every trigger opens the FIRST panel on the page and the rest sit unopened.
 */
export const popoverCardCase = (
  t: Translate,
  card: string = "card",
): UsageTree => {
  const base = popoverTree(t);
  const id = typeof card === "string" && card ? card : "card";
  /*
   * The placement card is the one whose panel opens SIDEWAYS, and the stage is only as wide as the docs
   * column: a panel at its full 24rem does not fit beside a centered trigger and spills out of the card.
   * So it gets no paragraph, only the title and the one-line description, which keeps the panel narrow
   * enough to sit on either side.
   */
  const slots =
    id === "placement" ? { ...base.slots, children: undefined } : base.slots;
  return {
    ...base,
    slots,
    options: { ...base.options, panelId: `popover-${id}` },
  };
};
