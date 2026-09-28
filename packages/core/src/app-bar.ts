import type { ComponentContract, ContractTemplate } from "./contract.js";
import { menuAttrs, menuItemShape, menuParts, menuPopupTemplatePortable } from "./menu.js";

/*
 * APP BAR. The thin bar across the top of an application, the way a desktop OS draws one: the
 * application's menus on the leading side (its own name first, in bold), a few words of state on the
 * trailing side ("Saved", "72rem", a clock), all of it text, all of it one short line.
 *
 * WHY NOT MENUBAR. Menubar is the general APG widget: its items are real Buttons (`ghost`/`sm`, a
 * chevron on every dropdown), because it sits in a page among other controls and has to read as one.
 * An app bar is chrome, not content: an item is a word, it has no box until it is open, and a
 * dropdown says so by opening, not by a chevron. It also has a second region Menubar has no notion of:
 * status on the trailing side, some of it plain text and some of it a menu of its own. Bending
 * Menubar into that would have meant an option that swaps its whole look and a slot only one of its
 * uses wants, so the two stay separate widgets that share only what is genuinely the same thing.
 *
 * WHAT IS SHARED. Every dropdown here is a real `Menu`: the wrapper is a `[data-sk-menu]` root, the
 * trigger carries `data-sk-menu-trigger`, and the popup is `menuPopupTemplatePortable`, so items and
 * nested submenus are Menu's own, in both bindings. What the bar narrows is WHICH items: actions
 * only (`appBarItemShape` below), never a checkbox, a radio or a separator. What the app bar
 * owns is the BAR: one tab stop across its menus, Left/Right between them (opening the neighbour when
 * one was open), and the desktop habit that once one menu is open, pointing at another opens it.
 *
 * TWO REGIONS, TWO ROLES. The menus are a `role="menubar"`, named by `label`. The status region is
 * NOT: a menubar may only hold menu items, and "Saved" is not one. It is a plain row; its menu items
 * are ordinary menu buttons (`aria-haspopup`), each its own tab stop, which is what they are.
 */
export const appBarParts = {
  root: "sk-app-bar",
  menus: "sk-app-bar__menus",
  menu: "sk-app-bar__menu",
  trigger: "sk-app-bar__trigger",
  status: "sk-app-bar__status",
  statusItem: "sk-app-bar__status-item",
  statusText: "sk-app-bar__status-text",
  /** The small chevron on a title that opens something. Absent on a plain command or plain text. */
  indicator: "sk-app-bar__indicator",
  /** Menu's own positioner, marked as the bar's, so the bar can tighten its rows even where React
   *  has portalled it out of the bar. */
  dropdown: "sk-app-bar__dropdown",
} as const;

export type AppBarPart = keyof typeof appBarParts;
export type AppBarPartClass = (typeof appBarParts)[AppBarPart];

export const appBarAttrs = {
  root: "data-sk-app-bar",
  /** Every trigger in the bar, menus and status alike: the set pointing-to-switch works over. */
  trigger: "data-sk-app-bar-trigger",
  /** Only the menus' triggers: the roving set Left/Right move through. */
  menuTrigger: "data-sk-app-bar-menu",
} as const;

/*
 * ONLY ACTIONS. A bar item's dropdown is Menu's item shape minus everything that makes it a control
 * rather than a command: no `kind` (so no checkbox, no radio, and no separator either) and no `group`
 * (which exists only to pair radios). What stays is what an action is: a value, a label, a
 * destination when it navigates, `disabled` when it is unavailable now, `tone` when it destroys, and
 * `children` for a second or third level of the same. Settings belong in the application, not in its
 * bar; a desktop bar that toggles and chooses is a settings panel folded into menus.
 */
const { kind: _kind, group: _group, ...actionOptions } = menuItemShape.options;
export const appBarItemShape = { ...menuItemShape, options: actionOptions } as const;

/**
 * Menu's popup with every node and condition that exists only for `kind` taken out: the checkbox and
 * radio indicator, the separator, and the "not a separator" test on a command. Derived rather than
 * written again, so the bar's popup stays Menu's in everything else (the item, the link, the nested
 * submenu) and follows it when it changes; and the template names no item option the shape lacks.
 */
function actionsOnly(node: ContractTemplate): ContractTemplate | undefined {
  if (node.whenItemGiven === "kind" || node.whenItemEquals?.option === "kind") return undefined;
  const { whenItemNotEquals, itemOptions, children, ...rest } = node;
  const kept = children?.map(actionsOnly).filter((child): child is ContractTemplate => child !== undefined);
  return {
    ...rest,
    ...(whenItemNotEquals && whenItemNotEquals.option !== "kind" ? { whenItemNotEquals } : {}),
    ...(itemOptions ? { itemOptions: itemOptions.filter((name) => name in actionOptions) } : {}),
    ...(kept ? { children: kept } : {}),
  };
}

