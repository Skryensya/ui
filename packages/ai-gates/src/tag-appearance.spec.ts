import { tokenAppearanceGate } from "./token-appearance.js";

tokenAppearanceGate({
  name: "Tag",
  markup: (id, appearance) => `<span id="${id}" class="sk-tag" data-appearance="${appearance}"><span class="sk-tag__label">Diseño</span></span>`,
  offset: 2,
});
