import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const event = (tone: string, icon: string, time: string, heading: string, body: string): UsageTree => ({
  contract: "timeline",
  signature: "TimelineItem",
  options: { tone },
  slots: { icon: { contract: "icon", signature: "Icon", options: { name: icon } }, time, heading, children: body },
});

/*
 * Timeline, as Figma structure, drawn as it nests: three events, each with its marker, time, heading
 * and body as text properties, in the tones a history mixes.
 */
export const timelineRealization: Realization = {
  contract: "timeline",
  signature: "Timeline",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  width: 360,
  slots: {},
  content: {
    trees: {
      children: [
        event("success", "check", "Mar 3", "Order delivered", "Left at the front door."),
        event("accent", "upload", "Mar 2", "Out for delivery", "With the local courier."),
        event("neutral", "clock", "Feb 28", "Order placed", "Payment confirmed."),
      ],
    },
    names: { "TimelineItem.children": "body" },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
