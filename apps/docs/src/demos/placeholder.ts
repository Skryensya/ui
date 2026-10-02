import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import {
  anatomyCanvas,
  anatomyHints,
  type AnnotationPartItem,
  type Side,
} from "./annotation-parts";

/*
 * THE ANATOMY IS A WHOLE SKELETON, not one paragraph: a card with a media block, an avatar, a line
 * of text and a paragraph, because the four shapes are the anatomy. Every shape is the same
 * `sk-placeholder` root told apart by `data-shape`; only the paragraph owns a child part, the line.
 * The legend names the attribute that makes each one, since that is what a reader writes.
 */
const shapePart = (
  selector: string,
  label: string,
  side: Side,
  extras: Partial<AnnotationPartItem["options"]> = {},
): AnnotationPartItem => ({
  options: { for: selector, side, ...extras },
  slots: { children: label },
});

export const placeholderAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("placeholderPage.anatomyLabel"),
    inert: true,
  },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "box",
      signature: "Box",
      options: { border: "subtle", padding: "md", surface: "surface" },
      attrs: { style: "inline-size: 20rem;" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "placeholder",
            signature: "Placeholder.block",
            options: { height: "5rem" },
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center", wrap: false },
            children: [
              {
                contract: "placeholder",
                signature: "Placeholder.circle",
                options: { size: "md" },
              },
              {
                contract: "placeholder",
                signature: "Placeholder",
                options: { text: "h3" },
                attrs: { style: "flex: 1 1 auto;" },
              },
            ],
          },
          {
            contract: "placeholder",
            signature: "Placeholder.paragraph",
            options: { text: "body", lines: 3 },
          },
        ],
      },
    },
    items: [
      shapePart('[data-shape="block"]', 'data-shape="block"', "block-start"),
      shapePart('[data-shape="circle"]', 'data-shape="circle"', "inline-start"),
      shapePart('[data-shape="text"]', 'data-shape="text"', "inline-end"),
      shapePart(
        '[data-shape="paragraph"]',
        'data-shape="paragraph"',
        "inline-start",
        {
          mark: "bracket",
        },
      ),
      shapePart(".sk-placeholder__line", "sk-placeholder__line", "inline-end", {
        match: "all",
        ringPlacement: "offset",
        ringDistance: 2,
      }),
    ],
  },
});

const mediaSrc = "/demos/lightbox/fjord-small.jpg";

/*
 * THE FEATURE CARD, loaded and loading. A photograph with the category and the headline set on it
 * (a MediaOverlay at the bottom edge), the summary and the byline beneath. The two trees below are
 * the same arrangement twice, so the swap lands every line where its skeleton stood: the photo keeps
 * a fixed aspect, so what is set on it cannot move the layout, and the lines under it are the same
 * type roles on both sides.
 */
const CARD = { border: "subtle", padding: "none", surface: "surface" } as const;
const CARD_STYLE = "overflow: hidden;";

/* Bars drawn over the photo's own grey need a little more ink than bars on a card surface. */
const ON_MEDIA =
  "--sk-placeholder-fill: color-mix(in oklab, var(--color-text-primary) 18%, var(--color-bg-surface));";

