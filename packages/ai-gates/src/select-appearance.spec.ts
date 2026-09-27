import { surfaceAppearanceGate } from "./surface-appearance.js";

/* The root carries the attribute; its hooks reach the trigger that paints. */
surfaceAppearanceGate({
  name: "Select",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-select" data-appearance="${appearance}"><button class="sk-select__trigger" type="button" style="inline-size:200px">Elige</button></div>`,
  paint: ".sk-select__trigger",
  offset: 3,
  blur: 10,
});
