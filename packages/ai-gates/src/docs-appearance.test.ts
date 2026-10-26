// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { initAppearance } from "../../../apps/docs/src/scripts/appearance";

// The browser checks geometry; this exercises the docs' real appearance writer and frame lifecycle.
it("keeps composed previews coherent across appearances and asynchronous frame mounts", async () => {
  document.body.innerHTML = `
    <div data-docs-appearance-scope data-docs-appearance-target=".sk-button, .sk-input, .sk-select, .sk-popover">
      <button data-docs-appearance-set="brutalist"></button>
      <button data-docs-appearance-set="frosted"></button>
      <button data-docs-appearance-set="tactile"></button>
      <iframe class="sk-component-preview__stage"></iframe>
    </div>
  `;
  const frame = document.querySelector("iframe")!;
  const markup = '<button class="sk-button"></button><input class="sk-input"><div class="sk-select"></div><div class="sk-popover"></div>';
  frame.setAttribute("data-sk-component-preview-doc", `<!doctype html><body>${markup}</body>`);
  frame.contentDocument!.body.innerHTML = markup;
  initAppearance();

  const appearances = () => [...frame.contentDocument!.body.children].map((el) => el.getAttribute("data-appearance"));
  const choose = (value: string) => document.querySelector<HTMLButtonElement>(`[data-docs-appearance-set="${value}"]`)!.click();
  for (const value of ["brutalist", "frosted"]) {
    choose(value);
    expect(appearances()).toEqual([value, value, value, value]);
    const source = new DOMParser().parseFromString(frame.getAttribute("data-sk-component-preview-doc")!, "text/html");
    expect([...source.body.children].map((el) => el.getAttribute("data-appearance"))).toEqual([value, value, value, value]);
  }
  choose("tactile");
  expect(appearances()).toEqual(["tactile", "plain", "plain", "plain"]);

  choose("brutalist");
  // Like a variant switch: the frame's new React content appears after its load event.
  frame.contentDocument!.body.innerHTML = markup;
  expect(appearances()).toEqual([null, null, null, null]);
  frame.setAttribute("data-sk-component-preview-frame-ready", "");
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(appearances()).toEqual(["brutalist", "brutalist", "brutalist", "brutalist"]);
});

afterEach(() => {
  document.body.innerHTML = "";
});
