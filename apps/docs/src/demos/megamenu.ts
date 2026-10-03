import { placeholderHrefs } from "../lib/placeholder-hrefs";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureTree } from "./annotation-parts";
import { DEMO_IMAGE_FRAME_SRC } from "./image-frame.js";

/*
 * Two categories, `Producto` (4 columns) and `Recursos` (3 columns). Both inside the contract's
 * documented 2-4 range, and different enough from each other that the ruler's own constant-height
 * behavior visibly does something. Every links column is `NavListGroup` with `heading: true` (a real
 * `<h3>`, see `nav-list.ts`'s own doc). The same component NavList uses for its sidebar/navbar
 * groups, not a second description of one. Each trigger's LAST column is an `ImageFrame`
 * (`image-frame.ts`), the contract's own worked example of `columns`' OTHER accepted signature. A
 * media column, not a links column, proving `columns` was never NavListGroup-only by construction.
 *
 * EVERY link carries `data-sk-megamenu-preview` (`megamenu.ts`'s own `attrs` escape hatch, no
 * contract change needed; see that constant's own doc), each a differently-colored placeholder:
 * hovering or focusing one swaps ITS trigger's image (the Lightbox demos' own photos, so nothing here
 * needs the network), reverting to the trigger's own authored default
 * the instant focus/hover leaves every preview link.
 */
export const megamenuTree = (
  t: Translate,
  hrefs: { overview: string; pricing: string; integrations: string; teams: string; enterprise: string } = placeholderHrefs(),
): UsageTree => ({
  contract: "megamenu",
  signature: "Megamenu",
  options: { label: t("demo.megamenu.label") },
  children: [
    {
      contract: "megamenu",
      signature: "MegamenuTrigger",
      children: t("demo.megamenu.trigger1"),
      slots: {
        columns: [
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group1") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.overview },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/fjord-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link1"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.pricing },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/coast-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link2"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.integrations },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/waterfall-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link3"),
              },
            ],
          },
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group2") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.teams },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/snow-camp-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link4"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: hrefs.enterprise },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/street-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link5"),
              },
            ],
          },
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group3") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/coast-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link6"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/fjord-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link7"),
              },
            ],
          },
          {
            contract: "image-frame",
            signature: "ImageFrame",
            options: { aspect: "4/3", fit: "cover", radius: "surface", src: "/demos/lightbox/fjord-thumb.jpg", alt: "" },
          },
        ],
      },
    },
    {
      contract: "megamenu",
      signature: "MegamenuTrigger",
      children: t("demo.megamenu.trigger2"),
      slots: {
        columns: [
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group3") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/coast-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link6"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/fjord-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link7"),
              },
            ],
          },
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group4") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/waterfall-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link8"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/snow-camp-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link9"),
              },
            ],
          },
          {
            contract: "image-frame",
            signature: "ImageFrame",
            options: { aspect: "4/3", fit: "cover", radius: "surface", src: "/demos/lightbox/coast-thumb.jpg", alt: "" },
          },
        ],
      },
    },
    {
      contract: "megamenu",
      signature: "MegamenuTrigger",
      children: t("demo.megamenu.trigger3"),
      slots: {
        columns: [
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group5") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/street-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link10"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/puppy-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link11"),
              },
            ],
          },
          {
            contract: "nav-list",
            signature: "NavListGroup",
            options: { heading: true },
            slots: { label: t("demo.megamenu.group4") },
            children: [
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/waterfall-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link8"),
              },
              {
                contract: "nav-list",
                signature: "NavListLink",
                options: { href: "#" },
                attrs: {
                  "data-sk-megamenu-preview": "/demos/lightbox/snow-camp-thumb.jpg",
                  "data-sk-megamenu-preview-alt": "",
                },
                children: t("demo.megamenu.link9"),
              },
            ],
          },
          {
            contract: "image-frame",
            signature: "ImageFrame",
            options: { aspect: "4/3", fit: "cover", radius: "surface", src: "/demos/lightbox/waterfall-thumb.jpg", alt: "" },
          },
        ],
      },
    },
  ],
});

/*
 * VARIANTS: the contract's own range, one panel each. `columns` takes two to four, and a column is a
 * links group or a media frame; these are the two ends of it, so the page shows the least a trigger
 * needs and the most it takes. The first trigger carries every column of the one it demonstrates.
 */
