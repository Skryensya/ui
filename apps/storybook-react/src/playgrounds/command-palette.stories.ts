import "@skryensya/core/components/button.css";
import "@skryensya/core/components/command-palette.css";
import "@skryensya/core/components/dialog.css";
import "@skryensya/core/patterns/dialog-vaul.css";
import "@skryensya/core/patterns/icon.css";
import "@skryensya/core/patterns/layout.css";
import {
  commandPaletteMobileViewport,
  commandPalettePlaygroundArgTypes,
  commandPalettePlaygroundTree,
  type CommandPalettePlaygroundArgs,
} from "@skryensya/storybook-kit/command-palette-playground";
import { argsStory, type Meta, type StoryObj } from "../tree-story";

export default { title: "Playground/CommandPalette" } satisfies Meta;

/* The palette as a desktop reader gets it: a centred box over the page, at any width. */
export const Desktop: StoryObj<CommandPalettePlaygroundArgs> = argsStory(commandPalettePlaygroundTree, {
  args: { vaul: false },
  argTypes: commandPalettePlaygroundArgTypes,
});

/* The same palette on a phone: drawn in a phone's viewport, where it becomes the bottom sheet. */
export const Mobile: StoryObj<CommandPalettePlaygroundArgs> = argsStory(commandPalettePlaygroundTree, {
  args: { vaul: true },
  argTypes: commandPalettePlaygroundArgTypes,
  globals: { viewport: commandPaletteMobileViewport },
});
