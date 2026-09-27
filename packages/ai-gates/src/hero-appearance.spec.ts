import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "Hero",
  markup: (id, appearance) =>
    `<section id="${id}" class="sk-hero" data-surface="raised" data-appearance="${appearance}" style="--sk-hero-min-height:8rem;inline-size:260px">Titular</section>`,
  paint: ":scope",
  offset: 8,
  blur: 24,
});
