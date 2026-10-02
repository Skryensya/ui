import { placeholderHrefs } from "../lib/placeholder-hrefs";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { megamenuTree } from "./megamenu";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

type NavbarHrefs = { home: string; projects: string; reports: string; team: string };

type NavbarDestination = keyof NavbarHrefs;

/*
 * The destinations the navbar demos share: the bar changes around them, the list does not. Home is
 * always the current page. A demo may take fewer of them; the anatomy does, to fit its drawing.
 */
const navbarLinks = (
  t: Translate,
  hrefs: NavbarHrefs,
  destinations: readonly NavbarDestination[] = ["home", "projects", "reports", "team"],
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  options: { orientation: "horizontal" },
  attrs: { "aria-label": t("demo.navbar.nav") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    children: destinations.map((destination) => ({
      contract: "nav-list",
      signature: "NavListLink",
      options: { href: hrefs[destination], ...(destination === "home" ? { current: true } : {}) },
      children: t(`demo.navbar.${destination}`),
    })),
  },
});

/*
 * The bar holds a brand, a horizontal nav-list guest, and two actions. "Atlas" stays written: it
 * is a product name. Locale-owned paths come from the page.
 *
 * The hand-written HTML skipped NavListGroup; the contract requires it (a `<li>` needs a `<ul>`),
 * so the tree always nests the group, even when it has no label.
 */
export const navbarTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    {
      contract: "navbar",
      signature: "NavbarBrand",
      children: "Atlas",
    },
    navbarLinks(t, hrefs),
    {
      contract: "navbar",
      signature: "NavbarActions",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost" },
          children: t("demo.navbar.invite"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          children: t("demo.navbar.newProject"),
        },
      ],
    },
  ],
});

/*
 * NO CONTAINER, and no option for it either: the bar's surface is four hooks (`bg`, `wash`,
 * `elevation`, `border-color`), so a consumer who wants the bar to sit on the page rather than on a
 * surface re-declares them, the same way any shell is restyled. The padding stays: it is what keeps
 * the brand off the viewport's edge once there is no bar edge to measure from.
 *
 * The guest follows: a tinted current link reads as a chip once there is no bar around it, so the
 * current page keeps its colour and emphasis and drops the fill. Scoped to `.sk-navbar .sk-nav-list`
 * because the list declares its own defaults on its root; a hook set on the bar alone would lose.
 */
export const navbarBareCss = `.sk-navbar {
  --sk-navbar-bg: transparent;
  --sk-navbar-wash: none;
  --sk-navbar-elevation: none;
  --sk-navbar-border-color: transparent;
}

.sk-navbar .sk-nav-list {
  --sk-nav-list-link-current-bg: transparent;
  --sk-nav-list-link-current-fg: var(--color-text-primary);
}`;

/** The same bar with no surface of its own: a marketing header sitting straight on the page. */
export const navbarBareTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    {
      contract: "navbar",
      signature: "NavbarBrand",
      children: "Atlas",
    },
    navbarLinks(t, hrefs),
    {
      contract: "navbar",
      signature: "NavbarActions",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost" },
          children: t("demo.navbar.signIn"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          children: t("demo.navbar.getStarted"),
        },
      ],
    },
  ],
});

/*
 * An app's bar: the actions are tools rather than calls to action, so they go icon-only, each with
 * its own accessible name, and the account closes the row. The avatar is a node in the actions
 * slot like any other; the bar does not need to know it is a person.
 */
export const navbarAppTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    {
      contract: "navbar",
      signature: "NavbarBrand",
      children: "Atlas",
    },
    navbarLinks(t, hrefs),
    {
      contract: "navbar",
      signature: "NavbarActions",
      children: [
        {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true, variant: "ghost" },
          attrs: { "aria-label": t("demo.navbar.search") },
          children: { contract: "icon", signature: "Icon", options: { name: "search" } },
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true, variant: "ghost" },
          attrs: { "aria-label": t("demo.navbar.settings") },
          children: { contract: "icon", signature: "Icon", options: { name: "settings" } },
        },
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { name: "Ada Lovelace", size: "sm" },
          children: "AL",
        },
      ],
    },
  ],
});

