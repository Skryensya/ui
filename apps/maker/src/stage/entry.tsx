import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { loadTree, renderTree, setPortalContainer } from "@skryensya/react/render-tree";
import type { UsageTree } from "@skryensya/core/usage-tree";
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import "./stage.css";

/*
 * THE STAGE DOCUMENT. It renders one usage tree with the real React binding and does nothing else:
 * no selection, no dragging, no knowledge of the Maker. The chrome in the parent document drives it
 * through `window.makerStage` and reads its DOM (same origin) to paint overlays and resolve drops.
 *
 * Every published stylesheet, not a hand-picked list: a maker page can reach any contract, and
 * `apps/eval-viewer` lost `dialog.css` once by picking.
 */
import.meta.glob("../../../../packages/core/css/components/*.css", { eager: true });
import.meta.glob("../../../../packages/core/css/patterns/*.css", { eager: true });

export type StageApi = {
  render(tree: UsageTree): Promise<void>;
};

declare global {
  interface Window {
    makerStage?: StageApi;
  }
}

const host = document.getElementById("stage")!;
const root = createRoot(host);
setPortalContainer({ current: host });

window.makerStage = {
  async render(tree) {
    await loadTree(tree);
    /* Synchronous, so the parent can measure the moment this resolves. */
    flushSync(() => root.render(renderTree(tree)));
  },
};

document.body.dataset.ready = "true";
window.parent.postMessage({ type: "maker-stage-ready" }, window.location.origin);