/*
 * Menu's popup, as the bar's: actions only, its own part class, and the compact density written on
 * the positioner itself as well as on the wrapper. React portals the positioner and has to re-stamp
 * the density there; saying it in the template too keeps the two bindings' DOM the same.
 */
const appBarDropdown = {
  ...actionsOnly(menuPopupTemplatePortable)!,
  part: "dropdown",
  attrs: { ...menuPopupTemplatePortable.attrs, "data-density": "compact" },
  whenGiven: "items",
} as const;

export const appBarContract = {
  id: "app-bar",
  category: "actions",
  css: "@skryensya/core/components/app-bar.css",
  parts: appBarParts,
  hooks: [
    "--sk-anchored-align",
    "--sk-anchored-arrow-edge",
    "--sk-anchored-arrow-near",
    "--sk-anchored-justify",
    "--sk-anchored-offset",
    "--sk-anchored-position-area",
    "--sk-anchored-position-try",
    "--sk-anchored-size",
    "--sk-anchored-z",
    "--sk-app-bar-bg",
    "--sk-app-bar-block-size",
    "--sk-app-bar-border-color",
    "--sk-app-bar-dropdown-padding-block",
    "--sk-app-bar-fg",
    "--sk-app-bar-font-size",
    "--sk-app-bar-gap",
    "--sk-app-bar-item-open-bg",
    "--sk-app-bar-item-open-fg",
    "--sk-app-bar-item-open-indicator",
    "--sk-app-bar-menu-item-block-size",
    "--sk-app-bar-menu-item-padding-block",
    "--sk-app-bar-item-padding-inline",
    "--sk-app-bar-item-radius",
    "--sk-app-bar-muted-fg",
  ],
  /* Same reason as Menubar: the dropdowns embed Menu's portable popup (`sk-anchor`/`sk-anchored`),
     classes no contract owns uniquely, so the sheet that paints them is named here. */
  hookSheets: ["@skryensya/core/patterns/anchored.css"],

  options: {
    /** The menus' accessible name, usually the application's. `role="menubar"` carries none. */
    label: { type: "string", attr: "aria-label" },
    /**
     * The application's own menu, drawn in bold the way a desktop OS draws the frontmost app's name.
     * A look, not a role: it is a menu like its neighbours.
     */
    strong: { type: "boolean", default: false, attr: "data-strong", trueValue: "" },
  },

  signatures: {
    AppBar: {
      intent: ["application-bar", "app-menu-bar", "desktop-style-top-bar", "editor-top-bar"],
      host: { element: "div" },
      options: ["label"],
      requires: ["label"],
      forward: ["id", "aria-*"],
      slots: {
        children: { accepts: "signature", required: true, of: ["AppBarMenu"] },
        status: { accepts: "signature", of: ["AppBarStatus"] },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "menus",
            attrs: { role: "menubar" },
            /* The name belongs to the element that IS the menubar, not to the bar around it. */
            options: ["label"],
            slot: "children",
          },
          { element: "div", part: "status", whenGiven: "status", slot: "status" },
        ],
      },
      mount: appBarAttrs.root,
      react: { from: "@skryensya/react/app-bar", name: "AppBar" },
    },

    /*
     * One menu title. With `items` (actions only: `appBarItemShape`) it opens a dropdown; without,
     * it is a command that acts at once. Either way it is a `menuitem` of the menubar, WAI's own
     * vocabulary for both shapes of a top-level item.
     */
    AppBarMenu: {
      compose: [
        {
          of: "menu",
          sheets: ["@skryensya/core/components/menu.css", "@skryensya/core/patterns/anchored.css"],
          systemOwned: true,
        },
      ],
      intent: ["app-bar-menu", "app-bar-command"],
      /* A wrapper, not the button: the popup is full of its own menuitems and cannot sit inside a
         `<button>`, so trigger and popup are siblings under one root, which is also Menu's root. */
      host: { element: "div" },
      options: ["strong"],
      parents: ["AppBar"],
      portals: { container: true },
      slots: {
        children: { accepts: "text", required: true },
        items: { accepts: "items", item: appBarItemShape },
      },
      template: {
        element: "div",
        part: "menu",
        /* `sk-menu` declares the popup's custom properties; without it the dropdown is structurally
           right and visually blank. */
        also: [menuParts.root],
        /* A desktop menu is dense: every dropdown of the bar is Menu's compact density, fixed rather
           than an option, because a roomy row is not what this bar is for. */
        attrs: { "data-density": "compact" },
        host: true,
        mount: menuAttrs.root,
        children: [
          {
            element: "button",
            part: "trigger",
            /* `sk-anchor`: what the popup measures itself against. No `sk-button`: a title is a word
               until it is open, and app-bar.css draws the one state it has. */
            also: ["sk-interactive", "sk-anchor"],
            attrs: {
              type: "button",
              role: "menuitem",
              [menuAttrs.trigger]: "",
              [appBarAttrs.trigger]: "",
              [appBarAttrs.menuTrigger]: "",
            },
            slot: "children",
            /* A small chevron on a title that opens something, none on a plain command: it would
               promise a list that never comes. app-bar.css turns it while the list is open. */
            children: [
              {
                element: "span",
                part: "indicator",
                attrs: { "aria-hidden": "true" },
                whenGiven: "items",
                children: [{ element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "sm" } }],
              },
            ],
          },
          appBarDropdown,
        ],
      },
      react: { from: "@skryensya/react/app-bar", name: "AppBarMenu" },
    },

    /*
     * One piece of status on the trailing side. Without `items` it is text and nothing else: not
     * focusable, not a button, because there is nothing to do with it. With `items` it is a menu
     * button whose label is that text, the way a desktop status item opens its own small menu.
     */
    AppBarStatus: {
      compose: [
        {
          of: "menu",
          sheets: ["@skryensya/core/components/menu.css", "@skryensya/core/patterns/anchored.css"],
          systemOwned: true,
        },
      ],
      intent: ["app-bar-status", "app-bar-status-menu"],
      host: { element: "div" },
      options: [],
      parents: ["AppBar"],
      portals: { container: true },
      slots: {
        children: { accepts: "text", required: true },
        items: { accepts: "items", item: appBarItemShape },
      },
      template: {
        element: "div",
        part: "statusItem",
        also: [menuParts.root],
        attrs: { "data-density": "compact" },
        host: true,
        mount: menuAttrs.root,
        children: [
          { element: "span", part: "statusText", slot: "children", whenMissing: "items" },
          {
            element: "button",
            part: "trigger",
            also: ["sk-interactive", "sk-anchor"],
            attrs: { type: "button", [menuAttrs.trigger]: "", [appBarAttrs.trigger]: "" },
            slot: "children",
            whenGiven: "items",
            children: [
              {
                element: "span",
                part: "indicator",
                attrs: { "aria-hidden": "true" },
                whenGiven: "items",
                children: [{ element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "sm" } }],
              },
            ],
          },
          appBarDropdown,
        ],
      },
      react: { from: "@skryensya/react/app-bar", name: "AppBarStatus" },
    },
  },
} as const satisfies ComponentContract;

