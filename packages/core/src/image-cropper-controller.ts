import type { CropperCanvas, CropperImage, CropperSelection } from "cropperjs";
import {
  imageCropperAttrs as A,
  imageCropperEvents,
  imageCropperLabels,
  imageCropperParts as P,
  type ImageCropperChangeDetails,
  type ImageCropperConfirmDetails,
  type ImageCropperError,
  type ImageCropperErrorCode,
  type ImageCropperExportOptions,
  type ImageCropperLabelKey,
  type ImageCropperLabels,
  type ImageCropperOutputType,
} from "./image-cropper.js";
import {
  IMAGE_CROPPER_MAX_ZOOM,
  IMAGE_CROPPER_MIN_ZOOM,
  clamp,
  clampToCover,
  cropOf,
  defaultFrame,
  defaultValue,
  frameFromFractions,
  imageCropperKeyAction,
  imageCropperRatios,
  matrixOf,
  normalizeRotation,
  nudge,
  outputSize,
  parseAspect,
  placementFromValue,
  placementOf,
  resolveAspect,
  resizedFrame,
  fitFrame,
  rotatedBy,
  sameValue,
  serializeAspect,
  valueFromPlacement,
  zoomRange,
  type ImageCropperAspect,
  type ImageCropperCrop,
  type ImageCropperShape,
  type ImageCropperValue,
  type Placement,
  type Rect,
  type Size,
} from "./image-cropper-model.js";

/*
 * IMAGE CROPPER, THE CONTROLLER. The only file that touches Cropper.js, and the one both bindings call.
 *
 * WHAT IT DOES, in the order it happens:
 *
 *   1. Reads the contract's options off the root's attributes, and keeps reading them: an attribute that changes is an
 *      option that changed, so React (which renders the attributes) and authored markup (which the author edits) are
 *      driven the same way, and there is no second copy of any option for the two to disagree about.
 *   2. Loads Cropper.js on demand and gives it a template of the elements it needs: a canvas, the picture, the fade, a
 *      selection with its grid and handles. Nothing of Cropper.js leaves this file: no instance, no event object, no type.
 *   3. Holds the crop as an `ImageCropperValue` (the model's, in ratios) and the window as a rectangle, and draws that onto
 *      Cropper.js's elements. A gesture it hears about is turned into a placement, run through `clampToCover`, written back,
 *      and reported. Cropper.js's `transform` and `change` events are cancelable, which is what makes the rule continuous:
 *      a drag never shows an empty corner, not even for a frame.
 *   4. Wires the toolbar that is already in the markup, the keyboard on the stage, the preview and the announcements.
 *
 * WHAT IT DOES NOT DO: decide anything the model decides. A number computed here that the model also computes would be the
 * two bindings' two answers all over again; the controller asks.
 *
 * LIFECYCLE. `connectImageCropper` returns a handle whose `destroy` removes every listener, observer and Cropper.js element it
 * made, and cancels a load in flight. A picture replaced mid-load never draws: each load carries a token and a stale one
 * stops where it stands.
 */

export type ImageCropperCallbacks = {
  onValueChange?: (details: ImageCropperChangeDetails) => void;
  onValueChangeEnd?: (details: ImageCropperChangeDetails) => void;
  onCropConfirm?: (details: ImageCropperConfirmDetails) => void;
  onCancel?: () => void;
  onReady?: (details: ImageCropperChangeDetails) => void;
  onError?: (error: ImageCropperError) => void;
  onShapeChange?: (shape: ImageCropperShape) => void;
  onAspectChange?: (aspect: ImageCropperAspect) => void;
};

export type ImageCropperConfig = ImageCropperCallbacks & {
  /** The value the crop starts from, and what Reset returns to. */
  defaultValue?: ImageCropperValue;
  /** The words in use, for announcements. Markup that carries `data-labels` has them applied to the DOM; a binding that renders its own does not. */
  labels?: Partial<ImageCropperLabels>;
};

export type ImageCropperHandle = {
  /** Resolves once the picture is loaded and the crop is drawn; rejects with the error the picture failed with. */
  readonly ready: Promise<void>;
  getValue(): ImageCropperValue;
  /** Moves the crop to `value`, held inside the rule. Silent by default: a value you set is not a change you need told of. */
  setValue(value: ImageCropperValue, options?: { silent?: boolean }): void;
  /** Back to the starting value. */
  reset(): void;
  /** The crop in the picture's own pixels, or `null` until the picture is ready. */
  getCrop(): ImageCropperCrop | null;
  exportBlob(options?: ImageCropperExportOptions): Promise<Blob>;
  exportCanvas(options?: ImageCropperExportOptions): Promise<HTMLCanvasElement>;
  /** What the Apply button does: reports the crop and hands back the means to export it. */
  confirm(): void;
  /** Replaces the callbacks, so a binding's latest closures are the ones called. */
  setCallbacks(callbacks: ImageCropperCallbacks): void;
  /**
   * Replaces the words used in announcements and error messages. It does not touch the DOM: a binding that renders its own words
   * (React) tells the controller what they are so that what is said aloud matches what is shown.
   */
  setLabels(labels: Partial<ImageCropperLabels>): void;
  destroy(): void;
};

const handles = new WeakMap<HTMLElement, ImageCropperHandle>();

/** The handle of a cropper that is connected on `root`, for authored markup that wants to export or set a value. */
export const getImageCropper = (root: Element): ImageCropperHandle | undefined => handles.get(root as HTMLElement);

/* ---------------------------------------------------------------------------------------------- *
 * Cropper.js, loaded once and only when asked
 * ---------------------------------------------------------------------------------------------- */

type CropperClass = typeof import("cropperjs").default;
let cropperModule: Promise<CropperClass> | undefined;
/*
 * The default export, whichever way the bundler hands it over: a native ES module gives the class, and a toolchain that
 * reads the package as CommonJS wraps it once more. Both are handled here so no consumer ever has to know.
 */
