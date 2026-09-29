import type { Realization } from "../realization.js";
import { icons, stage } from "./shared.js";

/*
 * TagsInput, as Figma structure, drawn as it nests: two tags with their remove buttons and the field
 * after them holding its placeholder. Each tag's text is a property; one set per appearance.
 */
export const tagsInputRealization: Realization = {
  contract: "tags-input",
  signature: "TagsInput",
  splitBy: "appearance",
  nested: true,
  state: {
    axis: "state",
    rest: "rest",
    options: ["disabled", "invalid"],
    interactions: [{ name: "focus", pseudo: ":focus-within" }],
  },
  overlays: {},
  ring: "focus ring",
  exclude: ["readOnly", "required", "allowDuplicates", "editable", "delimiter"],
  width: 320,
  given: { label: "Topics", name: "topics" },
  slots: { placeholder: { holds: "text", sample: "Add a topic", option: "placeholder", pseudo: "placeholder" } },
  collections: { items: { slot: "label", items: [{ text: "design" }, { text: "research" }] } },
  icons,
  grid: { columns: ["state"], rows: [], descending: [] },
  stage,
};
