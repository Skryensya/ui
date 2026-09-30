import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

const button = (label: string, options: Record<string, string>): UsageTree => ({ contract: "button", signature: "Button.action", options, slots: { children: label } });

/*
 * Dialog, as Figma structure, drawn open and as it nests: its title and close button, the message,
 * and a footer of two actions, at a width. The page it covers is not drawn. One set per appearance,
 * the footer's alignment across.
 */
export const dialogRealization: Realization = {
  contract: "dialog",
  signature: "Dialog",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  exclude: ["open", "vaul", "alert"],
  width: 420,
  given: { open: true },
  slots: {
    title: { holds: "text", sample: "Delete this project?" },
    children: { holds: "text", sample: "Everything in it goes too, and it cannot be undone." },
  },
  content: { trees: { footer: [button("Cancel", { variant: "outline" }), button("Delete", { variant: "solid", tone: "danger" })] }, names: { "Button.action.children": "action" } },
  icons,
  grid: { columns: ["footerAlign"], rows: [], descending: [] },
  stage,
};
