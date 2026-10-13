import type { UsageTree } from "@skryensya/core/usage-tree";
import { commandPaletteDemoTree } from "@docs/demos/command-palette";
import { translator } from "./translate";

/*
 * THE COMMAND PALETTE'S STORIES, as data both Storybooks render. A palette is a modal dialog, and
 * the docs open it with a script (`demos/scripts/command-palette-open.ts`) that a story has no slot
 * for, so the trigger is wired here instead: `wireCommandPaletteDemo`, run after the story renders.
 *
 * Desktop and Mobile are the same tree with the one option that decides the look, `vaul`; what
 * makes a story "mobile" is the VIEWPORT it is drawn in, because the bottom sheet is a media query,
 * not a prop. That is set on the story, so the toolbar's viewport does not have to be remembered.
 */
export type CommandPalettePlaygroundArgs = {
  /** The bottom sheet below the desktop breakpoint. Off, the palette is a centred box at every width. */
  vaul: boolean;
};

export const commandPalettePlaygroundArgs: CommandPalettePlaygroundArgs = { vaul: true };

export const commandPalettePlaygroundArgTypes = {
  vaul: {
    control: "boolean" as const,
    description: "A bottom sheet below the desktop breakpoint (Dialog Vaul). Off keeps the centred box at every width.",
  },
};

export function commandPalettePlaygroundTree({ vaul }: CommandPalettePlaygroundArgs): UsageTree {
  return commandPaletteDemoTree(translator("en"), { vaul });
}

/** The viewport the Mobile story is drawn in (Storybook's built-in `mobile1`, 320px wide). */
export const commandPaletteMobileViewport = { value: "mobile1", isRotated: false } as const;

const WIRED = "data-cmdk-demo-wired";

/**
 * Opens the palette from its demo trigger, the way the docs script does, and then asks the field for
 * the full list: opened by a bare `showModal()` the palette shows no results until it is typed in, and
 * an `input` event is what both bindings answer by filtering on the empty query.
 *
 * ONE LISTENER ON THE DOCUMENT, not one on the trigger. A story's `play` runs once, after the first
 * render, but a global change (the viewport toolbar) re-renders the story, and the Vanilla binding
 * draws a NEW tree each time: a listener bound to the old trigger died with it, and the button did
 * nothing after a viewport switch. A delegated listener outlives every redraw. Installed by the first
 * story that asks and a no-op for stories without a palette, so every tree story can call it.
 */
export function wireCommandPaletteDemo(root: ParentNode): void {
  const doc = root instanceof Document ? root : root.ownerDocument ?? document;
  if (doc.documentElement.hasAttribute(WIRED)) return;
  doc.documentElement.setAttribute(WIRED, "");
  doc.addEventListener("click", (event) => {
    const trigger = (event.target as Element | null)?.closest?.("[data-cmdk-demo-open]");
    if (!trigger) return;
    const dialog = doc.querySelector<HTMLDialogElement>("dialog[data-sk-command-palette]");
    if (!dialog || dialog.open) return;
    dialog.showModal();
    dialog.querySelector("input")?.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
