import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "Callout",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-callout" data-tone="info" data-appearance="${appearance}" style="inline-size:240px"><div class="sk-callout__content">Aviso</div></div>`,
  paint: ":scope",
  offset: 4,
  blur: 16,
});
