import { placeholderHrefs } from "../lib/placeholder-hrefs";
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * ONE group with a labelled list, an icon link, a trailing count, and a nested sub-list: enough of
 * the pattern's own parts to name the landmark without filling the frame with a full product nav.
 */
export const navListAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("navListPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "nav-list",
      signature: "NavList",
      attrs: { "aria-label": t("demo.navList.productLabel"), style: "inline-size: 14rem" },
      children: [
        {
          contract: "nav-list",
          signature: "NavListGroup",
          slots: { label: t("demo.navList.groupWork") },
          children: [
            link(t("demo.navList.dashboard"), "/app/dashboard", "info", { current: true }),
            link(t("demo.navList.inbox"), "/app/inbox", "file", { trailing: "8" }),
            link(t("demo.navList.customers"), "/app/customers", "user", {
              nested: {
                contract: "nav-list",
                signature: "NavListGroup",
                children: [
                  link(t("demo.navList.allCustomers"), "/app/customers"),
                  link(t("demo.navList.segments"), "/app/segments"),
                ],
              },
            }),
          ],
        },
      ],
    },
    items: [
      namePart(".sk-nav-list", "block-start", { mark: "bracket" }),
      namePart(".sk-nav-list__group", "inline-start"),
      namePart(".sk-nav-list__group-label", "inline-end"),
      namePart(".sk-nav-list__list", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-nav-list__item", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-nav-list__link", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-nav-list__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-nav-list__trailing", "inline-end"),
    ],
  },
});

const icon = (name: string): UsageTree => ({
  contract: "icon",
  signature: "Icon",
  options: { name },
});

const link = (
  label: string,
  href: string,
  iconName?: string,
  extra: { current?: boolean; trailing?: string; nested?: UsageTree } = {},
): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(extra.current ? { current: true } : {}) },
  slots: {
    ...(iconName ? { icon: icon(iconName) } : {}),
    ...(extra.trailing ? { trailing: extra.trailing } : {}),
    ...(extra.nested ? { nested: extra.nested } : {}),
  },
  children: label,
});

/*
 * Sidebar-like product navigation: more than a toy pair of links, with real grouping, active route,
 * icons, trailing counters, and a destination that owns sub-destinations through NavListLink.nested.
 * The stage stays narrow because nav-list is always sized by a sidebar, drawer, or navbar host.
 */
export const navListProductTree = (
  t: Translate,
  hrefs: { dashboard: string; inbox: string; customers: string; segments: string; automations: string; settings: string } = placeholderHrefs(),
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.navList.productLabel") },
  children: [
    {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: { label: t("demo.navList.groupWork") },
      children: [
        link(t("demo.navList.dashboard"), hrefs.dashboard, "info", { current: true }),
        link(t("demo.navList.inbox"), hrefs.inbox, "file", { trailing: "8" }),
        link(t("demo.navList.customers"), hrefs.customers, "user", {
          nested: {
            contract: "nav-list",
            signature: "NavListGroup",
            children: [
              link(t("demo.navList.allCustomers"), hrefs.customers),
              link(t("demo.navList.segments"), hrefs.segments),
            ],
          },
        }),
      ],
    },
    {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: { label: t("demo.navList.groupOperate") },
      children: [
        link(t("demo.navList.automations"), hrefs.automations, "refresh"),
        link(t("demo.navList.settings"), hrefs.settings, "settings"),
      ],
    },
  ],
});

/*
 * THE ORIENTATION CARD'S SPECIMEN: one flat, unlabelled group, so the same tree reads in a column and
 * in a row. The product tree (two labelled groups, a nested destination) is a sidebar by nature: in a
 * row its group labels, nesting and counters line up into something nobody would build.
 */
export const navListOrientationTree = (
  t: Translate,
  hrefs: { dashboard: string; inbox: string; customers: string; automations: string; settings: string },
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.navList.productLabel") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    children: [
      link(t("demo.navList.dashboard"), hrefs.dashboard, "info", { current: true }),
      link(t("demo.navList.inbox"), hrefs.inbox, "file", { trailing: "8" }),
      link(t("demo.navList.customers"), hrefs.customers, "user"),
      link(t("demo.navList.automations"), hrefs.automations, "refresh"),
      link(t("demo.navList.settings"), hrefs.settings, "settings"),
    ],
  },
});

/* Horizontal nav-list as a navbar guest: the same NavListGroup wrapper remains, just unlabelled. */
export const navListHorizontalTree = (
  t: Translate,
  hrefs: { overview: string; projects: string; reports: string; team: string } = placeholderHrefs(),
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  options: { orientation: "horizontal" },
  attrs: { "aria-label": t("demo.navList.horizontalLabel") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    children: [
      link(t("demo.navList.overview"), hrefs.overview, undefined, { current: true }),
      link(t("demo.navList.projects"), hrefs.projects),
      link(t("demo.navList.reports"), hrefs.reports),
      link(t("demo.navList.team"), hrefs.team),
    ],
  },
});

