import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

/*
 * IMAGE CROPPER DEMOS. Every example crops the same photograph, a fjord, served from the docs' own `public/demos/lightbox`, the one
 * the Lightbox demos use. It is 1800 by 1200 with its subject off centre, so a crop that moves, zooms or turns is visibly a
 * different crop. It is same-origin, which is what lets Apply export it: an image from elsewhere needs CORS (see the export notes).
 *
 * The examples are the cropper in its jobs, not its options one at a time: an avatar, a banner, a free cut, a number the page chose,
 * a picture already straightened, a cropper that is read-only and one whose picture is missing. The flow that needs a page around it
 * (a file chosen, a crop applied) is `imageCropperFlowTree`, at the end.
 */

/** The picture every example crops. */
export const CROPPER_PICTURE = "/demos/lightbox/fjord.jpg";

const cropper = (t: Translate, options: Record<string, string | number | boolean> = {}): UsageTree => ({
  contract: "image-cropper",
  signature: "ImageCropper",
  options: { src: CROPPER_PICTURE, alt: t("demo.imageCropper.alt"), ...options },
});

/** 1. The default: a rectangle, free, the picture as it comes. */
export const imageCropperTree = (t: Translate): UsageTree => cropper(t, { aspect: "4:3" });

/** 2. A profile picture: a circle, with the small round result beside it. */
export const imageCropperAvatarTree = (t: Translate): UsageTree =>
  cropper(t, { shape: "circle", label: t("demo.imageCropper.avatarLabel"), maxZoom: 3 });

/** 3. Free: the window is the reader's, resized by its corners. */
export const imageCropperFreeTree = (t: Translate): UsageTree => cropper(t, { aspect: "free" });

/** 4. Fixed 16:9, the shape a banner has, with the file at the size the page needs. */
export const imageCropperBannerTree = (t: Translate): UsageTree =>
  cropper(t, { aspect: "16:9", outputWidth: 1600, outputType: "image/jpeg", outputQuality: 0.85 });

/** 5. A ratio the page chose: not a preset, a number. */
export const imageCropperCustomTree = (t: Translate): UsageTree => cropper(t, { aspect: "2.35" });

/** 6. Already zoomed and straightened: a starting value, as a stored crop would come back. */
export const imageCropperValueTree = (t: Translate): UsageTree => ({
  /* `value` is an option (it writes `data-value`), so it goes in `options`, never in `attrs`. */
  ...cropper(t, { aspect: "4:3", value: JSON.stringify({ position: { x: 0.62, y: 0.42 }, zoom: 1.35, rotation: -8 }) }),
  attrs: { class: "ic-value-cropper" },
});

/** 7. Read-only: the crop is shown, not changed. */
export const imageCropperReadOnlyTree = (t: Translate): UsageTree => ({
  ...cropper(t, {
    aspect: "4:3",
    readOnly: true,
    showControls: false,
    value: JSON.stringify({ position: { x: 0.58, y: 0.42 }, zoom: 1.28, rotation: 0 }),
  }),
  attrs: { class: "ic-readonly-cropper" },
});

/** 8. Disabled: nothing can be changed, and the stage is out of the tab order. */
export const imageCropperDisabledTree = (t: Translate): UsageTree => cropper(t, { aspect: "4:3", disabled: true });

/** 9. A picture that is not there: the stage says so, and there is nothing to apply. */
export const imageCropperErrorTree = (t: Translate): UsageTree =>
  cropper(t, { src: "/this-picture-does-not-exist.png", aspect: "4:3", label: t("demo.imageCropper.errorLabel") });

/** 10. Without the adjustments: the picture and the window, and Apply: for a layout that has one shape and no choices. */
export const imageCropperBareTree = (t: Translate): UsageTree => cropper(t, { aspect: "1:1", showControls: false, shape: "circle" });

/*
 * THE ANATOMY'S SPECIMEN: the whole component, with its preview, so that every part is on the drawing. Not interactive: it is a
 * picture of the structure, and `inert` takes it out of the tab order and the pointer's reach.
 */
export const imageCropperAnatomyCss = `.sk-annotated-figure {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated__subject .sk-image-cropper {
  max-inline-size: 44rem;
}
`;

export const imageCropperAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("imageCropperPage.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: cropper(t, { aspect: "4:3" }),
    items: [
      namePart(".sk-image-cropper", "block-start", { mark: "bracket" }),
      namePart(".sk-image-cropper__stage", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-image-cropper__side", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-image-cropper__controls", "inline-end"),
    ],
  },
});

/*
 * THE WHOLE FLOW, JOINED BY THE PAGE AND NOT BY THE COMPONENTS. FileUpload chooses a file, ImageCropper crops a picture, and an
 * ImageFrame shows what came out; none of them knows about the others. What joins them is a dozen lines of the page's own
 * script (`ImageCropperPage.astro`): the file's object URL becomes the cropper's `src`, and the confirmed crop's blob becomes the
 * frame's. That is the recommended shape and the only one: a cropper that reached for a file input, or an uploader that opened a
 * cropper, could not be used without the other.
 *
 * The cropper starts on the sample picture so the example works before anything is chosen.
 */

const stack = (gap: string, ...children: UsageTree[]): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap },
  children,
});

export const imageCropperFlowTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Grid",
  /* `minColumn` decides the lanes itself, so it excludes `responsive`. */
  options: { gap: "lg", minColumn: "md", align: "start" },
  attrs: { class: "ic-flow" },
  children: [
    stack(
      "md",
      {
        contract: "file-upload",
        signature: "FileUpload",
        options: { accept: "image/*", maxFiles: 1, maxFileSize: 8_000_000, name: "picture" },
        attrs: { id: "flow-upload" },
        slots: {
          label: t("demo.imageCropper.flow.uploadLabel"),
          dropzoneLabel: t("demo.imageCropper.flow.uploadDropzone"),
          triggerLabel: t("demo.imageCropper.flow.uploadTrigger"),
        },
      },
      {
        contract: "image-cropper",
        signature: "ImageCropper",
        options: { src: CROPPER_PICTURE, alt: t("demo.imageCropper.flow.alt"), shape: "circle", maxZoom: 3 },
        attrs: { id: "flow-cropper", class: "ic-flow__cropper" },
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", justify: "end" },
        children: [
          { contract: "button", signature: "Button.action", options: { variant: "ghost", size: "sm" }, attrs: { id: "flow-reset" }, children: t("demo.imageCropper.flow.reset") },
          { contract: "button", signature: "Button.action", options: { tone: "accent", size: "sm" }, attrs: { id: "flow-apply" }, children: t("demo.imageCropper.flow.apply") },
        ],
      },
    ),
    {
      contract: "box",
      signature: "Box",
      options: { padding: "md", surface: "surface", border: "subtle" },
      attrs: { class: "ic-flow__result" },
      children: stack(
        "sm",
        { contract: "typography", signature: "Text", options: { textRole: "eyebrow" }, children: t("demo.imageCropper.flow.resultTitle") },
        { contract: "typography", signature: "Text", options: { tone: "secondary", size: "sm" }, attrs: { id: "flow-empty" }, children: t("demo.imageCropper.flow.resultEmpty") },
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: { src: CROPPER_PICTURE, alt: t("demo.imageCropper.flow.resultAlt"), aspect: "1/1", radius: "pill" },
          attrs: { id: "flow-result", hidden: "", style: "inline-size: min(100%, 12rem);" },
        },
      ),
    },
  ],
});
