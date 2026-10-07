import type { ComponentContract } from "./contract.js";

export type Space = "none" | "xs" | "sm" | "md" | "lg" | "xl";
/** A gap step: the spacing scale plus `section`, the distance between the bands of a page. */
export type Gap = Space | "section";
/**
 * Which side of the expanded line (decision 30) an element exists on. Measured against the nearest
 * query container (decision 35), the same line `gapExpanded` and `paddingExpanded` switch at.
 */
export type LayoutShow = "compact" | "expanded";
/** How a Stack spends height it was given beyond its content: the block-axis twin of Inline's `justify`. */
export type StackJustify = "start" | "center" | "end" | "between";
/** How many of a Grid's lanes a direct child takes. Capped to the lanes that exist. */
export type GridSpan = 2 | 3 | 4 | 5;
/** Where an AppShell's scroll lives: the whole page, or each region on its own (expanded only). */
export type AppShellScroll = "page" | "regions";
/** A Main's block inset: the spacing scale plus `section`. The inline gutter stays the Wrapper's. */
export type MainPadding = "none" | "sm" | "md" | "lg" | "xl" | "section";
export type BoxSurface = "none" | "sunken" | "surface" | "raised";
export type BoxBorder = "none" | "subtle" | "default";
export type BoxAppearance = "plain" | "brutalist" | "frosted";
/** How round a Box's corners are: the surface radius by default, `control` for a tighter one, `none` for a band that runs edge to edge. */
export type BoxRadius = "none" | "control" | "surface";
/** A Box's inline ceiling, on the Wrapper's size scale but never centred: see patterns/box.css. */
export type BoxMeasure = "sm" | "md" | "lg";
export type LayoutAlign = "start" | "center" | "end" | "stretch";
export type InlineAlign = "start" | "center" | "end" | "baseline" | "stretch";
export type InlineJustify = "start" | "center" | "end" | "between";
/**
 * Space above an Inline, or `auto` to absorb leftover height in a flex/grid column (a card's
 * action row sitting on the floor while siblings in the same grid grow taller).
 */
export type InlineBlockStart = Space | "auto";
export type GridColumns = 1 | 2 | 3 | 4 | 5;
export type GridAlign = LayoutAlign;
/** The narrowest a Grid lane may get before the browser drops one: `--size-column-*`. */
export type GridMinColumn = "sm" | "md" | "lg";
/** How a direct Inline child takes the row's main axis: its content (`fit`) or what is left (`fill`). */
export type InlineChildSizing = "fit" | "fill";
/**
 * Named spans a direct LayoutGrid child may request with `data-width`.
 *
 * Omitting the attribute keeps the child in the content span. `"rail"` and `"rail-start"` are
 * not content spans. They are supporting columns (a TOC, contextual navigation) beside the
 * grid rather than a section within its flow, but they earn a value in this same attribute
 * rather than a second one. `"rail"` sits after the content; `"rail-start"` sits before it; a
 * grid may carry both at once.
 */
export type LayoutGridWidth = "narrow" | "content" | "breakout" | "full-width" | "rail" | "rail-start";
/** Page-column max measure on a size scale, see patterns/wrapper.css. */
export type WrapperSize = "sm" | "md" | "lg" | "full";
/** A Wrapper gutter step: the inset scale without `xs`, which is too thin to be a page edge. */
export type WrapperGutter = "none" | "sm" | "md" | "lg" | "xl";
/*
 * The elements a layout primitive may render as from a tree, the same freedom React's `as` gives,
 * closed to the sectioning and landmark tags. A list (`ul`/`ol`) is left out on purpose: it brings a
 * rule about its children (only `<li>`) that a primitive with node children cannot keep.
 */
const layoutElements = ["div", "section", "article", "aside", "header", "footer", "nav", "main"] as const;
export type LayoutElement = (typeof layoutElements)[number];

