import type { ComponentContract } from "./contract.js";
export const buttonGroupParts = {
  root: "sk-button-group",
  separator: "sk-button-group__separator",
  text: "sk-button-group__text",
} as const;

/*
 * BUTTON GROUP, the contract: related controls joined flush into one shape. A split button is one
 * of these (a Button and a Menu with an icon-only trigger), not a component of its own.
 *
 * The group owns the WELD. Its members carry nothing for it: the first member loses the corners
 * on its end side, the last on its start side, a middle one both, and each later member pulls
 * back over the previous one's border so the two borders share one pixel column (a subpixel
 * rounding mismatch between two adjacent flex items can no longer open a hairline). Position is
 * read from the DOM, so a three-way group, a separator in the middle, or a member added at runtime
 * needs no prop on anyone. This replaced Button's `weldStart`/`weldEnd` and Menu's
 * `triggerWeldStart`/`triggerWeldEnd`: a flag per member was the author's to remember, and a
 * forgotten one left a rounded corner in the middle of a seam.
 *
 * Members are any control whose face this sheet knows: Button, Menu and Popover (their trigger is
 * a Button), Select (its trigger), Input, NativeSelect, ButtonGroupText. A ButtonGroup inside a
 * ButtonGroup is a spacer row instead: the outer one welds nothing and puts a gap between groups.
 *
 * No enhancer and no machine. Every member already behaves on its own; Tab visits each one, which
 * is what separates this from Toolbar (one Tab stop, arrows between controls) and from Segmented
 * or a ToggleGroup (a choice, not a set of actions).
 *
 * `role="group"`: WAI-ARIA has no split-button or button-group pattern; ARIA17's grouping
 * guidance is what applies. Members announce their own names, so `label` names the set, it is
 * not the only source of anyone's identity.
 */
export const buttonGroupContract = {
  id: "button-group",
  category: "actions",
  css: "@skryensya/core/components/button-group.css",
  parts: buttonGroupParts,
  hooks: [
    "--sk-button-group-brutalist-offset",
    "--sk-button-group-gap",
    "--sk-button-group-separator-color",
    "--sk-button-group-separator-inset",
    "--sk-button-group-shadow",
    "--sk-button-group-text-bg",
    "--sk-button-group-wash",
  ],

  options: {
    /** Which axis the members join on. `vertical` stacks them: zoom in over zoom out. */
    orientation: {
      type: "enum",
      values: ["horizontal", "vertical"],
      default: "horizontal",
      attr: "data-orientation",
    },
    /**
     * The divider between members, always drawn. `full` is the whole height (the group paints it);
     * `inset` is a shorter centred line, drawn by ButtonGroupSeparator.
     */
    separator: {
      type: "enum",
      values: ["full", "inset"],
      default: "full",
      attr: "data-separator",
    },
    /** The group's own accessible name; optional, see `role="group"` above. */
    label: { type: "string", attr: "aria-label" },
    /** The control a ButtonGroupLabel names, by id. */
    htmlFor: { type: "string", attr: "for", prop: "htmlFor" },
  },

  signatures: {
    ButtonGroup: {
      intent: [
        "grouped-actions",
        "joined-buttons",
        "input-with-button",
        "paired-vertical-actions",
        // A split button is a ButtonGroup of a Button and an icon-only Menu, not a component.
        "split-button",
        "primary-action-with-alternatives",
        "save-and-save-as",
      ],
      host: { element: "div" },
      options: ["orientation", "separator", "label"],
      // `dir`: a group can be mirrored on its own, and the weld follows (logical corners).
      forward: ["id", "dir", "aria-*"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "root", host: true, attrs: { role: "group" }, slot: "children" },
      react: { from: "@skryensya/react/button-group", name: "ButtonGroup" },
    },

    ButtonGroupSeparator: {
      intent: ["divide-joined-buttons"],
      host: { element: "span" },
      options: [],
      parents: ["ButtonGroup"],
      slots: {},
      // Decorative: each member already has its own name. A solid fill paints no border, so the
      // seam between two solid members is this line or nothing.
      template: { element: "span", part: "separator", host: true, attrs: { "aria-hidden": "true" } },
      react: { from: "@skryensya/react/button-group", name: "ButtonGroupSeparator" },
    },

    ButtonGroupText: {
      intent: ["static-text-in-a-group", "input-prefix"],
      host: { element: "span" },
      options: [],
      parents: ["ButtonGroup"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "span", part: "text", host: true, slot: "children" },
      react: { from: "@skryensya/react/button-group", name: "ButtonGroupText" },
    },

    ButtonGroupLabel: {
      intent: ["label-an-input-in-a-group"],
      host: { element: "label" },
      options: ["htmlFor"],
      requires: ["htmlFor"],
      parents: ["ButtonGroup"],
      slots: { children: { accepts: "text", required: true } },
      // ButtonGroupText's face as a real <label>: clicking it focuses the input it names.
      template: { element: "label", part: "text", host: true, slot: "children" },
      react: { from: "@skryensya/react/button-group", name: "ButtonGroupLabel" },
    },

  },
} as const satisfies ComponentContract;