/*
 * Brand, nav guest and actions: the three regions a Navbar always composes.
 *
 * A SMALLER BAR than the usage demo: three links and one action. Every anatomy is drawn at a design
 * width of the frame or 36rem, whichever is wider (`annotation.css`), and the full bar is wider than
 * what 36rem leaves once the bubbles have their gutters. The canvas scales the whole drawing down, but
 * it cannot scale a specimen that was squeezed first, so on a phone the links were ellipsised to "H."
 * and "P…". Each region still holds something, which is all the drawing needs to point at.
 */
export const navbarAnatomyTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("navbarPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Atlas" },
        navbarLinks(t, hrefs, ["home", "projects", "team"]),
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: {
            contract: "button",
            signature: "Button.action",
            options: { tone: "accent" },
            children: t("demo.navbar.newProject"),
          },
        },
      ],
    },
    items: [
      namePart(".sk-navbar", "block-start", { mark: "bracket" }),
      namePart(".sk-navbar__brand", "inline-start"),
      namePart(".sk-nav-list", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-navbar__actions", "inline-end"),
    ],
  },
});


/*
 * A MEGAMENU AS THE BAR'S GUEST: `Navbar` accepts it next to (or instead of) a NavList, a peer with
 * its own destinations. It opens its panel against the bar, so the card reserves room below it.
 */
export const navbarMegamenuTree = (t: Translate): UsageTree => {
  const hrefs = { overview: "#", pricing: "#", integrations: "#", teams: "#", enterprise: "#" };
  return {
    contract: "navbar",
    signature: "Navbar",
    children: [
      { contract: "navbar", signature: "NavbarBrand", children: "Atlas" },
      megamenuTree(t, hrefs),
      {
        contract: "navbar",
        signature: "NavbarActions",
        children: {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          children: t("demo.navbar.newProject"),
        },
      },
    ],
  };
};

/*
 * USAGE GUIDE. One bar builder for every pair, so only the thing a rule is about differs: how many
 * calls to action compete, how many links share the row, how long the brand is. The bars are drawn
 * at the frame's own width on purpose: a bar that is too full is plain to see there.
 */
const accent = (label: string): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { tone: "accent" },
  children: label,
});

const guideBar = (
  t: Translate,
  { brand = "Atlas", links = ["home", "projects", "reports", "team"].map((d) => t(`demo.navbar.${d as NavbarDestination}`)), actions }: { brand?: string; links?: string[]; actions: UsageTree[] },
): UsageTree => ({
  contract: "navbar",
  signature: "Navbar",
  children: [
    { contract: "navbar", signature: "NavbarBrand", children: brand },
    {
      contract: "nav-list",
      signature: "NavList",
      options: { orientation: "horizontal" },
      attrs: { "aria-label": t("demo.navbar.nav") },
      children: {
        contract: "nav-list",
        signature: "NavListGroup",
        children: links.map((label, index) => ({
          contract: "nav-list",
          signature: "NavListLink",
          options: { href: "#", ...(index === 0 ? { current: true } : {}) },
          children: label,
        })),
      },
    },
    { contract: "navbar", signature: "NavbarActions", children: actions },
  ],
});

const ghost = (label: string): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "ghost" },
  children: label,
});

/** Do: one accent action; the rest are quiet. */
export const navbarDoOneActionTree = (t: Translate): UsageTree =>
  guideBar(t, { links: [t("demo.navbar.home")], actions: [ghost(t("demo.navbar.signIn")), accent(t("demo.navbar.getStarted"))] });

/** Don't: every action shouts, so none of them leads. */
export const navbarDontManyActionsTree = (t: Translate): UsageTree =>
  guideBar(t, {
    links: [t("demo.navbar.home")],
    actions: [accent(t("demo.navbar.signIn")), accent(t("demo.navbar.dd.tryFree")), accent(t("demo.navbar.getStarted"))],
  });

/** Do: a handful of sections. */
export const navbarDoFewLinksTree = (t: Translate): UsageTree =>
  guideBar(t, { links: [t("demo.navbar.home"), t("demo.navbar.projects"), t("demo.navbar.reports")], actions: [accent(t("demo.navbar.getStarted"))] });