/*
 * Layout is a pattern: these exact primitives recur in page sections, controls and component
 * anatomy. The classes are the shared structure; consumers keep control of the element and its
 * semantics. React simply renders the same contract.
 */
export const layoutParts = {
  box: "sk-box",
  stack: "sk-stack",
  inline: "sk-inline",
  grid: "sk-grid",
  wrapper: "sk-wrapper",
} as const;

/*
 * LayoutGrid belongs only to the flow-layout family. Keeping it out of the shared parts object
 * prevents Box and Wrapper from publishing a part their own contracts do not realize.
 */
export const layoutGridParts = {
  ...layoutParts,
  layoutGrid: "sk-layout-grid",
  appShell: "sk-app-shell",
  main: "sk-main",
} as const;

export type LayoutPart = keyof typeof layoutParts;
export type LayoutPartClass = (typeof layoutParts)[LayoutPart];

/*
 * The flow-layout signatures share a family because choosing one answers the same question: how does
 * this group occupy space? Stack, Inline, Grid and LayoutGrid differ in flow. Each is `as`-polymorphic
 * in React, so the author keeps the element semantics: a Stack that is really a `<ul>` is still a
 * Stack.
 */
/*
 * Three stylesheets, so three families. Box and Wrapper keep only their own public parts; the flow
 * family extends those shared constants with LayoutGrid. Code stays co-located because a core module
 * is a source file, while `css` stays per family.
 */
export const boxContract = {
  id: "box",
  category: "layout",
  css: "@skryensya/core/patterns/box.css",
  /* Only its own part. The shared `layoutParts` made Box claim `sk-stack`, `sk-wrapper`… and pulled
     wrapper.css (and its hooks) into every tree that holds a Box, a sheet it never paints from. */
  parts: { box: layoutParts.box },
  hooks: [
    "--sk-box-bg",
    "--sk-box-border-color",
    "--sk-box-border-width",
    "--sk-box-brutalist-edge",
    "--sk-box-brutalist-offset-block",
    "--sk-box-brutalist-offset-inline",
    "--sk-box-brutalist-shadow",
    "--sk-box-padding",
    "--sk-box-radius",
    "--sk-box-shadow",
    "--sk-box-wash",
  ],

  options: {
    padding: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl"], default: "none", attr: "data-padding" },
    /*
     * THE EXPANDED SIDE OF THE SAME CHOICE, declared rather than inferred (decision 30). The plain
     * option is the compact value, from the smallest screen up; this one replaces it from the
     * `desktop` breakpoint (52rem, semantic/_breakpoints.scss) up. No default: absent, the plain
     * option holds at every width, exactly as before this existed.
     */
    paddingExpanded: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl"], attr: "data-padding-expanded" },
    surface: { type: "enum", values: ["none", "sunken", "surface", "raised"], default: "none", attr: "data-surface" },
    border: { type: "enum", values: ["none", "subtle", "default"], default: "none", attr: "data-border" },
    /*
     * HOW THE SURFACE IS MATERIALLY EXPRESSED, the same axis Button and Tile publish, so a region
     * and the controls inside it can share one language. `plain` is the box as `surface`/`border`
     * paint it; `brutalist` draws it with Button's black edge and hard offset; `frosted` makes the
     * surface Button's see-through material (opaque wherever the material cannot be trusted). No
     * `tactile`: that expression is press travel, and a Box is never pressed. Independent of
     * `surface`, `border` and `padding`: frosted tints with the surface, brutalist draws around it.
     */
    appearance: { type: "enum", values: ["plain", "brutalist", "frosted"], default: "plain", attr: "data-appearance" },
    /*
     * The inline ceiling of the region, from the same `--size-wrapper-*` scale a Wrapper takes, but
     * NOT centred and with no gutter: a Box keeps its place in its parent's flow and only stops
     * growing. The Wrapper stays the one centred page column; this is a paragraph block or a form
     * that should not stretch to a 90rem row. No default: absent, the Box is as wide as its parent.
     */
    measure: { type: "enum", values: ["sm", "md", "lg"], attr: "data-measure" },
    /*
     * THE CORNERS. A card wants the surface radius; a BAND (a region that runs edge to edge, like a page header
     * with a background) must not be rounded, because rounded corners on something that touches the viewport
     * edge read as a clipped rectangle. No default: absent, the surface radius holds, exactly as before.
     */
    radius: { type: "enum", values: ["none", "control", "surface"], attr: "data-radius" },
    /*
     * ON ONE SIDE OF THE LINE ONLY (decision 35). `compact` exists below the expanded line, `expanded` from it
     * up; absent, the box exists at every width. It is `display: none` on the other side, so what it holds
     * leaves the accessibility tree with it: whatever it carried must reach that side some other way.
     */
    show: { type: "enum", values: ["compact", "expanded"], attr: "data-show" },
    /** The element it renders as; React's `as`. A `section` or `nav` still wants an accessible name. */
    boxElement: { type: "enum", values: layoutElements, default: "div", element: true, prop: "as" },
  },

  signatures: {
    Box: {
      intent: ["padded-region", "card-like-surface", "bordered-region"],
      host: { element: "div" },
      options: ["padding", "paddingExpanded", "surface", "border", "appearance", "measure", "radius", "show", "boxElement"],
      /* A Box IS its visual style. With all three at `none` it paints nothing and is a bare `div`
         standing in for a decision; grouping without paint is Stack, Inline or Grid. */
      atLeastOneOf: [["padding", "surface", "border", "appearance", "measure"]],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "box", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Box" },
    },
  },
} as const satisfies ComponentContract;

