import type { ComponentContract } from "./contract.js";

/** A one-time visual invitation to scroll, not a control or a replacement for a scrollbar. */
export type ScrollHintAxis = "horizontal" | "vertical";

export const scrollHintParts = {
  root: "sk-scroll-hint",
  indicator: "sk-scroll-hint__indicator",
  mark: "sk-scroll-hint__mark",
  label: "sk-scroll-hint__label",
} as const;

export const scrollHintAttrs = {
  root: "data-sk-scroll-hint",
  axis: "data-axis",
  scroller: "data-scroller",
  dismissed: "data-dismissed",
} as const;

export const scrollHintContract = {
  id: "scroll-hint",
  category: "layout",
  css: "@skryensya/core/components/scroll-hint.css",
  parts: scrollHintParts,
  hooks: ["--sk-scroll-hint-fg", "--sk-scroll-hint-gap", "--sk-scroll-hint-size", "--sk-scroll-hint-travel"],
  options: {
    axis: { type: "enum", values: ["horizontal", "vertical"], default: "vertical", attr: scrollHintAttrs.axis },
    /** A selector for the actual scroll container. Omitted: nearest scrolling ancestor, then page. */
    scroller: { type: "string", attr: scrollHintAttrs.scroller, machineInput: true },
  },
  signatures: {
    ScrollHint: {
      intent: ["scroll-hint", "scroll-affordance", "swipe-hint"],
      host: { element: "div" },
      mount: scrollHintAttrs.root,
      options: ["axis", "scroller"],
      forward: ["id", "aria-*"],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "div", part: "root", host: true,
        attrs: { hidden: "" },
        children: [
          { element: "span", part: "indicator", attrs: { "aria-hidden": "true" }, children: [{ element: "span", part: "mark" }] },
          { element: "span", part: "label", slot: "children" },
        ],
      },
      react: { from: "@skryensya/react/scroll-hint", name: "ScrollHint" },
    },
  },
} as const satisfies ComponentContract;
