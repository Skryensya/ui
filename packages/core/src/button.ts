import type { ComponentContract, OptionsOf, OptionValue } from "./contract.js";

export const buttonParts = {
  root: "sk-button",
  interactive: "sk-interactive",
  /** Leading slot: icon (or other affordance) before the label. */
  pre: "sk-button__pre",
  /** Trailing slot: icon (or other affordance) after the label. */
  post: "sk-button__post",
  /** The label itself, wrapped so `[data-loading]` can hide it selectively - plain text has no
   *  element of its own to select. */
  label: "sk-button__label",
  /** The `loading` spinner. Always in the DOM; `[data-loading]` is what shows it. */
  loader: "sk-button__loader",
  /** The `loadingText` substitute for the label. Only in the DOM when `loadingText` is given. */
  loadingLabel: "sk-button__loading-label",
} as const;

export type ButtonPart = keyof typeof buttonParts;
export type ButtonPartClass = (typeof buttonParts)[ButtonPart];

/*
 * Two signatures over one export. `href` is the discriminant and the tag switch: every appearance
 * works identically on either host, only the semantics differ. Passing it drops `disabled` (a link
 * cannot be disabled and stay a link) and `type`; omitting it keeps the native button contract.
 *
 * There is no `ButtonLink` contract. It was a thin wrapper forwarding to Button with `href`, and the
 * reconstruction resolves deprecations in code instead of carrying two paths (decision 28).
 */
