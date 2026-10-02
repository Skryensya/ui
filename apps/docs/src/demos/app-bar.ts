import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const item = (value: string, label: string): ItemInput => ({ options: { value }, slots: { label } });

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
 * of actions that change it, and a clock. Actions only, everywhere: the bar allows nothing else.
 */
export const appBarTree = (t: Translate): UsageTree => ({
  contract: "app-bar",
  signature: "AppBar",
  options: { label: t("demo.appBar.app") },
  children: [
    menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about")), item("settings", t("demo.appBar.settings"))], true),
    menu(t("demo.appBar.file"), [
      item("new", t("demo.appBar.new")),
      item("open", t("demo.appBar.open")),
      /* Three levels: File, then Export, then React. Nested submenus are Menu's own, at any depth. */
      {
        options: { value: "export" },
        slots: {
          label: t("demo.appBar.export"),
          children: [item("html", "HTML"), { options: { value: "react" }, slots: { label: "React", children: [item("tsx", "TSX"), item("jsx", "JSX")] } }],
        },
      },
    ]),
    menu(t("demo.appBar.edit"), [item("undo", t("demo.appBar.undo")), item("redo", t("demo.appBar.redo"))]),
    menu(t("demo.appBar.view"), [item("zoom-in", t("demo.appBar.zoomIn")), item("zoom-out", t("demo.appBar.zoomOut"))]),
    menu(t("demo.appBar.help")),
  ],
  slots: {
    status: [
      status(t("demo.appBar.saved")),
      status("72rem", [item("36", "36rem"), item("52", "52rem"), item("72", "72rem"), item("90", "90rem")]),
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

/*
 * USAGE GUIDE PAIRS. Each is a small bar that differs from its twin in the one thing the pair is
 * about: how long the status is, which menu is bold, how long the titles are.
 */
const bar = (t: Translate, menus: readonly UsageTree[], statuses: readonly UsageTree[] = []): UsageTree => ({
  contract: "app-bar",
  signature: "AppBar",
  options: { label: t("demo.appBar.app") },
  children: [...menus],
  ...(statuses.length > 0 ? { slots: { status: [...statuses] } } : {}),
});

const workMenus = (t: Translate): UsageTree[] => [
  menu(t("demo.appBar.file"), [item("new", t("demo.appBar.new"))]),
  menu(t("demo.appBar.edit"), [item("undo", t("demo.appBar.undo"))]),
];

export const appBarDoShortStatusTree = (t: Translate): UsageTree =>
  bar(t, [menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about"))], true), ...workMenus(t)], [
    status(t("demo.appBar.saved")),
    status("14:02"),
  ]);

export const appBarDontLongStatusTree = (t: Translate): UsageTree =>
  bar(t, [menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about"))], true), ...workMenus(t)], [
    status(t("demo.appBar.savedLong")),
  ]);

export const appBarDoAppMenuTree = (t: Translate): UsageTree =>
  bar(t, [menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about"))], true), ...workMenus(t)]);

export const appBarDontNoAppMenuTree = (t: Translate): UsageTree =>
  bar(t, [
    menu(t("demo.appBar.file"), [item("new", t("demo.appBar.new"))], true),
    menu(t("demo.appBar.edit"), [item("undo", t("demo.appBar.undo"))], true),
    menu(t("demo.appBar.view"), [item("zoom-in", t("demo.appBar.zoomIn"))], true),
  ]);

export const appBarDoShortTitlesTree = (t: Translate): UsageTree =>
  bar(t, [
    menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about"))], true),
    ...workMenus(t),
    menu(t("demo.appBar.view"), [item("zoom-in", t("demo.appBar.zoomIn"))]),
  ]);

export const appBarDontLongTitlesTree = (t: Translate): UsageTree =>
  bar(t, [
    menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about"))], true),
    menu(t("demo.appBar.fileLong"), [item("new", t("demo.appBar.new"))]),
    menu(t("demo.appBar.editLong"), [item("undo", t("demo.appBar.undo"))]),
  ]);

/*
 * FROZEN OPEN-DROPDOWN SPECIMENS. `AppBarMenu` is interactive and starts closed in a usage tree;
 * these are inert HTML specimens, like the anatomy drawing, so readers can compare the contents
 * without a menu machine opening or repositioning the popup during the preview.
 */
const appBarDropdownSpecimen = (t: Translate, items: string): string => `<div class="sk-app-bar" style="inline-size: 20rem; max-inline-size: 100%; min-block-size: 12rem; align-items: flex-start;">
  <div class="sk-app-bar__menus" role="menubar" aria-label="${t("demo.appBar.app")}" style="align-items: flex-start;">
    <div class="sk-app-bar__menu sk-menu" data-strong style="display: grid; align-content: start;">
      <button class="sk-app-bar__trigger sk-interactive sk-anchor" type="button" role="menuitem">${t("demo.appBar.app")}</button>
    </div>
    <div class="sk-app-bar__menu sk-menu" style="display: grid; align-content: start;">
      <button class="sk-app-bar__trigger sk-interactive sk-anchor" type="button" role="menuitem" aria-haspopup="menu" aria-expanded="true">${t("demo.appBar.file")}<span class="sk-app-bar__indicator" aria-hidden="true"><span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span></span></button>
      <div class="sk-app-bar__dropdown sk-menu__positioner" style="position: static; inset: auto; inline-size: max-content;">
        <div class="sk-menu__content" data-state="open" role="menu">${items}</div>
      </div>
    </div>
  </div>
</div>`;

export const appBarDoDropdownHtml = (t: Translate): string => appBarDropdownSpecimen(t, `
  <div class="sk-menu__item sk-interactive" role="menuitem"><span class="sk-menu__item-label">${t("demo.appBar.new")}</span></div>
  <div class="sk-menu__item sk-interactive" role="menuitem"><span class="sk-menu__item-label">${t("demo.appBar.open")}</span></div>
  <div class="sk-menu__item sk-interactive" role="menuitem"><span class="sk-menu__item-label">${t("demo.appBar.export")}</span></div>`);

export const appBarDontDropdownHtml = (t: Translate): string => appBarDropdownSpecimen(t, `
  <div class="sk-menu__item sk-interactive" role="menuitemcheckbox" aria-checked="true"><span class="sk-menu__item-label">${t("demo.appBar.showGrid")}</span><span class="sk-menu__item-indicator" data-state="checked" aria-hidden="true"><span data-sk-icon="check" data-sk-icon-size="sm"></span></span></div>
  <div class="sk-menu__item sk-interactive" role="menuitemcheckbox" aria-checked="false"><span class="sk-menu__item-label">${t("demo.appBar.snapToGrid")}</span><span class="sk-menu__item-indicator" aria-hidden="true"><span data-sk-icon="check" data-sk-icon-size="sm"></span></span></div>`);

/** The same commands as `menubarCompareTree` (`demos/menubar.ts`), drawn as an app bar: the name, then the words. */
export const appBarCompareTree = (t: Translate): UsageTree => ({
  contract: "app-bar",
  signature: "AppBar",
  options: { label: t("demo.appBar.app") },
  children: [
    menu(t("demo.appBar.app"), [item("about", t("demo.appBar.about"))], true),
    menu(t("demo.appBar.file"), [item("new", t("demo.appBar.new")), item("open", t("demo.appBar.open"))]),
    menu(t("demo.appBar.edit"), [item("undo", t("demo.appBar.undo")), item("redo", t("demo.appBar.redo"))]),
    menu(t("demo.appBar.view"), [item("zoom-in", t("demo.appBar.zoomIn")), item("zoom-out", t("demo.appBar.zoomOut"))]),
  ],
  slots: { status: [status(t("demo.appBar.saved"))] },
});
