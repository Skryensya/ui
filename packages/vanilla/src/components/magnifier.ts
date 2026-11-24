import { MAGNIFIER_DEFAULT_ZOOM, magnifierAttrs, magnifierDispersionStrength, magnifierFilterColor, magnifierParts } from "@skryensya/core/magnifier";
import { createMagnifierView } from "@skryensya/core/magnifier-view";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/* The DOM adapter only finds the elements and reads the zoom; the pointer, the GPU and the fallback are `magnifier-view.ts`, shared with React. */
export function connectMagnifier(root: HTMLElement): () => void {
  const lens = root.querySelector<HTMLCanvasElement>(`:scope > canvas.${magnifierParts.lens}`);
  if (!lens) return () => {};
  const authored = Number.parseFloat(root.getAttribute(magnifierAttrs.zoom) ?? "");
  const view = createMagnifierView(root, lens, {
    zoom: Number.isFinite(authored) ? authored : MAGNIFIER_DEFAULT_ZOOM,
    dispersion: magnifierDispersionStrength(root.getAttribute(magnifierAttrs.dispersion)),
    filter: magnifierFilterColor(root.getAttribute(magnifierAttrs.filter)),
  });
  return () => view.destroy();
}

export const mountMagnifier = createConnectMount({
  key: "magnifier",
  rootSelector: `[${magnifierAttrs.root}]`,
  connect: connectMagnifier,
});