type Hrefs = { overview: string; pricing: string; integrations: string; teams: string; enterprise: string };

const variantLink = (label: string, href: string, photo: string): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href },
  attrs: { "data-sk-megamenu-preview": `/demos/lightbox/${photo}-thumb.jpg`, "data-sk-megamenu-preview-alt": "" },
  children: label,
});

const variantGroup = (label: string, links: UsageTree[]): UsageTree => ({
  contract: "nav-list",
  signature: "NavListGroup",
  options: { heading: true },
  slots: { label },
  children: links,
});

const variantBar = (t: Translate, columns: UsageTree[]): UsageTree => ({
  contract: "megamenu",
  signature: "Megamenu",
  options: { label: t("demo.megamenu.label") },
  children: [
    {
      contract: "megamenu",
      signature: "MegamenuTrigger",
      children: t("demo.megamenu.trigger1"),
      slots: { columns },
    },
  ],
});

/** The minimum: two links columns and nothing else. */
export const megamenuTwoColumnsTree = (t: Translate, hrefs: Hrefs): UsageTree =>
  variantBar(t, [
    variantGroup(t("demo.megamenu.group1"), [
      variantLink(t("demo.megamenu.link1"), hrefs.overview, "fjord"),
      variantLink(t("demo.megamenu.link2"), hrefs.pricing, "coast"),
      variantLink(t("demo.megamenu.link3"), hrefs.integrations, "waterfall"),
    ]),
    variantGroup(t("demo.megamenu.group2"), [
      variantLink(t("demo.megamenu.link4"), hrefs.teams, "snow-camp"),
      variantLink(t("demo.megamenu.link5"), hrefs.enterprise, "street"),
    ]),
  ]);

/** The maximum: three links columns and a media column, the fourth. */
export const megamenuFourColumnsTree = (t: Translate, hrefs: Hrefs): UsageTree =>
  variantBar(t, [
    variantGroup(t("demo.megamenu.group1"), [
      variantLink(t("demo.megamenu.link1"), hrefs.overview, "fjord"),
      variantLink(t("demo.megamenu.link2"), hrefs.pricing, "coast"),
    ]),
    variantGroup(t("demo.megamenu.group2"), [
      variantLink(t("demo.megamenu.link4"), hrefs.teams, "snow-camp"),
      variantLink(t("demo.megamenu.link5"), hrefs.enterprise, "street"),
    ]),
    variantGroup(t("demo.megamenu.group3"), [
      variantLink(t("demo.megamenu.link6"), "#", "waterfall"),
      variantLink(t("demo.megamenu.link7"), "#", "puppy"),
    ]),
    {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "4/3", fit: "cover", radius: "surface", src: "/demos/lightbox/fjord-thumb.jpg", alt: "" },
    },
  ]);

/** Between the two: two links columns and a media column, the third. */
export const megamenuThreeColumnsTree = (t: Translate, hrefs: Hrefs): UsageTree =>
  variantBar(t, [
    variantGroup(t("demo.megamenu.group1"), [
      variantLink(t("demo.megamenu.link1"), hrefs.overview, "fjord"),
      variantLink(t("demo.megamenu.link2"), hrefs.pricing, "coast"),
      variantLink(t("demo.megamenu.link3"), hrefs.integrations, "waterfall"),
    ]),
    variantGroup(t("demo.megamenu.group2"), [
      variantLink(t("demo.megamenu.link4"), hrefs.teams, "snow-camp"),
      variantLink(t("demo.megamenu.link5"), hrefs.enterprise, "street"),
    ]),
    {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "4/3", fit: "cover", radius: "surface", src: "/demos/lightbox/coast-thumb.jpg", alt: "" },
    },
  ]);

/*
 * THE OPEN PANEL, FROZEN, for the columns property card. A live Megamenu opens its panel only on
 * hover or click, portaled to the body, so in a card the reader would see one lonely trigger and have
 * to discover the panel; and the thing the card is about (two, three or four columns) lives in that
 * panel. So the card shows the panel open, drawn by hand the way the anatomy is (see below): the
 * variant's own columns, the Megamenu's own classes, no script. The card's `megamenuOpenCss` paints it.
 */
