import { tokenAppearanceGate } from "./token-appearance.js";

tokenAppearanceGate({
  name: "Kbd",
  markup: (id, appearance) => `<kbd id="${id}" class="sk-kbd" data-appearance="${appearance}">K</kbd>`,
  offset: 2,
});
