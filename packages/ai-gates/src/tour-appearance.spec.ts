import { surfaceAppearanceGate } from "./surface-appearance.js";

/* One step's box, shown statically in the flow. */
surfaceAppearanceGate({
  name: "Tour",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-tour" data-appearance="${appearance}"><div class="sk-tour__popover" style="position:static;display:block;inline-size:220px;opacity:1;visibility:visible">Paso</div></div>`,
  paint: ".sk-tour__popover",
  offset: 5,
  blur: 20,
});
