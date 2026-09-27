import { surfaceAppearanceGate } from "./surface-appearance.js";

/* A non-modal `open` dialog: the paint is the same as a modal one, and it stays in the flow to read. */
surfaceAppearanceGate({
  name: "Dialog",
  markup: (id, appearance) =>
    `<dialog id="${id}" class="sk-dialog" open data-appearance="${appearance}" style="position:static;inline-size:240px"><div class="sk-dialog__body">Cuerpo</div></dialog>`,
  paint: ":scope",
  offset: 8,
  blur: 24,
});
