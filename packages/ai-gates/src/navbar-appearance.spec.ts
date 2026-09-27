import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "Navbar",
  markup: (id, appearance) =>
    `<header id="${id}" class="sk-navbar" data-appearance="${appearance}" style="position:static;inline-size:280px">Marca</header>`,
  paint: ":scope",
  offset: 4,
  blur: 20,
});
