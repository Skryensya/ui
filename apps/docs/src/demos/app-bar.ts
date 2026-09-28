import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyFigureHtml } from "./annotation-parts";

/*
 * THE ANATOMY SPECIMEN: frozen markup with one menu open, the same reason Menubar's is frozen (a
 * live dropdown closes on the first press in an inert frame). No mount attributes; the open popup is
 * Menu's own positioner/content, placed statically by `appBarAnatomyCss` so Annotated can measure it.
 */
const appBarAnatomySpecimen = (t: Translate): string => `<div class="sk-app-bar">
  <div class="sk-app-bar__menus" role="menubar" aria-label="${t("demo.appBar.app")}">
    <div class="sk-app-bar__menu sk-menu" data-strong>
      <button class="sk-app-bar__trigger sk-interactive sk-anchor" type="button" role="menuitem" tabindex="-1">${t("demo.appBar.app")}</button>
    </div>
    <div class="sk-app-bar__menu sk-menu">
      <button class="sk-app-bar__trigger sk-interactive sk-anchor" type="button" role="menuitem" aria-haspopup="menu" aria-expanded="true" tabindex="-1">${t("demo.appBar.file")}</button>
      <div class="sk-app-bar__dropdown sk-menu__positioner sk-anchored">
        <div class="sk-menu__content" data-state="open" role="menu">
          <div class="sk-menu__item sk-interactive" role="menuitem"><span class="sk-menu__item-label">${t("demo.appBar.new")}</span></div>
          <div class="sk-menu__item sk-interactive" role="menuitem"><span class="sk-menu__item-label">${t("demo.appBar.open")}</span></div>
        </div>
      </div>
    </div>
    <div class="sk-app-bar__menu sk-menu">
      <button class="sk-app-bar__trigger sk-interactive sk-anchor" type="button" role="menuitem" tabindex="-1">${t("demo.appBar.view")}</button>
    </div>
  </div>
  <div class="sk-app-bar__status">
    <div class="sk-app-bar__status-item sk-menu"><span class="sk-app-bar__status-text">${t("demo.appBar.saved")}</span></div>
    <div class="sk-app-bar__status-item sk-menu">
      <button class="sk-app-bar__trigger sk-interactive sk-anchor" type="button" aria-haspopup="menu" aria-expanded="false">72rem</button>
    </div>
  </div>
</div>`;

export const appBarAnatomyHtml = (t: Translate): string =>
  anatomyFigureHtml(t, {
    label: t("appBarPage.anatomyLabel"),
    specimen: appBarAnatomySpecimen(t),
    parts: [
      { for: ".sk-app-bar", side: "block-start", mark: "bracket", ringPlacement: "offset", ringDistance: 8 },
      { for: ".sk-app-bar__menus", side: "block-start" },
      { for: ".sk-app-bar__menu", side: "inline-start" },
      { for: ".sk-app-bar__trigger", side: "block-start", ringPlacement: "offset", ringDistance: 2 },
      { for: ".sk-menu__content", side: "inline-start" },
      { for: ".sk-app-bar__status", side: "block-end" },
      { for: ".sk-app-bar__status-item", side: "inline-end" },
    ],
  });

export const appBarAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject > .sk-app-bar {
  inline-size: 34rem;
  align-items: flex-start;
}

.sk-annotated .sk-app-bar__menu {
  display: inline-grid;
  justify-items: start;
  gap: var(--space-stack-xs);
}

.sk-annotated .sk-app-bar__menu > .sk-menu__positioner {
  position: static;
  inline-size: max-content;
}

.sk-annotated .sk-menu__content {
  min-inline-size: 8rem;
}`;

const item = (value: string, label: string): ItemInput => ({ options: { value }, slots: { label } });
const separator = (value: string): ItemInput => ({ options: { value, kind: "separator" }, slots: {} });
const radio = (value: string, label: string): ItemInput => ({ options: { value, kind: "radio", group: "width" }, slots: { label } });

const menu = (label: string, items?: readonly ItemInput[], strong = false): UsageTree => ({
  contract: "app-bar",
  signature: "AppBarMenu",
  ...(strong ? { options: { strong: true } } : {}),
  children: label,
  ...(items ? { slots: { items } } : {}),
});

const status = (label: string, items?: readonly ItemInput[]): UsageTree => ({
  contract: "app-bar",
  signature: "AppBarStatus",
  children: label,
  ...(items ? { slots: { items } } : {}),
});

/*
 * A desktop application's bar: its own menu in bold, File with a submenu, Edit, View, and Help as a
 * plain command; on the trailing side "Saved" (text, not a control), the stage width as a small menu
 * of radio items, and a clock. The same shapes Maker's own bar uses.
 */
export const appBarTree = (t: Translate): UsageTree => ({
  contract: "app-bar",
  signature: "AppBar",
  options: { label: t("demo.appBar.app") },
  children: [
    menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about")), separator("sep"), item("settings", t("demo.appBar.settings"))], true),
    menu(t("demo.appBar.file"), [
      item("new", t("demo.appBar.new")),
      item("open", t("demo.appBar.open")),
      separator("sep"),
      { options: { value: "export" }, slots: { label: t("demo.appBar.export"), children: [item("html", "HTML"), item("react", "React")] } },
    ]),
    menu(t("demo.appBar.edit"), [item("undo", t("demo.appBar.undo")), item("redo", t("demo.appBar.redo"))]),
    menu(t("demo.appBar.view"), [item("zoom-in", t("demo.appBar.zoomIn")), item("zoom-out", t("demo.appBar.zoomOut"))]),
    menu(t("demo.appBar.help")),
  ],
  slots: {
    status: [
      status(t("demo.appBar.saved")),
      status("72rem", [radio("36", "36rem"), radio("52", "52rem"), radio("72", "72rem"), radio("90", "90rem")]),
      status("14:02"),
    ],
  },
});

/* The smallest bar worth drawing: a name and two menus, nothing on the trailing side. */
export const appBarMinimalTree = (t: Translate): UsageTree => ({
  contract: "app-bar",
  signature: "AppBar",
  options: { label: t("demo.appBar.app") },
  children: [
    menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about"))], true),
    menu(t("demo.appBar.file"), [item("new", t("demo.appBar.new")), item("open", t("demo.appBar.open"))]),
    menu(t("demo.appBar.help")),
  ],
});