/* ------------------------------------------------------------------------------------------------ *
 * Shared behaviour: the pure rules both bindings apply, so the two cannot drift.
 * ------------------------------------------------------------------------------------------------ */

export type AppBarAction =
  /** Move the tab stop (and focus) to the menu at `index`. `open`: open it on arrival. */
  | { readonly kind: "move"; readonly index: number; readonly open: boolean }
  | { readonly kind: "none" };

/**
 * The bar's own keys, from the menus' point of view. Everything inside an open dropdown (Up/Down,
 * Enter, Escape, Home/End in the list) is Menu's, and never reaches here.
 *
 * Left/Right wrap, like every roving row in this system. When a dropdown is open they carry it along:
 * the neighbour opens, the way a desktop menu bar walks through its menus. Home/End move to the ends
 * only while nothing is open; with a dropdown open they belong to its list.
 */
export function resolveAppBarKey(params: {
  readonly key: string;
  /** The menu that holds the tab stop, or whose dropdown holds focus. */
  readonly index: number;
  readonly count: number;
  /** Whether a dropdown of the bar's menus is open right now. */
  readonly open: boolean;
}): AppBarAction {
  const { key, index, count, open } = params;
  if (count < 1) return { kind: "none" };
  const last = count - 1;
  switch (key) {
    case "ArrowRight":
      return { kind: "move", index: index < last ? index + 1 : 0, open };
    case "ArrowLeft":
      return { kind: "move", index: index > 0 ? index - 1 : last, open };
    case "Home":
      return open ? { kind: "none" } : { kind: "move", index: 0, open: false };
    case "End":
      return open ? { kind: "none" } : { kind: "move", index: last, open: false };
    default:
      return { kind: "none" };
  }
}

/**
 * Pointing at a trigger while another menu of the bar is open switches to it; pointing while none is
 * open does nothing. A desktop bar never opens a menu on hover alone, only once the person has
 * already opened one: from then on they are browsing, and every click would be a chore.
 */
export function shouldSwitchOnPointer(params: { readonly openIndex: number; readonly pointedIndex: number }): boolean {
  return params.openIndex !== -1 && params.openIndex !== params.pointedIndex;
}