const publicationPlaceholder = (): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: CARD,
  attrs: { style: CARD_STYLE },
  children: [
    {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "4/3", radius: "top" },
      children: {
        contract: "placeholder",
        signature: "Placeholder.block",
        options: { fill: true },
      },
      slots: {
        caption: {
          contract: "media-overlay",
          signature: "MediaOverlay",
          options: { edge: "bottom" },
          children: [
            {
              contract: "placeholder",
              signature: "Placeholder.block",
              options: { width: "5.5rem", height: "var(--size-control-sm)" },
              attrs: { style: ON_MEDIA },
            },
            {
              contract: "placeholder",
              signature: "Placeholder.paragraph",
              options: { text: "h3", lines: 2, lastLine: "65%" },
              attrs: { style: ON_MEDIA },
            },
          ],
        },
      },
    },
    {
      contract: "box",
      signature: "Box",
      options: { padding: "md" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "placeholder",
            signature: "Placeholder.paragraph",
            options: { text: "body", lines: 2, lastLine: "80%" },
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center", wrap: false },
            children: [
              {
                contract: "placeholder",
                signature: "Placeholder.circle",
                options: { size: "md" },
              },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "xs" },
                attrs: { style: "flex: 1 1 auto; max-inline-size: 12rem;" },
                children: [
                  {
                    contract: "placeholder",
                    signature: "Placeholder",
                    options: { text: "sm" },
                  },
                  {
                    contract: "placeholder",
                    signature: "Placeholder",
                    options: { text: "caption", width: "70%" },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
});

const publicationContent = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: CARD,
  attrs: {
    style: CARD_STYLE,
    "aria-labelledby": "publication-title",
    role: "article",
  },
  children: [
    {
      contract: "image-frame",
      signature: "ImageFrame",
      options: {
        alt: "",
        aspect: "4/3",
        fit: "cover",
        radius: "top",
        src: mediaSrc,
      },
      slots: {
        caption: {
          contract: "media-overlay",
          signature: "MediaOverlay",
          options: { edge: "bottom" },
          children: [
            {
              contract: "media-overlay",
              signature: "MediaOverlayShade",
              options: { strength: "strong" },
            },
            {
              contract: "badge",
              signature: "Badge",
              options: { tone: "accent" },
              attrs: {
                style:
                  "align-self: flex-start; justify-self: start; inline-size: fit-content;",
              },
              children: t("demo.placeholder.research"),
            },
            {
              contract: "typography",
              signature: "Heading",
              options: { headingSize: "h3", flush: true },
              attrs: { id: "publication-title" },
              children: t("demo.placeholder.title"),
            },
          ],
        },
      },
    },
    {
      contract: "box",
      signature: "Box",
      options: { padding: "md" },
      children: {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "secondary" },
            children: t("demo.placeholder.body"),
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", inlineAlign: "center" },
            children: [
              {
                contract: "avatar",
                signature: "Avatar.initials",
                options: { name: "Rocio Mora" },
                children: "RM",
              },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "none" },
                children: [
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "sm", weight: "label" },
                    children: "Rocio Mora",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { size: "caption", tone: "tertiary" },
                    children: t("demo.placeholder.readTime"),
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
});

/** Always-pending geometry: the status remains outside the decorative placeholder subtree. */
export const publicationPlaceholderTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  attrs: { "aria-busy": "true", class: "placeholder-example" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm", tone: "secondary" },
      attrs: { role: "status", class: "sk-visually-hidden" },
      children: t("demo.placeholder.loading"),
    },
    publicationPlaceholder(),
  ],
});

/** Both states occupy one grid area; the frame script changes only state and accessibility attrs. */
export const publicationSwapTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  attrs: { "aria-busy": "true", class: "placeholder-example" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: {
        gap: "sm",
        inlineAlign: "center",
        justify: "between",
        wrap: false,
      },
      attrs: { style: "padding-block-end: var(--space-stack-xs);" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { size: "sm", tone: "secondary" },
          /*
           * BOTH words, on the node that shows them: the script swaps the text after five seconds and
           * reads the second one from `data-loaded` rather than carrying it. A script that carried it
           * would have to be built once per language, which is what it used to be.
           */
          attrs: {
            "aria-live": "polite",
            "data-placeholder-status": "",
            "data-loaded": t("demo.placeholder.loaded"),
            role: "status",
          },
          children: t("demo.placeholder.loading"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { size: "sm", variant: "ghost" },
          attrs: { "data-placeholder-restart": "" },
          slots: {
            pre: {
              contract: "icon",
              signature: "Icon",
              options: { name: "refresh" },
            },
          },
          children: t("demo.placeholder.restart"),
        },
      ],
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "none" },
      attrs: { class: "placeholder-example__swap", "data-state": "loading" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none" },
          attrs: { "aria-hidden": "false", "data-placeholder-loading": "" },
          children: publicationPlaceholder(),
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none" },
          attrs: { "aria-hidden": "true", "data-placeholder-content": "" },
          children: publicationContent(t),
        },
      ],
    },
  ],
});