export const megamenuOpenTree = (t: Translate, variant: UsageTree): UsageTree => {
  const columns = ((variant.children as UsageTree[])[0]!.slots as { columns: UsageTree[] }).columns;
  const links = columns.filter((column) => column.contract === "nav-list");
  const media = columns.filter((column) => column.contract !== "nav-list");
  return part("sk-megamenu", [
    part("sk-megamenu__list", [
      part("sk-megamenu__item", [
        {
          contract: "typography",
          signature: "Text",
          attrs: { class: "sk-megamenu__trigger", "aria-expanded": "true" },
          children: t("demo.megamenu.trigger1"),
        },
        part("sk-megamenu__positioner", [
          part("sk-megamenu__content", [
            {
              ...part("sk-megamenu__panel", [
                { contract: "nav-list", signature: "NavList", attrs: { class: "megamenu-open__columns" }, children: links },
                ...media,
              ]),
              attrs: { class: "sk-megamenu__panel", style: `--megamenu-open-columns: ${columns.length}` },
            } as UsageTree,
          ]),
        ]),
      ]),
    ]),
  ]);
};

export const megamenuOpenCss = `.sk-megamenu {
  inline-size: min(100%, 52rem);
}

.sk-megamenu__list {
  display: flex;
  align-items: stretch;
}

.sk-megamenu__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  inline-size: 100%;
  gap: var(--space-stack-sm);
}

.sk-megamenu__positioner {
  position: relative;
  inset: auto;
  inline-size: 100%;
  margin: 0;
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: blur(0);
}

.sk-megamenu__content {
  display: block;
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: none;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-surface);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-overlay, 0 8px 24px rgb(0 0 0 / 0.12));
}

.megamenu-open__columns {
  display: contents;
}

.sk-megamenu__panel {
  display: grid;
  grid-template-columns: repeat(var(--megamenu-open-columns, 3), minmax(0, 1fr));
  gap: var(--space-inline-lg);
  padding: var(--space-inset-lg);
}

.sk-megamenu__panel > .sk-image-frame {
  align-self: stretch;
}
`;

/*
 * ANATOMY, WITH THE PANEL OPEN. A live Megamenu cannot be drawn open: the React binding mounts ONE
 * shared panel, portaled to the body, only while a trigger is open, and `Annotated` finds its parts
 * inside its own subject, which a portaled panel is not. So the specimen is the same structure
 * written out by hand: plain Stacks that carry the Megamenu's own classes (`class` is forwarded on any
 * host), with the real NavList groups and ImageFrame as the columns. It is inert and frozen, a
 * drawing of the markup, not a second Megamenu; the CSS below paints the open state.
 */
const part = (className: string, children: UsageTree | UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  attrs: { class: className },
  children,
});

