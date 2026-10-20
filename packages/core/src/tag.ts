import type { ComponentContract } from "./contract.js";

/*
 * TAG, a keyword or facet. It may be inert/removable (`span`), navigational (`a href`), or a
 * toggle (`button`, `Tag.toggle`).
 *
 * Where Badge is a read-only status label, a Tag classifies content the user can act on: filters,
 * chips, applied facets, or a keyword chip in a list that is not itself a status. A link tag
 * navigates to that facet or keyword. A removable tag dismisses an applied facet. A toggle tag
 * selects/deselects itself (a choice chip: "Design", "Frontend", click to filter by it). All three
 * jobs are deliberately separate, for the same reason in each direction: an anchor must not contain
 * a nested remove button, and neither a link nor a toggle button may, since a `<button>` cannot
 * nest another `<button>` either. Pick exactly one signature for what this instance of the chip
 * actually does.
 *
 * `remove` is a MODIFIER, not a standalone control: it goes on a real small icon-only button
 * (`sk-button sk-interactive` + `data-size="sm" data-icon-only data-variant="ghost"`), and the tag
 * stylesheet only shrinks it to the chip. The remove control is system-owned Button+Icon
 * (`compose` + `also`); Tag ships no enhancer: React maps `onRemove` to the
 * declared `remove` event; authored markup listens to the button's native `click` (or to
 * `sk:tagremove` when a binding dispatches it).
 */
/*
 * NEUTRAL AND ACCENT ONLY, never the three feedback tones. Badge owns `success`/`warning`/`danger`
 * (a read-only status report); Tag classifies content the user can act on, and giving it the same
 * palette let a chip stand in for a status badge with nothing else about it saying so, which is
 * exactly the confusion `badge.whenNot1` / `tagPage.whenNot1` already warn about in prose. Narrowing
 * the enum makes that mistake impossible to construct instead of merely discouraged - breaking
 * change, see contracts/changelog/tag.yaml.
 */
export type TagTone = "neutral" | "accent";

export const tagParts = {
  root: "sk-tag",
  label: "sk-tag__label",
  remove: "sk-tag__remove",
} as const;

export type TagPart = keyof typeof tagParts;
export type TagPartClass = (typeof tagParts)[TagPart];

/** Dispatched on the host when the remove control is activated. React also exposes `onRemove`. */
export const tagEvents = {
  remove: "sk:tagremove",
} as const;

/*
 * A label the user can act on, and the reason it is not a Badge: a tag can be removed or navigate to
 * a facet. Navigation uses a link host; dismissal uses a separate Button. They never combine.
 * An inert keyword chip (no href, not removable) is still a Tag when it classifies content rather
 * than reporting system status, that is what `keyword` covers; counts and status roles are Badge.
 */
