import type { Realization } from "../realization.js";
import { icons, noStates, stage } from "./shared.js";

/*
 * Pagination, as Figma structure, drawn as it nests: page 3 of 10, its neighbours, the ends and the
 * gaps between, previous and next either side. One set per appearance.
 */
export const paginationRealization: Realization = {
  contract: "pagination",
  signature: "Pagination",
  splitBy: "appearance",
  nested: true,
  state: noStates,
  overlays: {},
  ring: "focus ring",
  exclude: [],
  given: { page: 3, total: 10 },
  slots: {},
  icons,
  grid: { columns: [], rows: [], descending: [] },
  stage,
};