const anatomySubject = (t: Translate): UsageTree =>
  part("sk-megamenu", [
    part("sk-megamenu__list", [
      part("sk-megamenu__item", [
        {
          contract: "typography",
          signature: "Text",
          attrs: { class: "sk-megamenu__trigger" },
          children: t("demo.megamenu.trigger1"),
        },
        part("sk-megamenu__positioner", [
          part("sk-megamenu__content", [
            part("sk-megamenu__panel", [
              {
                contract: "nav-list",
                signature: "NavList",
                attrs: { class: "megamenu-anatomy__columns" },
                children: [
                  variantGroup(t("demo.megamenu.group1"), [
                    variantLink(t("demo.megamenu.link1"), "#", "fjord"),
                    variantLink(t("demo.megamenu.link2"), "#", "coast"),
                  ]),
                  variantGroup(t("demo.megamenu.group2"), [
                    variantLink(t("demo.megamenu.link4"), "#", "snow-camp"),
                    variantLink(t("demo.megamenu.link5"), "#", "street"),
                  ]),
                ],
              },
              {
                contract: "image-frame",
                signature: "ImageFrame",
                options: { aspect: "4/3", fit: "cover", radius: "surface", src: DEMO_IMAGE_FRAME_SRC, alt: "" },
              },
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);

/* `fitOnly`: the canvas only sizes the drawing. No zoom, pan or zoom bar, so no hints either. */
const fitOnly = (tree: UsageTree): UsageTree => {
  const { touchHint: _touch, wheelHint: _wheel, ...slots } = (tree.slots ?? {}) as Record<string, unknown>;
  return { ...tree, options: { ...tree.options, fitOnly: true }, slots } as UsageTree;
};

export const megamenuAnatomyTree = (t: Translate): UsageTree =>
  fitOnly(anatomyFigureTree(t, {
    label: t("megamenuPage.anatomyLabel"),
    subject: anatomySubject(t),
    parts: [
      { for: ".sk-megamenu", side: "block-start", mark: "bracket", ringPlacement: "offset", ringDistance: 8 },
      { for: ".sk-megamenu__list", side: "inline-start", ringPlacement: "offset", ringDistance: 4 },
      { for: ".sk-megamenu__item", side: "inline-start", ringPlacement: "offset", ringDistance: 2 },
      { for: ".sk-megamenu__trigger", side: "inline-start" },
      { for: ".sk-image-frame", side: "inline-end", ringPlacement: "offset", ringDistance: 2 },
      { for: ".sk-megamenu__positioner", side: "inline-end", ringPlacement: "offset", ringDistance: 6 },
      { for: ".sk-megamenu__content", side: "inline-end", ringPlacement: "offset", ringDistance: 3 },
      { for: ".sk-megamenu__panel", side: "block-end", mark: "bracket" },
      { for: ".sk-nav-list__group", side: "block-end", ringPlacement: "offset", ringDistance: 2 },
    ],
  }));

/*
 * The open state, painted by hand for the same two reasons Popover's specimen does: `.sk-anchored` is
 * `position: fixed`, so out of flow the panel adds nothing to Annotated's measured box, and the
 * content is closed (`display: none`, faded and scaled) until a binding opens it. The NavList that
 * wraps the groups is only there because a group needs a NavList parent; `display: contents` takes
 * it out of the grid so the groups themselves are the panel's columns.
 */
export const megamenuAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
  /* Numbers sit close to the part they name: the default gap leaves them a bubble and more away. */
  --sk-annotated-gap: var(--space-inline-sm);
}

.sk-annotated__subject > .sk-megamenu {
  inline-size: 100%;
}

/* Stack is the neutral host; each part takes back the display its own class sets. */
.sk-annotated__subject .sk-megamenu__list {
  display: flex;
  align-items: stretch;
}

.sk-annotated__subject .sk-megamenu__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.sk-annotated__subject .sk-megamenu__positioner {
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

.sk-annotated__subject .sk-megamenu__content {
  display: block;
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: none;
}

.sk-annotated__subject .megamenu-anatomy__columns {
  display: contents;
}

.sk-annotated__subject .sk-megamenu__panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sk-annotated__subject .sk-megamenu__panel > .sk-image-frame {
  align-self: stretch;
}
`;

/*
 * USAGE GUIDE. Every pair is about what a reader sees in an OPEN panel, so each half draws the bar
 * and its open panel, with the same hand-built structure the anatomy uses (a frozen specimen cannot
 * be a live Megamenu: its panel mounts only while a trigger is open). `megamenuGuideCss` paints the
 * open state inside a Do/Don't frame.
 */
const guideLink = (label: string): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href: "#" },
  children: label,
});

const guideColumn = (label: string, links: string[]): UsageTree => variantGroup(label, links.map(guideLink));

/** One trigger and its open panel; `columns` are NavListGroups, sitting directly in the panel's grid. */
const guidePanel = (t: Translate, columns: UsageTree[], panelAttrs?: Record<string, string>): UsageTree =>
  part("sk-megamenu", [
    part("sk-megamenu__list", [
      part("sk-megamenu__item", [
        {
          contract: "typography",
          signature: "Text",
          attrs: { class: "sk-megamenu__trigger" },
          children: t("demo.megamenu.trigger1"),
        },
        part("sk-megamenu__positioner", [
          part("sk-megamenu__content", [
            part("sk-megamenu__panel", [
              {
                contract: "nav-list",
                signature: "NavList",
                attrs: { class: "megamenu-guide__columns", ...panelAttrs },
                children: columns,
              },
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);

const named = (t: Translate): UsageTree[] => [
  guideColumn(t("demo.megamenu.group1"), [t("demo.megamenu.link1"), t("demo.megamenu.link2"), t("demo.megamenu.link3")]),
  guideColumn(t("demo.megamenu.group2"), [t("demo.megamenu.link4"), t("demo.megamenu.link5")]),
];

export const megamenuDoNamedLinksTree = (t: Translate): UsageTree => guidePanel(t, named(t));

export const megamenuDontVagueLinksTree = (t: Translate): UsageTree =>
  guidePanel(t, [
    guideColumn(t("demo.megamenu.group1"), [t("demo.megamenu.vague1"), t("demo.megamenu.vague2"), t("demo.megamenu.vague3")]),
    guideColumn(t("demo.megamenu.group2"), [t("demo.megamenu.vague1"), t("demo.megamenu.vague3")]),
  ]);

export const megamenuDoShortColumnsTree = (t: Translate): UsageTree => guidePanel(t, named(t));

export const megamenuDontLongColumnTree = (t: Translate): UsageTree =>
  guidePanel(t, [
    guideColumn(
      t("demo.megamenu.allGroup"),
      [1, 2, 3, 4, 5, 6].map((n) => t(`demo.megamenu.link${n}` as Parameters<Translate>[0])),
    ),
  ]);

/* A bar of triggers and nothing else: the rule is about the labels, so no panel is drawn. */
const guideBar = (labels: string[]): UsageTree =>
  part("sk-megamenu", [
    part(
      "sk-megamenu__list",
      labels.map((label) =>
        part("sk-megamenu__item", {
          contract: "typography",
          signature: "Text",
          attrs: { class: "sk-megamenu__trigger" },
          children: label,
        }),
      ),
    ),
  ]);

export const megamenuDoShortTriggersTree = (t: Translate): UsageTree =>
  guideBar([t("demo.megamenu.trigger1"), t("demo.megamenu.trigger2"), t("demo.megamenu.trigger3")]);

export const megamenuDontLongTriggersTree = (t: Translate): UsageTree =>
  guideBar([t("demo.megamenu.longTrigger1"), t("demo.megamenu.longTrigger2"), t("demo.megamenu.longTrigger3")]);

/*
 * Paints the open state in a Do/Don't card, the same reasons as `megamenuAnatomyCss`: `.sk-anchored`
 * is `position: fixed` and the content is closed until a binding opens it. Global, because the card
 * is page markup, not a scoped component; every rule hangs off `.sk-do-dont__card`.
 *
 * The pairs render on a Canvas that only fits, so the specimen keeps the width it is laid out at and
 * is shown scaled: 22rem is wide enough for two columns of real link names, and narrow enough that
 * the scale stays readable in the 4:3 frame. Nothing is clipped: the long column shows all six
 * links, and being tall is what makes it the wrong example.
 */
export const megamenuGuideCss = `.sk-do-dont__card .sk-megamenu {
  inline-size: 22rem;
}

.sk-do-dont__card .sk-megamenu__list {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  padding: 0;
}

.sk-do-dont__card .sk-megamenu__item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-stack-xs);
}

/* The item that holds a panel takes the bar's whole width, or the panel shrinks to its columns. */
.sk-do-dont__card .sk-megamenu__item:has(> .sk-megamenu__positioner) {
  flex: 1 1 auto;
}

.sk-do-dont__card .sk-megamenu__list:has(> .sk-megamenu__item > .sk-megamenu__trigger:only-child) .sk-megamenu__trigger {
  text-align: center;
}

.sk-do-dont__card .sk-megamenu__positioner {
  position: relative;
  inset: auto;
  inline-size: 100%;
  margin: 0;
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: blur(0);
}

.sk-do-dont__card .sk-megamenu__content {
  /* Tighter rows and padding than a live panel: the tall column has to stay legible once scaled. */
  --sk-nav-list-link-height: 1.5rem;
  --sk-nav-list-group-label-padding-block-end: 0;
  padding: var(--space-inset-md);
  display: block;
  opacity: 1;
  scale: 1;
  translate: 0 0;
  filter: none;
}

.sk-do-dont__card .megamenu-guide__columns {
  display: contents;
}

.sk-do-dont__card .sk-megamenu__panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  align-items: start;
  column-gap: var(--space-inline-lg);
}
`;
