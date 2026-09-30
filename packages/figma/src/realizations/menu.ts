import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Menu, as Figma structure: its open list drawn alone, three commands, a checkbox item among them.
 * The trigger that opens it is a Button of its own. Each label is a text property.
 */
export const menuRealization: Realization = {
  contract: "menu",
  signature: "Menu",
  nested: true,
  drawFrom: ".sk-menu__content",
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  // The trigger's options shape the Button that opens it, not the list; the safety triangle is a debug aid.
  exclude: ["triggerWeldStart", "triggerWeldEnd", "triggerIconOnly", "triggerVariant", "triggerSize", "triggerTone", "debugSafetyTriangle"],
  width: 220,
  given: { label: "Actions", triggerLabel: "Actions" },
  // Open, as the machine marks it.
  marks: { ".sk-menu__content": { "data-state": "open" } },
  slots: {},
  collections: {
    items: {
      slot: "label",
      items: [
        { options: { value: "rename" }, text: "Rename" },
        { options: { value: "duplicate" }, text: "Duplicate" },
        { options: { value: "favorite", kind: "checkbox" }, text: "Favorite" },
      ],
    },
  },
  icons,
  grid: { columns: ["density"], rows: [], descending: [] },
  stage,
};
