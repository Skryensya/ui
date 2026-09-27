import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "PasswordInput",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-password-input" data-appearance="${appearance}"><div class="sk-password-input__control" style="inline-size:200px"><input type="password" aria-label="Clave"></div></div>`,
  paint: ".sk-password-input__control",
  offset: 3,
  blur: 10,
});
