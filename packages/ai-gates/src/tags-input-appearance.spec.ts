import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "TagsInput",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-tags-input" data-appearance="${appearance}"><div class="sk-tags-input__control" style="inline-size:220px"><input aria-label="Temas"></div></div>`,
  paint: ".sk-tags-input__control",
  offset: 3,
  blur: 10,
});
