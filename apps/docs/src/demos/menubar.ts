import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * `menubar-editor`, the WAI-ARIA APG example this pattern is named after: File/Edit, each opening
 * one level of commands. `MenubarItem`'s own label is its `children` slot (text); the dropdown
 * itself is a SEPARATE slot, `items`. The contract's own vocabulary, distinct from the React
 * binding's `label`/`children` split (documented in `menubar.ts`'s own file banner).
 *
 * `items` is `Menu`'s own item shape verbatim (`menu.ts`'s `menuItemShape`), an `ItemInput[]`, NOT
 * a nested `UsageTree`: `MenubarMenu`/`MenubarMenuItem`, the hand-rolled signatures this demo used
 * to build with, are gone from the contract (see the header comment on `packages/core/src/
 * menubar.ts`. A dropdown IS a real `Menu` popup now, not a second description of one).
 */
const dropdownItem = (value: string, label: string): ItemInput => ({
  options: { value },
  slots: { label },
});

/** A dropdown entry that navigates instead of firing a command: `menuItemShape`'s own `href`
 *  (`menu.ts`), a real `<a>` in the rendered dropdown. */
const navDropdownItem = (value: string, label: string, href: string): ItemInput => ({
  options: { value, href },
  slots: { label },
});

/*
 * A SUBMENU standing where a dropdown item would: `children` is the same recursive collection
 * slot `menuItemShape` declares (`menu.ts`'s own `children: { accepts: "items", recursive: true }`),
 * so this is not special MENUBAR machinery. A bar item's dropdown is a real `Menu` popup, and
 * arbitrarily nested submenus are `Menu`'s own feature, inherited for free (see `menubar.ts`'s file
 * banner and the `menubarPage.contractBody` copy: the bar's OWN hand-rolled behaviour stops at one
 * level of DROPDOWN per top-level item; a dropdown's own CONTENTS nest exactly as deep as `Menu`'s
 * already do).
 */
const submenuItem = (value: string, label: string, children: readonly ItemInput[]): ItemInput => ({
  options: { value },
  slots: { label, children },
});

/*
 * `Menubar.children` accepts SIGNATURE nodes, of `MenubarItem` (a real UsageTree, per the
 * contract's `slots.children`), unlike `MenubarItem.items` below it, which accepts the flat
 * `ItemInput[]` array `dropdownItem` builds. One level down, one shape down. `MenubarItem`
 * declares no options of its own (`options: []`). Only `children` (its label, text) and `items`
 * (its dropdown, optional).
 */
const topItem = (label: string, items?: readonly ItemInput[]): UsageTree => ({
  contract: "menubar",
  signature: "MenubarItem",
  children: label,
  ...(items ? { slots: { items } } : {}),
});

export const menubarTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: [
    topItem(t("demo.menubar.file"), [
      dropdownItem("new", t("demo.menubar.new")),
      dropdownItem("open", t("demo.menubar.open")),
      dropdownItem("save", t("demo.menubar.save")),
    ]),
    topItem(t("demo.menubar.edit"), [
      dropdownItem("undo", t("demo.menubar.undo")),
      dropdownItem("redo", t("demo.menubar.redo")),
    ]),
  ],
});

export const menubarSubmenuTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: [
    topItem(t("demo.menubar.file"), [
      dropdownItem("new", t("demo.menubar.new")),
      dropdownItem("open", t("demo.menubar.open")),
      dropdownItem("save", t("demo.menubar.save")),
      submenuItem("export", t("demo.menubar.export"), [
        dropdownItem("pdf", t("demo.menubar.pdf")),
        dropdownItem("csv", t("demo.menubar.csv")),
      ]),
      dropdownItem("print", t("demo.menubar.print")),
    ]),
    topItem(t("demo.menubar.edit"), [
      dropdownItem("undo", t("demo.menubar.undo")),
      dropdownItem("redo", t("demo.menubar.redo")),
    ]),
  ],
});


/* Don't: a bar with one entry, which is a single menu button dressed as an application bar. */
export const menubarDontSingleTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: [
    topItem(t("demo.menubar.file"), [
      dropdownItem("new", t("demo.menubar.new")),
      dropdownItem("open", t("demo.menubar.open")),
      dropdownItem("save", t("demo.menubar.save")),
    ]),
  ],
});

/** A bar that mixes a dropdown with a plain command: an entry with no `items` runs directly. */
export const menubarCommandTree = (t: Translate): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: [
    topItem(t("demo.menubar.file"), [
      dropdownItem("new", t("demo.menubar.new")),
      dropdownItem("open", t("demo.menubar.open")),
      dropdownItem("save", t("demo.menubar.save")),
    ]),
    topItem(t("demo.menubar.edit"), [
      dropdownItem("undo", t("demo.menubar.undo")),
      dropdownItem("redo", t("demo.menubar.redo")),
    ]),
    topItem(t("demo.menubar.help")),
  ],
});

