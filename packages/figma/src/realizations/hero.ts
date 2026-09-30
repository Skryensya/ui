import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Hero, as Figma structure, drawn as it nests: its surface holding a sample stack, a heading, a line
 * and an action, at a width. Surfaces down, alignment across; padding is a scale and left to the
 * page. The heading and line are text properties.
 */
export const heroRealization: Realization = {
  contract: "hero",
  signature: "Hero",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["padding", "paddingExpanded", "heroElement", "appearance"],
  width: 640,
  slots: {},
  content: {
    trees: {
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "sm", align: "start" },
          children: [
            { contract: "typography", signature: "Heading", options: { headingSize: "h2", flush: true }, children: "Ship with confidence" },
            { contract: "typography", signature: "Text", children: "Everything your team needs to plan, build and release." },
            { contract: "button", signature: "Button.action", options: { tone: "accent", variant: "solid" }, children: "Get started" },
          ],
        },
      ],
    },
    names: { "Heading.children": "title", "Text.children": "lede", "Button.action.children": "action" },
  },
  icons,
  grid: { columns: ["align"], rows: ["surface"], descending: [] },
  stage,
};
