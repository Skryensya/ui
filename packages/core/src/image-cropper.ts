import type { ComponentContract, ContractTemplate, OptionsOf, OptionValue } from "./contract.js";
import {
  IMAGE_CROPPER_MAX_ZOOM,
  IMAGE_CROPPER_MIN_ZOOM,
  imageCropperRatios,
  type ImageCropperCrop,
  type ImageCropperValue,
} from "./image-cropper-model.js";

/*
 * IMAGE CROPPER, a crop window over an image, with the controls to place it.
 *
 * THE ENGINE IS CROPPER.JS v2 AND THE PROMISE IS NOT. The picture is panned, zoomed and rotated by Cropper.js's elements,
 * and the pixels of the result come out of its `$toCanvas`. Everything a consumer can see of it stops at
 * `image-cropper-controller.ts`: the public value is `{ position, zoom, rotation, frame? }`, all ratios and degrees, the
 * crop is plain numbers in the image's own pixels, and no Cropper.js type or instance crosses that line. Cropper.js is
 * imported lazily, on the first connect, so a page that never shows a cropper never loads it and a server never has to.
 *
 * ONE CONTROLLER, TWO BINDINGS. The model (`image-cropper-model.ts`) is the geometry and the rule that a crop never contains
 * an empty corner; the controller (`image-cropper-controller.ts`) is the DOM behaviour: it adapts Cropper.js to that model
 * and wires the toolbar. The Vanilla enhancer and the React effect each call `connectImageCropper` on their root and do
 * nothing else, which is how both of them draw the same crop for the same value.
 *
 * THE TOOLBAR IS PART OF THE TEMPLATE, NOT BUILT BY SCRIPT. Every button, slider and group is in the markup both bindings
 * emit, in English, so the component reads and tabs correctly before any script has run and the two bindings can be held to
 * one DOM. The controller only wires what is already there. A different language is `labels`, applied over those defaults.
 *
 * NOT HERE: uploading, and choosing the file. `FileUpload` and this stay independently reusable; the example that joins them
 * lives in the docs, and the join is the consumer's `src`.
 */
export const imageCropperParts = {
  root: "sk-image-cropper",
  /** The stage and its instructions: the large half of the component. */
  workspace: "sk-image-cropper__workspace",
  /** Everything that is not the picture: the preview, the adjustments and the actions. Beside the stage when there is room, under it when there is not. */
  side: "sk-image-cropper__side",
  /** The editing canvas. Focusable: it is where the keyboard moves, zooms and turns the picture. */
  stage: "sk-image-cropper__stage",
  /** Where Cropper.js draws. Hidden from assistive technology: the stage is what is named and operated. */
  surface: "sk-image-cropper__surface",
  /** What the stage says in place of the picture: that it is loading, or why it could not. */
  message: "sk-image-cropper__message",
  /** The keyboard instructions the stage is described by. Visually hidden, never `display: none`. */
  help: "sk-image-cropper__help",
  /** The live preview of the crop. Decorative: the same picture, smaller. */
  preview: "sk-image-cropper__preview",
  previewCanvas: "sk-image-cropper__preview-canvas",
  /** The HUD controls over the picture: zoom and quarter-turn rotation. */
  controls: "sk-image-cropper__controls",
  group: "sk-image-cropper__group",
  groupLabel: "sk-image-cropper__group-label",
  /** Any button of the toolbar. It is also an `sk-button`. */
  control: "sk-image-cropper__control",
  range: "sk-image-cropper__range",
  /** The number beside a range: a percentage, a number of degrees. */
  output: "sk-image-cropper__output",
  ratioInput: "sk-image-cropper__ratio-input",
  /** External action row, when a consumer chooses to compose one beside the cropper. */
  actions: "sk-image-cropper__actions",
  /** The polite live region that announces what a finished change did. */
  live: "sk-image-cropper__live",
} as const;

export type ImageCropperPart = keyof typeof imageCropperParts;
export type ImageCropperPartClass = (typeof imageCropperParts)[ImageCropperPart];

