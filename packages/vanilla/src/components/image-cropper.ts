import { imageCropperAttrs } from "@skryensya/core/image-cropper";
import { connectImageCropper, getImageCropper } from "@skryensya/core/image-cropper-controller";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export { imageCropperEvents } from "@skryensya/core/image-cropper";
export type {
  ImageCropperChangeDetails,
  ImageCropperConfirmDetails,
  ImageCropperError,
  ImageCropperExportOptions,
} from "@skryensya/core/image-cropper";
export type { ImageCropperHandle } from "@skryensya/core/image-cropper-controller";
export type { ImageCropperCrop, ImageCropperValue } from "@skryensya/core/image-cropper-model";
export { getImageCropper };

const rootSelector = `[${imageCropperAttrs.root}]`;

/*
 * IMAGE CROPPER, the DOM shell around `@skryensya/core/image-cropper-controller`.
 *
 * As thin as Canvas's, for Canvas's reason: every behaviour is `connectImageCropper`'s, which the React binding runs too, so
 * the only thing left here is giving the mount a way to stop it. The options are the root's own attributes and the
 * controller keeps reading them, so a page that edits `data-aspect` or `data-src` later is changing the cropper.
 *
 * To export or to set a value from script, ask for the handle of a root: `getImageCropper(root)`. To hear a crop confirmed,
 * listen for `sk:imagecropperconfirm` on the root; its `detail` carries the crop and the means to export it.
 */
export function connectImageCropperRoot(root: HTMLElement): () => void {
  const handle = connectImageCropper(root);
  return () => handle.destroy();
}

export const mountImageCropper = createConnectMount({
  key: "image-cropper",
  rootSelector,
  connect: connectImageCropperRoot,
});