export { default as publicationSwapScript } from "./scripts/placeholder-swap.ts?raw";

/*
 * THE POINT OF NAMING THE ROLE, shown rather than asserted: each row is a skeleton beside the real
 * text it stands in for, at the same role. They line up because both read the same token pair, not
 * because anyone measured. Change the type scale and both move together.
 */
const MATCHED_ROLES = ["h1", "h3", "body", "caption"] as const;

export const placeholderMatchTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  children: MATCHED_ROLES.map((role) => ({
    contract: "layout",
    signature: "Grid",
    options: { columns: "2", gap: "md" },
    children: [
      {
        contract: "placeholder",
        signature: "Placeholder",
        options: { text: role, width: "80%" },
      },
      role === "h1" || role === "h3"
        ? {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: role, flush: true },
            children: t("demo.placeholder.roleSample"),
          }
        : {
            contract: "typography",
            signature: "Text",
            options: { size: role },
            children: t("demo.placeholder.roleSample"),
          },
    ],
  })),
});

/*
 * REAL INTERFACES, each a skeleton a product actually ships. They differ in shape on purpose: a
 * thread is rows of avatar beside prose under a header, a profile is a cover with an avatar sitting
 * on its edge, a results list is a thumbnail beside two lines, a metric is a figure over a chart, a
 * table is columns that line up. None writes a length for text: every bar is a type role.
 */
type Node = UsageTree;

const stack = (
  gap: "xs" | "sm" | "md" | "lg" | "none",
  children: Node[],
  style?: string,
): Node => ({
  contract: "layout",
  signature: "Stack",
  options: { gap },
  ...(style ? { attrs: { style } } : {}),
  children,
});

const row = (
  children: Node[],
  opts: {
    gap?: "xs" | "sm" | "md";
    align?: "start" | "center";
    between?: boolean;
  } = {},
  style?: string,
): Node => ({
  contract: "layout",
  signature: "Inline",
  options: {
    gap: opts.gap ?? "sm",
    inlineAlign: opts.align ?? "center",
    wrap: false,
    ...(opts.between ? { justify: "between" } : {}),
  },
  ...(style ? { attrs: { style } } : {}),
  children,
});

const bar = (
  text: "caption" | "sm" | "body" | "h3" | "h4" | "h1",
  width?: string,
  style?: string,
): Node => ({
  contract: "placeholder",
  signature: "Placeholder",
  options: { text, ...(width ? { width } : {}) },
  ...(style ? { attrs: { style } } : {}),
});

const lines = (n: number, last = "60%"): Node => ({
  contract: "placeholder",
  signature: "Placeholder.paragraph",
  options: { text: "body", lines: n, lastLine: last },
});

const disc = (size: "sm" | "md" | "lg", style?: string): Node => ({
  contract: "placeholder",
  signature: "Placeholder.circle",
  options: { size },
  ...(style ? { attrs: { style } } : {}),
});

const slab = (height: string, width?: string, style?: string): Node => ({
  contract: "placeholder",
  signature: "Placeholder.block",
  options: { height, ...(width ? { width } : {}) },
  attrs: { style: `flex: none;${style ? ` ${style}` : ""}` },
});

const FILL = "flex: 1 1 auto; min-inline-size: 0;";
const RULE = "border-block-end: 1px solid var(--color-border-subtle);";
const CHIP = "var(--size-control-sm)";

/* A card that fills its grid cell, so a row of unlike skeletons still reads as one tidy set. */
const skeletonCard = (
  children: Node[],
  padding: "none" | "md" = "md",
): Node => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding, surface: "surface" },
  attrs: { style: "block-size: 100%; overflow: hidden;" },
  children: stack("md", children),
});

const commentRow = (): Node =>
  row([disc("md"), stack("xs", [bar("sm", "35%"), lines(2, "55%")], FILL)], {
    align: "start",
  });

