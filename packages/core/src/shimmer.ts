import type { ComponentContract } from "./contract.js";

/*
 * SHIMMER, the contract.
 *
 * A text utility for live, temporary status copy: "Generating response…", "Reading 4 files".
 * It is not a skeleton (Placeholder owns absent content shapes) and not a loader (Loader owns the
 * accessible wait announcement). Shimmer only paints existing text with a moving highlight.
 */
export const shimmerParts = {
  root: "sk-shimmer",
} as const;

export type ShimmerPart = keyof typeof shimmerParts;
export type ShimmerPartClass = (typeof shimmerParts)[ShimmerPart];

export const shimmerContract = {
  id: "shimmer",
  category: "content",
  css: "@skryensya/core/components/shimmer.css",
  parts: shimmerParts,
  hooks: [
    "--sk-shimmer-angle",
    "--sk-shimmer-color",
    "--sk-shimmer-duration",
    "--sk-shimmer-position",
    "--sk-shimmer-spread",
    "--sk-shimmer-text-fill",
  ],
  options: {
    color: { type: "string", styleProperty: "--sk-shimmer-color" },
    duration: { type: "string", styleProperty: "--sk-shimmer-duration" },
    spread: { type: "string", styleProperty: "--sk-shimmer-spread" },
    angle: { type: "string", styleProperty: "--sk-shimmer-angle" },
    once: { type: "boolean", default: false, attr: "data-once", trueValue: "" },
    reverse: { type: "boolean", default: false, attr: "data-reverse", trueValue: "" },
    active: { type: "boolean", default: true, attr: "data-shimmer", falseValue: "false" },
  },
  signatures: {
    Shimmer: {
      intent: ["live-status-text", "temporary-progress-copy", "streaming-response-copy"],
      host: { element: "span" },
      options: ["color", "duration", "spread", "angle", "once", "reverse", "active"],
      slots: { children: { accepts: "text", required: true } },
      template: { element: "span", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/shimmer", name: "Shimmer" },
    },
  },
} as const satisfies ComponentContract;