const loadCropper = (): Promise<CropperClass> =>
  (cropperModule ??= import("cropperjs").then((module) => {
    const first = (module as unknown as { default: unknown }).default as { default?: CropperClass } & CropperClass;
    return first.default ?? first;
  }));

const CROPPER_TEMPLATE =
  "<cropper-canvas>" +
  "<cropper-image rotatable scalable translatable></cropper-image>" +
  "<cropper-shade></cropper-shade>" +
  /* `precise`: Cropper.js rounds a selection to whole pixels unless told not to, and the window here is not whole pixels. */
  '<cropper-selection initial-coverage="0.5" precise resizable>' +
  '<cropper-grid covered></cropper-grid>' +
  '<cropper-handle action="move"></cropper-handle>' +
  ["n", "e", "s", "w", "ne", "nw", "se", "sw"].map((direction) => `<cropper-handle action="${direction}-resize"></cropper-handle>`).join("") +
  "</cropper-selection>" +
  "</cropper-canvas>";

/* ---------------------------------------------------------------------------------------------- *
 * Options, as the attributes say them
 * ---------------------------------------------------------------------------------------------- */

type Options = {
  src: string;
  alt: string;
  shape: ImageCropperShape;
  aspect: ImageCropperAspect;
  minZoom: number;
  maxZoom: number;
  disabled: boolean;
  readOnly: boolean;
  wheelZoom: boolean;
  outputType: ImageCropperOutputType;
  outputQuality: number;
  outputWidth?: number;
  outputHeight?: number;
  crossOrigin: "anonymous" | "use-credentials" | null;
};

const flag = (root: Element, attr: string): boolean => root.hasAttribute(attr) && root.getAttribute(attr) !== "false";
const numberAttr = (root: Element, attr: string, fallback: number | undefined, min = -Infinity): number | undefined => {
  const parsed = Number.parseFloat(root.getAttribute(attr) ?? "");
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
};

function readOptions(root: HTMLElement): Options {
  const minZoom = numberAttr(root, "data-min-zoom", IMAGE_CROPPER_MIN_ZOOM, 0.1)!;
  const maxZoom = Math.max(minZoom, numberAttr(root, "data-max-zoom", IMAGE_CROPPER_MAX_ZOOM, 1)!);
  const type = root.getAttribute("data-output-type");
  const cross = root.getAttribute("data-cross-origin");
  return {
    src: root.getAttribute("data-src") ?? "",
    alt: root.getAttribute("data-alt") ?? "",
    shape: root.getAttribute("data-shape") === "circle" ? "circle" : "rectangle",
    aspect: parseAspect(root.getAttribute("data-aspect") ?? "free"),
    minZoom,
    maxZoom,
    disabled: flag(root, "data-disabled"),
    readOnly: flag(root, "data-read-only"),
    wheelZoom: flag(root, "data-wheel-zoom"),
    outputType: type === "image/jpeg" || type === "image/webp" ? type : "image/png",
    outputQuality: clamp(numberAttr(root, "data-output-quality", 0.92, 0)!, 0, 1),
    outputWidth: numberAttr(root, "data-output-width", undefined, 1),
    outputHeight: numberAttr(root, "data-output-height", undefined, 1),
    crossOrigin: cross === "anonymous" || cross === "use-credentials" ? cross : null,
  };
}

function parseValue(text: string | null): ImageCropperValue | undefined {
  if (!text) return undefined;
  try {
    const raw = JSON.parse(text) as Partial<ImageCropperValue> | null;
    if (!raw || typeof raw !== "object") return undefined;
    return {
      position: { x: Number(raw.position?.x ?? 0.5), y: Number(raw.position?.y ?? 0.5) },
      zoom: Number(raw.zoom ?? 1),
      rotation: Number(raw.rotation ?? 0),
      ...(raw.frame ? { frame: { x: Number(raw.frame.x), y: Number(raw.frame.y), width: Number(raw.frame.width), height: Number(raw.frame.height) } } : {}),
    };
  } catch {
    return undefined;
  }
}

function parseLabels(text: string | null): Partial<ImageCropperLabels> {
  if (!text) return {};
  try {
    const raw = JSON.parse(text) as Record<string, unknown> | null;
    if (!raw || typeof raw !== "object") return {};
    const labels: Partial<Record<ImageCropperLabelKey, string>> = {};
    for (const key of Object.keys(imageCropperLabels) as ImageCropperLabelKey[]) if (typeof raw[key] === "string") labels[key] = raw[key] as string;
    return labels;
  } catch {
    return {};
  }
}

const fail = (code: ImageCropperErrorCode, message: string): ImageCropperError => ({ code, message });

const CODES: readonly string[] = ["load", "cors", "not-ready", "export"];
const isCropperError = (error: unknown): error is ImageCropperError =>
  typeof error === "object" && error !== null && typeof (error as { code?: unknown }).code === "string" && CODES.includes((error as { code: string }).code) && typeof (error as { message?: unknown }).message === "string";

let uid = 0;

/* ---------------------------------------------------------------------------------------------- *
 * Connect
 * ---------------------------------------------------------------------------------------------- */

