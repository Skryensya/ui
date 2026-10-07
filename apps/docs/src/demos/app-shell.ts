import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { menuDrawer, menuTrigger } from "../lib/template-chrome";

const icon = (name: string): UsageTree => ({
  contract: "icon",
  signature: "Icon",
  options: { name },
});

const navLink = (
  t: Translate,
  key: "overview" | "deployments" | "incidents" | "settings" | "billing",
  iconName: string,
  href: string,
  current = false,
  trailing?: string,
): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  slots: {
    icon: icon(iconName),
    ...(trailing ? { trailing } : {}),
    children: t(`demo.appShell.nav.${key}`),
  },
});


const kpi = (label: string, value: string, change: string, trend: "up" | "down"): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { surface: "surface", border: "subtle", padding: "md" },
  children: {
    contract: "stat",
    signature: "Stat",
    options: { trend },
    slots: {
      label,
      value,
      change: [{ contract: "icon", signature: "Icon", options: { name: trend === "up" ? "arrow-up" : "arrow-down", size: "sm" } }, change],
    },
  },
});

/** One deployment: the service as the row's header, its environment, a `Badge` for its state, and how long ago. */
const deployment = (service: string, environment: string, status: string, tone: "success" | "warning" | "danger", when: string): UsageTree => ({
  contract: "table",
  signature: "TableRow",
  children: [
    { contract: "table", signature: "TableHeader", options: { scope: "row" }, children: service },
    { contract: "table", signature: "TableCell", children: environment },
    { contract: "table", signature: "TableCell", children: { contract: "badge", signature: "Badge", options: { tone }, children: status } },
    { contract: "table", signature: "TableCell", children: when },
  ],
});

const header = (label: string): UsageTree => ({ contract: "table", signature: "TableHeader", children: label });

/**
 * THE OPERATIONS APP, WHOLE. An `AppShell` places each region by what it is: the Navbar across the top, the Sidebar
 * down the rail to the bottom of the screen, the Main filling the rest. No class of the docs' own holds it together,
 * so the Maker (which has none) opens it exactly as it is shown here: the frame becomes the project's layout, the
 * Main's content its first page.
 *
 * The work area is a real overview rather than an empty pane, in the order an on-call engineer reads it: what this
 * screen is and what you can do from it, what is on fire right now, the day at a glance, then the list you work in.
 * Its content follows the page rule (Main > Box > Wrapper > Stack): the Box gives the area its breathing room, the
 * Wrapper its measure (`lg`, a work area of tables and cards) with no second gutter on top of the Box's padding.
 *
 * The Sidebar's trigger sits in its header, NOT floating: a floating trigger is pinned to the rail's outer edge and,
 * with a populated Main, lands on the work area's first line (the dashboard template measured exactly that).
 */
/* Each shell's navigation, written once and drawn twice: down the rail on a wide screen, in the drawer on a phone. */
const operationsNav = (t: Translate): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.appShell.navigation") },
  children: [
    {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: {
        label: t("demo.appShell.workspace"),
        children: [
          navLink(t, "overview", "info", "#overview", true),
          navLink(t, "deployments", "calendar", "#deployments", false, "12"),
          navLink(t, "incidents", "warning", "#incidents", false, "1"),
        ],
      },
    },
    {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: {
        label: t("demo.appShell.manage"),
        children: [navLink(t, "settings", "settings", "#settings"), navLink(t, "billing", "file", "#billing")],
      },
    },
  ],
});

const explorerNav = (t: Translate): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.appShell.nested.navigation") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    slots: {
      label: t("demo.appShell.workspace"),
      children: [
        projectLink(t, "Northstar", "#northstar", true),
        projectLink(t, "Atlas", "#atlas"),
      ],
    },
  },
});