/*
 * USAGE GUIDE, drawn as an application window: a bordered frame with the bar along its top edge and
 * the document area under it, so the bar reads as a menu bar and not as three loose buttons. A live
 * Menubar opens only on interaction, so these are frozen HTML with the dropdown drawn open, the same
 * device AppBar's and Menu's guides use. `nowrap` and `flex: none` on every entry are what a real bar
 * does, and what makes a long label cost the entries after it their room.
 */
const chevron = `<span aria-hidden="true"><span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span></span>`;
const row = (label: string): string =>
  `<div class="sk-menu__item sk-interactive" role="menuitem"><span class="sk-menu__item-label">${label}</span></div>`;

/** One bar entry; with `rows` its dropdown is drawn open beneath it. The button hugs its own text. */
const barEntry = (label: string, rows?: string): string => `<div class="sk-menubar__item-wrapper sk-menu" style="position: relative; flex: none;">
  <button class="sk-menubar__item sk-button sk-interactive sk-anchor" type="button" role="menuitem" aria-haspopup="menu" aria-expanded="${rows ? "true" : "false"}" data-variant="ghost" data-size="sm" style="white-space: nowrap;">${label}${chevron}</button>
  ${rows ? `<div class="sk-menu__positioner sk-anchored" style="position: absolute; inset: 100% auto auto 0; margin-block-start: var(--space-stack-xs); inline-size: max-content; z-index: 1;"><div class="sk-menu__content" data-state="open" role="menu">${rows}</div></div>` : ""}
</div>`;

/** The window: `clip` cuts what overflows the row (a long bar), otherwise an open dropdown hangs out below. */
const windowHtml = (t: Translate, entries: string, clip: boolean): string => `<div style="inline-size: 100%; border: 1px solid var(--color-border-default); border-radius: var(--radius-control); background: var(--color-bg-surface); ${clip ? "overflow: hidden;" : "min-block-size: 11.5rem;"}">
  <div class="sk-menubar" role="menubar" aria-label="${t("demo.menubar.label")}" style="flex-wrap: nowrap; align-items: flex-start; ${clip ? "overflow: hidden;" : ""}">${entries}</div>
  ${clip ? `<div aria-hidden="true" style="block-size: 4.5rem; border-block-start: 1px solid var(--color-border-subtle);"></div>` : ""}
</div>`;

const shortLabels = (t: Translate): string[] => [t("demo.menubar.file"), t("demo.menubar.edit"), t("demo.menubar.view")];
const longLabels = (t: Translate): string[] => [
  t("demo.menubar.longFile"),
  t("demo.menubar.longEdit"),
  t("demo.menubar.longView"),
  t("demo.menubar.longHelp"),
];

export const menubarDoShortLabelsHtml = (t: Translate): string => windowHtml(t, shortLabels(t).map((label) => barEntry(label)).join(""), true);

export const menubarDontLongLabelsHtml = (t: Translate): string => windowHtml(t, longLabels(t).map((label) => barEntry(label)).join(""), true);

export const menubarDoCommandsHtml = (t: Translate): string =>
  windowHtml(
    t,
    barEntry(t("demo.menubar.file"), row(t("demo.menubar.new")) + row(t("demo.menubar.open")) + row(t("demo.menubar.save"))) +
      barEntry(t("demo.menubar.edit")),
    false,
  );

export const menubarDontDestinationsHtml = (t: Translate): string =>
  windowHtml(
    t,
    barEntry(t("demo.menubar.file"), row(t("demo.marquee.link.pricing")) + row(t("demo.marquee.link.docs")) + row(t("demo.marquee.link.blog"))) +
      barEntry(t("demo.menubar.edit")),
    false,
  );

/*
 * WHAT A DROPDOWN CAN HOLD. A dropdown is a real Menu, so its `items` take Menu's whole item shape,
 * not only plain commands: checkboxes and radios that keep their own state, separators that group
 * rows, a disabled row, a destructive one (`tone: "danger"`) and a row that is a real link (`href`).
 * Each function is one entry's rows; the trees below put them in a bar.
 */
const separator = (value: string): ItemInput => ({ options: { value, kind: "separator" }, slots: {} });

const fileItems = (t: Translate): readonly ItemInput[] => [
  dropdownItem("new", t("demo.menubar.new")),
  dropdownItem("open", t("demo.menubar.open")),
  dropdownItem("save", t("demo.menubar.save")),
  submenuItem("export", t("demo.menubar.export"), [
    dropdownItem("pdf", t("demo.menubar.pdf")),
    dropdownItem("csv", t("demo.menubar.csv")),
  ]),
  separator("file-end"),
  dropdownItem("print", t("demo.menubar.print")),
];

