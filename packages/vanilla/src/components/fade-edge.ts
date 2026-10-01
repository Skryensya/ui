import { fadeEdgeAttrs } from "@skryensya/core/fade-edge";
import { watchFadeEdge } from "@skryensya/core/fade-edge-dom";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * FADE EDGE, the scroll watcher. Every FadeEdge mounts it: the stylesheet needs the thickness of
 * the root's scrollbars to keep them out of the fade, and only a measurement knows it. Roots that
 * carry `data-scroll-aware` also get `data-at-edge`. The watching itself is core's `watchFadeEdge`,
 * the same call React's effect makes, so both bindings paint the same pixel.
 */
const rootSelector = `[${fadeEdgeAttrs.mount}]`;

export const mountFadeEdge = createConnectMount({ key: "fade-edge", rootSelector, connect: watchFadeEdge });
