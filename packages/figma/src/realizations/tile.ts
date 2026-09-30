import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

const content = (title: string, description: string): UsageTree => ({ contract: "tile", signature: "TileContent", slots: { title, description } });

/*
 * TileLink, as Figma structure, drawn as it nests: a card that goes somewhere, its title over its
 * description, at a width. Hovered and focused across; one set per appearance. Padding is a scale
 * and left to the layout that places it.
 */
export const tileLinkRealization: Realization = {
  contract: "tile",
  id: "tile-link",
  signature: "TileLink",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: [],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
  },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["padding"],
  width: 320,
  given: { href: "#" },
  slots: {},
  content: { trees: { children: [content("Billing", "Invoices, payment methods and receipts")] } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};

/* TileCheckbox: a card picked by its checkbox, checked and disabled among its states. */
export const tileCheckboxRealization: Realization = {
  ...tileLinkRealization,
  id: "tile-checkbox",
  signature: "TileCheckbox",
  state: {
    axis: "state",
    rest: "unchecked",
    options: ["disabled"],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
    // Checked is the input's, written by the binding from `defaultChecked`.
    attributes: [{ name: "checked", attrs: { checked: "" }, on: "input" }],
  },
  exclude: ["padding", "required", "defaultChecked"],
  given: { name: "plan", value: "team" },
  content: { trees: { children: [content("Team plan", "Up to 20 members, shared billing")] } },
};

/* TileSwitch: a card with a switch that turns a setting on, on and disabled among its states. */
export const tileSwitchRealization: Realization = {
  ...tileCheckboxRealization,
  id: "tile-switch",
  signature: "TileSwitch",
  state: { ...tileCheckboxRealization.state, rest: "off", attributes: [{ name: "on", attrs: { checked: "" }, on: "input" }] },
  given: { name: "alerts", value: "on" },
  content: { trees: { children: [content("Email alerts", "A note when something needs you")] } },
};

/* ExpandableTile: one disclosure card, closed and open, its chevron turned as the binding turns it. */
export const expandableTileRealization: Realization = {
  ...tileLinkRealization,
  id: "expandable-tile",
  signature: "ExpandableTile",
  state: {
    axis: "state",
    rest: "closed",
    options: ["disabled"],
    interactions: [
      { name: "hover", pseudo: ":hover", trigger: "ON_HOVER" },
      { name: "focus", pseudo: ":focus-visible" },
    ],
    attributes: [{ name: "open", attrs: { "data-state": "open", "aria-expanded": "true" }, on: ".sk-tile__trigger", given: { defaultOpen: true } }],
  },
  exclude: ["padding", "defaultOpen"],
  given: {},
  content: {
    trees: {
      children: [
        {
          contract: "tile",
          signature: "ExpandableTileTrigger",
          children: [content("Shipping", "Where and how fast we deliver"), { contract: "tile", signature: "TileChevron" }],
        },
        { contract: "tile", signature: "ExpandableTileContent", children: "Orders ship within two working days." },
      ],
    },
    names: { "ExpandableTileContent.children": "answer" },
  },
};

/* TileRadioGroup: three plan cards, the middle one picked as the binding checks it. */
export const tileRadioGroupRealization: Realization = {
  contract: "tile",
  id: "tile-radio-group",
  signature: "TileRadioGroup",
  splitBy: "appearance",
  nested: true,
  state: { axis: "state", rest: "rest", options: [], interactions: [] },
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["padding", "disabled", "required"],
  width: 480,
  given: { name: "plan", defaultValue: "team" },
  marks: { 'input[value="team"]': { checked: "" } },
  slots: {},
  collections: {
    items: {
      slot: "label",
      items: [
        { options: { value: "solo" }, text: "Solo" },
        { options: { value: "team" }, text: "Team" },
        { options: { value: "company" }, text: "Company" },
      ],
    },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
