import { surfaceAppearanceGate } from "./surface-appearance.js";

/* The panel shown statically (no `popover` attribute): the paint is the same, and it stays readable. */
surfaceAppearanceGate({
  name: "Popover",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-popover" data-appearance="${appearance}"><div class="sk-popover__content" style="position:static;display:block;inline-size:220px">Contenido</div></div>`,
  paint: ".sk-popover__content",
  offset: 5,
  blur: 20,
});
