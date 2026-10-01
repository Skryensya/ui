import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Window, as Figma structure: its open panel drawn alone, a header with its title and the minimize,
 * maximize and close controls over its body, at its default size. Where it floats is the page's.
 * One set per appearance.
 */
export const windowRealization: Realization = {
  contract: "window",
  signature: "Window",
  // One set per appearance, like Dialog and Popover: with nothing on its grid, four appearances in
  // one set would have no place to go.
  splitBy: "appearance",
  nested: true,
  drawFrom: ".sk-window__content",
  state: noStates,
  overlays: { before: "state layer" },
  ring: "focus ring",
  // The trigger that opens it is a Button of its own; resizing adds edges no one sees at rest.
  exclude: ["resizable", "triggerIconOnly"],
  width: 360,
  given: { defaultWidth: 360, defaultHeight: 240, closeLabel: "Close", minimizeLabel: "Minimize", maximizeLabel: "Maximize", restoreLabel: "Restore" },
  // Open, as the machine marks it.
  // Restore shows only once maximized: the machine hides it until then.
  marks: { ".sk-window__content": { "data-state": "open" }, '[data-stage="default"]': { hidden: "" } },
  slots: {
    trigger: { holds: "text", sample: "Open notes", hidden: true },
    title: { holds: "text", sample: "Notes" },
    children: { holds: "text", sample: "Drag the header to move the window; its edges resize it." },
  },
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
