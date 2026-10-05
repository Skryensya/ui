import type { Ref } from "react";
import { Tour, type TourHandle, type TourStep } from "@skryensya/react/tour";
import "@skryensya/core/components/tour.css";

/*
 * THE MAKER'S TOUR: one stop for each place the work happens, in the order it happens (look at the page,
 * find a component, put it down, change it, ask for it in words, undo, and where everything else lives).
 *
 * It starts only when asked (Help, Take the tour): the kit's Tour never starts itself, and a design tool
 * that opens a guide over your work unprompted is the wrong way round. A step whose target is not on
 * screen is skipped, so a tour started with a panel hidden is shorter, not broken.
 *
 * Every sentence says only what the Maker does. The Inspector line is the contract's own rule: there is
 * no x, y, width, margin or style anywhere in the vocabulary, so layout is structure.
 */
export const MAKER_TOUR_ID = "maker-tour";

export const makerTourSteps: readonly TourStep[] = [
  {
    target: ".maker-artboard[data-active]",
    title: "The canvas",
    description: "Every page of your site sits here as an artboard. Scroll to pan, hold Ctrl or ⌘ and scroll to zoom, and press Shift+1 to fit all the pages.",
    placement: "block-end",
  },
  {
    target: ".maker__left",
    title: "Pages and layers",
    description: "Pages lists the pages of your site and Layers the structure of the open one. Select a layer to select it on the canvas, and drag to reorder.",
    placement: "inline-end",
  },
  {
    target: '[aria-label="Insert blocks and sections"]',
    title: "Insert",
    description: "Opens the palette of components. Drag one onto the canvas, or click it to add it where your selection is.",
    placement: "inline-end",
  },
  {
    target: ".maker__right",
    title: "Inspector",
    description: "Select something on the canvas to change it here. You get the options its component declares, and no x, y or pixel width: layout is structure (a Stack, an Inline, a Grid) and the browser does the rest.",
    placement: "inline-start",
  },
  {
    target: '[aria-label="Editing mode"]',
    title: "Maker AI",
    description: "Switch to AI to describe a change in words. The draft builds on the canvas as it is written, nothing is saved until you press Apply, and one Undo takes it all back.",
    placement: "inline-start",
  },
  {
    target: ".maker-quick-toolbar",
    title: "Undo, play and modes",
    description: "Undo and redo, play the site as a visitor would, switch between editing and interacting with the page, and flip the canvas to dark.",
    placement: "block-start",
  },
  {
    target: ".maker-shell__bar",
    title: "Menus",
    description: "Everything has a menu: File, Edit, View, Page, Insert and Help. Export and Publish are under File, and the width, the zoom and whether your work is saved sit on the right of this bar.",
    placement: "block-end",
  },
];

/** The tour, mounted once in the editor. Start it with the handle: `ref.current?.restart()`. */
export function MakerTour({ handle }: { handle: Ref<TourHandle> }) {
  return <Tour id={MAKER_TOUR_ID} steps={makerTourSteps} ref={handle} />;
}
