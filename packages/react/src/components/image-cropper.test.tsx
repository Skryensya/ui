import { imageCropperAttrs, imageCropperLabels, imageCropperParts } from "@skryensya/core/image-cropper";
import type { ImageCropperConfig, ImageCropperHandle } from "@skryensya/core/image-cropper-controller";
import { act, render } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The React half of `ImageCropper`. The behaviour is the shared controller's and is proved in a real browser (`image-cropper.spec.ts`,
 * over both bindings): Cropper.js needs a layout, and jsdom lays nothing out. What is proved here is what is React's: that it
 * renders the template's parts and the options as attributes, says its words (and only its own), connects the controller once
 * and takes it down, hands it the latest callbacks, and keeps a value it is told to hold.
 *
 * So the controller is replaced by a handle that records what it is asked, and the assertions are about those asks.
 */

const handle = {
  ready: Promise.resolve(),
  getValue: vi.fn(() => ({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 })),
  setValue: vi.fn(),
  reset: vi.fn(),
  getCrop: vi.fn(() => null),
  exportBlob: vi.fn(() => Promise.resolve(new Blob())),
  exportCanvas: vi.fn(),
  confirm: vi.fn(),
  setCallbacks: vi.fn(),
  setLabels: vi.fn(),
  destroy: vi.fn(),
} satisfies ImageCropperHandle;

const connect = vi.fn((_root: HTMLElement, _config?: ImageCropperConfig) => handle);

vi.mock("@skryensya/core/image-cropper-controller", () => ({
  connectImageCropper: (root: HTMLElement, config?: ImageCropperConfig) => connect(root, config),
}));

const { ImageCropper } = await import("./image-cropper.js");

const base = { src: "data:image/png;base64,AAAA", alt: "A mountain at dusk" };
const value = { position: { x: 0.2, y: 0.8 }, zoom: 2, rotation: 15 };

