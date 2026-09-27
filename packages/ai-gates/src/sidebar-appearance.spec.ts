import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "Sidebar",
  markup: (id, appearance) =>
    `<aside id="${id}" class="sk-sidebar" data-state="expanded" data-appearance="${appearance}" style="position:static;block-size:160px;inline-size:200px">Nav</aside>`,
  paint: ":scope",
  offset: 6,
  blur: 20,
});