export const imageCropperAttrs = {
  /** The enhancer's attachment point. */
  root: "data-sk-image-cropper",
  /** Marks the status of the picture on the root: `loading`, `ready` or `error`. Written by the controller. */
  status: "data-status",
  stage: "data-sk-image-cropper-stage",
  surface: "data-sk-image-cropper-surface",
  message: "data-sk-image-cropper-message",
  help: "data-sk-image-cropper-help",
  preview: "data-sk-image-cropper-preview",
  live: "data-sk-image-cropper-live",
  /** A button's job: `apply`, `reset`, `cancel`, `zoom-*` or `rotate-right`. */
  action: "data-sk-image-cropper-action",
  /** An aspect button's ratio: `free`, `original`, `1:1`… */
  aspect: "data-sk-image-cropper-aspect",
  /** A shape button's shape: `rectangle` or `circle`. */
  shape: "data-sk-image-cropper-shape",
  /** Which range a slider is: `zoom` or `rotation`. */
  range: "data-sk-image-cropper-range",
  /** Which number an output shows. */
  output: "data-sk-image-cropper-output",
  ratioInput: "data-sk-image-cropper-ratio",
  /** The key of the label that names this node, so `labels` can replace its text. */
  label: "data-sk-image-cropper-label",
  /** The key of the label that is this node's visible text. */
  text: "data-sk-image-cropper-text",
} as const;

/** The model's types, re-exported where a consumer looks for them: none of them mentions Cropper.js. */
export type {
  ImageCropperAspect,
  ImageCropperCrop,
  ImageCropperFrame,
  ImageCropperShape,
  ImageCropperValue,
} from "./image-cropper-model.js";

/* ---------------------------------------------------------------------------------------------- *
 * Labels
 * ---------------------------------------------------------------------------------------------- */

/**
 * Every word the component says, in English. Authored markup and the template both carry these, and `labels` replaces any of
 * them. `{value}` in an announcement is where the number goes.
 */
export const imageCropperLabels = {
  stage: "Crop area",
  stageHelp:
    "Arrow keys move the image, Shift for larger steps. Plus and minus zoom. Square brackets rotate one degree, R rotates a quarter turn. Zero resets.",
  aspectGroup: "Aspect ratio",
  aspectFree: "Free",
  aspectOriginal: "Original",
  aspectCustom: "Custom ratio, width divided by height",
  shapeGroup: "Crop shape",
  shapeRectangle: "Rectangle",
  shapeCircle: "Circle",
  zoomGroup: "Zoom",
  zoomOut: "Zoom out",
  zoomIn: "Zoom in",
  zoomRange: "Zoom",
  rotationGroup: "Rotation",
  rotateLeft: "Rotate left 90 degrees",
  rotateRight: "Rotate 90 degrees",
  rotationRange: "Rotation",
  rotationReset: "Reset rotation",
  reset: "Reset",
  apply: "Apply",
  cancel: "Cancel",
  preview: "Preview",
  loading: "Loading image…",
  loadError: "The image could not be loaded.",
  announceZoom: "Zoom {value}%",
  announceRotation: "Rotation {value} degrees",
  announceMoved: "Image moved",
  announceFrame: "Crop area resized",
  announceReset: "Crop reset",
  announceAspect: "Aspect ratio {value}",
  announceShape: "{value} crop",
  announceApplied: "Crop applied",
} as const;

export type ImageCropperLabelKey = keyof typeof imageCropperLabels;
export type ImageCropperLabels = { readonly [K in ImageCropperLabelKey]: string };

/* ---------------------------------------------------------------------------------------------- *
 * The public types, none of which mention Cropper.js
 * ---------------------------------------------------------------------------------------------- */

export type ImageCropperErrorCode =
  /** The image could not be fetched or decoded. */
  | "load"
  /** The image is from another origin without CORS, so the browser will not let a canvas read it. */
  | "cors"
  /** Nothing to export: the image has not loaded, or the cropper was destroyed meanwhile. */
  | "not-ready"
  /** The browser could not produce the file: an unsupported type, or a canvas too large. */
  | "export";

export type ImageCropperError = {
  readonly code: ImageCropperErrorCode;
  /** In English, written for the developer: what happened and what to do. */
  readonly message: string;
};

/** Derived from the option, never restated. */
export type ImageCropperOutputType = OptionValue<typeof imageCropperContract.options.outputType>;

export type ImageCropperExportOptions = {
  /** The file type. A circle is always `image/png`: it is the only one of these with transparency everywhere. */
  readonly type?: ImageCropperOutputType;
  /** 0 to 1, for `image/jpeg` and `image/webp`. */
  readonly quality?: number;
  /** The output's width in pixels. Alone, the height follows the window's own ratio. */
  readonly width?: number;
  readonly height?: number;
  /** What fills the corners a rotation exposes in a JPEG, which has no transparency. Default white. */
  readonly background?: string;
};

