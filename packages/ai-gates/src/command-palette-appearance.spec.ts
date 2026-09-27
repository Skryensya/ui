import { surfaceAppearanceGate } from "./surface-appearance.js";

/* The palette's root is a `.sk-dialog`: Dialog's appearance rules paint it, with no CSS of its own. */
surfaceAppearanceGate({
  name: "CommandPalette",
  markup: (id, appearance) =>
    `<dialog id="${id}" class="sk-dialog sk-command-palette" open data-appearance="${appearance}" style="position:static;inline-size:260px">Buscar</dialog>`,
  paint: ":scope",
  offset: 8,
  blur: 24,
});
