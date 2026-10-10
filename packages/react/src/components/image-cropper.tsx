import {
  imageCropperAttrs as A,
  imageCropperContract,
  imageCropperLabels,
  imageCropperParts as P,
  type ImageCropperAspect,
  type ImageCropperChangeDetails,
  type ImageCropperConfirmDetails,
  type ImageCropperError,
  type ImageCropperLabelKey,
  type ImageCropperLabels,
  type ImageCropperShapeOption,
} from "@skryensya/core/image-cropper";
import { connectImageCropper, type ImageCropperHandle } from "@skryensya/core/image-cropper-controller";
import {
  IMAGE_CROPPER_MAX_ZOOM,
  IMAGE_CROPPER_MIN_ZOOM,
  sameValue,
  serializeAspect,
  type ImageCropperValue,
} from "@skryensya/core/image-cropper-model";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

/* Derived, never restated: the values and defaults live in the contract. */
const o = imageCropperContract.options;

type CropperLook = Omit<
  SignatureOptionsOf<typeof imageCropperContract, "ImageCropper">,
  "aspect" | "value" | "labels" | "label" | "src" | "alt"
>;

/* `defaultValue` and `onError` are DOM attributes with another meaning (a field's starting text, an image's load failure): here they are the crop's. */
export type ImageCropperProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "defaultValue" | "onError"> &
  CropperLook & {
    /** The picture to crop. A same-origin, `data:` or `blob:` URL, or a CORS-enabled one when the crop is to be exported. */
    src: string;
    /** What the picture shows. Empty only when the picture is decoration. */
    alt: string;
    /** Names the whole cropper, for a page that holds several. */
    label?: string;
    /** `"free"`, `"original"`, or a ratio as a number (`1.5`) or as `"16:9"`. A circle is always 1:1. */
    aspect?: ImageCropperAspect | `${number}:${number}`;
    /** The crop, when you hold it. Pair with `onValueChange`; the cropper keeps showing what you pass. */
    value?: ImageCropperValue;
    /** The crop to start from, and what Reset returns to. */
    defaultValue?: ImageCropperValue;
    /** Replaces any word the component says, such as the labels of the buttons or the announcements. */
    labels?: Partial<ImageCropperLabels>;
    /** Every change of the value as it happens: a drag, a slider, a key. */
    onValueChange?: (details: ImageCropperChangeDetails) => void;
    /** A change that has ended: the pointer was lifted, the key released, the slider settled. */
    onValueChangeEnd?: (details: ImageCropperChangeDetails) => void;
    /** Apply was chosen. `details.exportBlob()` and `details.exportCanvas()` make the file. */
    onCropConfirm?: (details: ImageCropperConfirmDetails) => void;
    /** Cancel was chosen. */
    onCancel?: () => void;
    /** The picture is loaded and the first crop is drawn. */
    onReady?: (details: ImageCropperChangeDetails) => void;
    /** The picture could not load, or an export failed. */
    onError?: (error: ImageCropperError) => void;
    /** The reader chose another shape on the toolbar. Pass `shape` back to keep it. */
    onShapeChange?: (shape: ImageCropperShapeOption) => void;
    /** The reader chose another aspect ratio on the toolbar. Pass `aspect` back to keep it. */
    onAspectChange?: (aspect: ImageCropperAspect) => void;
  };

export type { ImageCropperHandle };

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/*
 * IMAGE CROPPER: the React half. The behaviour is `connectImageCropper`'s, run in an effect on this root exactly as the
 * Vanilla enhancer runs it on authored markup; this component renders the template's parts and hands the controller its
 * callbacks. The options are rendered as attributes and the controller reads them from there, so a prop that changes is an
 * attribute that changes and nothing here has to tell it.
 */