export type ImageCropperChangeDetails = {
  readonly value: ImageCropperValue;
  readonly crop: ImageCropperCrop;
};

export type ImageCropperConfirmDetails = ImageCropperChangeDetails & {
  readonly shape: ImageCropperShapeOption;
  /** The ratio the crop is held to, or `null` when it is free. */
  readonly aspect: number | null;
  /** The file of this crop. Rejects with an `ImageCropperError`; resolves once, with a `Blob` of the type that was produced. */
  readonly exportBlob: (options?: ImageCropperExportOptions) => Promise<Blob>;
  /** The canvas of this crop, circular and transparent for a circle. Rejects like `exportBlob`. */
  readonly exportCanvas: (options?: ImageCropperExportOptions) => Promise<HTMLCanvasElement>;
};

export type ImageCropperErrorDetails = { readonly error: ImageCropperError };

export const imageCropperEvents = {
  /** Every change of the value, while it is happening: a drag, a slider, a key. */
  valueChange: "sk:imagecroppervaluechange",
  /** A change that has ended: the pointer was lifted, the key was released, the slider settled. */
  valueChangeEnd: "sk:imagecroppervaluechangeend",
  /** Apply was chosen. */
  confirm: "sk:imagecropperconfirm",
  /** Cancel was chosen. */
  cancel: "sk:imagecroppercancel",
  /** The reader chose another shape on the toolbar. */
  shapeChange: "sk:imagecroppershapechange",
  /** The reader chose another aspect ratio on the toolbar. */
  aspectChange: "sk:imagecropperaspectchange",
  /** The picture is loaded and the crop is ready. */
  ready: "sk:imagecropperready",
  /** The picture could not load, or an export from the toolbar failed. */
  error: "sk:imagecroppererror",
} as const;

/* ---------------------------------------------------------------------------------------------- *
 * Template
 * ---------------------------------------------------------------------------------------------- */

const A = imageCropperAttrs;
const L = imageCropperLabels;

const label = (key: ImageCropperLabelKey): Record<string, string> => ({ "aria-label": L[key], [A.label]: key });
const visibleText = (key: ImageCropperLabelKey): ContractTemplate => ({
  element: "span",
  attrs: { [A.text]: key },
  text: L[key],
});
const icon = (name: string): ContractTemplate => ({ element: "span", attrs: { "data-sk-icon": name, "data-sk-icon-size": "sm" } });

/** An icon-only button. The label is its whole name, so it carries the label key. */
const iconControl = (action: string, key: ImageCropperLabelKey, glyph: string, extra: Record<string, string> = {}): ContractTemplate => ({
  element: "button",
  part: "control",
  also: ["sk-button", "sk-interactive"],
  attrs: { type: "button", [A.action]: action, ...label(key), "data-icon-only": "", "data-size": "sm", "data-variant": "ghost", ...extra },
  children: [icon(glyph)],
});

/** A button whose visible text is its name. */
const textControl = (
  attrs: Record<string, string>,
  key: ImageCropperLabelKey | null,
  variant: "ghost" | "soft" | "solid",
  text?: string,
  more: Partial<ContractTemplate> = {},
): ContractTemplate => ({
  element: "button",
  part: "control",
  also: ["sk-button", "sk-interactive"],
  attrs: { type: "button", ...attrs, "data-size": "sm", "data-variant": variant },
  children: [key ? visibleText(key) : { element: "span", text: text ?? "" }],
  ...more,
});

const group = (key: ImageCropperLabelKey, children: readonly ContractTemplate[]): ContractTemplate => ({
  element: "div",
  part: "group",
  attrs: { role: "group", ...label(key) },
  children: [{ element: "span", part: "groupLabel", attrs: { "aria-hidden": "true", [A.text]: key }, text: L[key] }, ...children],
});

