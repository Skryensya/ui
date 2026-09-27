import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "Footer",
  markup: (id, appearance) =>
    `<footer id="${id}" class="sk-footer" data-surface="surface" data-appearance="${appearance}" style="inline-size:260px">Pie</footer>`,
  paint: ":scope",
  offset: 6,
  blur: 20,
});
