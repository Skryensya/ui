import type { ComponentContract, OptionsOf } from "./contract.js";

export const dockParts = {
  root: "sk-dock",
  item: "sk-dock__item",
  icon: "sk-dock__icon",
} as const;

/** A small action group, not an application menu or a toolbar with roving focus.
 * Native Tab order stays intact. The native button lifts as one piece, including its hit area and focus ring. */
export const dockContract = {
  id: "dock",
  category: "actions",
  css: "@skryensya/core/components/dock.css",
  parts: dockParts,
  hooks: [
    "--sk-dock-bg", "--sk-dock-border-color", "--sk-dock-fg", "--sk-dock-gap",
    "--sk-dock-item-radius", "--sk-dock-padding", "--sk-dock-radius", "--sk-dock-shadow", "--sk-dock-size",
    "--sk-dock-magnification", "--sk-dock-lift", "--sk-dock-item-bg",
  ],
  options: {
    label: { type: "string", attr: "aria-label" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
  },
  signatures: {
    Dock: {
      intent: ["dock", "compact-action-launcher", "icon-action-group"],
      host: { element: "div" },
      options: ["label"],
      requires: ["label"],
      forward: ["id", "aria-*"],
      slots: { children: { accepts: "node", required: true } },
      mount: "data-sk-dock",
      template: { element: "div", part: "root", host: true, attrs: { role: "group" }, slot: "children" },
      react: { from: "@skryensya/react/dock", name: "Dock" },
    },
    DockItem: {
      intent: ["dock-action"],
      host: { element: "button" },
      options: ["label", "disabled"],
      requires: ["label"],
      parents: ["Dock"],
      forward: ["id", "aria-*"],
      slots: { children: { accepts: "node", required: true } },
      template: {
        element: "button", part: "item", also: ["sk-interactive"], host: true,
        attrs: { type: "button" },
        children: [{ element: "span", part: "icon", attrs: { "aria-hidden": "true" }, slot: "children" }],
      },
      react: { from: "@skryensya/react/dock", name: "DockItem" },
    },
  },
} as const satisfies ComponentContract;

export type DockOptions = OptionsOf<typeof dockContract>;