const commentsSkeleton = (): Node =>
  skeletonCard([
    row([bar("h4", "45%", FILL), slab(CHIP, "2.5rem")], { between: true }),
    commentRow(),
    commentRow(),
    commentRow(),
  ]);

/* A cover with the avatar sitting on its lower edge: the arrangement every profile page has. */
const profileSkeleton = (): Node => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "none", surface: "surface" },
  attrs: { style: "block-size: 100%; overflow: hidden;" },
  children: stack("none", [
    slab("5rem", "100%", "border-radius: 0;"),
    stack(
      "md",
      [
        disc(
          "lg",
          "margin-block-start: calc(var(--size-control-lg) * -0.75); box-shadow: 0 0 0 4px var(--color-bg-surface);",
        ),
        stack("xs", [bar("h3", "55%"), bar("sm", "35%")]),
        lines(2, "70%"),
        row([slab(CHIP, "5.5rem"), slab(CHIP, "5.5rem")]),
      ],
      "padding: var(--space-inset-md);",
    ),
  ]),
});

const resultRow = (): Node =>
  row([
    slab("3.5rem", "5rem"),
    stack("xs", [bar("body", "85%"), bar("caption", "50%")], FILL),
  ]);

const resultsSkeleton = (): Node =>
  skeletonCard([
    row([
      slab("var(--size-control-md)", "100%", "flex: 1 1 auto;"),
      slab("var(--size-control-md)", "var(--size-control-md)"),
    ]),
    resultRow(),
    resultRow(),
    resultRow(),
  ]);

const metricSkeleton = (): Node =>
  skeletonCard([
    row([bar("sm", "40%", FILL), slab(CHIP, "3.5rem")], { between: true }),
    stack("xs", [bar("h1", "50%"), bar("caption", "35%")]),
    slab("7.5rem", "100%"),
  ]);

const COL = ["5.5rem", "4rem", "3.5rem"] as const;
const NOSHRINK = "flex: none;";

const tableRow = (last = false): Node =>
  row(
    [
      row([disc("sm"), bar("body", "70%", FILL)], {}, FILL),
      slab(CHIP, COL[0], NOSHRINK),
      bar("sm", COL[1], NOSHRINK),
      bar("sm", COL[2], NOSHRINK),
    ],
    { gap: "md" },
    `padding: var(--space-inset-sm) var(--space-inset-md);${last ? "" : ` ${RULE}`}`,
  );

/* Header row, then rows whose columns line up: avatar and name, a status pill, two figures. */
const tableSkeleton = (): Node => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "none", surface: "surface" },
  attrs: { style: "overflow: hidden;" },
  children: stack("none", [
    row(
      [
        bar("caption", "30%", FILL),
        bar("caption", COL[0], NOSHRINK),
        bar("caption", COL[1], NOSHRINK),
        bar("caption", COL[2], NOSHRINK),
      ],
      { gap: "md" },
      `padding: var(--space-inset-sm) var(--space-inset-md); background: var(--color-bg-surface-raised); ${RULE}`,
    ),
    tableRow(),
    tableRow(),
    tableRow(),
    tableRow(),
    tableRow(true),
  ]),
});

/** The loading message for a region of skeletons, kept for assistive tech and out of the picture. */
const region = (message: string, children: Node[]): Node => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  attrs: { "aria-busy": "true", style: "inline-size: 100%;" },
  children: [
    {
      contract: "typography",
      signature: "Text",
      options: { size: "sm" },
      attrs: { role: "status", class: "sk-visually-hidden" },
      children: message,
    },
    ...children,
  ],
});

/** Four everyday interfaces in one loading region: thread, profile, results and a metric. */
export const placeholderGalleryTree = (t: Translate): Node =>
  region(t("demo.placeholder.loadingAll"), [
    {
      contract: "layout",
      signature: "Grid",
      options: { columns: "2", gap: "md" },
      children: [
        commentsSkeleton(),
        profileSkeleton(),
        resultsSkeleton(),
        metricSkeleton(),
      ],
    },
  ]);