beforeEach(() => {
  for (const fn of Object.values(handle)) if (typeof fn === "function" && "mockClear" in fn) (fn as ReturnType<typeof vi.fn>).mockClear();
  /* A test that sets what the handle answers must not decide what the next one reads. */
  handle.getValue.mockImplementation(() => ({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 }));
  connect.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

const rootOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe("ImageCropper", () => {
  it("renders the template's parts: the stage contains the crop canvas and HUD, actions stay external", () => {
    const { container } = render(<ImageCropper {...base} />);
    const root = rootOf(container);
    expect(root.className).toBe(imageCropperParts.root);
    expect(Array.from(root.children).map((child) => child.className)).toEqual([
      imageCropperParts.workspace,
      imageCropperParts.side,
      imageCropperParts.live,
    ]);
    expect(Array.from(root.children[0]!.children).map((child) => child.className)).toEqual([imageCropperParts.stage, imageCropperParts.help]);
    expect(Array.from(root.children[1]!.children).map((child) => child.className)).toEqual([]);
    const stage = root.querySelector(`.${imageCropperParts.stage}`)!;
    expect(stage.getAttribute("tabindex")).toBe("0");
    expect(stage.getAttribute("role")).toBe("group");
    expect(stage.getAttribute("aria-label")).toBe(imageCropperLabels.stage);
    const help = root.querySelector(`.${imageCropperParts.help}`)!;
    expect(stage.getAttribute("aria-describedby")).toBe(help.id);
    expect(help.id).toBeTruthy();
    expect(stage.querySelector(`.${imageCropperParts.surface}`)!.getAttribute("aria-hidden")).toBe("true");
    expect(stage.querySelector(`.${imageCropperParts.controls}`)).not.toBeNull();
    expect(root.querySelector(`.${imageCropperParts.preview}`)).toBeNull();
    const live = root.querySelector(`.${imageCropperParts.live}`)!;
    expect(live.getAttribute("role")).toBe("status");
    expect(live.getAttribute("aria-live")).toBe("polite");
  });

  it("has a focused HUD: zoom in, zoom out, and one rotate button", () => {
    const { container } = render(<ImageCropper {...base} />);
    expect(container.querySelectorAll(`[${imageCropperAttrs.aspect}]`)).toHaveLength(0);
    expect(container.querySelectorAll(`[${imageCropperAttrs.shape}]`)).toHaveLength(0);
    expect(container.querySelectorAll(`input[type="range"], input[type="number"]`)).toHaveLength(0);
    const unnamed = Array.from(container.querySelectorAll("button, input")).filter((el) => !(el.getAttribute("aria-label") || el.textContent?.trim()));
    expect(unnamed).toEqual([]);
    for (const button of container.querySelectorAll("button")) expect(button.getAttribute("type")).toBe("button");
    expect(Array.from(container.querySelectorAll(`[${imageCropperAttrs.action}]`)).map((button) => button.getAttribute(imageCropperAttrs.action))).toEqual([
      "zoom-out",
      "zoom-in",
      "rotate-right",
    ]);
    expect(container.querySelector(`[${imageCropperAttrs.output}="zoom"]`)).toBeNull();
    expect(container.querySelector(`[${imageCropperAttrs.output}="rotation"]`)).toBeNull();
  });

  it("writes the options as the attributes the controller reads", () => {
    const { container } = render(
      <ImageCropper
        {...base}
        aspect="16:9"
        crossOrigin="anonymous"
        disabled
        maxZoom={3}
        minZoom={0.5}
        outputHeight={450}
        outputQuality={0.8}
        outputType="image/webp"
        outputWidth={800}
        readOnly
        shape="circle"
        showGrid={false}
        wheelZoom
      />,
    );
    const root = rootOf(container);
    expect(root.getAttribute("data-src")).toBe(base.src);
    expect(root.getAttribute("data-alt")).toBe(base.alt);
    expect(root.getAttribute("data-shape")).toBe("circle");
    expect(root.getAttribute("data-aspect")).toBe("16:9");
    expect(root.getAttribute("data-min-zoom")).toBe("0.5");
    expect(root.getAttribute("data-max-zoom")).toBe("3");
    expect(root.hasAttribute("data-disabled")).toBe(true);
    expect(root.hasAttribute("data-read-only")).toBe(true);
    expect(root.getAttribute("data-grid")).toBe("false");
    expect(root.hasAttribute("data-wheel-zoom")).toBe(true);
    expect(root.getAttribute("data-output-type")).toBe("image/webp");
    expect(root.getAttribute("data-output-quality")).toBe("0.8");
    expect(root.getAttribute("data-output-width")).toBe("800");
    expect(root.getAttribute("data-output-height")).toBe("450");
    expect(root.getAttribute("data-cross-origin")).toBe("anonymous");
    expect(root.hasAttribute(imageCropperAttrs.root)).toBe(true);
  });

  it("writes only what was asked: defaults leave no attribute that says the opposite", () => {
    const { container } = render(<ImageCropper {...base} />);
    const root = rootOf(container);
    expect(root.getAttribute("data-shape")).toBe("rectangle");
    expect(root.getAttribute("data-aspect")).toBe("free");
    for (const name of ["data-disabled", "data-read-only", "data-grid", "data-controls", "data-wheel-zoom", "data-cross-origin", "data-labels", "data-output-width", "data-output-height", "role", "aria-label"]) {
      expect(root.hasAttribute(name), name).toBe(false);
    }
  });

  it("takes an aspect as a number, a ratio or a word, and writes each the way the controller reads it", () => {
    const written = (aspect: Parameters<typeof ImageCropper>[0]["aspect"]) => {
      const { container, unmount } = render(<ImageCropper {...base} aspect={aspect} />);
      const text = rootOf(container).getAttribute("data-aspect");
      unmount();
      return text;
    };
    expect(written(1.5)).toBe("1.5");
    expect(written(1)).toBe("1");
    expect(written("16:9")).toBe("16:9");
    expect(written("original")).toBe("original");
    expect(written("free")).toBe("free");
    expect(written(undefined)).toBe("free");
  });

  it("names the whole cropper only when asked, as a group", () => {
    const { container } = render(<ImageCropper {...base} label="Profile picture" />);
    expect(rootOf(container).getAttribute("role")).toBe("group");
    expect(rootOf(container).getAttribute("aria-label")).toBe("Profile picture");
  });

  it("does not render finishing actions; reset, cancel and apply are external", () => {
    const { container } = render(<ImageCropper {...base} onCancel={() => {}} />);
    expect(container.querySelector(`[${imageCropperAttrs.action}="reset"]`)).toBeNull();
    expect(container.querySelector(`[${imageCropperAttrs.action}="cancel"]`)).toBeNull();
    expect(container.querySelector(`[${imageCropperAttrs.action}="apply"]`)).toBeNull();
  });

  it("says its words in English, and in another language when given them, in the markup and to the controller", () => {
    const labels = { zoomIn: "Acercar", rotateRight: "Girar", stage: "Zona de recorte", stageHelp: "Flechas para mover." };
    const { container } = render(<ImageCropper {...base} labels={labels} />);
    expect(container.querySelector(`[${imageCropperAttrs.action}="zoom-in"]`)!.getAttribute("aria-label")).toBe("Acercar");
    expect(container.querySelector(`[${imageCropperAttrs.action}="rotate-right"]`)!.getAttribute("aria-label")).toBe("Girar");
    expect(container.querySelector(`.${imageCropperParts.stage}`)!.getAttribute("aria-label")).toBe("Zona de recorte");
    expect(container.querySelector(`.${imageCropperParts.help}`)!.textContent).toBe("Flechas para mover.");
    /* What is not replaced stays as it was. */
    expect(container.querySelector(`[${imageCropperAttrs.action}="zoom-out"]`)!.getAttribute("aria-label")).toBe(imageCropperLabels.zoomOut);
    /* React renders its own words, so the controller is not told to write them: no attribute, and it is told what they are. */
    expect(rootOf(container).hasAttribute("data-labels")).toBe(false);
    expect(handle.setLabels).toHaveBeenLastCalledWith(labels);
    expect(connect.mock.calls[0]![1]!.labels).toEqual(labels);
  });

  it("connects the controller once on its root, and takes it down on unmount", () => {
    const { container, rerender, unmount } = render(<ImageCropper {...base} />);
    expect(connect).toHaveBeenCalledTimes(1);
    expect(connect.mock.calls[0]![0]).toBe(rootOf(container));
    rerender(<ImageCropper {...base} shape="circle" aspect="1:1" />);
    rerender(<ImageCropper {...base} src="data:image/png;base64,BBBB" />);
    expect(connect).toHaveBeenCalledTimes(1);
    expect(handle.destroy).not.toHaveBeenCalled();
    unmount();
    expect(handle.destroy).toHaveBeenCalledTimes(1);
  });

  it("survives Strict Mode's mount, unmount, mount: one live controller at the end, one destroyed on the way", () => {
    const { unmount } = render(
      <StrictMode>
        <ImageCropper {...base} />
      </StrictMode>,
    );
    expect(connect).toHaveBeenCalledTimes(2);
    expect(handle.destroy).toHaveBeenCalledTimes(1);
    unmount();
    expect(handle.destroy).toHaveBeenCalledTimes(2);
  });

  it("hands the controller a starting value, from `value` or from `defaultValue`", () => {
    render(<ImageCropper {...base} defaultValue={value} />);
    expect(connect.mock.calls[0]![1]!.defaultValue).toEqual(value);
    connect.mockClear();
    render(<ImageCropper {...base} value={{ ...value, zoom: 3 }} defaultValue={value} />);
    expect(connect.mock.calls[0]![1]!.defaultValue).toEqual({ ...value, zoom: 3 });
  });

  it("calls the latest callback, however often it renders, and not a stale one", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<ImageCropper {...base} onValueChange={first} />);
    const config = connect.mock.calls[0]![1]!;
    const details = { value, crop: { x: 0, y: 0, width: 1, height: 1, rotation: 0, outputWidth: 1, outputHeight: 1 } };
    rerender(<ImageCropper {...base} onValueChange={second} />);
    act(() => config.onValueChange!(details));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(details);
  });

  it("forwards every event the controller reports, to the prop of the same name", () => {
    const props = {
      onValueChange: vi.fn(),
      onValueChangeEnd: vi.fn(),
      onCropConfirm: vi.fn(),
      onCancel: vi.fn(),
      onReady: vi.fn(),
      onError: vi.fn(),
      onShapeChange: vi.fn(),
      onAspectChange: vi.fn(),
    };
    render(<ImageCropper {...base} {...props} />);
    const config = connect.mock.calls[0]![1]!;
    const details = { value, crop: { x: 0, y: 0, width: 1, height: 1, rotation: 0, outputWidth: 1, outputHeight: 1 } };
    const confirm = { ...details, shape: "circle" as const, aspect: 1, exportBlob: vi.fn(), exportCanvas: vi.fn() };
    const error = { code: "load" as const, message: "no" };
    act(() => {
      config.onValueChange!(details);
      config.onValueChangeEnd!(details);
      config.onCropConfirm!(confirm);
      config.onCancel!();
      config.onReady!(details);
      config.onError!(error);
      config.onShapeChange!("circle");
      config.onAspectChange!(1.5);
    });
    expect(props.onValueChange).toHaveBeenCalledWith(details);
    expect(props.onValueChangeEnd).toHaveBeenCalledWith(details);
    expect(props.onCropConfirm).toHaveBeenCalledWith(confirm);
    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onReady).toHaveBeenCalledWith(details);
    expect(props.onError).toHaveBeenCalledWith(error);
    expect(props.onShapeChange).toHaveBeenCalledWith("circle");
    expect(props.onAspectChange).toHaveBeenCalledWith(1.5);
  });

  it("holds a value it is given: it draws a new one, and goes back to it when the parent does not take a change", () => {
    vi.useFakeTimers();
    const { rerender } = render(<ImageCropper {...base} value={value} />);
    expect(handle.setValue).toHaveBeenLastCalledWith(value);
    const next = { ...value, zoom: 3 };
    rerender(<ImageCropper {...base} value={next} />);
    expect(handle.setValue).toHaveBeenLastCalledWith(next);

    /* The reader moves the picture; the parent hears of it and keeps `value` as it was. The cropper is put back. */
    handle.getValue.mockReturnValue({ position: { x: 0.9, y: 0.1 }, zoom: 3, rotation: 15 });
    handle.setValue.mockClear();
    const config = connect.mock.calls[0]![1]!;
    act(() => config.onValueChange!({ value: { position: { x: 0.9, y: 0.1 }, zoom: 3, rotation: 15 }, crop: { x: 0, y: 0, width: 1, height: 1, rotation: 15, outputWidth: 1, outputHeight: 1 } }));
    act(() => void vi.advanceTimersByTime(5));
    expect(handle.setValue).toHaveBeenCalledWith(next);

    /* And when the parent does take it, nothing is undone. */
    handle.setValue.mockClear();
    handle.getValue.mockReturnValue(next);
    act(() => config.onValueChange!({ value: next, crop: { x: 0, y: 0, width: 1, height: 1, rotation: 15, outputWidth: 1, outputHeight: 1 } }));
    act(() => void vi.advanceTimersByTime(5));
    expect(handle.setValue).not.toHaveBeenCalled();
  });

  it("does not hold anything when it is not given a value", () => {
    vi.useFakeTimers();
    render(<ImageCropper {...base} />);
    const config = connect.mock.calls[0]![1]!;
    act(() => config.onValueChange!({ value, crop: { x: 0, y: 0, width: 1, height: 1, rotation: 0, outputWidth: 1, outputHeight: 1 } }));
    act(() => void vi.advanceTimersByTime(5));
    expect(handle.setValue).not.toHaveBeenCalled();
  });

  it("exposes the controller through a ref, and refuses an export once it is gone", async () => {
    const ref = createRef<ImageCropperHandle>();
    const { unmount } = render(<ImageCropper {...base} ref={ref} />);
    ref.current!.setValue(value, { silent: false });
    expect(handle.setValue).toHaveBeenCalledWith(value, { silent: false });
    ref.current!.reset();
    expect(handle.reset).toHaveBeenCalledTimes(1);
    ref.current!.confirm();
    expect(handle.confirm).toHaveBeenCalledTimes(1);
    expect(ref.current!.getValue()).toEqual({ position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 });
    await expect(ref.current!.exportBlob({ type: "image/png" })).resolves.toBeInstanceOf(Blob);
    expect(handle.exportBlob).toHaveBeenCalledWith({ type: "image/png" });
    const detached = ref.current!;
    unmount();
    await expect(detached.exportBlob()).rejects.toEqual({ code: "not-ready", message: "ImageCropper is not mounted." });
  });

  it("passes id, aria-* and a class to the root, and keeps its own class", () => {
    const { container } = render(<ImageCropper {...base} id="avatar" aria-describedby="note" className="mine" />);
    const root = rootOf(container);
    expect(root.id).toBe("avatar");
    expect(root.getAttribute("aria-describedby")).toBe("note");
    expect(root.className).toBe(`${imageCropperParts.root} mine`);
  });
});
