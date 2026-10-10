import "@skryensya/core/components/button.css";
import "@skryensya/core/components/dialog.css";
import "@skryensya/core/components/file-upload.css";
import "@skryensya/core/components/image-cropper.css";
import "@skryensya/core/components/typography.css";
import "@skryensya/core/patterns/icon.css";
import "@skryensya/core/patterns/layout.css";
import { getImageCropper } from "@skryensya/vanilla/image-cropper";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { CROPPER_PICTURE, imageCropperFlowTree } from "@docs/demos/image-cropper";
import { translator } from "@skryensya/storybook-kit/translate";
import { render, type Meta, type StoryObj } from "../tree-story";

/*
 * THE RECIPES, FOR AUTHORED MARKUP. A cropper is the root's attributes, and what a page does with it is events and a handle: the
 * file that comes out of `sk:imagecropperconfirm`, a picture replaced by writing `data-src`, a value set through the handle.
 * The plain examples are the generated stories beside these.
 */
export default { title: "Components/Media & Visuals/Image Cropper/Recipes", parameters: { layout: "padded" } } satisfies Meta;

const alt = "A mountain landscape at sunset, with the sun above a lake";
const cropperTree = (options: Record<string, string | number | boolean>): UsageTree => ({
  contract: "image-cropper",
  signature: "ImageCropper",
  options: { src: CROPPER_PICTURE, alt, ...options },
});

const page = (...children: (Node | string)[]): HTMLElement => {
  const host = document.createElement("div");
  Object.assign(host.style, { display: "grid", gap: "1rem", maxInlineSize: "44rem" });
  host.append(...children);
  return host;
};

const note = (text: string): HTMLElement => {
  const element = document.createElement("p");
  element.textContent = text;
  element.style.margin = "0";
  return element;
};

/** Apply makes a file, and the file is shown with its type and size: `detail.exportBlob()` is the whole contract. */
export const ExportedFile: StoryObj = {
  render: () => {
    const cropper = render(cropperTree({ aspect: "16:9", outputWidth: 1200, outputType: "image/jpeg", outputQuality: 0.85 }));
    const output = note("Apply the crop to see the file that comes out.");
    let url = "";
    cropper.addEventListener("sk:imagecropperconfirm", async (event) => {
      try {
        const blob = await (event as CustomEvent).detail.exportBlob();
        const bitmap = await createImageBitmap(blob);
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(blob);
        output.replaceChildren();
        const image = document.createElement("img");
        image.alt = "The exported crop";
        image.src = url;
        image.style.maxInlineSize = "14rem";
        output.append(image, ` ${blob.type}, ${bitmap.width} × ${bitmap.height} px, ${(blob.size / 1024).toFixed(1)} kB`);
      } catch (error) {
        output.textContent = `${(error as { code: string }).code}: ${(error as Error).message}`;
      }
    });
    return page(cropper, output);
  },
};

/** The handle: a value set from the page, read back, and a reset. It is the Vanilla side of a controlled cropper. */
export const SetAndReadAValue: StoryObj = {
  render: () => {
    const cropper = render(cropperTree({ aspect: "4:3" }));
    const shown = document.createElement("pre");
    shown.style.margin = "0";
    const show = () => {
      const root = cropper.querySelector<HTMLElement>(".sk-image-cropper");
      shown.textContent = JSON.stringify(root && getImageCropper(root)?.getValue(), null, 2);
    };
    cropper.addEventListener("sk:imagecroppervaluechange", show);
    cropper.addEventListener("sk:imagecropperready", show);
    const buttons = document.createElement("div");
    buttons.style.display = "flex";
    buttons.style.gap = "0.5rem";
    for (const [label, value] of [
      ["Jump to a stored crop", { position: { x: 0.9, y: 0.2 }, zoom: 2.5, rotation: -20 }],
      ["Back to the start", { position: { x: 0.5, y: 0.5 }, zoom: 1, rotation: 0 }],
    ] as const) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sk-button";
      button.dataset.variant = "soft";
      button.textContent = label;
      button.addEventListener("click", () => {
        const root = cropper.querySelector<HTMLElement>(".sk-image-cropper");
        if (root) getImageCropper(root)?.setValue(value, { silent: false });
        show();
      });
      buttons.append(button);
    }
    return page(cropper, buttons, shown);
  },
};

/** Inside a native modal dialog: Cancel closes it, Apply exports and closes it, and focus goes back to the button that opened it. */
export const InDialog: StoryObj = {
  render: () => {
    const opener = document.createElement("button");
    opener.type = "button";
    opener.className = "sk-button";
    opener.textContent = "Change profile picture";
    const dialog = document.createElement("dialog");
    dialog.className = "sk-dialog";
    dialog.setAttribute("aria-label", "Profile picture");
    dialog.append(render(cropperTree({ shape: "circle", maxZoom: 3 })));
    const close = () => {
      dialog.close();
      opener.focus();
    };
    dialog.addEventListener("sk:imagecroppercancel", close);
    dialog.addEventListener("sk:imagecropperconfirm", close);
    opener.addEventListener("click", () => dialog.showModal());
    return page(opener, dialog);
  },
};

/** FileUpload, ImageCropper and a frame, joined by a dozen lines of script: the same flow the docs page runs. */
export const WithFileUpload: StoryObj = {
  render: () => {
    const host = render(imageCropperFlowTree(translator("en")));
    requestAnimationFrame(() => {
      const upload = host.querySelector<HTMLElement>("#flow-upload");
      const cropper = host.querySelector<HTMLElement>("#flow-cropper");
      const result = host.querySelector<HTMLElement>("#flow-result");
      const empty = host.querySelector<HTMLElement>("#flow-empty");
      if (!upload || !cropper || !result || !empty) return;
      let sourceUrl = "";
      let resultUrl = "";
      upload.addEventListener("sk:fileuploadchange", (event) => {
        const [file] = (event as CustomEvent<{ acceptedFiles: File[] }>).detail.acceptedFiles;
        if (!file) return;
        if (sourceUrl) URL.revokeObjectURL(sourceUrl);
        sourceUrl = URL.createObjectURL(file);
        cropper.setAttribute("data-src", sourceUrl);
      });
      cropper.addEventListener("sk:imagecropperconfirm", async (event) => {
        const blob = await (event as CustomEvent).detail.exportBlob();
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        resultUrl = URL.createObjectURL(blob);
        const image = result.querySelector("img");
        if (image) image.src = resultUrl;
        result.hidden = false;
        empty.hidden = true;
      });
    });
    return host;
  },
};