export const imageCropperTemplateChildren: readonly ContractTemplate[] = [
  {
    element: "div",
    part: "workspace",
    children: [
      {
        element: "div",
        part: "stage",
        attrs: { tabindex: "0", role: "group", [A.stage]: "", ...label("stage") },
        children: [
          { element: "div", part: "surface", attrs: { "aria-hidden": "true", [A.surface]: "" } },
          { element: "p", part: "message", attrs: { hidden: "", [A.message]: "" } },
          {
            element: "div",
            part: "controls",
            children: [
              group("zoomGroup", [iconControl("zoom-out", "zoomOut", "zoom-out"), iconControl("zoom-in", "zoomIn", "zoom-in")]),
              group("rotationGroup", [iconControl("rotate-right", "rotateRight", "refresh")]),
            ],
          },
        ],
      },
      { element: "p", part: "help", attrs: { [A.help]: "", [A.text]: "stageHelp" }, text: L.stageHelp },
    ],
  },
  {
    element: "div",
    part: "side",
    children: [],
  },
  { element: "div", part: "live", attrs: { role: "status", "aria-live": "polite", "aria-atomic": "true", [A.live]: "" } },
];

/* ---------------------------------------------------------------------------------------------- *
 * Contract
 * ---------------------------------------------------------------------------------------------- */