/** A data table: the skeleton whose columns have to line up with the rows that replace it. */
export const placeholderTableTree = (t: Translate): Node =>
  region(t("demo.placeholder.loadingTable"), [tableSkeleton()]);

/* Usage guide pairs. Each DO is a skeleton that matches; each DON'T is the tempting shortcut. A fixed
   width, not a percentage: the canvas sizes its content to fit, and a percentage collapses. */
const labelled = (child: UsageTree): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  attrs: { "aria-busy": "true", style: "inline-size: 20rem;" },
  children: child,
});

/** DO: media, title and lines in the card's own order. */
export const placeholderDoShapeTree = (): UsageTree =>
  labelled(
    skeletonCard([
      {
        contract: "placeholder",
        signature: "Placeholder.block",
        options: { height: "4rem" },
      },
      {
        contract: "placeholder",
        signature: "Placeholder",
        options: { text: "h3", width: "75%" },
      },
      {
        contract: "placeholder",
        signature: "Placeholder.paragraph",
        options: { text: "body", lines: 2 },
      },
    ]),
  );

/** DON'T: one grey slab where a card is coming. */
export const placeholderDontSlabTree = (): UsageTree =>
  labelled(
    skeletonCard([
      {
        contract: "placeholder",
        signature: "Placeholder.block",
        options: { height: "11rem" },
      },
    ]),
  );

/** DO: a title line at the h3 role, so the real heading lands on the same line box. */
export const placeholderDoRoleTree = (): UsageTree =>
  labelled(
    skeletonCard([
      {
        contract: "placeholder",
        signature: "Placeholder",
        options: { text: "h3", width: "70%" },
      },
      {
        contract: "placeholder",
        signature: "Placeholder.paragraph",
        options: { text: "body", lines: 3 },
      },
    ]),
  );

/** DON'T: hand-sized bars, a guess at a height that the heading and body then disagree with. */
export const placeholderDontRoleTree = (): UsageTree =>
  labelled(
    skeletonCard([
      {
        contract: "placeholder",
        signature: "Placeholder.block",
        options: { width: "70%", height: "0.75rem" },
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "placeholder",
            signature: "Placeholder.block",
            options: { width: "100%", height: "0.75rem" },
          },
          {
            contract: "placeholder",
            signature: "Placeholder.block",
            options: { width: "100%", height: "0.75rem" },
          },
          {
            contract: "placeholder",
            signature: "Placeholder.block",
            options: { width: "100%", height: "0.75rem" },
          },
        ],
      },
    ]),
  );

/** DO: a circle at an Avatar's scale beside the lines of a comment. */
export const placeholderDoAvatarTree = (): UsageTree =>
  labelled(skeletonCard([commentRow(), commentRow()]));

/** DON'T: a square where a round avatar will land, and equal lines that read as a table. */
export const placeholderDontAvatarTree = (): UsageTree => {
  const row = (): UsageTree => ({
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", inlineAlign: "start", wrap: false },
    children: [
      {
        contract: "placeholder",
        signature: "Placeholder.block",
        options: {
          width: "var(--size-control-md)",
          height: "var(--size-control-md)",
        },
        attrs: { style: "flex: none;" },
      },
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        attrs: { style: "flex: 1 1 auto;" },
        children: [
          {
            contract: "placeholder",
            signature: "Placeholder",
            options: { text: "body", width: "100%" },
          },
          {
            contract: "placeholder",
            signature: "Placeholder",
            options: { text: "body", width: "100%" },
          },
          {
            contract: "placeholder",
            signature: "Placeholder",
            options: { text: "body", width: "100%" },
          },
        ],
      },
    ],
  });
  return labelled(skeletonCard([row(), row()]));
};

/* One paragraph placeholder, the specimen the `shimmer` preview varies. */
export const placeholderParagraphTree = (): UsageTree => ({
  contract: "placeholder",
  signature: "Placeholder.paragraph",
  options: { lines: 3 },
  attrs: { style: "inline-size: min(100%, 20rem)" },
});
