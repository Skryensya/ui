import type { ComponentContract } from "./contract.js";
import { selectAttrs, selectParts } from "./select.js";

/*
 * USER SELECT, a people picker composed on Select: the same machine (`@zag-js/select`, always
 * `multiple` and `composite: false`), the same trigger, positioner, content box and rows, plus what a
 * people picker has that a Select does not. A search field above the rows and a footer under them,
 * a leading checkbox per row, an avatar summary in the trigger, the empty states, and a string table
 * (`userSelectLabels`) both bindings read.
 *
 * IT HAS A CONTRACT, and for a while it did not, on the theory that a composition painted entirely
 * with other families' classes describes no CSS of its own. That stopped being true the moment it
 * grew parts of its own (the list well, the checkbox column, the empty states), which now live in
 * `user-select.css` with hooks of their own. Without the contract the component had no reference
 * page, no changelog, no canonical tree (so G2 never compared its two bindings), no place in the
 * Vanilla auto-loader and no entry in the artifacts the MCP tools read.
 *
 * The parts reuse Select's classes on purpose: the trigger and the box ARE a Select, and a sheet
 * that restyled them would make two components that look alike drift apart. The composition's own
 * pieces are named by their `data-sk-user-select-*` mount instead of a class.
 */

export const userSelectAttrs = {
  root: "data-sk-user-select",
  search: "data-sk-user-select-search",
  list: "data-sk-user-select-list",
  empty: "data-sk-user-select-empty",
  /** The row shown instead of the list while the roster loads: a Loader and the `loading` string. */
  loading: "data-sk-user-select-loading",
  status: "data-sk-user-select-status",
  footer: "data-sk-user-select-footer",
  count: "data-sk-user-select-count",
  clear: "data-sk-user-select-clear",
  unselected: "data-sk-user-select-unselected",
  check: "data-sk-user-select-check",
  emptyIcon: "data-sk-user-select-empty-icon",
  emptyTitle: "data-sk-user-select-empty-title",
  emptyHint: "data-sk-user-select-empty-hint",
} as const;

export type UserSelectPart = keyof typeof userSelectAttrs;
export type UserSelectAttr = (typeof userSelectAttrs)[UserSelectPart];

/*
 * EVERY STRING THE COMPOSITION WRITES, one table both bindings read, so React and Vanilla never say
 * different things. Each is a template: `{term}` is the noun for what is being picked ("users" by
 * default; "usuarios", "members", "reviewers"...), `{count}`, `{name}` and `{query}` are filled at
 * the point of use. Changing `term` alone relabels an English picker; localizing replaces the
 * sentences too, because a noun cannot carry another language's word order ("No hay usuarios").
 *
 * React takes these as `term` and `labels`; Vanilla as `data-term` and `data-<key>-label` on the root
 * (`data-placeholder` and `data-search-placeholder` keep their existing names).
 */
export const userSelectLabels = {
  term: "users",
  placeholder: "Select {term}",
  searchPlaceholder: "Search {term}...",
  unselected: "No one selected",
  /** The trigger's text beside the avatar stack when two or more are selected. */
  count: "{count} {term}",
  /** The footer's count. */
  selectedCount: "{count} selected",
  /** Appended to the trigger's accessible name: "Select users, Jane Cooper selected". */
  selectedOne: "{name} selected",
  selectedMany: "{count} {term} selected",
  clear: "Clear all",
  empty: "No {term} available",
  /** The search came back empty: the title, then a hint under it. */
  noResults: 'No {term} match "{query}"',
  noResultsHint: "Try another name or email.",
  loading: "Loading {term}...",
  result: "1 result available",
  results: "{count} results available",
} as const;

export type UserSelectLabels = { -readonly [K in keyof typeof userSelectLabels]: string };

/** Fills one template: `{term}` from the labels themselves, the rest from `values`. */
export function userSelectLabel(
  labels: UserSelectLabels,
  key: Exclude<keyof UserSelectLabels, "term">,
  values: Record<string, string | number> = {},
): string {
  let result = labels[key].replaceAll("{term}", labels.term);
  for (const [name, value] of Object.entries(values)) result = result.replaceAll(`{${name}}`, String(value));
  return result;
}

export const userSelectEvents = {
  valueChange: "sk:userselectvaluechange",
} as const;

const combiningMarks = /\p{M}+/gu;

/**
 * Diacritic-insensitive fold: "mar" and "María" match in either binding. One function so the two
 * bindings' search never quietly disagree on what counts as a match.
 */
export function userSelectSearchKey(value: string): string {
  return value.normalize("NFD").replace(combiningMarks, "").toLocaleLowerCase();
}