export const imageCropperContract = {
  id: "image-cropper",
  category: "content",
  css: "@skryensya/core/components/image-cropper.css",
  parts: imageCropperParts,
  events: imageCropperEvents,
  eventDetails: {
    valueChange: {
      detail: { value: "ImageCropperValue", crop: "ImageCropperCrop" },
      reactProp: "onValueChange",
      reactDetail: "ImageCropperChangeDetails",
      source: "root",
    },
    valueChangeEnd: {
      detail: { value: "ImageCropperValue", crop: "ImageCropperCrop" },
      reactProp: "onValueChangeEnd",
      reactDetail: "ImageCropperChangeDetails",
      source: "root",
    },
    confirm: {
      detail: {
        value: "ImageCropperValue",
        crop: "ImageCropperCrop",
        shape: "ImageCropperShapeOption",
        aspect: "number | null",
        exportBlob: "(options?: ImageCropperExportOptions) => Promise<Blob>",
        exportCanvas: "(options?: ImageCropperExportOptions) => Promise<HTMLCanvasElement>",
      },
      reactProp: "onCropConfirm",
      reactDetail: "ImageCropperConfirmDetails",
      source: "root",
      trigger: "control",
    },
    shapeChange: {
      detail: { shape: "ImageCropperShapeOption" },
      reactProp: "onShapeChange",
      reactDetail: "ImageCropperShapeOption",
      source: "root",
      trigger: "control",
    },
    aspectChange: {
      detail: { aspect: "ImageCropperAspect" },
      reactProp: "onAspectChange",
      reactDetail: "ImageCropperAspect",
      source: "root",
      trigger: "control",
    },
    cancel: { detail: {}, reactProp: "onCancel", reactDetail: "void", source: "root", trigger: "control" },
    ready: {
      detail: { value: "ImageCropperValue", crop: "ImageCropperCrop" },
      reactProp: "onReady",
      reactDetail: "ImageCropperChangeDetails",
      source: "root",
    },
    error: {
      detail: { error: "ImageCropperError" },
      reactProp: "onError",
      reactDetail: "ImageCropperError",
      source: "root",
    },
  },
  hooks: [
    "--sk-image-cropper-bg",
    "--sk-image-cropper-radius",
    "--sk-image-cropper-gap",
    "--sk-image-cropper-stage-min-block-size",
    "--sk-image-cropper-stage-aspect-ratio",
    "--sk-image-cropper-overlay",
    "--sk-image-cropper-overlay-opacity",
    "--sk-image-cropper-frame-color",
    "--sk-image-cropper-frame-width",
    "--sk-image-cropper-grid-color",
    "--sk-image-cropper-handle-size",
    "--sk-image-cropper-handle-color",
    "--sk-image-cropper-focus-ring",
    "--sk-image-cropper-panel-bg",
    "--sk-image-cropper-preview-size",
    "--sk-image-cropper-side-size",
  ],

  options: {
    /** The picture to crop. Same-origin, a data or blob URL, or a CORS-enabled URL when the crop is to be exported. */
    src: { type: "string", attr: "data-src", machineInput: true },
    /** What the picture shows: the stage is described by it. An empty string only when the picture is decoration. */
    alt: { type: "string", attr: "data-alt", machineInput: true },
    /** Names the whole cropper. A group name, for when one page holds several. */
    label: { type: "string", attr: "aria-label" },
    /** The shape of the crop. A circle is always 1:1, whatever `aspect` says, and exports as a transparent PNG. */
    shape: { type: "enum", values: ["rectangle", "circle"], default: "rectangle", attr: "data-shape", machineInput: true },
    /** `free`, `original`, or a ratio as a number (`1.5`) or as `16:9`. */
    aspect: { type: "string", default: "free", attr: "data-aspect", machineInput: true },
    /** The least the picture can be zoomed: 1 is the picture just covering the window. */
    minZoom: { type: "number", default: IMAGE_CROPPER_MIN_ZOOM, min: 0.1, attr: "data-min-zoom", machineInput: true },
    /** The most the picture can be zoomed. */
    maxZoom: { type: "number", default: IMAGE_CROPPER_MAX_ZOOM, min: 1, attr: "data-max-zoom", machineInput: true },
    /** The value the crop starts from, as JSON: `{"position":{"x":0.5,"y":0.5},"zoom":1,"rotation":0}`. */
    value: { type: "string", attr: "data-value", machineInput: true },
    /** Nothing can be changed, and nothing can be applied. */
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    /** The crop is shown and can be applied, but not changed. */
    readOnly: { type: "boolean", default: false, attr: "data-read-only", trueValue: "", machineInput: true },
    /** The rule-of-thirds lines inside the window. */
    showGrid: { type: "boolean", default: true, attr: "data-grid", falseValue: "false", machineInput: true },
    /** The HUD controls (zoom and rotation). Crop confirmation and reset are called externally through the handle. */
    showControls: { type: "boolean", default: true, attr: "data-controls", falseValue: "false" },
    /** Zoom with the mouse wheel over the stage. Off by default: a wheel is also how a page scrolls past it. */
    wheelZoom: { type: "boolean", default: false, attr: "data-wheel-zoom", trueValue: "", machineInput: true },
    /** The file type of an export from the toolbar. A circle is always PNG. */
    outputType: {
      type: "enum",
      values: ["image/png", "image/jpeg", "image/webp"],
      default: "image/png",
      attr: "data-output-type",
      machineInput: true,
    },
    /** 0 to 1, for JPEG and WebP. */
    outputQuality: { type: "number", default: 0.92, min: 0, max: 1, attr: "data-output-quality", machineInput: true },
    /** The width of an export in pixels. Without it, the window's own width in the picture's pixels. */
    outputWidth: { type: "number", min: 1, attr: "data-output-width", machineInput: true },
    outputHeight: { type: "number", min: 1, attr: "data-output-height", machineInput: true },
    /** Set to `anonymous` to crop and export an image from another origin that sends CORS headers. */
    crossOrigin: { type: "enum", values: ["anonymous", "use-credentials"], attr: "data-cross-origin", machineInput: true },
    /** Replacements for any of the words the component says, as a JSON object keyed by label name. */
    labels: { type: "string", attr: "data-labels", machineInput: true },
  },

  signatures: {
    ImageCropper: {
      intent: [
        "image-cropper",
        "crop-image",
        "avatar-crop",
        "profile-picture-crop",
        "cover-image-crop",
        "rotate-and-zoom-image",
        "crop-to-aspect-ratio",
      ],
      host: { element: "div" },
      mount: imageCropperAttrs.root,
      options: [
        "src",
        "alt",
        "label",
        "shape",
        "aspect",
        "minZoom",
        "maxZoom",
        "value",
        "disabled",
        "readOnly",
        "showGrid",
        "showControls",
        "wheelZoom",
        "outputType",
        "outputQuality",
        "outputWidth",
        "outputHeight",
        "crossOrigin",
        "labels",
      ],
      forward: ["id", "aria-*"],
      slots: {},
      compose: [{ of: "icon", systemOwned: true }, { of: "button", systemOwned: true }],
      template: {
        element: "div",
        part: "root",
        host: true,
        attrsWhen: [{ option: "label", given: true, attrs: { role: "group" } }],
        children: imageCropperTemplateChildren,
      },
      react: { from: "@skryensya/react/image-cropper", name: "ImageCropper" },
    },
  },

  a11y: [
    {
      when: { src: "present" },
      requiresOneOf: ["alt"],
      because:
        "The stage is described by what the picture shows, so it needs an alt, empty only when the picture is decoration. The component never invents one.",
    },
  ],
} as const satisfies ComponentContract;

/** Derived, never restated. */
export type ImageCropperShapeOption = OptionValue<typeof imageCropperContract.options.shape>;
export type ImageCropperOptions = OptionsOf<typeof imageCropperContract>;
