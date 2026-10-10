import { imageCropperAttrs, imageCropperParts } from "@skryensya/core/image-cropper";
import type { ImageCropperHandle } from "@skryensya/core/image-cropper-controller";
import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The Vanilla half of `ImageCropper`: the thinnest enhancer there is. The behaviour is the shared controller's, proved in a real
 * browser over both bindings (`packages/ai-gates/src/image-cropper.spec.ts`), because Cropper.js needs a layout that jsdom does not
 * have. What is proved here is the enhancer's own job: that it finds authored roots, connects the controller on each exactly once,
 * lets go of it when the root is unmounted, and exports the way to get a cropper's handle.
 */

const handles: ImageCropperHandle[] = [];
const connect = vi.fn((root: HTMLElement) => {
  const handle = {
    ready: Promise.resolve(),
    getValue: vi.fn(),
    setValue: vi.fn(),
    reset: vi.fn(),
    getCrop: vi.fn(() => null),
    exportBlob: vi.fn(),
    exportCanvas: vi.fn(),
    confirm: vi.fn(),
    setCallbacks: vi.fn(),
    setLabels: vi.fn(),
    destroy: vi.fn(),
  } satisfies ImageCropperHandle;
  handles.push(handle);
  void root;
  return handle;
});
const lookup = vi.fn();

vi.mock("@skryensya/core/image-cropper-controller", () => ({
  connectImageCropper: (root: HTMLElement) => connect(root),
  getImageCropper: (root: Element) => lookup(root),
}));

const { connectImageCropperRoot, mountImageCropper, getImageCropper, imageCropperEvents } = await import("./image-cropper.js");
const { destroyMount } = await import("../runtime/svelte-hydrate.js");

const shell = (attrs = "") => `
  <div class="${imageCropperParts.root}" ${imageCropperAttrs.root} data-src="/photo.jpg" data-alt="A photo" ${attrs}>
    <div class="${imageCropperParts.workspace}">
      <div class="${imageCropperParts.stage}" ${imageCropperAttrs.stage} tabindex="0" role="group" aria-label="Crop area">
        <div class="${imageCropperParts.surface}" ${imageCropperAttrs.surface} aria-hidden="true"></div>
        <p class="${imageCropperParts.message}" ${imageCropperAttrs.message} hidden></p>
      </div>
    </div>
  </div>`;

const settle = async () => {
  flushSync();
  await Promise.resolve();
  await Promise.resolve();
  flushSync();
};

beforeEach(() => {
  handles.length = 0;
  connect.mockClear();
  lookup.mockReset();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ImageCropper (Vanilla)", () => {
  it("finds every authored root and connects the controller on each, once", async () => {
    document.body.innerHTML = shell() + shell('data-shape="circle"');
    expect(mountImageCropper(document)).toBe(2);
    await settle();
    expect(connect).toHaveBeenCalledTimes(2);
    const roots = Array.from(document.querySelectorAll<HTMLElement>(`[${imageCropperAttrs.root}]`));
    expect(connect.mock.calls.map(([root]) => root)).toEqual(roots);
  });

  it("does not connect a root twice when asked to mount again", async () => {
    document.body.innerHTML = shell();
    mountImageCropper(document);
    await settle();
    mountImageCropper(document);
    await settle();
    expect(connect).toHaveBeenCalledTimes(1);
  });

  it("marks a mounted root so the page and the gates can tell it is ready", async () => {
    document.body.innerHTML = shell();
    mountImageCropper(document);
    await settle();
    expect(document.querySelector(`[${imageCropperAttrs.root}]`)!.hasAttribute("data-sk-ready")).toBe(true);
  });

  it("lets go of the controller when the root is unmounted, and connects again if it is mounted anew", async () => {
    document.body.innerHTML = shell();
    mountImageCropper(document);
    await settle();
    const root = document.querySelector<HTMLElement>(`[${imageCropperAttrs.root}]`)!;
    destroyMount(root);
    expect(handles[0]!.destroy).toHaveBeenCalledTimes(1);
    mountImageCropper(document);
    await settle();
    expect(connect).toHaveBeenCalledTimes(2);
  });

  it("connects a root directly, and the cleanup it returns destroys the handle", () => {
    document.body.innerHTML = shell();
    const root = document.querySelector<HTMLElement>(`[${imageCropperAttrs.root}]`)!;
    const cleanup = connectImageCropperRoot(root);
    expect(connect).toHaveBeenCalledWith(root);
    cleanup();
    expect(handles[0]!.destroy).toHaveBeenCalledTimes(1);
  });

  it("gives back a cropper's handle for a root, and nothing for an element that is not one", () => {
    document.body.innerHTML = shell();
    const root = document.querySelector<HTMLElement>(`[${imageCropperAttrs.root}]`)!;
    lookup.mockReturnValueOnce(handles[0]);
    getImageCropper(root);
    expect(lookup).toHaveBeenCalledWith(root);
    lookup.mockReturnValueOnce(undefined);
    expect(getImageCropper(document.body)).toBeUndefined();
  });

  it("names the events a page listens for on the root", () => {
    expect(imageCropperEvents).toEqual({
      valueChange: "sk:imagecroppervaluechange",
      valueChangeEnd: "sk:imagecroppervaluechangeend",
      confirm: "sk:imagecropperconfirm",
      cancel: "sk:imagecroppercancel",
      shapeChange: "sk:imagecroppershapechange",
      aspectChange: "sk:imagecropperaspectchange",
      ready: "sk:imagecropperready",
      error: "sk:imagecroppererror",
    });
  });
});
