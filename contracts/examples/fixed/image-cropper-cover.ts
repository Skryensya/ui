import type { Snippet } from "./snippet.js";

/* In real use `src` is the person's own image: a same-origin URL, a `blob:` URL from a file input, or a CORS-enabled one. This is a photo the docs serve. */
const picture = "/demos/lightbox/fjord.jpg";

export const imageCropperCoverSnippet: Snippet = {
  id: "image-cropper-cover",
  level: "component",
  intent: "Cut a photo to the fixed 16:9 shape of a cover or a banner, with the least a person has to decide.",
  notes: [
    "`aspect: \"16:9\"` fixes the window, so the person only places the picture under it; with a fixed ratio there are no handles to resize and nothing to get wrong, which is what a banner that has to fit a layout wants.",
    "The toolbar still offers the other ratios, because the component does: when the layout allows only one, say so with `showControls: false` and let the picture and its two sliders be the whole interface.",
    "`outputWidth` makes the file the size the page needs (1600 wide here) instead of whatever the window happens to be in the picture's pixels; the height follows the ratio.",
    "`outputType` is JPEG with a quality, because a cover is a photograph with no transparency to keep, and a PNG of one is several times the weight for nothing.",
  ],
  tree: {
    contract: "image-cropper",
    signature: "ImageCropper",
    options: {
      src: picture,
      alt: "Four coloured quarters",
      aspect: "16:9",
      outputWidth: 1600,
      outputType: "image/jpeg",
      outputQuality: 0.85,
    },
  },
};
