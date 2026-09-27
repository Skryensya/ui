import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "TimeField",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-time-field" data-appearance="${appearance}"><div class="sk-time-field__control" style="inline-size:200px">10:30</div></div>`,
  paint: ".sk-time-field__control",
  offset: 3,
  blur: 10,
});