/** Don't: every page of the site in one row, so the links are cut off. */
export const navbarDontManyLinksTree = (t: Translate): UsageTree =>
  guideBar(t, {
    links: [
      t("demo.navbar.home"),
      t("demo.navbar.projects"),
      t("demo.navbar.reports"),
      t("demo.navbar.team"),
      t("demo.navbar.dd.pricing"),
      t("demo.navbar.dd.blog"),
      t("demo.navbar.dd.docs"),
      t("demo.navbar.dd.contact"),
    ],
    actions: [accent(t("demo.navbar.getStarted"))],
  });

/** Do: the product name and nothing else. */
export const navbarDoShortBrandTree = (t: Translate): UsageTree =>
  guideBar(t, { links: [t("demo.navbar.home"), t("demo.navbar.projects")], actions: [accent(t("demo.navbar.getStarted"))] });

/** Don't: a tagline as the brand, which pushes the links off the bar. */
export const navbarDontLongBrandTree = (t: Translate): UsageTree =>
  guideBar(t, {
    brand: t("demo.navbar.dd.longBrand"),
    links: [t("demo.navbar.home"), t("demo.navbar.projects")],
    actions: [accent(t("demo.navbar.getStarted"))],
  });

/*
 * LAYOUTS, in the page's own column (about 600px), so each bar holds three links and one action: more
 * would be ellipsised there. The bar has no layout option: it is a flex row whose actions push to the end, and the
 * rest is the consumer's. So a layout is a CSS rule on a `data-layout` the example writes on the bar,
 * shown together in `navbarLayoutCss`. Four are drawn: links beside the brand (the default), links
 * centred between brand and actions, the brand in the middle with links and actions at the sides, and
 * the bar with no links at all.
 */
export type NavbarLayout = "start" | "centered" | "brand-center" | "minimal";

const layoutVariant = (t: Translate, hrefs: NavbarHrefs, layout: NavbarLayout): UsageTree => {
  const actions: UsageTree = {
    contract: "navbar",
    signature: "NavbarActions",
    children: { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.navbar.getStarted") },
  };
  const brand: UsageTree = { contract: "navbar", signature: "NavbarBrand", children: "Atlas" };
  return {
    contract: "navbar",
    signature: "Navbar",
    attrs: { "data-layout": layout },
    children: layout === "minimal" ? [brand, actions] : [brand, navbarLinks(t, hrefs, ["home", "projects", "team"]), actions],
  };
};

/* One export per layout, each taking only what the generated stories pass (`t`, hrefs). */
export const navbarLayoutTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => layoutVariant(t, hrefs, "start");
export const navbarLayoutCenteredTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => layoutVariant(t, hrefs, "centered");
export const navbarLayoutBrandCenterTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => layoutVariant(t, hrefs, "brand-center");
export const navbarLayoutMinimalTree = (t: Translate, hrefs: NavbarHrefs = placeholderHrefs()): UsageTree => layoutVariant(t, hrefs, "minimal");

export const navbarLayoutCss = `.sk-navbar {
  inline-size: 100%;
}

/* Links centred between the brand and the actions. */
.sk-navbar[data-layout="centered"] .sk-nav-list {
  margin-inline: auto;
}

/* The brand in the middle: a three-track grid, links on the start side and actions on the end. */
.sk-navbar[data-layout="brand-center"] {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}

.sk-navbar[data-layout="brand-center"] .sk-nav-list {
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
}

.sk-navbar[data-layout="brand-center"] .sk-navbar__brand {
  grid-column: 2;
  grid-row: 1;
}

.sk-navbar[data-layout="brand-center"] .sk-navbar__actions {
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
}`;

/** A site's bar with a megamenu guest AND a quiet account area: the two ways to carry destinations. */
export const navbarMegamenuAppTree = (t: Translate): UsageTree => {
  const base = navbarMegamenuTree(t);
  const children = (base.children as UsageTree[]).slice(0, 2);
  return {
    ...base,
    children: [
      ...children,
      {
        contract: "navbar",
        signature: "NavbarActions",
        children: [
          {
            contract: "button",
            signature: "Button.action",
            options: { iconOnly: true, variant: "ghost" },
            attrs: { "aria-label": t("demo.navbar.search") },
            children: { contract: "icon", signature: "Icon", options: { name: "search" } },
          },
          { contract: "avatar", signature: "Avatar.initials", options: { name: "Ada Lovelace", size: "sm" }, children: "AL" },
        ],
      },
    ],
  };
};