export const ImageCropper = forwardRef<ImageCropperHandle, ImageCropperProps>(function ImageCropper(
  {
    src,
    alt,
    label,
    shape = o.shape.default,
    aspect = "free",
    minZoom = IMAGE_CROPPER_MIN_ZOOM,
    maxZoom = IMAGE_CROPPER_MAX_ZOOM,
    value,
    defaultValue,
    disabled = false,
    readOnly = false,
    showGrid = true,
    showControls = true,
    wheelZoom = false,
    outputType = o.outputType.default,
    outputQuality = o.outputQuality.default,
    outputWidth,
    outputHeight,
    crossOrigin,
    labels: labelOverrides,
    className,
    onValueChange,
    onValueChangeEnd,
    onCropConfirm,
    onCancel,
    onReady,
    onError,
    onShapeChange,
    onAspectChange,
    ...props
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const helpId = useId();
  const handleRef = useRef<ImageCropperHandle | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const words: ImageCropperLabels = { ...imageCropperLabels, ...labelOverrides };
  const aspectText = typeof aspect === "string" && aspect.includes(":") ? aspect : serializeAspect(aspect as ImageCropperAspect);

  /* The callbacks are the latest closures, however often the parent renders: the controller is connected once. */
  const callbacks = {
    onValueChange: (details: ImageCropperChangeDetails) => {
      onValueChange?.(details);
      /* A held value is the parent's to move. If, after this change, it did not move it, the cropper goes back to what it holds. */
      if (valueRef.current) {
        window.setTimeout(() => {
          const held = valueRef.current;
          const handle = handleRef.current;
          if (held && handle && !sameValue(handle.getValue(), held)) handle.setValue(held);
        }, 0);
      }
    },
    onValueChangeEnd,
    onCropConfirm,
    onCancel,
    onReady,
    onError,
    onShapeChange,
    onAspectChange,
  };
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const labelsRef = useRef(labelOverrides);
  labelsRef.current = labelOverrides;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const handle = connectImageCropper(root, {
      defaultValue: value ?? defaultValue,
      labels: labelsRef.current,
      onValueChange: (details) => callbacksRef.current.onValueChange(details),
      onValueChangeEnd: (details) => callbacksRef.current.onValueChangeEnd?.(details),
      onCropConfirm: (details) => callbacksRef.current.onCropConfirm?.(details),
      onCancel: () => callbacksRef.current.onCancel?.(),
      onReady: (details) => callbacksRef.current.onReady?.(details),
      onError: (error) => callbacksRef.current.onError?.(error),
      onShapeChange: (next) => callbacksRef.current.onShapeChange?.(next),
      onAspectChange: (next) => callbacksRef.current.onAspectChange?.(next),
    });
    handleRef.current = handle;
    return () => {
      handle.destroy();
      handleRef.current = null;
    };
    /* Connected once per root. Everything else reaches the controller as an attribute or through `handleRef`. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value) handleRef.current?.setValue(value);
  }, [value]);

  /* What is shown is rendered above; the controller is told the same words, so what is announced matches. */
  const labelsKey = JSON.stringify(labelOverrides ?? {});
  useEffect(() => {
    handleRef.current?.setLabels(labelsRef.current ?? {});
  }, [labelsKey]);

  useImperativeHandle(
    ref,
    () => ({
      get ready() {
        return handleRef.current?.ready ?? Promise.resolve();
      },
      getValue: () => handleRef.current?.getValue() ?? value ?? defaultValue ?? { position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 },
      setValue: (next, options) => handleRef.current?.setValue(next, options),
      reset: () => handleRef.current?.reset(),
      getCrop: () => handleRef.current?.getCrop() ?? null,
      exportBlob: (options) => handleRef.current?.exportBlob(options) ?? Promise.reject({ code: "not-ready", message: "ImageCropper is not mounted." }),
      exportCanvas: (options) => handleRef.current?.exportCanvas(options) ?? Promise.reject({ code: "not-ready", message: "ImageCropper is not mounted." }),
      confirm: () => handleRef.current?.confirm(),
      setCallbacks: (next) => handleRef.current?.setCallbacks(next),
      setLabels: (next) => handleRef.current?.setLabels(next),
      destroy: () => handleRef.current?.destroy(),
    }),
    [value, defaultValue],
  );

  return (
    <div
      {...props}
      aria-label={label}
      className={cx(P.root, className)}
      ref={rootRef}
      role={label ? "group" : undefined}
      {...{
        [A.root]: "",
        [o.src.attr]: src,
        [o.alt.attr]: alt,
        [o.shape.attr]: shape,
        [o.aspect.attr]: aspectText,
        [o.minZoom.attr]: String(minZoom),
        [o.maxZoom.attr]: String(maxZoom),
        [o.disabled.attr]: disabled ? "" : undefined,
        [o.readOnly.attr]: readOnly ? "" : undefined,
        [o.showGrid.attr]: showGrid ? undefined : "false",
        [o.showControls.attr]: showControls ? undefined : "false",
        [o.wheelZoom.attr]: wheelZoom ? "" : undefined,
        [o.outputType.attr]: outputType,
        [o.outputQuality.attr]: String(outputQuality),
        [o.outputWidth.attr]: outputWidth === undefined ? undefined : String(outputWidth),
        [o.outputHeight.attr]: outputHeight === undefined ? undefined : String(outputHeight),
        [o.crossOrigin.attr]: crossOrigin,
      }}
    >
      <div className={P.workspace}>
        <div
          aria-describedby={helpId}
          aria-label={words.stage}
          className={P.stage}
          role="group"
          tabIndex={0}
          {...{ [A.stage]: "", [A.label]: "stage" }}
        >
          <div aria-hidden="true" className={P.surface} {...{ [A.surface]: "" }} />
          <p className={P.message} hidden {...{ [A.message]: "" }} />
          <div className={P.controls}>
            <Group label="zoomGroup" words={words}>
              <IconButton action="zoom-out" glyph="zoom-out" labelKey="zoomOut" words={words} />
              <IconButton action="zoom-in" glyph="zoom-in" labelKey="zoomIn" words={words} />
            </Group>
            <Group label="rotationGroup" words={words}>
              <IconButton action="rotate-right" glyph="refresh" labelKey="rotateRight" words={words} />
            </Group>
          </div>
        </div>
        <p className={P.help} id={helpId} {...{ [A.help]: "", [A.text]: "stageHelp" }}>
          {words.stageHelp}
        </p>
      </div>
      <div className={P.side} />
      <div aria-atomic="true" aria-live="polite" className={P.live} role="status" {...{ [A.live]: "" }} />
    </div>
  );
});

type Words = { words: ImageCropperLabels };

function Group({ label, words, children }: Words & { label: ImageCropperLabelKey; children: ReactNode }) {
  return (
    <div aria-label={words[label]} className={P.group} role="group" {...{ [A.label]: label }}>
      <span aria-hidden="true" className={P.groupLabel} {...{ [A.text]: label }}>
        {words[label]}
      </span>
      {children}
    </div>
  );
}

function IconButton({ action, glyph, labelKey, flip, words }: Words & { action: string; glyph: "zoom-in" | "zoom-out" | "refresh"; labelKey: ImageCropperLabelKey; flip?: boolean }) {
  return (
    <button
      aria-label={words[labelKey]}
      className={cx(P.control, "sk-button", "sk-interactive")}
      data-icon-only=""
      data-size="sm"
      data-variant="ghost"
      type="button"
      {...{ [A.action]: action, [A.label]: labelKey, ...(flip ? { "data-flip": "" } : {}) }}
    >
      <Icon name={glyph} size="sm" />
    </button>
  );
}

