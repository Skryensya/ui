import { surfaceAppearanceGate } from "./surface-appearance.js";

surfaceAppearanceGate({
  name: "CodePreview",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-code-preview" data-appearance="${appearance}" style="inline-size:260px"><pre>const a = 1;</pre></div>`,
  paint: ":scope",
  offset: 5,
  blur: 16,
});