export const tagContract = {
  id: "tag",
  category: "content",
  css: "@skryensya/core/components/tag.css",
  parts: tagParts,
  hooks: [
    "--sk-tag-bg",
    "--sk-tag-border",
    "--sk-tag-fg",
    "--sk-tag-gap",
    "--sk-tag-height",
    "--sk-tag-remove-size",
  ],
  events: tagEvents,
  eventDetails: {
    remove: { detail: {}, reactProp: "onRemove", reactDetail: "void", source: "root", trigger: "remove" },
  },

  options: {
    /*
     * HOW THE CHIP IS DRAWN, Button's axis, brutalist alone: a black edge and a small hard offset.
     * No tactile (a chip is not a key) and no frosted (glass would only cost the label its
     * contrast).
     */
    appearance: {
      type: "enum",
      values: ["plain", "brutalist"],
      default: "plain",
      attr: "data-appearance",
    },
    tone: {
      type: "enum",
      values: ["neutral", "accent"],
      default: "neutral",
      attr: "data-tone",
    },
    /**
     * Whether the remove control EXISTS. Structure only: the contract owns presence; activation is
     * the `remove` event (`onRemove` in React). Bindings must not infer this from a handler alone.
     */
    removable: { type: "boolean", default: false, attr: "data-removable", trueValue: "" },
    /** The remove control's accessible name. It is an icon-only button, so it has no other. */
    removeLabel: { type: "string", default: "Remove", attr: "aria-label" },
    /** Destination for a navigable tag. Present only on `Tag.link`; link tags cannot be removable. */
    href: { type: "string", attr: "href" },
    /*
     * A CHOICE, not a status: present only on `Tag.toggle`, Button's own `pressed` option restated
     * (button.ts) down to the missing `default`. Absence has to mean "this chip has no selection
     * state at all"; a value of `false` means "selectable, currently off". A default would erase
     * that distinction and the React binding would have no way to tell the two apart when deciding
     * whether to write `aria-pressed` at all.
     */
    selected: { type: "boolean", attr: "aria-pressed", trueValue: "true", falseValue: "false" },
    /*
     * `aria-disabled`, NOT `disabled`, as the primary attr: `Tag`'s root is a `<span>`, which has no
     * native disabled state to carry, and `aria-disabled` is the one spelling that means the same
     * thing on every host this contract has. `Tag.toggle`'s template adds the REAL `disabled`
     * attribute on top (its own `attrsWhen` below), the same two-attribute shape Button's own
     * `disabled` already writes, for the same reason: one stops the click, the other is what a
     * screen reader reads. Absent on `Tag.link` - a link cannot be natively disabled either, and
     * Button.navigation forbids it for the identical reason.
     */
    disabled: { type: "boolean", default: false, attr: "aria-disabled", trueValue: "true" },
  },

  a11y: [
    {
      when: { removable: true },
      requiresOneOf: ["removeLabel"],
      because:
        "The remove control is icon-only; each removable tag needs a distinct accessible name for the facet it clears.",
      signatures: ["Tag"],
    },
  ],

  signatures: {
    Tag: {
      intent: ["removable-label", "filter-chip", "applied-filter", "keyword"],
      host: { element: "span", when: { href: "absent" } },
      options: ["tone", "removable", "removeLabel", "appearance", "disabled"],
      /** Host id / a11y names; remove control chrome stays template realization, not forwarded attrs. */
      forward: ["id", "aria-*"],
      /*
       * Remove control is system-owned Button + close Icon (`also` paints the classes). Compose is
       * the machine-readable statement of that borrow (Dialog close same pattern).
       */
      compose: [
        { of: "button", sheets: ["@skryensya/core/components/button.css"], systemOwned: true },
        { of: "icon", systemOwned: true },
      ],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "span",
        part: "root",
        host: true,
        children: [
          { element: "span", part: "label", slot: "children" },
          /*
           * System-owned Button+Icon realization (not a public compose slot): state layer, focus ring
           * and hit target come from Button; `close` is the system's dismiss icon. Bindings may
           * render the real Button/Icon components; emitted markup writes these classes and attrs.
           */
          {
            element: "button",
            part: "remove",
            also: ["sk-button", "sk-interactive"],
            whenGiven: "removable",
            options: ["removeLabel"],
            /* The ROOT's own `disabled` reaches the nested Button too: `aria-disabled` on a `<span>`
             * announces the whole chip, but only a REAL `disabled` on this button actually stops the
             * remove click. Same two-attribute split as Button.action's own `loading`→`disabled`. */
            attrsWhen: [{ option: "disabled", equals: "true", attrs: { disabled: "" } }],
            attrs: {
              type: "button",
              "data-appearance": "plain",
              "data-variant": "ghost",
              "data-tone": "neutral",
              "data-size": "sm",
              "data-icon-only": "",
              "data-sk-button": "",
            },
            children: [{ element: "span", attrs: { "data-sk-icon": "close", "data-sk-icon-size": "md" } }],
          },
        ],
      },
      react: { from: "@skryensya/react/tag", name: "Tag" },
    },

    "Tag.link": {
      intent: ["tag-link", "navigable-keyword", "facet-link"],
      host: { element: "a", when: { href: "present" } },
      options: ["tone", "href", "appearance"],
      requires: ["href"],
      forbids: ["removable", "removeLabel", "disabled"],
      /** Link host attrs the contract does not map (same channel as Button.navigation). */
      forward: ["id", "target", "rel", "download", "aria-*"],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "a",
        part: "root",
        also: ["sk-interactive"],
        host: true,
        children: [{ element: "span", part: "label", slot: "children" }],
      },
      react: { from: "@skryensya/react/tag", name: "Tag" },
    },

    /*
     * THE THIRD SHAPE: a real `<button>`, not a `<span>` with `role="button"` bolted on. The same
     * reasoning Button's own host switch already relies on (and the only way this contract model
     * can vary a root element: per-signature, never conditionally within one template - see
     * `nav-list.ts`'s own note on exactly this). It cannot also be `removable`: nesting the remove
     * control's button inside this root button is two interactive elements in one, the identical
     * problem `Tag.link` already forbids for the same shape reason.
     */
    "Tag.toggle": {
      intent: ["filter-chip", "choice-chip", "selectable-keyword"],
      host: { element: "button", when: { href: "absent", selected: "present" } },
      options: ["tone", "selected", "appearance", "disabled"],
      requires: ["selected"],
      forbids: ["removable", "removeLabel", "href"],
      forward: ["id", "aria-*"],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "button",
        part: "root",
        also: ["sk-interactive"],
        host: true,
        attrs: { type: "button" },
        /* `aria-disabled` is already automatic (this signature lists `disabled` among its options);
         * this is the SECOND attribute, the real one, same split `Tag`'s own remove button gets. */
        attrsWhen: [{ option: "disabled", equals: "true", attrs: { disabled: "" } }],
        children: [{ element: "span", part: "label", slot: "children" }],
      },
      react: { from: "@skryensya/react/tag", name: "Tag" },
    },
  },
} as const satisfies ComponentContract;
