import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Tabs, as Figma structure, drawn as it nests: three tabs, the first selected with its panel shown,
 * the others' panels hidden as the binding hides them. Each tab's label and panel text is a text
 * property. One set per appearance.
 */
export const tabsRealization: Realization = {
  contract: "tabs",
  signature: "Tabs",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["activationMode"],
  width: 360,
  given: { value: "overview" },
  marks: {
    '.sk-tabs__trigger[data-value="overview"]': { "data-selected": "", "aria-selected": "true" },
    '.sk-tabs__content[data-value="activity"]': { hidden: "" },
    '.sk-tabs__content[data-value="settings"]': { hidden: "" },
  },
  slots: {},
  collections: {
    items: {
      slot: "label",
      items: [
        { options: { value: "overview" }, text: "Overview", more: { children: "A summary of the account and its recent changes." } },
        { options: { value: "activity" }, text: "Activity", more: { children: "Every change, newest first." } },
        { options: { value: "settings" }, text: "Settings", more: { children: "Preferences for this account." } },
      ],
    },
  },
  icons,
  grid: { columns: ["variant"], rows: ["orientation", "size"], descending: [] },
  stage,
};