/** The flow layouts. The choice between them is which axis the things sit along. */
export const layoutContract = {
  id: "layout",
  category: "layout",
  css: "@skryensya/core/patterns/layout.css",
  /*
   * Only the flow parts this family realizes. `layoutGridParts` still spreads box/wrapper for the
   * shared class map React/vanilla read, but claiming those classes here made every Stack tree
   * compete with Box and Wrapper for ownership of `sk-box` / `sk-wrapper` (and used to pull their
   * hooks via hookSheets). layout.css @imports box/wrapper/image-frame as a CSS convenience bundle;
   * that is not a contract claim.
   */
  parts: {
    stack: layoutParts.stack,
    inline: layoutParts.inline,
    grid: layoutParts.grid,
    layoutGrid: layoutGridParts.layoutGrid,
    appShell: layoutGridParts.appShell,
    main: layoutGridParts.main,
  },
  hooks: [
    "--sk-app-shell-block-size",
    "--sk-app-shell-gap",
    "--sk-grid-columns",
    "--sk-grid-gap",
    "--sk-inline-block-start",
    "--sk-inline-gap",
    "--sk-layout-breakout",
    "--sk-layout-breakout-track",
    "--sk-layout-content",
    "--sk-layout-gutter",
    "--sk-layout-narrow",
    "--sk-layout-narrow-track",
    "--sk-layout-rail-gap",
    "--sk-layout-rail-inline-size",
    "--sk-layout-rail-row-span",
    "--sk-main-padding-block",
    "--sk-stack-gap",
  ],

  options: {
    /* `section` is the distance between the bands of a page (`--space-section`), past the `xl` a group ever wants. */
    gap: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl", "section"], default: "md", attr: "data-gap" },
    /*
     * THE EXPANDED SIDE OF THE SAME CHOICE, declared rather than inferred (decision 30). The plain
     * option is the compact value, from the smallest screen up; this one replaces it from the
     * `desktop` breakpoint (52rem, semantic/_breakpoints.scss) up. No default: absent, the plain
     * option holds at every width, exactly as before this existed.
     */
    gapExpanded: { type: "enum", values: ["none", "xs", "sm", "md", "lg", "xl", "section"], attr: "data-gap-expanded" },
    align: { type: "enum", values: ["start", "center", "end", "stretch"], attr: "data-align" },
    inlineAlign: { type: "enum", values: ["start", "center", "end", "baseline", "stretch"], default: "end", attr: "data-align", prop: "align" },
    justify: { type: "enum", values: ["start", "center", "end", "between"], default: "start", attr: "data-justify" },
    /*
     * THE BLOCK-AXIS JUSTIFY. A Stack given it fills the height its parent has (a Main, a stretched card)
     * and spends the leftover: `center` puts a sign-in form in the middle of the screen, `between` sends
     * the last child to the floor. No default, unlike Inline's: a Stack that says nothing stays as tall
     * as its content and never claims height it was not asked to fill.
     */
    stackJustify: { type: "enum", values: ["start", "center", "end", "between"], attr: "data-justify", prop: "justify" },
    /* See Box's `show`: the same option, on every flow primitive (decision 35). */
    show: { type: "enum", values: ["compact", "expanded"], attr: "data-show" },
    equal: { type: "boolean", default: false, attr: "data-equal", trueValue: "" },
    /*
     * Whether items fall to a second line. Written as "true"/"false" and not by presence, because
     * the stylesheet has a rule for `data-wrap="false"` and an absent attribute would be a third
     * state nobody meant.
     */
    wrap: { type: "boolean", default: true, attr: "data-wrap", trueValue: "true", falseValue: "false" },
    /*
     * Space above the row. Named in CSS (`block-start`), never `marginTop`. `auto` is the card-floor
     * case: leftover height in the parent column goes above the row so a set of cards line their
     * actions up. Default `none` so an Inline used as a label-and-value pair does not grow a gap
     * it never asked for.
     */
    blockStart: {
      type: "enum",
      values: ["none", "xs", "sm", "md", "lg", "xl", "auto"],
      default: "none",
      attr: "data-block-start",
    },
    columns: { type: "enum", values: ["1", "2", "3", "4", "5"], default: "1", attr: "data-columns" },
    multicol: { type: "boolean", default: false, attr: "data-multicol", trueValue: "" },
    responsive: { type: "boolean", default: false, attr: "data-responsive", trueValue: "" },
    /*
     * The narrowest a lane may get, and nothing else: the browser fits as many lanes as the GRID'S
     * OWN width allows (`repeat(auto-fit, minmax(min(X, 100%), 1fr))`), so a Grid in a sidebar and
     * the same Grid in a page column each find their own count with no breakpoint. It decides the
     * lane count, which is why it excludes the options that decide it another way.
     */
    minColumn: { type: "enum", values: ["sm", "md", "lg"], attr: "data-min-column" },
    /*
     * How tall an AppShell is. Absent it fills the screen (`screen`: at least 100dvh), which is what an app is. `fit`
     * lets it be as tall as its content, for a shell that is one part of a page (a panel, a preview, a section
     * inside a longer document) and would otherwise be held a full screen tall with nothing to fill it. No default,
     * so a shell that says nothing is the shell it always was.
     */
    shellHeight: { type: "enum", values: ["screen", "fit"], attr: "data-height", prop: "height" },
    /*
     * WHERE THE SCROLL LIVES. `page` (the default when absent): one document, the header scrolls away with
     * everything else, which is what a site is. `regions`: the shell is exactly a screen tall and each region
     * scrolls on its own, so the header and the rails stay put while the work area moves, which is what an
     * application is (a mail client, a chat, an editor). Below the expanded line the shell is one column and
     * always scrolls as a page: a phone has no room for panes.
     */
    scroll: { type: "enum", values: ["page", "regions"], attr: "data-scroll" },
    /* The header stays at the top while the page scrolls under it. Meaningless with `regions`, where nothing scrolls past it. */
    stickyHeader: { type: "boolean", default: false, attr: "data-sticky-header", trueValue: "" },
    /*
     * A Main's BLOCK inset, compact first (decision 30). Block only: the inline gutter is the Wrapper's, and a
     * second one here stacked on top of it. A Hero that opens the Main sits flush under the header regardless.
     */
    paddingBlock: { type: "enum", values: ["none", "sm", "md", "lg", "xl", "section"], attr: "data-padding-block" },
    paddingBlockExpanded: { type: "enum", values: ["none", "sm", "md", "lg", "xl", "section"], attr: "data-padding-block-expanded" },
    /** The element it renders as; React's `as`. A `section` or `nav` still wants an accessible name. */
    layoutElement: { type: "enum", values: layoutElements, default: "div", element: true, prop: "as" },
  },

  signatures: {
    Stack: {
      intent: ["vertical-rhythm", "things-one-above-another", "form-fields"],
      host: { element: "div" },
      options: ["gap", "gapExpanded", "align", "stackJustify", "show", "layoutElement"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "stack", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Stack" },
    },

    Inline: {
      intent: ["things-side-by-side", "button-row", "label-and-value"],
      host: { element: "div" },
      options: ["gap", "gapExpanded", "inlineAlign", "justify", "wrap", "equal", "blockStart", "show", "layoutElement"],
      slots: {
        children: {
          accepts: "node",
          required: true,
          /*
           * Fit or fill is a relation to THIS row, so the row publishes it and the child carries it
           * (`data-sizing`), the same way LayoutGrid publishes `width`. A child moved out of the row
           * leaves it behind instead of carrying a flex rule its new parent never reads. Absent is
           * `fit`. Under `equal` every child already shares the row, so `fill` adds nothing there.
           */
          childAttrs: {
            sizing: { type: "enum", values: ["fit", "fill"], attr: "data-sizing" },
          },
        },
      },
      template: { element: "div", part: "inline", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Inline" },
    },

    Grid: {
      intent: ["columns", "card-grid", "equal-width-cells"],
      host: { element: "div" },
      options: ["gap", "gapExpanded", "columns", "multicol", "responsive", "minColumn", "align", "show", "layoutElement"],
      excludes: { minColumn: ["columns", "multicol", "responsive"] },
      slots: {
        children: {
          accepts: "node",
          required: true,
          /*
           * UNEVEN COLUMNS ARE SPANS OF EVEN ONES. Two thirds and one third is `columns: 3` with a child that
           * spans 2, the way a twelve-column system has always said it, so the kit needs no second vocabulary
           * of ratios. Capped to the lanes that exist (a `responsive` grid on a phone has one), and ignored
           * under `minColumn` and `multicol`, whose lanes are not counted.
           */
          childAttrs: {
            span: { type: "enum", values: ["2", "3", "4", "5"], attr: "data-span" },
          },
        },
      },
      template: { element: "div", part: "grid", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Grid" },
    },

    /*
     * A page flow with four named measures. Width is intentionally an attribute of a direct child:
     * a heading, figure or section owns its own semantics and can opt into the span it needs.
     */
    LayoutGrid: {
      intent: ["page-flow", "named-content-measures", "breakout-content", "full-bleed-section", "supporting-rail"],
      host: { element: "div" },
      options: ["layoutElement"],
      slots: {
        children: {
          accepts: "node",
          required: true,
          /*
           * Span lives on the child host (`data-width`), not as a LayoutGrid option. Authored on the
           * child via UsageTree `attrs` (`data-width="narrow"`); the validator checks the enum.
           */
          childAttrs: {
            width: {
              type: "enum",
              values: ["narrow", "content", "breakout", "full-width", "rail", "rail-start"],
              attr: "data-width",
            },
            /* A `breakout` child that runs edge to edge below the expanded line: a figure a phone should not inset. */
            breakout: { type: "enum", values: ["flush"], attr: "data-breakout" },
          },
        },
      },
      template: { element: "div", part: "layoutGrid", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "LayoutGrid" },
    },

    /*
     * THE APPLICATION SHELL: header across the top, a rail down the side, the work area filling the rest,
     * an optional footer across the bottom. It exists because that arrangement is what every application
     * page is, and without a primitive for it an agent (or a person) composes `Inline[Sidebar, Main]`,
     * which is VALID and wrong: the Main does not fill the row, the rail does not reach the bottom, and
     * the page needs a hand-written class to look like an app. Children are placed by what they ARE
     * (a header, an aside, a main, a footer), not by an option, so there is nothing to mis-set.
     */
    AppShell: {
      intent: ["app-shell", "application-frame", "header-rail-and-main", "dashboard-frame", "page-chrome-layout"],
      host: { element: "div" },
      options: ["shellHeight", "scroll", "stickyHeader"],
      slots: {
        children: {
          /*
           * Placed by what they are AND where they stand: a Sidebar before the Main is the start rail, one after
           * it is the end rail (an inspector, a detail pane). Below the expanded line the rails are not drawn;
           * what they carry reaches a phone through a `Vaul.drawer` opened from the header (decision 35).
           */
          accepts: "signature",
          of: ["SkipLink", "Navbar", "AppBar", "Sidebar", "Main", "Footer", "Vaul.drawer"],
          required: true,
        },
      },
      template: { element: "div", part: "appShell", host: true, options: ["shellHeight", "scroll", "stickyHeader"], slot: "children" },
      react: { from: "@skryensya/react/layout", name: "AppShell" },
    },

    /*
     * The main landmark is a shell region, not a content component. Its children stay optional so a
     * template can show chrome and an intentionally empty work area before an application decides
     * what belongs there.
     */
    Main: {
      intent: ["main-content", "application-work-area", "app-shell-main"],
      host: { element: "main" },
      options: ["paddingBlock", "paddingBlockExpanded"],
      slots: { children: { accepts: "node" } },
      template: { element: "main", part: "main", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Main" },
    },
  },
} as const satisfies ComponentContract;

/*
 * The page column. Its measure comes from a SIZE scale and never from a use-name (`prose`, `shell`),
 * so a header and a body can share one number without either naming the other.
 */
export const wrapperContract = {
  id: "wrapper",
  category: "layout",
  css: "@skryensya/core/patterns/wrapper.css",
  /* Only its own part. The shared `layoutParts` made Wrapper claim `sk-box`, `sk-stack`… and pulled
     box.css (and its hooks) into every tree that holds a Wrapper, a sheet it never paints from. */
  parts: { wrapper: layoutParts.wrapper },
  hooks: [
    "--sk-wrapper-max",
    "--sk-wrapper-padding-inline",
  ],

  options: {
    wrapperSize: { type: "enum", values: ["sm", "md", "lg", "full"], default: "md", attr: "data-size", prop: "size" },
    /*
     * The inline gutter either side of the column. No default: absent, the gutter stays the
     * `--space-inset-lg` it has always been, so no existing page moves. Declared, it takes a step of
     * the inset scale; `gutterExpanded` replaces it from the `desktop` breakpoint up (decision 30).
     */
    gutter: { type: "enum", values: ["none", "sm", "md", "lg", "xl"], attr: "data-gutter" },
    gutterExpanded: { type: "enum", values: ["none", "sm", "md", "lg", "xl"], attr: "data-gutter-expanded" },
    /** The element it renders as; React's `as`. A `section` or `nav` still wants an accessible name. */
    wrapperElement: { type: "enum", values: layoutElements, default: "div", element: true, prop: "as" },
  },

  signatures: {
    Wrapper: {
      intent: ["page-column", "centred-measure", "content-width"],
      host: { element: "div" },
      options: ["wrapperSize", "gutter", "gutterExpanded", "wrapperElement"],
      notInside: ["Wrapper"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "wrapper", host: true, slot: "children" },
      react: { from: "@skryensya/react/layout", name: "Wrapper" },
    },
  },
} as const satisfies ComponentContract;
