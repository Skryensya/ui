import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { mountComponentsWithIcons } from "@skryensya/vanilla/auto";
import { lucideIcons } from "@skryensya/icons-lucide";
import { snippets } from "../../../contracts/snippets/index.js";
import { loadTree, renderTree } from "./react-render.js";

import "@skryensya/core/tokens.scss";
import.meta.glob("../../core/css/patterns/*.css", { eager: true });
import.meta.glob("../../core/css/components/*.css", { eager: true });

/* What a real page's own stylesheet does and the kit deliberately does not: paint the canvas and set the
   text colour. Without them dark mode is light text on the browser's default white. */
const base = document.createElement("style");
base.textContent = "body{margin:0;background:var(--color-bg-canvas);color:var(--color-text-primary);font-family:var(--font-family-body)}";
document.head.append(base);

/*
 * ONE PAGE PER DOCUMENT, which is the whole point of this harness and why it is not `main.tsx`.
 *
 * `main.tsx` stacks 175 canonical components into one page, so it can only ask component-level questions:
 * a whole page inside another page's `<main>` would be two mains and two h1s, and the landmark, heading
 * and bypass-block rules (the ones that matter for a page) could not run. Here the document IS the page:
 * `?id=<snippet id>&binding=vanilla|react` renders that snippet's tree directly under `<body>`, so axe
 * judges it as the page it claims to be, and the keyboard checks walk a real tab order.
 */
declare global {
  interface Window {
    gateError?: string;
  }
}

async function render(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const snippet = snippets.find((entry) => entry.id === params.get("id"));
  if (!snippet) throw new Error(`no snippet "${params.get("id")}"`);
  const host = document.getElementById("page")!;

  if (params.get("binding") === "react") {
    await loadTree(snippet.tree);
    flushSync(() => createRoot(host).render(renderTree(snippet.tree)));
  } else {
    host.innerHTML = emitMarkup(snippet.tree, { idPrefix: snippet.id });
    await mountComponentsWithIcons(host, lucideIcons);
  }
  document.title = `${snippet.id}`;
  document.body.dataset.ready = "true";
}

render().catch((error: unknown) => {
  window.gateError = error instanceof Error ? error.message : String(error);
  document.body.dataset.ready = "error";
});
