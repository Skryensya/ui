import { tokenAppearanceGate } from "./token-appearance.js";

tokenAppearanceGate({
  name: "ImageFrame",
  markup: (id, appearance) =>
    `<div id="${id}" class="sk-image-frame" data-aspect="16/9" data-radius="md" data-border="none" data-appearance="${appearance}" style="inline-size:160px"><span class="sk-image-frame__media" style="display:block;background:#89a;inline-size:100%;block-size:100%"></span></div>`,
  offset: 4,
});
