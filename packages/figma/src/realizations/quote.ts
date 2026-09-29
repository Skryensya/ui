import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Quote, as Figma structure, drawn as it nests: the quotation behind its rule, the attribution and the
 * source's title under it. Drawn at a reading width, so the quotation wraps as it does on a page.
 */
export const quoteRealization: Realization = {
  contract: "quote",
  signature: "Quote",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: ["cite"],
  width: 360,
  slots: {
    children: { holds: "text", sample: "Simple things should be simple, complex things should be possible." },
    attribution: { holds: "text", sample: "Alan Kay" },
    source: { holds: "text", sample: "Interview, 2003" },
  },
  icons,
  grid: { columns: [], rows: ["variant"], descending: [] },
  stage,
};
