import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { menuDrawer, menuTrigger, shownOn } from "../lib/template-chrome";

/*
 * THE APPSHELL PAGE'S EXAMPLES: the same frame as a document and as an application. Each renders in its
 * own frame, so it owns a whole document (one main landmark) and the frame's width is the room it answers
 * to (decision 35): the same tree folds its rails into the drawer when that frame is phone-narrow.
 */

const text = (children: string, options: Record<string, string> = {}): UsageTree => ({ contract: "typography", signature: "Text", options, children });

const link = (label: string, href: string, current = false): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(current ? { current: true } : {}) },
  children: label,
});

const siteLinks = (t: Translate, orientation: "horizontal" | "vertical"): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  options: { orientation },
  attrs: { "aria-label": t("demo.appShellPage.siteNav") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    children: [link(t("demo.appShellPage.linkProduct"), "#product", true), link(t("demo.appShellPage.linkPricing"), "#pricing"), link(t("demo.appShellPage.linkDocs"), "#docs")],
  },
});

/** A document: header, a main that grows, a footer on the floor of a short page. No rail, page scroll. */
export const appShellDocumentTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "AppShell",
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Lumen" },
        shownOn("expanded", siteLinks(t, "horizontal")),
        { contract: "navbar", signature: "NavbarActions", children: menuTrigger(t, "document-menu") },
      ],
    },
    {
      contract: "layout",
      signature: "Main",
      options: { paddingBlock: "lg", paddingBlockExpanded: "xl" },
      children: {
        contract: "wrapper",
        signature: "Wrapper",
        options: { wrapperSize: "sm", gutter: "md", gutterExpanded: "lg" },
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm" },
          children: [
            { contract: "typography", signature: "Heading", options: { headingSize: "h3", headingElement: "h1", flush: true }, children: t("demo.appShellPage.documentTitle") },
            text(t("demo.appShellPage.documentBody"), { tone: "secondary" }),
          ],
        },
      },
    },
    {
      contract: "footer",
      signature: "Footer",
      options: { padding: "md" },
      children: { contract: "wrapper", signature: "Wrapper", options: { wrapperSize: "sm", gutter: "md", gutterExpanded: "lg" }, children: text("© 2026 Lumen", { size: "sm", tone: "tertiary" }) },
    },
    menuDrawer(t, "document-menu", siteLinks(t, "vertical")),
  ],
});

const workspace = (t: Translate): UsageTree => ({
  contract: "nav-list",
  signature: "NavList",
  attrs: { "aria-label": t("demo.appShellPage.workspace") },
  children: {
    contract: "nav-list",
    signature: "NavListGroup",
    children: [link(t("demo.appShellPage.linkInbox"), "#inbox", true), link(t("demo.appShellPage.linkSent"), "#sent"), link(t("demo.appShellPage.linkArchive"), "#archive")],
  },
});

/** An application: both rails, each region scrolling on its own, the rails in a drawer on a phone. */
export const appShellApplicationTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "AppShell",
  options: { scroll: "regions" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Postbox" },
        { contract: "navbar", signature: "NavbarActions", children: menuTrigger(t, "application-menu") },
      ],
    },
    {
      contract: "sidebar",
      signature: "Sidebar",
      options: { landmarkLabel: t("demo.appShellPage.workspace") },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: {
            contract: "sidebar",
            signature: "SidebarTrigger",
            options: { label: t("demo.appShellPage.collapse") },
            slots: { icon: { contract: "icon", signature: "Icon", options: { name: "chevron-left" } } },
          },
        },
        { contract: "sidebar", signature: "SidebarContent", children: workspace(t) },
      ],
    },
    {
      contract: "layout",
      signature: "Main",
      options: { paddingBlock: "md", paddingBlockExpanded: "lg" },
      children: {
        contract: "wrapper",
        signature: "Wrapper",
        options: { wrapperSize: "full", gutter: "md", gutterExpanded: "lg" },
        children: {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md" },
          children: [
            { contract: "typography", signature: "Heading", options: { headingSize: "h3", headingElement: "h1", flush: true }, children: t("demo.appShellPage.applicationTitle") },
            ...[1, 2, 3, 4, 5, 6].map((index) =>
              ({
                contract: "box",
                signature: "Box",
                options: { padding: "md", border: "subtle", surface: "surface" },
                children: text(t("demo.appShellPage.message", { n: String(index) })),
              }) satisfies UsageTree,
            ),
          ],
        },
      },
    },
    {
      contract: "sidebar",
      signature: "Sidebar",
      options: { landmarkLabel: t("demo.appShellPage.details"), side: "end" },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarContent",
          children: {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [text(t("demo.appShellPage.details"), { weight: "emphasis" }), text(t("demo.appShellPage.detailsBody"), { size: "sm", tone: "secondary" })],
          },
        },
        { contract: "sidebar", signature: "SidebarResizeHandle", options: { label: t("demo.appShellPage.resize") } },
      ],
    },
    menuDrawer(t, "application-menu", workspace(t)),
  ],
});