export const buttonContract = {
  id: "button",
  category: "actions",
  css: "@skryensya/core/components/button.css",
  /* Own anatomy only. `sk-interactive` is composed via `also` (base bundle); claiming it as a part
     made button.css the unique owner once List stopped claiming it too, so Toc/List trees pulled
     button.css for every interactive row. */
  parts: {
    root: buttonParts.root,
    pre: buttonParts.pre,
    post: buttonParts.post,
    label: buttonParts.label,
    loader: buttonParts.loader,
    loadingLabel: buttonParts.loadingLabel,
  },
  hooks: [
    "--sk-button-accent",
    "--sk-button-bg",
    "--sk-button-border-color",
    "--sk-button-border-width",
    "--sk-button-brutalist-edge",
    "--sk-button-brutalist-offset-block",
    "--sk-button-brutalist-offset-inline",
    "--sk-button-brutalist-shadow",
    "--sk-button-depth",
    "--sk-button-fg",
    "--sk-button-font-size",
    "--sk-button-font-weight",
    "--sk-button-gap",
    "--sk-button-height",
    "--sk-button-ink",
    "--sk-button-padding-x",
    "--sk-button-radius",
    "--sk-button-shadow",
    "--sk-button-tactile-press-duration",
    "--sk-button-tactile-press-easing",
    "--sk-button-wash",
    "--sk-button-width",
  ],

  options: {
    /*
     * HOW LOUD, and nothing about what it means. The two used to be one enum, which is why a quiet
     * destructive button was unsayable: four emphases times three intents is twelve combinations and
     * a single list spelled six of them, picking arbitrarily which. You got loud-destructive but not
     * quiet-destructive, quiet-neutral but not quiet-primary.
     *
     *   solid   the fill carries it. A form's submit, a confirm.
     *   soft    a see-through fill that recedes: present, not competing, and at home on any
     *           surface, canvas, a coloured card or a photograph. (It was `subtle`, and it absorbed
     *           `translucent`, which was the same paint for an unknown surface under a second name.)
     *   ghost   ink only. Toolbars, action rows, anywhere a box per control would be noise.
     */
    variant: {
      type: "enum",
      values: ["solid", "soft", "ghost"],
      default: "solid",
      attr: "data-variant",
    },
    /*
     * WHAT IT MEANS, and nothing about how loud. `tone` is already this system's word for exactly
     * this - Badge, Tag and Callout all publish it - and Button was the odd one out, spelling
     * `variant="danger"` for the thing Badge spells `tone="danger"`. One word, one meaning.
     *
     * THREE, not Badge's five. A badge REPORTS a state, so `success` and `warning` are things it can
     * truthfully say. A button PERFORMS an action, and there is no such thing as a warning action or
     * a success action; the closest real one is destructive, which is `danger`. Adding the other two
     * would publish four cells nobody can describe the meaning of.
     *
     * Every combination is legal and every one has a use, which is the point of splitting the axis:
     * `ghost` + `danger` is a delete in an action row, `solid` + `danger` the confirm it opens.
     */
    tone: {
      type: "enum",
      values: ["neutral", "accent", "danger"],
      default: "neutral",
      attr: "data-tone",
    },
    /*
     * HOW IT IS PHYSICALLY EXPRESSED, and nothing about what it means or how loud it is. The
     * plain appearance is the existing flat/raised Button paint and feedback. `tactile` keeps the
     * same host, anatomy, slots, states and options, but renders the control as a physical push
     * button with visible travel into its surface. `brutalist` is the graphic hard-edge expression:
     * flat face, strong outline, zero-blur offset shadow and mechanical travel. `frosted` is a
     * material: a translucent face over a blurred backdrop, with an opaque baseline wherever the
     * material cannot be trusted (no backdrop-filter, reduced transparency, high contrast, forced
     * colors). Not the `soft` variant: that is how loud the paint is over an unknown
     * surface; frosted is how the surface behind is processed, and it composes with every variant.
     * Independent axis: never spell this as `tactile-solid`, `frosted-danger`, or another compound
     * value.
     */
    appearance: {
      type: "enum",
      values: ["plain", "tactile", "brutalist", "frosted"],
      default: "plain",
      attr: "data-appearance",
    },
    /*
     * `xs` is the floor of the scale, not a fourth step someone felt like adding: it paints at
     * `--size-control-xs`, which sits exactly on WCAG 2.2 SC 2.5.8's 24px target minimum. It
     * exists for a control that has to read as a NODE rather than as a button parked somewhere -
     * comment-thread's fold handle is the case that asked for it, riding on the thread's own rail,
     * where `sm` was as wide as the avatar above it and competed with it. The hit area does not
     * shrink with the face: `.sk-button::after` still expands to `--size-touch-target`.
     */
    size: {
      type: "enum",
      values: ["xs", "sm", "md", "lg"],
      default: "md",
      attr: "data-size",
    },
    /*
     * The icon-only shape: a control-sized square holding a single glyph. Orthogonal to variant and
     * size, any of those can be icon-only. Presence-only in the DOM, hence the empty `trueValue`.
     */
    /*
     * The native `type`, written always. A `<button>` with no type SUBMITS the form it sits in, so the
     * emitted markup did while React (which defaults to "button") did not: one tree, two behaviours
     * inside any form. `submit` is what a form's own confirm button asks for.
     */
    type: { type: "enum", values: ["button", "submit", "reset"], default: "button", attr: "type" },
    iconOnly: {
      type: "boolean",
      default: false,
      attr: "data-icon-only",
      trueValue: "",
    },
    /*
     * A TOGGLE'S OWN STATE. Bold in a toolbar, an upvote, Play/Pause: a button that stays on.
     *
     * Three states, not two, which is why it carries both `trueValue` and `falseValue` the way
     * layout's `wrap` does. ABSENT means "not a toggle at all" and is the right answer for almost
     * every button; `false` means "a toggle, currently off", which is a thing a screen reader
     * announces and a plain button must never claim. Writing the attribute unconditionally would
     * turn every button in the system into a toggle that is off.
     *
     * Action only. `Button.navigation` forbids it: a link goes somewhere, it does not stay pressed,
     * and `aria-pressed` on an anchor is a promise the element cannot keep.
     */
    pressed: {
      type: "boolean",
      attr: "aria-pressed",
      trueValue: "true",
      falseValue: "false",
    },
    href: {
      type: "string",
      attr: "href",
    },
    /*
     * Unavailable right now. Native `disabled` AND `aria-disabled`: the first is what stops the
     * click and the form, the second is what a screen reader announces on a control it can still
     * land on. Only on the action signature: a link cannot be disabled and stay a link.
     */
    disabled: {
      type: "boolean",
      default: false,
      attr: "disabled",
      trueValue: "",
    },
    /*
     * BUSY, NOT JUST DISABLED: a button that triggered something slow (export a PDF) and is
     * waiting on it. Implies `disabled` (the attrsWhen below), so a second click cannot start a
     * second export, and carries `aria-busy` so a screen reader hears the button itself is working,
     * not merely unavailable. The spinner is systemOwned (compose), not a `pre`/`post` the author
     * swaps in by hand: it takes the `pre` icon's place inline (button.css), the same reserved
     * position, rather than floating over the label - a control that LOOKS inert but is secretly
     * doing something read as broken on the break harness. The label stays put unless `loadingText`
     * overrides it (below); either way the button is free to reflow, since its content genuinely
     * changed, not merely its paint. Action only, the same reasoning `pressed` already states: a
     * link does not wait on anything this component can see.
     */
    loading: {
      type: "boolean",
      default: false,
      attr: "data-loading",
      trueValue: "",
    },
    /*
     * What the label says WHILE busy, when the plain label on its own does not say enough ("Save"
     * mid-export reads fine without one; "Delete 12 items" does not, since the count is the part a
     * reader needs confirmed is still in flight). Text only, no attribute: `textFromOption`
     * (button.css's own `[data-loading]` rule) renders it, and omitting it is the common case - the
     * plain label keeps showing beside the spinner instead.
     */
    loadingText: { type: "string" },
  },

  signatures: {
    "Button.action": {
      intent: ["action", "submit", "destructive-action"],
      host: { element: "button", when: { href: "absent" } },
      options: [
        "variant",
        "tone",
        "appearance",
        "size",
        "iconOnly",
        "pressed",
        "disabled",
        "type",
        "loading",
        "loadingText",
      ],
      compose: [
        { of: "icon", systemOwned: true },
        { of: "loader", sheets: ["@skryensya/core/components/loader.css"], systemOwned: true },
      ],
      hitTesting: { childrenNone: ["Icon"] },
      /*
       * Native form association and a11y names the contract does not own as options. `type` is an
       * option (shadowed-attr); `name`/`form` stay attrs so a tree can submit without inventing
       * Button-level form vocabulary. `value` travels with `name` - a submit button that names a
       * field and cannot say what it submits is half an attribute - and `autofocus` is the
       * platform's, on any focusable host.
       */
      forward: [
        "id",
        "name",
        "value",
        "form",
        "formaction",
        "formmethod",
        "formenctype",
        "formnovalidate",
        "formtarget",
        "autofocus",
        "aria-*",
      ],
      slots: {
        /**
         * Reserved place BEFORE the label. An icon that names the kind of action (download, add)
         * lands here; omitting it leaves no empty box in the flex row.
         */
        pre: { accepts: "node" },
        children: { accepts: "node", required: true },
        /**
         * Reserved place AFTER the label. An icon that points where the action goes (arrow, chevron)
         * lands here; same omit-when-empty rule as `pre`.
         */
        post: { accepts: "node" },
      },
      template: {
        element: "button",
        part: "root",
        also: [buttonParts.interactive],
        host: true,
        // The announcement, beside the behaviour: `disabled` stops the click, `aria-disabled` is
        // what a screen reader reads on a control it can still land on.
        attrsWhen: [
          { option: "disabled", given: true, attrs: { "aria-disabled": "true" } },
          { option: "loading", given: true, attrs: { "aria-disabled": "true", "aria-busy": "true", disabled: "" } },
        ],
        children: [
          { element: "span", part: "pre", whenGiven: "pre", slot: "pre" },
          /* Wrapped (unlike every other slot's own `children`) so `[data-loading]` has an element
             to hide: plain text has none, and that gap is what let a loading label sit, fully
             visible, UNDER the old overlay spinner (the break harness's actual "raro" case). */
          { element: "span", part: "label", slot: "children" },
          { element: "span", part: "post", whenGiven: "post", slot: "post" },
          /* Always in the DOM, like the icon-swap `[data-state]` pattern elsewhere (Select,
             Details): `[data-loading]` is what shows it, never a conditional template branch.
             Sized by button.css off the host's own `data-size`, the same tiers `.sk-icon` uses -
             no `data-size` written here, unlike `pre`/`post`'s icons, so there is nothing for an
             attribute selector to race against. */
          { element: "span", part: "loader", also: ["sk-loader"], attrs: { "aria-hidden": "true" } },
          /* Only exists when `loadingText` is given; the plain label above keeps showing otherwise. */
          { element: "span", part: "loadingLabel", whenGiven: "loadingText", textFromOption: "loadingText" },
        ],
      },
      react: { from: "@skryensya/react/button", name: "Button" },
      mount: "data-sk-button",
    },

    "Button.navigation": {
      intent: ["navigation", "single-destination"],
      host: { element: "a", when: { href: "present" } },
      options: ["variant", "tone", "appearance", "size", "iconOnly", "href"],
      compose: [{ of: "icon", systemOwned: true }],
      hitTesting: { childrenNone: ["Icon"] },
      requires: ["href"],
      forbids: ["disabled", "type", "pressed"],
      /** Link host attrs the contract does not map: where it opens, how it is announced. */
      forward: ["id", "target", "rel", "download", "aria-*"],
      slots: {
        pre: { accepts: "node" },
        children: { accepts: "node", required: true },
        post: { accepts: "node" },
      },
      template: {
        element: "a",
        part: "root",
        also: [buttonParts.interactive],
        host: true,
        children: [
          { element: "span", part: "pre", whenGiven: "pre", slot: "pre" },
          { slot: "children" },
          { element: "span", part: "post", whenGiven: "post", slot: "post" },
        ],
      },
      react: { from: "@skryensya/react/button", name: "Button" },
      mount: "data-sk-button",
    },
  },

  a11y: [
    {
      when: { iconOnly: true },
      requiresOneOf: ["aria-label", "aria-labelledby"],
      because:
        "A square control shows no text, so the host owns the accessible name; the icon child is decorative.",
    },
  ],
} as const satisfies ComponentContract;

/*
 * Derived, never restated. Adding a variant is one edit (in the contract above), and both bindings
 * follow. `disabled` is deliberately absent: it is a native attribute of the `<button>` host, not an
 * option this contract maps onto one, and `Button.navigation` forbids it outright.
 */
export type ButtonVariant = OptionValue<typeof buttonContract.options.variant>;
export type ButtonTone = OptionValue<typeof buttonContract.options.tone>;
export type ButtonAppearance = OptionValue<typeof buttonContract.options.appearance>;
export type ButtonSize = OptionValue<typeof buttonContract.options.size>;
export type ButtonOptions = OptionsOf<typeof buttonContract>;
