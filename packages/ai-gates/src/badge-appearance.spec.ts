import { tokenAppearanceGate } from "./token-appearance.js";

tokenAppearanceGate({
  name: "Badge",
  markup: (id, appearance) => `<span id="${id}" class="sk-badge" data-tone="accent" data-appearance="${appearance}">Nuevo</span>`,
  offset: 2,
});
