import { surfaceAppearanceGate } from "./surface-appearance.js";

/* An open, non-modal panel pinned in the flow: the paint is the drawer's, the geometry is the test's. */
surfaceAppearanceGate({
  name: "Vaul",
  markup: (id, appearance) =>
    `<dialog id="${id}" class="sk-vaul" open data-edge="block-end" data-appearance="${appearance}" style="position:static;inset:auto;inline-size:220px;block-size:120px;translate:none;transform:none">Panel</dialog>`,
  paint: ":scope",
  offset: 6,
  blur: 24,
});
