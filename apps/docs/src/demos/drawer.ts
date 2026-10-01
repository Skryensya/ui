import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * A navigation drawer, `Vaul.drawer`, which is what this page has always said it is: "un drawer ES
 * un Vaul".
 *
 * The page's own `demo-drawer__*` classes come along, and that works because every one of them lands
 * on an element that is a signature HOST. A tree can hand a class to a host; it cannot reach inside
 * another signature's template. That is exactly the line `card` falls on the wrong side of, and it
 * is worth seeing the two next to each other: the same kind of decoration, convertible here and not
 * there, decided by WHERE it attaches rather than by what it is.
 */
const link = (t: Translate, key: string, href: string, icon: string, extra?: UsageTree | string): UsageTree => ({
  contract: "nav-list",
  signature: "NavListLink",
  options: { href, ...(key === "summary" ? { current: true } : {}) },
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: icon } },
    children: t(`demo.drawer.${key}` as never),
    ...(extra ? { trailing: extra } : {}),
  },
});

export const drawerTree = (t: Translate): UsageTree => ({
  contract: "vaul",
  signature: "Vaul.drawer",
  options: { edge: "inline-start", open: true, label: t("demo.drawer.label"), panelId: "demo-drawer" },
  children: [
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", inlineAlign: "center" },
      attrs: { class: "demo-drawer__header" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          attrs: { class: "demo-drawer__brand" },
          children: t("demo.drawer.brand"),
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost", iconOnly: true },
          attrs: { "aria-label": t("demo.drawer.close"), "data-sk-vaul-close": "" },
          children: { contract: "icon", signature: "Icon", options: { name: "close" } },
        },
      ],
    },
    {
      contract: "nav-list",
      signature: "NavList",
      attrs: { class: "demo-drawer__nav", "aria-label": t("demo.drawer.main") },
      children: [
        {
          contract: "nav-list",
          signature: "NavListGroup",
          slots: {
            label: t("demo.drawer.work"),
            children: [
              link(t, "summary", "#resumen", "info"),
              link(t, "agenda", "#agenda", "calendar", "3"),
              link(t, "files", "#archivos", "download"),
            ],
          },
        },
        {
          contract: "nav-list",
          signature: "NavListGroup",
          slots: {
            label: t("demo.drawer.account"),
            children: [
              link(t, "team", "#equipo", "user"),
              link(t, "settings", "#ajustes", "settings"),
            ],
          },
        },
      ],
    },
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", inlineAlign: "center" },
      attrs: { class: "demo-drawer__footer" },
      children: [
        {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { size: "sm", name: t("demo.drawer.userName") },
          children: "AK",
        },
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "none" },
          attrs: { class: "demo-drawer__user" },
          children: [
            {
              contract: "typography",
              signature: "Text",
              attrs: { class: "demo-drawer__user-name" },
              children: t("demo.drawer.userName"),
            },
            {
              contract: "typography",
              signature: "Text",
              options: { tone: "secondary" },
              attrs: { class: "demo-drawer__user-meta" },
              children: "ada@estudio.cl",
            },
          ],
        },
      ],
    },
  ],
});

/**
 * A small, zoomed-out viewport specimen for the close-control guideline. A real drawer is fixed to
 * the viewport, which a clipped Do/Don't card cannot show faithfully; freeze the whole scene so the
 * reader can see the edge panel, the scrim and the page it covers at once.
 */
