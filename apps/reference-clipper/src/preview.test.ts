// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { hidePreview, showPreview } from "./preview";

const previews = () => document.querySelectorAll("[data-sk-clipper-preview]");
afterEach(hidePreview);

it("draws one preview that never takes the page's pointer events", () => {
  showPreview("page");
  showPreview("selection");
  expect(previews()).toHaveLength(1);
  const host = previews()[0] as HTMLElement;
  expect(host.style.getPropertyValue("pointer-events")).toBe("none");
});

it("removes the preview", () => {
  showPreview("page");
  hidePreview();
  expect(previews()).toHaveLength(0);
});
