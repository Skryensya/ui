import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { loadTree, renderTree, setPortalContainer } from "@skryensya/react/render-tree";
import type { UsageTree } from "@skryensya/core/usage-tree";
import "@skryensya/core/fonts/hanken-grotesk.css";
import "@skryensya/core/tokens.scss";
import "@skryensya/icons-lucide/select.css";
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

/*
 * THE LATEST TREE WINS. Rendering waits for the binding modules a tree needs, and two requests can
 * finish out of order: a first render still loading its modules resolved after a newer one and put
 * the older page back on the stage, so a change the outline showed never appeared. Each request is
 * numbered, and one that finishes after a newer request was made is dropped.
 */
let latest = 0;

window.makerStage = {
  async render(tree) {
    const request = ++latest;
    await loadTree(tree);
    if (request !== latest) return;
    /* Synchronous, so the parent can measure the moment this resolves. */
    flushSync(() => root.render(renderTree(tree)));
  },
};

document.body.dataset.ready = "true";
window.parent.postMessage({ type: "maker-stage-ready" }, window.location.origin);
