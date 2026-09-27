import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "Combobox",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-combobox" data-appearance="${appearance}"><div class="sk-combobox__control" style="inline-size:200px"><input aria-label="País"></div></div>`,
  paint: ".sk-combobox__control",
  offset: 3,
  blur: 10,
});
