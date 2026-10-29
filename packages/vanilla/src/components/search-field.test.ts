import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountSearchField } from "./search-field.js";

/* Every assertion here has a twin in `packages/react/src/components/search-field.test.tsx`. */
function mountField(value = ""): { root: HTMLElement; input: HTMLInputElement; clear: HTMLButtonElement } {
  document.body.innerHTML = `<div class="sk-search-field" data-sk-search-field>
    <label class="sk-search-field__label" for="q">Search</label>
    <div class="sk-search-field__control">
      <input class="sk-search-field__input sk-input" data-sk-search-field-input id="q" type="search" value="${value}">
      <button class="sk-search-field__clear sk-button" data-sk-search-field-clear type="button" aria-label="Clear search" hidden></button>
    </div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-search-field]")!;
  mountSearchField();
  return {
    root,
    input: root.querySelector("input")!,
    clear: root.querySelector("button")!,
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("mountSearchField", () => {
  it("shows the clear button for an authored value and hides it while empty", () => {
    expect(mountField("tokens").clear.hidden).toBe(false);
    const { input, clear } = mountField();
    expect(clear.hidden).toBe(true);
    fireEvent.input(input, { target: { value: "tokens" } });
    expect(clear.hidden).toBe(false);
  });

  it("clears on the button, announces it as an input event and hands focus back", () => {
    const { input, clear } = mountField("tokens");
    const onInput = vi.fn();
    document.addEventListener("input", onInput);
    fireEvent.click(clear);
    document.removeEventListener("input", onInput);
    expect(input.value).toBe("");
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(clear.hidden).toBe(true);
    expect(document.activeElement).toBe(input);
  });

  it("clears on Escape, but lets Escape through when the field is already empty", () => {
    const { input } = mountField("tokens");
    const outer = vi.fn();
    document.body.addEventListener("keydown", outer);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
    expect(outer).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
  });
});