export const appShellTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "AppShell",
  /* An application: the header and the rail stay put while the work area scrolls. */
  options: { scroll: "regions" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Northstar" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: [
            menuTrigger(t, "operations-menu"),
            { contract: "avatar", signature: "Avatar.initials", options: { name: "Helena Park", size: "sm" }, children: "HP" },
          ],
        },
      ],
    },
    {
      contract: "sidebar",
      signature: "Sidebar",
      attrs: { id: "release-sidebar" },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: { contract: "sidebar", signature: "SidebarTrigger", options: { label: t("demo.appShell.collapse") }, slots: { icon: icon("chevron-left") } },
        },
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: operationsNav(t),
        },
        { contract: "sidebar", signature: "SidebarSeparator" },
        {
          contract: "sidebar",
          signature: "SidebarFooter",
          children: { contract: "typography", signature: "Text", options: { size: "sm" }, children: "Helena Park" },
        },
      ],
    },
    {
      contract: "layout",
      signature: "Main",
      children: {
        contract: "box",
        signature: "Box",
        options: { padding: "md", paddingExpanded: "lg", radius: "none" },
        children: {
          contract: "wrapper",
          signature: "Wrapper",
          options: { wrapperSize: "lg", gutter: "none" },
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "md", gapExpanded: "lg" },
            children: [
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "md", justify: "between", inlineAlign: "center", wrap: true },
                children: [
                  {
                    contract: "layout",
                    signature: "Stack",
                    options: { gap: "xs" },
                    children: [
                      { contract: "typography", signature: "Heading", options: { headingElement: "h1", headingSize: "h2", flush: true }, children: t("demo.appShell.title") },
                      { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: t("demo.appShell.subtitle") },
                    ],
                  },
                  {
                    contract: "layout",
                    signature: "Inline",
                    options: { gap: "sm", wrap: true },
                    children: [
                      { contract: "button", signature: "Button.action", options: { variant: "soft" }, children: [icon("download"), t("demo.appShell.export")] },
                      { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.appShell.deploy") },
                    ],
                  },
                ],
              },
              {
                contract: "callout",
                signature: "Callout",
                options: { tone: "warning" },
                slots: {
                  icon: icon("warning"),
                  title: t("demo.appShell.incidentTitle"),
                  children: {
                    contract: "layout",
                    signature: "Stack",
                    options: { gap: "sm" },
                    children: [
                      { contract: "typography", signature: "Text", children: t("demo.appShell.incidentBody") },
                      { contract: "typography", signature: "Link", options: { href: "#incidents" }, children: t("demo.appShell.incidentAction") },
                    ],
                  },
                },
              },
              {
                contract: "layout",
                signature: "Grid",
                options: { columns: "4", gap: "md", responsive: true },
                attrs: { "aria-label": t("demo.appShell.kpiLabel") },
                children: [
                  kpi(t("demo.appShell.kpiDeploys"), "14", "3", "up"),
                  kpi(t("demo.appShell.kpiSuccess"), "98.6%", "0.4", "up"),
                  kpi(t("demo.appShell.kpiRecovery"), "18 min", "6 min", "down"),
                  kpi(t("demo.appShell.kpiIncidents"), "1", "1", "up"),
                ],
              },
              {
                contract: "table",
                signature: "TableScroll",
                options: { stickyHeader: true },
                /* A scrolling box is reachable by keyboard and named, or what is off screen is out of reach (quality.ts: table-scroll-focusable). */
                attrs: { tabindex: "0", role: "region", "aria-label": t("demo.appShell.tableCaption") },
                children: {
                  contract: "table",
                  signature: "Table",
                  children: [
                    { contract: "table", signature: "TableCaption", children: t("demo.appShell.tableCaption") },
                    {
                      contract: "table",
                      signature: "TableHead",
                      children: {
                        contract: "table",
                        signature: "TableRow",
                        children: [header(t("demo.appShell.colService")), header(t("demo.appShell.colEnvironment")), header(t("demo.appShell.colStatus")), header(t("demo.appShell.colWhen"))],
                      },
                    },
                    {
                      contract: "table",
                      signature: "TableBody",
                      children: [
                        deployment("api-gateway", t("demo.appShell.production"), t("demo.appShell.statusRunning"), "warning", "4 min"),
                        deployment("billing-service", t("demo.appShell.production"), t("demo.appShell.statusDone"), "success", "32 min"),
                        deployment("search-indexer", t("demo.appShell.staging"), t("demo.appShell.statusFailed"), "danger", "1 h"),
                        deployment("auth", t("demo.appShell.production"), t("demo.appShell.statusDone"), "success", "3 h"),
                        deployment("notifications", t("demo.appShell.staging"), t("demo.appShell.statusDone"), "success", "5 h"),
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    menuDrawer(t, "operations-menu", operationsNav(t)),
  ],
});

/**
 * A destination that carries its own sub-destinations underneath it: `nav-list`'s `nested` slot
 * (contracts/semantic/nav-list.yaml): a `NavListGroup` inside the SAME `<li>` as the link, not
 * inside the parent group's list, so it stays valid HTML and needs no label of its own. The link
 * above it already says what it is.
 */
const projectLink = (t: Translate, name: string, href: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  slots: {
    children: name,
    nested: {
      contract: "nav-list",
      signature: "NavListGroup",
      slots: {
        children: [
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: `${href}/resumen` },
            slots: { children: t("demo.appShell.nested.overview") },
          },
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: `${href}/configuracion` },
            slots: { children: t("demo.appShell.nested.settings") },
          },
        ],
      },
    },
  },
});

/**
 * The same shell, hosting the OTHER legal Sidebar shape (contracts/semantic/sidebar.yaml): a list
 * with sub-levels has no row to collapse to a rail of icons, so this one carries a
 * `SidebarResizeHandle` instead of a `SidebarTrigger`. Narrower on drag, never iconified, every
 * label still readable (ellipsis, never a bare icon strip) down to a minimum so low
 * (`minInlineSize`) that dragged all the way in, the panel reads as a bare edge rather than a
 * column with something illegible crammed into it.
 *
 * The nested navigation itself (`projectLink`, above) is a `NavList` with `NavListLink.nested`,
 * not a `TreeView`: a file tree names FILES, which are not navigable destinations, while this
 * shell's rail is exactly that. A list of destinations, some of which have their own
 * sub-destinations. `NavList` is what nav-list.yaml's `useWhen` already says that is.
 */
export const appShellExplorerTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "AppShell",
  options: { scroll: "regions" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Northstar" },
        { contract: "navbar", signature: "NavbarActions", children: menuTrigger(t, "explorer-menu") },
      ],
    },
    {
      contract: "sidebar",
      signature: "Sidebar",
      attrs: { id: "explorer-shell-sidebar" },
      // 10px: a sliver too narrow to hold a readable label or icon, on purpose. A sub-level
      // nav has no icon-only rail to fall back to (contracts/semantic/sidebar.yaml), so its
      // floor is "still a visible edge", not "still legible".
      options: { minInlineSize: "10px" },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: { contract: "typography", signature: "Text", children: t("demo.appShell.nested.header") },
        },
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: explorerNav(t),
        },
        {
          contract: "sidebar",
          signature: "SidebarResizeHandle",
          options: { label: t("demo.appShell.nested.resize") },
        },
      ],
    },
    { contract: "layout", signature: "Main" },
    menuDrawer(t, "explorer-menu", explorerNav(t)),
  ],
});
