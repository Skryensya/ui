import type { ComponentContract } from "./contract.js";

/*
 * SEARCH FIELD, a text box whose value is whatever was typed: the magnifier in front, a button that
 * clears it, Escape that does the same, and optionally the `<form role="search">` that submits it.
 *
 * NOT A COMBOBOX. A combobox's value has to resolve to one of its options; a search's value is the
 * query itself. Suggestions under a search box are a Combobox with a free value, not this.
 *
 * NO MACHINE. The whole behaviour is "show the clear button while there is text, empty the field on
 * click or Escape and hand focus back", which is three listeners, so neither binding pays for one.
 *
 * THE INPUT IS AN `sk-input`, composed rather than redrawn: the magnifier and the clear button sit
 * over it and its padding makes room for them. Its appearances, sizes, `aria-invalid` and focus ring
 * are Input's, so a search box next to a text field in a form reads as the same control.
 *
 * The native `type="search"` stays, for the keyboard a phone shows and the role the platform gives,
 * but its own clear glyph is hidden: it is WebKit-only, cannot be styled and has no reliable name.
 */

export const searchFieldParts = {
  root: "sk-search-field",
  label: "sk-search-field__label",
  control: "sk-search-field__control",
  /** The magnifier. Decorative: the label already says what the field is for. */
  icon: "sk-search-field__icon",
  input: "sk-search-field__input",
  /** The icon-only Button that empties the field. Hidden while it is empty. */
  clear: "sk-search-field__clear",
  /** `SearchField.form` only: the Button that submits. */
  submit: "sk-search-field__submit",
} as const;

export type SearchFieldPart = keyof typeof searchFieldParts;

export const searchFieldAttrs = {
  root: "data-sk-search-field",
  input: "data-sk-search-field-input",
  clear: "data-sk-search-field-clear",
} as const;

/** The key that empties a field with text in it, both bindings' one rule. */
export function isClearKey(event: { readonly key: string }, value: string): boolean {
  return event.key === "Escape" && value !== "";
}

const fieldOptions = [
  "name",
  "placeholder",
  "clearLabel",
  "labelVisuallyHidden",
  "disabled",
  "controlSize",
  "appearance",
] as const;

const inputNode = {
  element: "input",
  part: "input",
  name: "input",
  also: ["sk-input"],
  mount: "data-sk-search-field-input",
  options: ["name", "placeholder", "disabled", "controlSize", "appearance"],
  attrs: { type: "search", autocomplete: "off" },
} as const;

const clearNode = {
  element: "button",
  part: "clear",
  also: ["sk-button", "sk-interactive"],
  mount: "data-sk-search-field-clear",
  options: ["clearLabel"],
  attrs: {
    type: "button",
    "data-variant": "ghost",
    "data-size": "sm",
    "data-icon-only": "",
    hidden: "",
  },
  children: [{ element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "sm" } }],
} as const;

const fieldChildren = [
  { element: "label", part: "label", name: "label", slot: "label" },
  {
    element: "div",
    part: "control",
    children: [
      {
        element: "span",
        part: "icon",
        children: [{ element: "span", attrs: { "data-sk-icon": "search", "data-sk-icon-size": "sm" } }],
      },
      inputNode,
      clearNode,
    ],
  },
] as const;

export const searchFieldContract = {
  id: "search-field",
  category: "forms",
  css: "@skryensya/core/components/search-field.css",
  parts: searchFieldParts,
  hooks: ["--sk-search-field-gap", "--sk-search-field-icon-color", "--sk-search-field-label-color"],

  options: {
    /**
     * Input's axis, carried to the input itself: the field IS an `sk-input`, so no `sheets` here.
     * The input's borrowed class already brings `input.<value>.css` for the value asked for.
     */
    appearance: { type: "enum", values: ["plain", "brutalist", "frosted"], attr: "data-appearance" },
    /** Input's sizes. Named `controlSize` for Input's reason: `size` is native on `<input>`. */
    controlSize: { type: "enum", values: ["xs", "sm", "md", "lg"], attr: "data-size" },
    /** The query's key in the submitted URL: `q` gives `?q=...`. */
    name: { type: "string", attr: "name" },
    placeholder: { type: "string", attr: "placeholder" },
    disabled: { type: "boolean", default: false, attr: "disabled", trueValue: "" },
    /** The clear button's accessible name. It is icon-only, so this is the only name it has. */
    clearLabel: { type: "string", default: "Clear search", attr: "aria-label" },
    /**
     * FormField's option, for the search box whose purpose the page already shows (a navbar's, a
     * table's filter). The label still exists for a screen reader; it only leaves the layout.
     */
    labelVisuallyHidden: { type: "boolean", default: false, attr: "data-label-visually-hidden", trueValue: "" },
    /** `SearchField.form` only: where the query goes, as a GET. Its presence picks the signature. */
    action: { type: "string", attr: "action" },
  },

  signatures: {
    /*
     * The query filters something on this page as it is typed: a list, a table, a grid of cards.
     * Nothing is submitted, so there is no form and no submit button.
     */
    SearchField: {
      intent: ["search", "search-field", "search-box", "filter-as-you-type", "live-filter"],
      host: { element: "div", when: { action: "absent" } },
      options: fieldOptions,
      forbids: ["action"],
      forward: ["id", "aria-*"],
      slots: {
        label: { accepts: "text", required: true },
      },
      mount: "data-sk-search-field",
      compose: [
        { of: "input", sheets: ["@skryensya/core/components/input.css"], systemOwned: true },
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      wiring: [{ on: "label", attr: "for", references: ["input"] }],
      template: {
        element: "div",
        part: "root",
        host: true,
        options: ["labelVisuallyHidden"],
        children: fieldChildren,
      },
      react: { from: "@skryensya/react/search-field", name: "SearchField" },
    },

    /*
     * The query goes to another page: a site search, a help centre. A GET form with the `search`
     * landmark, so a screen reader can jump to it, and a submit button because Enter is not a thing
     * everyone knows a search box does.
     */
    "SearchField.form": {
      intent: ["site-search", "search-form", "search-landmark", "submit-search"],
      host: { element: "form", when: { action: "present" } },
      options: [...fieldOptions, "action"],
      requires: ["action"],
      forward: ["id", "aria-*"],
      slots: {
        label: { accepts: "text", required: true },
        /** The submit button's text: "Search", "Buscar". */
        submit: { accepts: "text", required: true },
      },
      mount: "data-sk-search-field",
      compose: [
        { of: "input", sheets: ["@skryensya/core/components/input.css"], systemOwned: true },
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      wiring: [{ on: "label", attr: "for", references: ["input"] }],
      template: {
        element: "form",
        part: "root",
        host: true,
        options: ["labelVisuallyHidden", "action"],
        attrs: { role: "search", method: "get" },
        children: [
          ...fieldChildren,
          {
            element: "button",
            part: "submit",
            also: ["sk-button", "sk-interactive"],
            slot: "submit",
            attrs: { type: "submit" },
          },
        ],
      },
      react: { from: "@skryensya/react/search-field", name: "SearchField" },
    },
  },
} as const satisfies ComponentContract;