/*
 * Disclosure navigation, like a docs rail or settings drawer: groups open and close, but the items
 * remain links rather than menuitems. The second group starts closed to make the defaultOpen contract visible.
 */
export const navListCollapsibleTree = (
  t: Translate,
  hrefs: { start: string; components: string; tokens: string; profile: string; billing: string } = placeholderHrefs(),
): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.navList.collapsibleNavLabel") },
  children: [
    {
      contract: "nav-list",
      signature: "NavListGroup",
      options: { collapsible: true, defaultOpen: true },
      slots: { label: t("demo.navList.docs") },
      children: [
        link(t("demo.navList.start"), hrefs.start, "info", { current: true }),
        link(t("demo.navList.components"), hrefs.components, "folder"),
        link(t("demo.navList.tokens"), hrefs.tokens, "edit"),
      ],
    },
    {
      contract: "nav-list",
      signature: "NavListGroup",
      options: { collapsible: true, defaultOpen: false },
      slots: { label: t("demo.navList.account") },
      children: [
        link(t("demo.navList.profile"), hrefs.profile, "user"),
        link(t("demo.navList.billing"), hrefs.billing, "file"),
      ],
    },
  ],
});

/*
 * USAGE GUIDE. Every pair is a plain sidebar column at one width, so what differs is the one thing the
 * rule is about: how destinations are named, how groups are titled, which one is current, and what
 * counts as a destination at all.
 */
type Row = [label: string, current?: boolean];

const guideList = (t: Translate, groups: { label?: string; rows: Row[] }[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  attrs: { style: "inline-size: 18rem; max-inline-size: 100%" },
  children: {
    contract: "nav-list",
    signature: "NavList",
    attrs: { "aria-label": t("demo.navList.productLabel") },
    children: groups.map(({ label, rows }) => ({
      contract: "nav-list",
      signature: "NavListGroup",
      ...(label ? { slots: { label } } : {}),
      children: rows.map(([text, current]) => link(text, "#", undefined, { current })),
    })),
  },
});

/** Do: one or two words per destination. */
export const navListDoShortNamesTree = (t: Translate): UsageTree =>
  guideList(t, [{ rows: [[t("demo.navList.dashboard"), true], [t("demo.navList.customers")], [t("demo.navList.automations")], [t("demo.navList.settings")]] }]);

/** Don't: a sentence per destination, which no sidebar has the width to show. */
export const navListDontLongNamesTree = (t: Translate): UsageTree =>
  guideList(t, [{ rows: [[t("demo.navList.dashboard"), true], [t("demo.navList.dd.longCustomers")], [t("demo.navList.dd.longAutomations")], [t("demo.navList.dd.longSettings")]] }]);

/** Do: groups titled by topic. */
export const navListDoTopicGroupsTree = (t: Translate): UsageTree =>
  guideList(t, [
    { label: t("demo.navList.groupWork"), rows: [[t("demo.navList.dashboard"), true], [t("demo.navList.inbox")], [t("demo.navList.customers")]] },
    { label: t("demo.navList.groupOperate"), rows: [[t("demo.navList.automations")], [t("demo.navList.settings")]] },
  ]);

/** Don't: the same destinations under titles that say nothing. */
export const navListDontVagueGroupsTree = (t: Translate): UsageTree =>
  guideList(t, [
    { label: t("demo.navList.dd.groupOther"), rows: [[t("demo.navList.dashboard"), true], [t("demo.navList.inbox")], [t("demo.navList.customers")]] },
    { label: t("demo.navList.dd.groupMisc"), rows: [[t("demo.navList.automations")], [t("demo.navList.settings")]] },
  ]);

/** Do: exactly one link marks the current page. */
export const navListDoOneCurrentTree = (t: Translate): UsageTree =>
  guideList(t, [{ rows: [[t("demo.navList.overview")], [t("demo.navList.projects"), true], [t("demo.navList.reports")], [t("demo.navList.team")]] }]);

/** Don't: two links claim to be the current page. */
export const navListDontTwoCurrentTree = (t: Translate): UsageTree =>
  guideList(t, [{ rows: [[t("demo.navList.overview"), true], [t("demo.navList.projects"), true], [t("demo.navList.reports")], [t("demo.navList.team")]] }]);

/** Do: every row is somewhere to go. */
export const navListDoDestinationsTree = (t: Translate): UsageTree =>
  guideList(t, [{ label: t("demo.navList.account"), rows: [[t("demo.navList.profile"), true], [t("demo.navList.billing")]] }]);

/** Don't: actions dressed as destinations; they do something, they do not go anywhere. */
export const navListDontActionsTree = (t: Translate): UsageTree =>
  guideList(t, [{ label: t("demo.navList.account"), rows: [[t("demo.navList.profile"), true], [t("demo.navList.dd.export")], [t("demo.navList.dd.delete")]] }]);