export type UserSelectValueChangeDetails = {
  value: string[];
};

export const userSelectParts = {
  root: selectParts.root,
  control: selectParts.control,
  trigger: selectParts.trigger,
  value: selectParts.value,
  indicator: selectParts.indicator,
  positioner: selectParts.positioner,
  content: selectParts.content,
  item: selectParts.item,
  itemText: selectParts.itemText,
} as const;

const icon = (name: string, size: "sm" | "md") => ({
  element: "span",
  attrs: { "data-sk-icon": name, "data-sk-icon-size": size },
});

export const userSelectContract = {
  id: "user-select",
  category: "forms",
  css: "@skryensya/core/components/user-select.css",
  parts: userSelectParts,
  events: userSelectEvents,
  eventDetails: {
    valueChange: { detail: { value: "string[]" }, reactProp: "onValueChange", source: "root", trigger: "item" },
  },
  hooks: [
    "--sk-user-select-content-max-block-size",
    "--sk-user-select-content-min-inline-size",
    "--sk-user-select-list-block-size",
  ],

  options: {
    /* Ghost by default, unlike Select: the trigger shows faces and names, and a bordered box around a
     * row of avatars reads as a form field where a picker is meant. */
    variant: { type: "enum", values: ["outline", "ghost"], default: "ghost", attr: "data-variant" },
    name: { type: "string", attr: "name" },
    /* Space-separated ids, the selection it opens with. */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    /* The noun every default string reads ("3 users", "No users available"). */
    term: { type: "string", attr: "data-term" },
    placeholder: { type: "string", attr: "data-placeholder" },
    searchPlaceholder: { type: "string", attr: "data-search-placeholder" },
    unselectedLabel: { type: "string", attr: "data-unselected-label" },
    /* How many faces the trigger stacks before the rest collapse into "+N". */
    maxAvatars: { type: "number", attr: "data-max-avatars" },
    /* The roster is still arriving: the open list shows a Loader and the `loading` string instead of
     * its rows, and the status announces it. Both bindings draw it, so a tree can ask for it. */
    loading: { type: "boolean", default: false, attr: "data-loading", trueValue: "" },
  },

  signatures: {
    UserSelect: {
      intent: ["pick-people", "assignees", "multiple-selection", "searchable-list", "avatar-summary"],
      host: { element: "div" },
      mount: userSelectAttrs.root,
      options: [
        "variant",
        "name",
        "value",
        "disabled",
        "term",
        "placeholder",
        "searchPlaceholder",
        "unselectedLabel",
        "maxAvatars",
        "loading",
      ],
      portals: { container: true },
      forward: ["id", "aria-*"],
      /* The families it is built from, and the sheets each borrow needs loaded before this one. */
      compose: [
        {
          of: "select",
          sheets: ["@skryensya/core/components/select.css", "@skryensya/core/patterns/anchored.css"],
          systemOwned: true,
        },
        { of: "combobox", sheets: ["@skryensya/core/components/combobox.css"], systemOwned: true },
        { of: "avatar", sheets: ["@skryensya/core/components/avatar.css"], systemOwned: true },
        { of: "checkbox", sheets: ["@skryensya/core/components/checkbox.css"], systemOwned: true },
      ],
      slots: {
        items: {
          accepts: "items",
          required: true,
          prop: "users",
          item: {
            key: "id",
            options: {
              id: { type: "string", attr: "data-value" },
              disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
            },
            slots: {
              name: { accepts: "text", required: true },
              /* What the avatar shows without a photo. Written, not derived: the React binding
               * derives the same two letters from `name` (`avatarInitials`), and G2 holds the two to
               * the same result. */
              initials: { accepts: "text", required: true },
              email: { accepts: "text" },
            },
          },
        },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          /* The hidden native control, so the selection reaches a form submission. Same node, same
           * reason and same visually-hidden declaration as Select's own. */
          {
            element: "select",
            mount: selectAttrs.hidden,
            attrs: {
              "aria-hidden": "true",
              multiple: "",
              tabindex: "-1",
              style:
                "border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap;word-wrap:normal;",
            },
            options: ["name"],
            children: [
              {
                element: "option",
                repeat: "items",
                itemOptions: ["id", "disabled"],
                itemOptionAttrs: { id: "value", disabled: "disabled" },
                selectedBy: { attr: "selected", option: "value" },
                itemSlot: "name",
              },
            ],
          },
          {
            element: "div",
            part: "control",
            mount: selectAttrs.control,
            children: [
              {
                element: "button",
                part: "trigger",
                also: ["sk-anchor", "sk-interactive"],
                mount: selectAttrs.trigger,
                attrs: { type: "button" },
                children: [
                  /* The live summary (faces, count or the empty disc) is the binding's to draw: it
                   * follows the selection. Decorative: the trigger's own label says it in words. */
                  { element: "span", part: "value", mount: selectAttrs.value, attrs: { "aria-hidden": "true" } },
                  {
                    element: "span",
                    part: "indicator",
                    mount: selectAttrs.indicator,
                    attrs: { "aria-hidden": "true" },
                    children: [
                      { element: "span", attrs: { "data-state": "closed" }, children: [icon("chevron-down", "md")] },
                      { element: "span", attrs: { "data-state": "open" }, children: [icon("chevron-up", "md")] },
                    ],
                  },
                ],
              },
            ],
          },
          {
            element: "div",
            part: "positioner",
            also: ["sk-anchored"],
            mount: selectAttrs.positioner,
            children: [
              {
                element: "div",
                part: "content",
                mount: selectAttrs.content,
                children: [
                  {
                    element: "input",
                    also: ["sk-input"],
                    mount: userSelectAttrs.search,
                    attrs: { type: "search", "data-size": "sm" },
                  },
                  {
                    element: "div",
                    also: ["sk-combobox__status", "sk-visually-hidden"],
                    mount: userSelectAttrs.status,
                    attrs: { role: "status", "aria-atomic": "true" },
                  },
                  {
                    element: "div",
                    also: ["sk-scrollbar"],
                    mount: userSelectAttrs.list,
                    children: [
                      {
                        element: "div",
                        part: "item",
                        also: ["sk-interactive"],
                        mount: selectAttrs.item,
                        repeat: "items",
                        itemOptions: ["id", "disabled"],
                        children: [
                          /* Decorative: the option's own `aria-selected` is the state. */
                          {
                            element: "span",
                            also: ["sk-checkbox"],
                            mount: userSelectAttrs.check,
                            attrs: { "aria-hidden": "true" },
                            children: [
                              {
                                element: "span",
                                also: ["sk-checkbox__control"],
                                children: [
                                  {
                                    element: "span",
                                    also: ["sk-checkbox__indicator"],
                                    attrs: { "data-state": "checked" },
                                    children: [icon("check", "sm")],
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            element: "span",
                            also: ["sk-inline"],
                            attrs: { "data-align": "center", "data-gap": "sm", "data-wrap": "false" },
                            children: [
                              {
                                element: "span",
                                also: ["sk-avatar"],
                                attrs: { "aria-hidden": "true", "data-appearance": "plain", "data-size": "sm", role: "img" },
                                attrsFromItemSlot: { "aria-label": "name" },
                                children: [
                                  {
                                    element: "span",
                                    also: ["sk-avatar__fallback"],
                                    attrs: { "aria-hidden": "true" },
                                    itemSlot: "initials",
                                  },
                                ],
                              },
                              {
                                element: "span",
                                also: ["sk-combobox__item-copy"],
                                children: [
                                  { element: "span", part: "itemText", mount: selectAttrs.itemText, itemSlot: "name" },
                                  {
                                    element: "span",
                                    part: "itemText",
                                    also: ["sk-combobox__item-description"],
                                    itemSlot: "email",
                                    whenItemSlotGiven: "email",
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      /* Nothing matches. Inside the list so it sits in the list's own height; hidden
                       * while any row shows. `role="presentation"`: a listbox holds options. */
                      {
                        element: "div",
                        also: ["sk-combobox__empty"],
                        mount: userSelectAttrs.empty,
                        attrs: { hidden: "", role: "presentation" },
                        children: [
                          { element: "span", mount: userSelectAttrs.emptyIcon, attrs: { "aria-hidden": "true" }, children: [icon("search", "md")] },
                          { element: "span", mount: userSelectAttrs.emptyTitle },
                          { element: "span", mount: userSelectAttrs.emptyHint },
                        ],
                      },
                    ],
                  },
                  /* "N selected · Clear all", hidden while nothing is selected. */
                  {
                    element: "span",
                    also: ["sk-inline"],
                    mount: userSelectAttrs.footer,
                    attrs: { "data-align": "center", "data-gap": "sm", "data-justify": "between" },
                    children: [
                      {
                        element: "span",
                        also: ["sk-text"],
                        mount: userSelectAttrs.count,
                        attrs: { "data-size": "caption", "data-tone": "secondary" },
                      },
                      {
                        element: "button",
                        also: ["sk-button", "sk-interactive"],
                        mount: userSelectAttrs.clear,
                        attrs: { type: "button", "data-size": "sm", "data-variant": "ghost" },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/user-select", name: "UserSelect" },
    },
  },
} as const satisfies ComponentContract;
