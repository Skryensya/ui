import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "DatePicker",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-date-picker" data-appearance="${appearance}"><div class="sk-date-picker__control" style="inline-size:200px"><input aria-label="Fecha"></div></div>`,
  paint: ".sk-date-picker__control",
  offset: 3,
  blur: 10,
});