/** Rows that are on or off, and one set of which-one: state the menu keeps for you. */
const viewItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "ruler", kind: "checkbox" }, slots: { label: t("demo.menubar.ruler") } },
  { options: { value: "grid", kind: "checkbox" }, slots: { label: t("demo.menubar.grid") } },
  separator("view-zoom"),
  { options: { value: "zoom-100", kind: "radio", group: "zoom" }, slots: { label: "100%" } },
  { options: { value: "zoom-150", kind: "radio", group: "zoom" }, slots: { label: "150%" } },
  { options: { value: "zoom-200", kind: "radio", group: "zoom" }, slots: { label: "200%" } },
];

/** A disabled row (nothing to paste), a separator before the destructive one, which takes the danger tone. */
const editItems = (t: Translate): readonly ItemInput[] => [
  dropdownItem("undo", t("demo.menubar.undo")),
  dropdownItem("redo", t("demo.menubar.redo")),
  separator("edit-clipboard"),
  dropdownItem("cut", t("demo.menubar.cut")),
  dropdownItem("copy", t("demo.menubar.copy")),
  { options: { value: "paste", disabled: true }, slots: { label: t("demo.menubar.paste") } },
  separator("edit-danger"),
  { options: { value: "delete", tone: "danger" }, slots: { label: t("demo.menubar.delete") } },
];

/** Help is the one place a row is a link: it leaves the application for its documentation. */
const helpItems = (t: Translate): readonly ItemInput[] => [
  navDropdownItem("docs", t("demo.menubar.docs"), "/docs"),
  navDropdownItem("shortcuts", t("demo.menubar.shortcuts"), "/docs/shortcuts"),
  navDropdownItem("report", t("demo.menubar.report"), "/docs/report"),
];

const bar = (t: Translate, entries: UsageTree[]): UsageTree => ({
  contract: "menubar",
  signature: "Menubar",
  options: { label: t("demo.menubar.label") },
  children: entries,
});

/**
 * ONE DROPDOWN WITH EVERY KIND OF ROW, so the point is seen at once instead of one kind per toggle:
 * checkboxes, a radio set, separators between the groups, a disabled row, a danger row and a link.
 * `menubarRowsLegend` names them in the same order.
 */
const rowsItems = (t: Translate): readonly ItemInput[] => [
  { options: { value: "ruler", kind: "checkbox" }, slots: { label: t("demo.menubar.ruler") } },
  { options: { value: "grid", kind: "checkbox" }, slots: { label: t("demo.menubar.grid") } },
  separator("rows-zoom"),
  { options: { value: "zoom-100", kind: "radio", group: "zoom" }, slots: { label: "100%" } },
  { options: { value: "zoom-150", kind: "radio", group: "zoom" }, slots: { label: "150%" } },
  separator("rows-actions"),
  { options: { value: "reset", disabled: true }, slots: { label: t("demo.menubar.reset") } },
  { options: { value: "clear", tone: "danger" }, slots: { label: t("demo.menubar.clear") } },
  separator("rows-help"),
  navDropdownItem("help", t("demo.menubar.viewHelp"), "/docs/view"),
];

export const menubarRowsTree = (t: Translate): UsageTree =>
  bar(t, [topItem(t("demo.menubar.file"), fileItems(t).slice(0, 3)), topItem(t("demo.menubar.view"), rowsItems(t))]);

/** The whole thing, as an editor ships it: four entries, a submenu, state, a danger row and links. */
export const menubarEditorTree = (t: Translate): UsageTree =>
  bar(t, [
    topItem(t("demo.menubar.file"), fileItems(t)),
    topItem(t("demo.menubar.edit"), editItems(t)),
    topItem(t("demo.menubar.view"), viewItems(t)),
    topItem(t("demo.menubar.help"), helpItems(t)),
  ]);

/**
 * THE SAME COMMANDS IN A MENUBAR AND IN AN APP BAR (`appBarCompareTree`), so the page can put the two
 * side by side and the only thing that changes is the component. Plain commands only, the one kind of
 * row both accept.
 */
export const menubarCompareTree = (t: Translate): UsageTree =>
  bar(t, [
    topItem(t("demo.menubar.file"), [dropdownItem("new", t("demo.menubar.new")), dropdownItem("open", t("demo.menubar.open"))]),
    topItem(t("demo.menubar.edit"), [dropdownItem("undo", t("demo.menubar.undo")), dropdownItem("redo", t("demo.menubar.redo"))]),
    topItem(t("demo.menubar.view"), [dropdownItem("zoom-in", t("demo.appBar.zoomIn")), dropdownItem("zoom-out", t("demo.appBar.zoomOut"))]),
  ]);
