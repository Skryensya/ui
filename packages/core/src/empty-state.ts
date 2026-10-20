import type { ComponentContract, OptionsOf } from "./contract.js";

export const emptyStateParts = {
  root: "sk-empty-state",
  icon: "sk-empty-state__icon",
  title: "sk-empty-state__title",
  description: "sk-empty-state__description",
  actions: "sk-empty-state__actions",
} as const;

/*
 * A region with nothing in it, said on purpose. The title is a real heading rather than styled text,
 * because "no results" IS the heading of that region, and the icon is `aria-hidden` since it
 * repeats what the title already says.
 */
export const emptyStateContract = {
  id: "empty-state",
  category: "feedback",
  css: "@skryensya/core/components/empty-state.css",
  parts: emptyStateParts,
  hooks: [
    "--sk-empty-state-actions-gap",
    "--sk-empty-state-description-color",
    "--sk-empty-state-fg",
    "--sk-empty-state-gap",
    "--sk-empty-state-icon-bg",
    "--sk-empty-state-icon-fg",
    "--sk-empty-state-icon-radius",
    "--sk-empty-state-icon-size",
    "--sk-empty-state-max-inline-size",
    "--sk-empty-state-padding",
    "--sk-empty-state-title-size",
  ],
  options: {
    /*
     * The title's LEVEL, as its element: the document's outline, not appearance. A region inside a page
     * is an `h2`; a state that IS the page (a 404, an empty inbox that fills the view) has no other
     * heading and is its `h1`. Size is the `--sk-empty-state-title-size` hook, so a level never has to
     * be chosen for how big it looks.
     */
    headingElement: { type: "enum", values: ["h1", "h2", "h3", "h4", "h5", "h6"], default: "h2", prop: "headingElement" },
  },

  signatures: {
    EmptyState: {
      intent: ["no-results", "nothing-here-yet", "empty-list", "first-run"],
      host: { element: "section" },
      options: ["headingElement"],
      slots: {
        icon: { accepts: "signature", of: ["Icon"] },
        title: { accepts: "text", required: true },
        description: { accepts: "node" },
        actions: { accepts: "signature", of: ["Button.action", "Button.navigation"] },
      },
      template: {
        element: "section",
        part: "root",
        host: true,
        children: [
          {
            element: "div",
            part: "icon",
            whenGiven: "icon",
            attrs: { "aria-hidden": "true" },
            slot: "icon",
          },
          { element: "h2", elementOption: "headingElement", part: "title", slot: "title" },
          { element: "div", part: "description", whenGiven: "description", slot: "description" },
          { element: "div", part: "actions", whenGiven: "actions", slot: "actions" },
        ],
      },
      react: { from: "@skryensya/react/empty-state", name: "EmptyState" },
    },
  },
} as const satisfies ComponentContract;

export type EmptyStateOptions = OptionsOf<typeof emptyStateContract>;
