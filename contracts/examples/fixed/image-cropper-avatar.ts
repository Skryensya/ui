import type { Snippet } from "./snippet.js";

/* In real use `src` is the person's own image: a same-origin URL, a `blob:` URL from a file input, or a CORS-enabled one. This is a photo the docs serve. */
const picture = "/demos/lightbox/fjord.jpg";

export const imageCropperAvatarSnippet: Snippet = {
  id: "image-cropper-avatar",
  level: "component",
  intent: "Let a person choose the part of a photo that becomes their round profile picture.",
  notes: [
    "`shape: \"circle\"` is the whole recipe: the window is 1:1 whatever `aspect` says, the faded part outside it is round too, and the export is a transparent PNG with the circle already cut, not a square to mask afterwards.",
    "`alt` says what the picture shows, never what the control does. The stage is described by it.",
    "`label` names the whole group, for a settings page that could hold more than one cropper.",
  ],
  tree: {
    contract: "image-cropper",
    signature: "ImageCropper",
    options: {
      src: picture,
      alt: "Four coloured quarters",
      shape: "circle",
      label: "Profile picture",
      maxZoom: 3,
    },
  },
};
