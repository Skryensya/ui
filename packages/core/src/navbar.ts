import type { ComponentContract } from "./contract.js";

/*
 * The bar only: a surface, a brand and a place for actions. The links inside are the `nav-list`
 * pattern, horizontal, shared with the sidebar rather than duplicated here (decision 17).
 */
export const navbarParts = {
  root: "sk-navbar",
  brand: "sk-navbar__brand",
  actions: "sk-navbar__actions",
} as const;

export type NavbarPart = keyof typeof navbarParts;
export type NavbarPartClass = (typeof navbarParts)[NavbarPart];

/*
 * The page's top chrome. A `<header>` and two named regions, and nothing else: a navbar is a SHELL
 * (decision 17): it owns its own bar and adjusts its guests only by re-declaring their styling hooks,
 * never by reaching into their markup. The nav list inside it is a guest, not a part.
 */
export const navbarContract = {
  id: "navbar",
  category: "navigation",
  css: "@skryensya/core/components/navbar.css",
  parts: navbarParts,
  hooks: [
    "--sk-navbar-actions-gap",
    "--sk-navbar-bg",
    "--sk-navbar-border-color",
    "--sk-navbar-brand-fg",
    "--sk-navbar-brand-font-size",
    "--sk-navbar-brand-font-weight",
    "--sk-navbar-brutalist-offset",
    "--sk-navbar-elevation",
    "--sk-navbar-fg",
    "--sk-navbar-gap",
    "--sk-navbar-min-height",
    "--sk-navbar-padding-x",
    "--sk-navbar-padding-y",
    "--sk-navbar-wash",
  ],
  options: {
    /*
     * HOW THE BAR IS DRAWN, Button's axis: brutalist a black rule and a hard offset under it,
     * frosted a see-through bar over the content scrolling beneath (opaque wherever the material
     * cannot be trusted). No tactile: a bar is never pressed.
     */
    appearance: {
      type: "enum",
      values: ["plain", "brutalist", "frosted"],
      default: "plain",
      attr: "data-appearance",
    },
  },

  signatures: {
    Navbar: {
      intent: ["top-bar", "app-header", "page-chrome"],
      host: { element: "header" },
      options: ["appearance"],
      slots: {
        children: {
          accepts: "signature",
          required: true,
          /* `Megamenu`, alongside `NavList`: another guest with its own navigation destinations -
           * see megamenu.ts's own header comment for why it is a peer, never a variant, of anything
           * else in this catalogue.
           *
           * `Inline`: a group of the bar's items that share a fate, which in practice is `show`. A site's
           * links exist on a wide screen and give way to a drawer's trigger on a phone (decision 35); the
           * bar is a flex row, so the group is one more item in it and needs no part of its own. */
          of: ["NavbarBrand", "NavbarActions", "NavList", "Megamenu", "Inline"],
        },
      },
      template: { element: "header", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/navbar", name: "Navbar" },
    },

    NavbarBrand: {
      intent: ["logo", "product-name", "home-link-in-the-bar"],
      host: { element: "div" },
      options: [],
      parents: ["Navbar"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "brand", host: true, slot: "children" },
      react: { from: "@skryensya/react/navbar", name: "NavbarBrand" },
    },

    NavbarActions: {
      intent: ["actions-in-the-bar", "account-menu-area"],
      host: { element: "div" },
      options: [],
      parents: ["Navbar"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "actions", host: true, slot: "children" },
      react: { from: "@skryensya/react/navbar", name: "NavbarActions" },
    },
  },
} as const satisfies ComponentContract;
