import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "NumberField",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-number-field" data-appearance="${appearance}"><div class="sk-number-field__control" style="inline-size:200px"><input aria-label="Cantidad" value="1"></div></div>`,
  paint: ".sk-number-field__control",
  offset: 3,
  blur: 10,
});
