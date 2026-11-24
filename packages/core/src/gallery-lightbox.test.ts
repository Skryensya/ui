// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { linkGalleryLightbox } from "./gallery-lightbox.js";
import { lightboxEvents } from "./lightbox-controller.js";

/* A gallery of three whose views are Lightbox triggers, the dialog they open, and nothing else: the wiring, not the viewer. */
function page({ dialogFirst = true } = {}) {
  const dialog = `<dialog id="viewer"><button>Close</button></dialog>`;
  const gallery = `<div class="sk-gallery">
    <div class="sk-gallery__views">${[0, 1, 2].map((i) => `<div class="sk-gallery__view"><a data-sk-lightbox-open="viewer" href="/p${i}.jpg">Photo ${i}</a></div>`).join("")}</div>
    <div class="sk-gallery__thumbs" role="radiogroup">${[0, 1, 2].map((i) => `<label class="sk-gallery__thumb"><input class="sk-gallery__thumb-input" type="radio" name="g" value="${i}" ${i === 0 ? "checked" : ""}></label>`).join("")}</div>
  </div>`;
  document.body.innerHTML = dialogFirst ? dialog + gallery : gallery;
  const root = document.querySelector<HTMLElement>(".sk-gallery")!;
  const inputs = [...root.querySelectorAll<HTMLInputElement>("input")];
  return { root, inputs, dialog: () => document.getElementById("viewer")! };
}

const fire = (target: Element, type: string, detail: unknown) => target.dispatchEvent(new CustomEvent(type, { detail }));

afterEach(() => {
  document.body.innerHTML = "";
});

describe("a gallery whose photos open a Lightbox", () => {
  it("follows the viewer: each step checks the matching thumbnail and says so", () => {
    const { root, inputs, dialog } = page();
    const stop = linkGalleryLightbox(root);
    const changes: string[] = [];
    root.addEventListener("change", (event) => changes.push((event.target as HTMLInputElement).value));
    fire(dialog(), lightboxEvents.indexChange, { index: 2 });
    expect(inputs.map((input) => input.checked)).toEqual([false, false, true]);
    expect(changes).toEqual(["2"]);
    stop();
    fire(dialog(), lightboxEvents.indexChange, { index: 1 });
    expect(inputs[2]!.checked).toBe(true);
  });

  it("hears a dialog that mounts after the gallery", () => {
    const { root, inputs } = page({ dialogFirst: false });
    linkGalleryLightbox(root);
    document.body.insertAdjacentHTML("beforeend", `<dialog id="viewer"></dialog>`);
    fire(document.getElementById("viewer")!, lightboxEvents.indexChange, { index: 1 });
    expect(inputs[1]!.checked).toBe(true);
  });

  it("ignores another Lightbox's steps", () => {
    const { root, inputs } = page();
    linkGalleryLightbox(root);
    document.body.insertAdjacentHTML("beforeend", `<dialog id="other"></dialog>`);
    fire(document.getElementById("other")!, lightboxEvents.indexChange, { index: 2 });
    expect(inputs[0]!.checked).toBe(true);
  });

  it("attaches nothing to a gallery with no Lightbox trigger", () => {
    document.body.innerHTML = `<div class="sk-gallery"><div class="sk-gallery__views"><div class="sk-gallery__view">x</div></div></div>`;
    expect(typeof linkGalleryLightbox(document.querySelector<HTMLElement>(".sk-gallery")!)).toBe("function");
  });
});