export const drawerGuideHtml = (t: Translate, withClose: boolean): string => `<div class="drawer-guide__viewport">
  <div class="drawer-guide__page" aria-hidden="true">
    <strong class="drawer-guide__page-title">${t("demo.drawer.pageTitle")}</strong>
    <span class="drawer-guide__page-line drawer-guide__page-line--long"></span>
    <span class="drawer-guide__page-line"></span>
    <div class="drawer-guide__page-card"><strong>${t("demo.drawer.pageCard")}</strong><span>${t("demo.drawer.pageCardBody")}</span></div>
    <span class="drawer-guide__page-line drawer-guide__page-line--short"></span>
  </div>
  <div class="drawer-guide__scrim"></div>
  <dialog class="sk-vaul sk-drawer drawer-guide__panel" open aria-label="${t("demo.drawer.label")}">
    <header class="drawer-guide__header">
      <strong>${t("demo.drawer.brand")}</strong>
      ${withClose ? `<button class="sk-button sk-interactive drawer-guide__close" type="button" aria-label="${t("demo.drawer.close")}">×</button>` : ""}
    </header>
    <nav class="drawer-guide__nav" aria-label="${t("demo.drawer.main")}">
      <span class="drawer-guide__section">${t("demo.drawer.work")}</span>
      <span class="drawer-guide__link drawer-guide__link--current">${t("demo.drawer.summary")}</span>
      <span class="drawer-guide__link">${t("demo.drawer.agenda")}</span>
      <span class="drawer-guide__link">${t("demo.drawer.files")}</span>
      <span class="drawer-guide__section">${t("demo.drawer.account")}</span>
      <span class="drawer-guide__link">${t("demo.drawer.settings")}</span>
    </nav>
    <footer class="drawer-guide__footer"><span class="drawer-guide__avatar">AK</span><strong>${t("demo.drawer.userName")}</strong></footer>
  </dialog>
</div>`;

/** Match the panel's visible heading to a specific accessible name, rather than a generic label. */
export const drawerNameGuideHtml = (t: Translate, specific: boolean): string => {
  const name = t(specific ? "demo.drawer.filters" : "demo.drawer.genericPanel");
  return `<div class="drawer-guide__viewport">
    <div class="drawer-guide__page" aria-hidden="true"><strong class="drawer-guide__page-title">${t("demo.drawer.pageTitle")}</strong><span class="drawer-guide__page-line drawer-guide__page-line--long"></span><span class="drawer-guide__page-line"></span></div>
    <div class="drawer-guide__scrim"></div>
    <dialog class="sk-vaul sk-drawer drawer-guide__panel" open aria-label="${name}">
      <header class="drawer-guide__header"><strong>${name}</strong></header>
      <div class="drawer-guide__nav">${t("demo.drawer.nameBody")}</div>
    </dialog>
  </div>`;
};

/** A short blocking decision belongs in a centered Dialog, not a full-height Drawer. */
export const drawerDecisionGuideHtml = (t: Translate, useDrawer: boolean): string => `<div class="drawer-guide__viewport">
  <div class="drawer-guide__page" aria-hidden="true"><strong class="drawer-guide__page-title">${t("demo.drawer.pageTitle")}</strong><span class="drawer-guide__page-line drawer-guide__page-line--long"></span><span class="drawer-guide__page-line"></span></div>
  <div class="drawer-guide__scrim"></div>
  ${useDrawer
    ? `<dialog class="sk-vaul sk-drawer drawer-guide__panel" open aria-label="${t("demo.drawer.decisionTitle")}"><header class="drawer-guide__header"><strong>${t("demo.drawer.decisionTitle")}</strong></header><div class="drawer-guide__nav">${t("demo.drawer.decisionBody")}<div class="drawer-guide__actions"><span>${t("demo.drawer.decisionCancel")}</span><strong>${t("demo.drawer.decisionConfirm")}</strong></div></div></dialog>`
    : `<div class="drawer-guide__decision"><strong>${t("demo.drawer.decisionTitle")}</strong><p>${t("demo.drawer.decisionBody")}</p><div class="drawer-guide__actions"><span>${t("demo.drawer.decisionCancel")}</span><strong>${t("demo.drawer.decisionConfirm")}</strong></div></div>`}
</div>`;

/** Opening is a call, never markup: the same escape hatch the dialog and the palette use. */
export { default as drawerScript } from "./scripts/drawer-open.ts?raw";

/*
 * A drawer is `Vaul.drawer`: the same root and handle as any Vaul, with `sk-drawer` added to the
 * root for the side-sheet paint. Drawn with `vaulAnatomyCss`, which pulls the fixed edge panel back
 * into flow and keeps the handle visible.
 */
export const drawerAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("drawer.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "vaul",
      signature: "Vaul.drawer",
      options: { edge: "inline-start", open: true, label: t("drawer.anatomyPanelLabel") },
      children: [
        {
          contract: "typography",
          signature: "Heading",
          options: { headingSize: "h4", flush: true },
          children: t("drawer.anatomyTitle"),
        },
        {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: t("drawer.anatomyBodyText"),
        },
      ],
    },
    items: [
      namePart(".sk-drawer", "block-start", { mark: "bracket" }),
      namePart(".sk-vaul__handle", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});