export function connectImageCropper(root: HTMLElement, initialConfig: ImageCropperConfig = {}): ImageCropperHandle {
  let config = initialConfig;
  const existing = handles.get(root);
  if (existing) existing.destroy();

  const $ = <T extends Element = HTMLElement>(selector: string): T | null => root.querySelector<T>(selector);
  const stage = $(`[${A.stage}]`);
  const surface = $(`[${A.surface}]`);
  const message = $(`[${A.message}]`);
  const help = $(`[${A.help}]`);
  const live = $(`[${A.live}]`);
  const previewCanvas = $<HTMLCanvasElement>(`.${P.previewCanvas}`);
  if (!stage || !surface) {
    /* Markup without its stage is not a cropper: connect to nothing rather than half of one. */
    const empty: ImageCropperHandle = {
      ready: Promise.resolve(),
      getValue: () => defaultValue,
      setValue: () => {},
      reset: () => {},
      getCrop: () => null,
      exportBlob: () => Promise.reject(fail("not-ready", "ImageCropper has no stage in its markup.")),
      exportCanvas: () => Promise.reject(fail("not-ready", "ImageCropper has no stage in its markup.")),
      confirm: () => {},
      setCallbacks: () => {},
      setLabels: () => {},
      destroy: () => {},
    };
    return empty;
  }

  const id = `sk-image-cropper-${(uid += 1)}`;
  if (help) {
    help.id ||= `${id}-help`;
    stage.setAttribute("aria-describedby", help.id);
  }

  let callbacks: ImageCropperCallbacks = config;
  /* `config` can be replaced (labels), so it is not const. */
  let options = readOptions(root);
  let labels: ImageCropperLabels = { ...imageCropperLabels, ...parseLabels(root.getAttribute("data-labels")), ...config.labels };
  const initial: ImageCropperValue = config.defaultValue ?? parseValue(root.getAttribute("data-value")) ?? defaultValue;
  let value: ImageCropperValue = initial;
  /** What Reset returns to. */
  const startValue: ImageCropperValue = initial;
  /** A value set before the picture is ready: what the first layout starts from instead of `startValue`. */
  let pendingValue: ImageCropperValue | null = null;

  let destroyed = false;
  let loadToken = 0;
  let image: HTMLImageElement | null = null;
  let natural: Size | null = null;
  let status: "idle" | "loading" | "ready" | "error" = "idle";
  let cropper: InstanceType<CropperClass> | null = null;
  let elements: { canvas: CropperCanvas; image: CropperImage; selection: CropperSelection } | null = null;
  /** The window, in stage pixels, and the picture's placement under it. */
  let frame: Rect = { x: 0, y: 0, width: 0, height: 0 };
  let placement: Placement | null = null;
  let stageSize: Size = { width: 0, height: 0 };
  /** True while the controller itself is writing to Cropper.js, so the events that write causes are not mistaken for a gesture. */
  let applying = false;
  /**
   * How many Cropper.js gestures are in progress. A change to the picture or the window is a gesture's only while this is above
   * zero; anything else Cropper.js does by itself (its own centring when the picture finishes loading, a re-select) is cancelled,
   * because this controller is the only one that places the picture.
   */
  let gestures = 0;
  /**
   * The wheel is a gesture with no start and no end event: Cropper.js emits one `action` per notch and nothing else. It is let
   * through while one is being handled, and its interaction is ended after the wheel has been quiet for a moment.
   */
  let wheeling = false;
  let wheelTimer = 0;
  let interacting = false;
  let interactionFrom: ImageCropperValue = initial;
  let announceTimer = 0;
  let previewFrame = 0;
  let resolveReady: () => void = () => {};
  let rejectReady: (error: unknown) => void = () => {};
  let readyPromise = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  /* A rejected `ready` nobody awaits is not an unhandled error: the failure is also reported through `onError`. */
  readyPromise.catch(() => {});

  const text = (key: ImageCropperLabelKey, value?: string | number): string => labels[key].replace("{value}", value === undefined ? "" : String(value));
  const limits = () => ({ minZoom: options.minZoom, maxZoom: options.maxZoom });
  const ratio = (): number | null => (natural ? resolveAspect(options.aspect, options.shape, natural) : options.shape === "circle" ? 1 : null);
  const isFree = (): boolean => ratio() === null;
  const editable = (): boolean => !options.disabled && !options.readOnly;

  /* ---- events ------------------------------------------------------------------------------------------------------ */

  function emit<T>(name: keyof typeof imageCropperEvents, detail: T): void {
    root.dispatchEvent(new CustomEvent(imageCropperEvents[name], { detail, bubbles: true }));
  }

  const crop = (): ImageCropperCrop | null => (natural && placement ? cropOf(placement, frame, natural) : null);

  function changeDetails(): ImageCropperChangeDetails | null {
    const current = crop();
    return current ? { value, crop: current } : null;
  }

  function reportError(error: ImageCropperError): void {
    emit("error", { error });
    callbacks.onError?.(error);
  }

  /* ---- the live region ---------------------------------------------------------------------------------------------- */

  function announce(messageText: string): void {
    if (!live) return;
    window.clearTimeout(announceTimer);
    /* A repeated sentence is not announced again unless the region changes: empty it first, then say it on the next tick. */
    live.textContent = "";
    announceTimer = window.setTimeout(() => {
      live.textContent = messageText;
    }, 60);
  }

  function describeChange(from: ImageCropperValue, to: ImageCropperValue): string | null {
    if (Math.abs(normalizeRotation(to.rotation - from.rotation)) > 0.05) return text("announceRotation", Math.round(to.rotation));
    if (Math.abs(to.zoom - from.zoom) > 0.005) return text("announceZoom", Math.round(to.zoom * 100));
    const a = from.frame;
    const b = to.frame;
    if (a && b && (Math.abs(a.width - b.width) > 0.002 || Math.abs(a.height - b.height) > 0.002)) return text("announceFrame");
    if (Math.abs(to.position.x - from.position.x) > 0.002 || Math.abs(to.position.y - from.position.y) > 0.002) return text("announceMoved");
    return null;
  }

  /* ---- drawing the model onto Cropper.js ---------------------------------------------------------------------------- */

  /** The window for the current mode and stage: from the value when free and given, derived from the ratio otherwise. */
  function windowFor(candidate: ImageCropperValue): Rect {
    if (!natural) return frame;
    const fixed = ratio();
    if (fixed !== null) return fitFrame(stageSize, fixed);
    return candidate.frame ? frameFromFractions(candidate.frame, stageSize) : defaultFrame(stageSize, null, natural);
  }

  /** Writes a window and a placement to Cropper.js's elements. Everything it causes is ignored, being its own. */
  function paint(): void {
    if (!elements || !natural || !placement) return;
    const { selection, image: pic } = elements;
    const fixed = ratio();
    applying = true;
    try {
      selection.resizable = fixed === null && editable();
      selection.movable = false;
      selection.aspectRatio = fixed ?? Number.NaN;
      selection.$change(frame.x, frame.y, frame.width, frame.height, fixed ?? Number.NaN, true);
      pic.$setTransform(...matrixOf(placement, natural));
    } finally {
      applying = false;
    }
    root.toggleAttribute("data-resizable", fixed === null && editable());
    schedulePreview();
  }

  /** Recomputes the window and placement from the value, at the stage's current size. Called when anything it depends on moves. */
  function layout(next: ImageCropperValue = value): void {
    if (!natural || !elements || stageSize.width < 1 || stageSize.height < 1) return;
    frame = windowFor(next);
    placement = placementFromValue(next, frame, natural, limits());
    value = valueFromPlacement(placement, frame, natural, stageSize, isFree());
    paint();
    syncControls();
  }

  /** Takes a placement a gesture or a control proposed, makes it valid, draws it, and reports it as a change. */
  function commit(proposed: Placement, nextFrame: Rect = frame, silent = false): void {
    if (!natural || !elements) return;
    const valid = clampToCover(proposed, nextFrame, natural, limits());
    const nextValue = valueFromPlacement(valid, nextFrame, natural, stageSize, isFree());
    const changed = !sameValue(nextValue, value);
    frame = nextFrame;
    placement = valid;
    value = nextValue;
    paint();
    syncControls();
    if (changed && !silent) {
      const details = changeDetails();
      if (details) {
        emit("valueChange", details);
        callbacks.onValueChange?.(details);
      }
    }
  }

  /** Ends an interaction: reports it once, and says in words what it did. */
  function finish(): void {
    if (!interacting) return;
    interacting = false;
    const details = changeDetails();
    if (!details) return;
    if (!sameValue(interactionFrom, value)) {
      emit("valueChangeEnd", details);
      callbacks.onValueChangeEnd?.(details);
      const sentence = describeChange(interactionFrom, value);
      if (sentence) announce(sentence);
    }
  }

  function begin(): void {
    if (interacting) return;
    interacting = true;
    interactionFrom = value;
  }

  /** A discrete edit (a button, a key, a slider step): one change, begun and ended in the same breath. */
  function edit(change: (current: Placement) => Placement, nextFrame: Rect = frame): void {
    if (!placement || !editable()) return;
    begin();
    commit(change(placement), nextFrame);
    finish();
  }

  /* ---- Cropper.js's events, turned into the model's ---------------------------------------------------------------- */

  function onTransform(event: Event): void {
    if (applying || !natural) return;
    if (!editable() || (gestures === 0 && !wheeling)) {
      event.preventDefault();
      return;
    }
    const matrix = (event as CustomEvent<{ matrix: number[] }>).detail.matrix;
    const proposed = placementOf(matrix, natural);
    const valid = clampToCover(proposed, frame, natural, limits());
    /* The gesture is allowed only as far as the rule lets it go: what it asked for is replaced by what is valid. */
    event.preventDefault();
    begin();
    commit(valid);
  }

  function onSelectionChange(event: Event): void {
    if (applying || !natural || !placement || !elements) return;
    /* A fixed window is not the reader's to change, and Cropper.js changing it by itself (a reset, a re-select) is not either. */
    if (!editable() || !isFree() || gestures === 0) {
      event.preventDefault();
      return;
    }
    const rect = (event as CustomEvent<Rect>).detail;
    event.preventDefault();
    begin();
    const next = resizedFrame(frame, { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, stageSize);
    commit(placement, next);
  }

  /** Runs before Cropper.js's own handling of the same event (capture), so the transform it causes is known to be the wheel's. */
  function onActionCapture(event: Event): void {
    const related = (event as CustomEvent<{ relatedEvent?: Event }>).detail?.relatedEvent;
    if (related?.type !== "wheel") return;
    wheeling = true;
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(finish, 220);
    queueMicrotask(() => {
      wheeling = false;
    });
  }

  function onActionStart(): void {
    gestures += 1;
  }

  function onActionEnd(): void {
    gestures = Math.max(0, gestures - 1);
    if (gestures === 0) finish();
  }

  /* ---- the toolbar ------------------------------------------------------------------------------------------------- */

  const buttons = (): HTMLButtonElement[] => Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
  const ranges = (): HTMLInputElement[] => Array.from(root.querySelectorAll<HTMLInputElement>(`input[${A.range}]`));
  const ratioInput = (): HTMLInputElement | null => root.querySelector<HTMLInputElement>(`input[${A.ratioInput}]`);
  const zoomFromAction = (action: string | null): number | null => {
    if (!action?.startsWith("zoom-")) return null;
    const amount = Number(action.slice("zoom-".length));
    return Number.isFinite(amount) ? amount : null;
  }; 

  /** Brings every control in line with the value, the mode and the state: pressed, enabled, ranged, and read aloud. */
  function syncControls(): void {
    const circle = options.shape === "circle";
    for (const button of buttons()) {
      const aspect = button.getAttribute(A.aspect);
      const shape = button.getAttribute(A.shape);
      const action = button.getAttribute(A.action);
      if (aspect !== null) {
        button.setAttribute("aria-pressed", String(!circle && aspectMatches(aspect)));
        button.disabled = options.disabled || options.readOnly || circle;
      } else if (shape !== null) {
        button.setAttribute("aria-pressed", String(options.shape === shape));
        button.disabled = options.disabled || options.readOnly;
      } else {
        const zoom = zoomFromAction(action);
        if (zoom !== null) button.setAttribute("aria-pressed", String(Math.abs(value.zoom - zoom) < 0.01));
        if (action === "apply" || action === "cancel") {
          button.disabled = options.disabled || (action === "apply" && status !== "ready");
        } else {
          button.disabled = !editable() || status !== "ready";
        }
      }
    }
    const input = ratioInput();
    if (input) {
      input.disabled = !editable() || circle;
      if (document.activeElement !== input) input.value = typeof options.aspect === "number" && !numericMatchesPreset(options.aspect) ? String(Number(options.aspect.toFixed(3))) : "";
      input.removeAttribute("aria-invalid");
    }
    syncRanges();
    stage!.tabIndex = options.disabled ? -1 : 0;
    if (options.disabled) stage!.setAttribute("aria-disabled", "true");
    else stage!.removeAttribute("aria-disabled");
    if (elements) elements.canvas.disabled = !editable();
  }

  function syncRanges(): void {
    const outputs = new Map(Array.from(root.querySelectorAll<HTMLElement>(`[${A.output}]`)).map((el) => [el.getAttribute(A.output), el]));
    for (const range of ranges()) {
      const kind = range.getAttribute(A.range);
      range.disabled = !editable() || status !== "ready";
      if (kind === "zoom") {
        const bounds = natural && frame.width > 0 ? zoomRange(frame, natural, ((value.rotation * Math.PI) / 180), limits()) : { min: options.minZoom, max: options.maxZoom };
        range.min = String(Number(bounds.min.toFixed(2)));
        range.max = String(Number(bounds.max.toFixed(2)));
        range.value = String(value.zoom);
        const percent = `${Math.round(value.zoom * 100)}%`;
        range.setAttribute("aria-valuetext", percent);
        const out = outputs.get("zoom");
        if (out) out.textContent = percent;
      } else if (kind === "rotation") {
        range.value = String(value.rotation);
        const degrees = `${Math.round(value.rotation)}°`;
        range.setAttribute("aria-valuetext", text("announceRotation", Math.round(value.rotation)));
        const out = outputs.get("rotation");
        if (out) out.textContent = degrees;
      }
    }
  }

  /** Whether a toolbar button's aspect is the one in force: by name for free and original, by value for a ratio. */
  function aspectMatches(id: string): boolean {
    if (id === "free" || id === "original") return options.aspect === id;
    const wanted = numericAspect(id);
    return wanted !== null && typeof options.aspect === "number" && Math.abs(options.aspect - wanted) < 0.002;
  }

  const PRESETS = [1, 4 / 3, 3 / 2, 16 / 9, 9 / 16];
  const numericMatchesPreset = (aspect: number): boolean => PRESETS.some((preset) => Math.abs(preset - aspect) < 0.002);
  const numericAspect = (id: string): number | null => {
    const parsed = parseAspect(id);
    return typeof parsed === "number" ? parsed : null;
  };

  /** A ratio as the toolbar names it: `1:1` for the preset, the word for free and original, the number otherwise. */
  function aspectName(aspect: ImageCropperAspect): string {
    if (typeof aspect !== "number") return aspect === "free" ? labels.aspectFree : labels.aspectOriginal;
    return imageCropperRatios.find((preset) => Math.abs(preset.ratio - aspect) < 0.002)?.id ?? String(Number(aspect.toFixed(3)));
  }

  function setAspect(next: ImageCropperAspect): void {
    if (!editable() || !elements) return;
    if (serializeAspect(options.aspect) === serializeAspect(next)) return;
    root.setAttribute("data-aspect", serializeAspect(next));
    options = readOptions(root);
    /* A new window, a new reading of position and zoom: the picture keeps its zoom and rotation, the window is re-fitted. */
    layout({ ...value, frame: undefined, position: { x: 0.5, y: 0.5 } });
    emit("aspectChange", { aspect: options.aspect });
    callbacks.onAspectChange?.(options.aspect);
    announce(text("announceAspect", aspectName(options.aspect)));
    emitChange();
  }

  function setShape(next: ImageCropperShape): void {
    if (!editable() || !elements || options.shape === next) return;
    root.setAttribute("data-shape", next);
    options = readOptions(root);
    layout({ ...value, frame: undefined, position: { x: 0.5, y: 0.5 } });
    emit("shapeChange", { shape: next });
    callbacks.onShapeChange?.(next);
    announce(text("announceShape", next === "circle" ? text("shapeCircle") : text("shapeRectangle")));
    emitChange();
  }

  /** After a change no gesture made (a mode, a reset) the value and crop are new all the same: report them, begun and ended. */
  function emitChange(): void {
    const details = changeDetails();
    if (!details) return;
    emit("valueChange", details);
    callbacks.onValueChange?.(details);
    emit("valueChangeEnd", details);
    callbacks.onValueChangeEnd?.(details);
  }

  function onClick(event: MouseEvent): void {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>("button");
    if (!button || !root.contains(button) || button.disabled) return;
    const action = button.getAttribute(A.action);
    const aspect = button.getAttribute(A.aspect);
    const shape = button.getAttribute(A.shape);
    if (aspect !== null) {
      setAspect(parseAspect(aspect));
      return;
    }
    if (shape !== null) {
      setShape(shape === "circle" ? "circle" : "rectangle");
      return;
    }
    const zoom = zoomFromAction(action);
    if (zoom !== null) {
      nextValue({ ...value, zoom });
      return;
    }
    switch (action) {
      case "zoom-in":
        nextValue({ ...value, zoom: value.zoom + 0.25 });
        break;
      case "zoom-out":
        nextValue({ ...value, zoom: value.zoom - 0.25 });
        break;
      case "rotate-right":
        nextValue(rotatedBy(value, 90));
        break;
      case "rotation-reset":
        nextValue({ ...value, rotation: 0 });
        break;
      case "reset":
        resetCrop();
        break;
      case "cancel":
        emit("cancel", {});
        callbacks.onCancel?.();
        break;
      case "apply":
        confirm();
        break;
    }
  }

  /** A discrete edit from a value: the placement it stands for, then the rule. */
  function nextValue(next: ImageCropperValue): void {
    if (!natural || !editable()) return;
    begin();
    const target = placementFromValue(next, frame, natural, limits());
    commit(target);
    finish();
  }

  function resetCrop(): void {
    if (!natural || !editable()) return;
    layout({ ...startValue, frame: isFree() ? startValue.frame : undefined });
    announce(text("announceReset"));
    /* A reset is reported even when it lands where it already was: the person asked for it. */
    emitChange();
  }

  function onRangeInput(event: Event): void {
    const range = event.target as HTMLInputElement;
    if (!range.matches(`input[${A.range}]`) || !natural) return;
    const kind = range.getAttribute(A.range);
    const amount = Number.parseFloat(range.value);
    if (!Number.isFinite(amount)) return;
    begin();
    if (kind === "zoom") commit(placementFromValue({ ...value, zoom: amount }, frame, natural, limits()));
    else if (kind === "rotation") commit(placementFromValue({ ...value, rotation: amount }, frame, natural, limits()));
  }

  function onRangeChange(event: Event): void {
    const range = event.target as HTMLInputElement;
    if (range.matches(`input[${A.range}]`)) finish();
    else if (range.matches(`input[${A.ratioInput}]`)) onRatioCommit(range as HTMLInputElement);
  }

  function onRatioCommit(input: HTMLInputElement): void {
    const raw = input.value.trim();
    if (raw === "") {
      input.removeAttribute("aria-invalid");
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0.1 || parsed > 10) {
      input.setAttribute("aria-invalid", "true");
      return;
    }
    input.removeAttribute("aria-invalid");
    setAspect(parsed);
  }

  /* ---- the keyboard ------------------------------------------------------------------------------------------------- */

  const heldKeys = new Set<string>();

  function onRootKeyDown(event: KeyboardEvent): void {
    /* Enter in the ratio box commits the ratio. It must not also submit a form the cropper happens to be inside. */
    if (event.key === "Enter" && (event.target as Element | null)?.matches?.(`input[${A.ratioInput}]`)) {
      event.preventDefault();
      onRatioCommit(event.target as HTMLInputElement);
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.target !== stage) return;
    const action = imageCropperKeyAction(event);
    if (!action) return;
    if (!editable()) return;
    event.preventDefault();
    if (!placement || !natural) return;
    heldKeys.add(event.key);
    begin();
    switch (action.type) {
      case "move":
        /* The picture goes the way the key points. */
        commit(nudge(placement, frame, action.dx, action.dy));
        break;
      case "zoom":
        commit(placementFromValue({ ...value, zoom: value.zoom + action.delta }, frame, natural, limits()));
        break;
      case "rotate":
        commit(placementFromValue(rotatedBy(value, action.degrees), frame, natural, limits()));
        break;
      case "reset":
        resetCrop();
        break;
    }
  }

  function onKeyUp(event: KeyboardEvent): void {
    if (!heldKeys.delete(event.key)) return;
    if (heldKeys.size === 0) finish();
  }

  function onStageBlur(): void {
    heldKeys.clear();
    finish();
  }

  /* ---- the preview -------------------------------------------------------------------------------------------------- */

  function schedulePreview(): void {
    if (!previewCanvas || previewFrame) return;
    previewFrame = window.requestAnimationFrame(() => {
      previewFrame = 0;
      drawPreview();
    });
  }

  /** The crop, drawn small with the same matrix the stage uses, so the two can never show different pictures. */
  function drawPreview(): void {
    if (!previewCanvas || !image || !natural || !placement || frame.width < 1) return;
    const width = 240;
    const height = Math.max(1, Math.round((width * frame.height) / frame.width));
    if (previewCanvas.width !== width) previewCanvas.width = width;
    if (previewCanvas.height !== height) previewCanvas.height = height;
    previewCanvas.style.aspectRatio = `${frame.width} / ${frame.height}`;
    const context = previewCanvas.getContext("2d");
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    const k = width / frame.width;
    context.save();
    if (options.shape === "circle") {
      context.beginPath();
      context.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      context.clip();
    }
    const [a, b, c, d, e, f] = matrixOf(placement, natural);
    const cx = natural.width / 2;
    const cy = natural.height / 2;
    context.setTransform(k, 0, 0, k, -frame.x * k, -frame.y * k);
    context.transform(a, b, c, d, cx - a * cx - c * cy + e, cy - b * cx - d * cy + f);
    try {
      context.drawImage(image, 0, 0);
    } catch {
      /* A canvas that cannot draw it shows nothing: the stage is the truth, the preview only a convenience. */
    }
    context.restore();
  }

  /* ---- export ------------------------------------------------------------------------------------------------------- */

  async function exportCanvas(request: ImageCropperExportOptions = {}): Promise<HTMLCanvasElement> {
    if (destroyed || status !== "ready" || !elements || !natural || !placement) {
      throw fail("not-ready", "ImageCropper cannot export before its image has loaded, or after it was destroyed.");
    }
    const current = cropOf(placement, frame, natural);
    const size = outputSize(current, { width: request.width ?? options.outputWidth, height: request.height ?? options.outputHeight });
    try {
      /* The pixels come out of Cropper.js. It draws the selection's region of the transformed image at the size asked. */
      const drawn = await elements.selection.$toCanvas({ width: size.width, height: size.height });
      if (options.shape !== "circle") return drawn;
      const masked = document.createElement("canvas");
      masked.width = drawn.width;
      masked.height = drawn.height;
      const context = masked.getContext("2d");
      if (!context) throw fail("export", "The browser could not create a 2D canvas for the circular mask.");
      context.drawImage(drawn, 0, 0);
      /* `destination-in` keeps what is inside the shape and makes the rest transparent: a real mask, not a painted-over corner. */
      context.globalCompositeOperation = "destination-in";
      context.beginPath();
      context.ellipse(masked.width / 2, masked.height / 2, masked.width / 2, masked.height / 2, 0, 0, Math.PI * 2);
      context.fill();
      return masked;
    } catch (error) {
      throw asExportError(error);
    }
  }

  function asExportError(error: unknown): ImageCropperError {
    /* One of ours, already classified. A DOMException also has a `code` and a `message`, but its code is a number. */
    if (isCropperError(error)) return error;
    const name = (error as { name?: string } | null)?.name;
    if (name === "SecurityError") {
      return fail(
        "cors",
        "The browser blocked reading this image because it is from another origin without CORS headers. Serve it with Access-Control-Allow-Origin and set crossOrigin=\"anonymous\" on the cropper, or use an image from the same origin.",
      );
    }
    return fail("export", `The crop could not be exported: ${(error as Error | null)?.message ?? "unknown error"}.`);
  }

  async function exportBlob(request: ImageCropperExportOptions = {}): Promise<Blob> {
    const canvas = await exportCanvas(request);
    /* A circle is PNG whatever was asked: JPEG has no transparency and the mask would come out as a black or white square. */
    const type: ImageCropperOutputType = options.shape === "circle" ? "image/png" : (request.type ?? options.outputType);
    const quality = request.quality ?? options.outputQuality;
    return new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(fail("export", `The browser could not encode the crop as ${type}.`))),
          type,
          quality,
        );
      } catch (error) {
        reject(asExportError(error));
      }
    });
  }

  function confirm(): void {
    if (destroyed || status !== "ready" || options.disabled) return;
    const details = changeDetails();
    if (!details) return;
    const confirmDetails: ImageCropperConfirmDetails = {
      ...details,
      shape: options.shape,
      aspect: ratio(),
      exportBlob: (request) => exportBlob(request),
      exportCanvas: (request) => exportCanvas(request),
    };
    announce(text("announceApplied"));
    emit("confirm", confirmDetails);
    callbacks.onCropConfirm?.(confirmDetails);
  }

  /* ---- the picture -------------------------------------------------------------------------------------------------- */

  function setStatus(next: typeof status, note = ""): void {
    status = next;
    root.setAttribute(A.status, next);
    if (next === "loading") root.setAttribute("aria-busy", "true");
    else root.removeAttribute("aria-busy");
    if (message) {
      message.textContent = note;
      message.hidden = note === "";
      if (next === "error") message.setAttribute("role", "alert");
      else message.removeAttribute("role");
    }
    syncControls();
  }

  function teardownCropper(): void {
    if (elements) {
      elements.image.removeEventListener("transform", onTransform);
      elements.selection.removeEventListener("change", onSelectionChange);
      elements.canvas.removeEventListener("action", onActionCapture, true);
      elements.canvas.removeEventListener("actionstart", onActionStart);
      elements.canvas.removeEventListener("actionend", onActionEnd);
    }
    elements = null;
    cropper?.destroy();
    cropper = null;
    surface!.replaceChildren();
    placement = null;
    natural = null;
    image = null;
    gestures = 0;
    wheeling = false;
    window.clearTimeout(wheelTimer);
  }

  async function load(): Promise<void> {
    const token = (loadToken += 1);
    teardownCropper();
    if (!options.src) {
      setStatus("idle");
      return;
    }
    setStatus("loading", text("loading"));
    readyPromise = new Promise<void>((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    readyPromise.catch(() => {});
    try {
      const [Cropper, picture] = await Promise.all([loadCropper(), decode(options.src, options.crossOrigin)]);
      if (token !== loadToken || destroyed) return;
      image = picture;
      natural = { width: picture.naturalWidth, height: picture.naturalHeight };
      if (!natural.width || !natural.height) throw fail("load", "The image has no size, so there is nothing to crop.");
      cropper = new Cropper(picture, { container: surface!, template: CROPPER_TEMPLATE });
      const canvas = cropper.getCropperCanvas();
      const cropperImage = cropper.getCropperImage();
      const selection = cropper.getCropperSelection();
      if (!canvas || !cropperImage || !selection) throw fail("load", "Cropper.js did not build its elements.");
      elements = { canvas, image: cropperImage, selection };
      cropperImage.addEventListener("transform", onTransform);
      selection.addEventListener("change", onSelectionChange);
      canvas.addEventListener("action", onActionCapture, true);
      canvas.addEventListener("actionstart", onActionStart);
      canvas.addEventListener("actionend", onActionEnd);
      canvas.removeAttribute("background");
      await cropperImage.$ready();
      if (token !== loadToken || destroyed) return;
      setStatus("ready");
      measure();
      layout(pendingValue ?? startValue);
      pendingValue = null;
      const details = changeDetails();
      if (details) {
        emit("ready", details);
        callbacks.onReady?.(details);
      }
      resolveReady();
    } catch (error) {
      if (token !== loadToken || destroyed) return;
      const known = isCropperError(error) ? error : null;
      const problem =
        known ??
        fail(
          "load",
          options.crossOrigin
            ? "The image could not be loaded. It may be missing, or its server may not send CORS headers while crossOrigin is set."
            : "The image could not be loaded. Check that the src exists and is reachable.",
        );
      teardownCropper();
      setStatus("error", text("loadError"));
      reportError(problem);
      rejectReady(problem);
    }
  }

  function measure(): boolean {
    const box = surface!.getBoundingClientRect();
    const next = { width: Math.round(box.width), height: Math.round(box.height) };
    const changed = next.width !== stageSize.width || next.height !== stageSize.height;
    stageSize = next;
    return changed;
  }

  /* ---- observers --------------------------------------------------------------------------------------------------- */

  const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
    if (!elements) return;
    if (measure()) layout();
  });
  resizeObserver?.observe(surface);

  const attributeObserver = new MutationObserver((records) => {
    const names = new Set(records.map((record) => record.attributeName));
    const before = options;
    options = readOptions(root);
    if (names.has("data-labels")) {
      labels = { ...imageCropperLabels, ...parseLabels(root.getAttribute("data-labels")), ...config.labels };
    }
    if (names.has("data-src") || names.has("data-cross-origin")) {
      if (before.src !== options.src || before.crossOrigin !== options.crossOrigin) {
        value = initial;
        pendingValue = null;
        void load();
        return;
      }
    }
    if (names.has("data-value")) {
      const attrValue = parseValue(root.getAttribute("data-value"));
      if (attrValue) handle.setValue(attrValue);
    }
    if (names.has("data-shape") || names.has("data-aspect") || names.has("data-min-zoom") || names.has("data-max-zoom") || names.has("data-disabled") || names.has("data-read-only")) {
      if (elements) {
        const modeChanged = before.shape !== options.shape || serializeAspect(before.aspect) !== serializeAspect(options.aspect);
        layout(modeChanged ? { ...value, frame: undefined, position: { x: 0.5, y: 0.5 } } : value);
      } else syncControls();
    }
    if (names.has("data-alt")) updateStageName();
    if (names.has("data-labels")) {
      applyLabels();
      updateStageName();
      syncControls();
    }
  });
  attributeObserver.observe(root, {
    attributes: true,
    attributeFilter: [
      "data-src",
      "data-alt",
      "data-shape",
      "data-aspect",
      "data-min-zoom",
      "data-max-zoom",
      "data-value",
      "data-disabled",
      "data-read-only",
      "data-wheel-zoom",
      "data-labels",
      "data-cross-origin",
      "data-output-type",
      "data-output-quality",
      "data-output-width",
      "data-output-height",
    ],
  });

  /* ---- words ------------------------------------------------------------------------------------------------------- */

  function updateStageName(): void {
    stage!.setAttribute("aria-label", options.alt ? `${labels.stage}: ${options.alt}` : labels.stage);
  }

  /** Puts any word the author replaced over the markup's own. Defaults are already there; only replacements are written. */
  function applyLabels(): void {
    for (const node of root.querySelectorAll<HTMLElement>(`[${A.label}]`)) {
      const key = node.getAttribute(A.label) as ImageCropperLabelKey;
      if (key in labels) node.setAttribute("aria-label", labels[key]);
    }
    for (const node of root.querySelectorAll<HTMLElement>(`[${A.text}]`)) {
      const key = node.getAttribute(A.text) as ImageCropperLabelKey;
      if (key in labels) node.textContent = labels[key];
    }
  }

  /* ---- wiring ------------------------------------------------------------------------------------------------------ */

  /** The wheel zooms only when asked: otherwise it is the page's, and Cropper.js never hears it. */
  function onWheel(event: WheelEvent): void {
    if (!options.wheelZoom || !editable()) event.stopPropagation();
  }

  root.addEventListener("click", onClick);
  root.addEventListener("input", onRangeInput);
  root.addEventListener("change", onRangeChange);
  root.addEventListener("keydown", onRootKeyDown);
  stage.addEventListener("keydown", onKeyDown);
  stage.addEventListener("keyup", onKeyUp);
  stage.addEventListener("blur", onStageBlur);
  surface.addEventListener("wheel", onWheel, { capture: true, passive: true });

  /* Words are written onto the markup only when the markup asked for it (`data-labels`). A binding that renders its own never is. */
  if (root.hasAttribute("data-labels")) applyLabels();
  updateStageName();
  syncControls();

  const handle: ImageCropperHandle = {
    get ready() {
      return readyPromise;
    },
    getValue: () => value,
    setValue(next, request = {}) {
      if (!natural || !elements) {
        /* Before the picture is ready the value is what the first layout starts from. */
        pendingValue = next;
        value = next;
        return;
      }
      const before = value;
      layout(next);
      if (request.silent === false && !sameValue(before, value)) emitChange();
    },
    reset: resetCrop,
    getCrop: crop,
    exportBlob,
    exportCanvas,
    confirm,
    setCallbacks(next) {
      callbacks = next;
    },
    setLabels(next) {
      config = { ...config, labels: next };
      labels = { ...imageCropperLabels, ...parseLabels(root.getAttribute("data-labels")), ...next };
      updateStageName();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      loadToken += 1;
      window.clearTimeout(announceTimer);
      window.cancelAnimationFrame(previewFrame);
      resizeObserver?.disconnect();
      attributeObserver.disconnect();
      root.removeEventListener("click", onClick);
      root.removeEventListener("input", onRangeInput);
      root.removeEventListener("change", onRangeChange);
      root.removeEventListener("keydown", onRootKeyDown);
      stage.removeEventListener("keydown", onKeyDown);
      stage.removeEventListener("keyup", onKeyUp);
      stage.removeEventListener("blur", onStageBlur);
      surface.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions);
      teardownCropper();
      root.removeAttribute(A.status);
      root.removeAttribute("aria-busy");
      root.removeAttribute("data-resizable");
      if (handles.get(root) === handle) handles.delete(root);
    },
  };

  handles.set(root, handle);
  void load();
  return handle;
}

/** Decodes a picture, with the CORS mode the cropper was asked for, and rejects with what went wrong. */
function decode(src: string, crossOrigin: Options["crossOrigin"]): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const picture = new Image();
    if (crossOrigin) picture.crossOrigin = crossOrigin;
    picture.decoding = "async";
    picture.onload = () => resolve(picture);
    /* Not a classified error: the caller knows whether CORS was in play, and says so. */
    picture.onerror = () => reject(new Error("load"));
    picture.src = src;
  });
}

