import { commandPaletteEvents, type CommandPaletteCommandEventDetail } from "@skryensya/core/command-palette";
import { mountIcons } from "@skryensya/vanilla/icon";
import { siteIcons } from "../icons";
import { DOCS_TOUR_COMMAND, DOCS_TOUR_ID, DOCS_TOUR_TEMPLATE_ID } from "../lib/docs-tour";
import tourCss from "@skryensya/core/components/tour.css?inline";
import { insertDeferredStyles } from "./deferred-styles";

/*
 * `/tour` in the command palette. The tour's markup waits in a `<template>` (Base.astro), where the
 * registry's `[data-sk-tour]` scan cannot see it, so neither Tour's enhancer nor its stylesheet is
 * on any page until a reader runs the command. The palette closes before it fires the event, so
 * the tour's focus move to Continue is not undone by the dialog handing focus back.
 */

let bound = false;

async function startDocsTour(): Promise<void> {
  /* Inserted on demand, not `import()`ed: Astro links every stylesheet a page's scripts can reach,
     dynamic imports included, so an import made the tour's CSS render-blocking on every page. */
  insertDeferredStyles([tourCss]);
  const { connectTourRoot, getTour } = await import("@skryensya/vanilla/tour");

  let root = document.getElementById(DOCS_TOUR_ID);
  if (!root) {
    const template = document.getElementById(DOCS_TOUR_TEMPLATE_ID);
    if (!(template instanceof HTMLTemplateElement)) return;
    document.body.append(template.content.cloneNode(true));
    root = document.getElementById(DOCS_TOUR_ID);
    if (!root) return;
    /* The close button's glyph is a `[data-sk-icon]` placeholder, and the page's icon pass ran
       before this markup existed. */
    mountIcons(root, siteIcons);
    connectTourRoot(root);
  }
  getTour(root)?.restart();
}

export function initDocsTour(): void {
  if (bound) return;
  bound = true;
  document.addEventListener(commandPaletteEvents.command, (event) => {
    const { command } = (event as CustomEvent<CommandPaletteCommandEventDetail>).detail;
    if (command === DOCS_TOUR_COMMAND) void startDocsTour();
  });
}
