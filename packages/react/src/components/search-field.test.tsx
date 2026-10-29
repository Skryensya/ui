import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchField } from "./search-field.js";

const field = (ui: ReturnType<typeof render>) => ui.getByRole("searchbox", { name: "Search" }) as HTMLInputElement;
const clearButton = (ui: ReturnType<typeof render>) =>
  ui.container.querySelector<HTMLButtonElement>(".sk-search-field__clear")!;

describe("SearchField (React)", () => {
  it("names a native search input by its label and composes Input's class", () => {
    const ui = render(<SearchField label="Search" name="q" />);
    expect(field(ui).type).toBe("search");
    expect(field(ui).name).toBe("q");
    expect(field(ui).classList.contains("sk-input")).toBe(true);
  });

  it("hides the clear button while empty and shows it once there is text", () => {
    const ui = render(<SearchField label="Search" />);
    expect(clearButton(ui).hidden).toBe(true);
    fireEvent.change(field(ui), { target: { value: "tokens" } });
    expect(clearButton(ui).hidden).toBe(false);
    expect(clearButton(ui).getAttribute("aria-label")).toBe("Clear search");
  });

  it("clears on the button, reports the empty value and hands focus back to the input", () => {
    const onValueChange = vi.fn();
    const ui = render(<SearchField defaultValue="tokens" label="Search" onValueChange={onValueChange} />);
    fireEvent.click(clearButton(ui));
    expect(field(ui).value).toBe("");
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect(document.activeElement).toBe(field(ui));
  });

  it("clears on Escape, but lets Escape through when the field is already empty", () => {
    const outer = vi.fn();
    const ui = render(
      <div onKeyDown={outer}>
        <SearchField defaultValue="tokens" label="Search" />
      </div>,
    );
    fireEvent.keyDown(field(ui), { key: "Escape" });
    expect(field(ui).value).toBe("");
    expect(outer).not.toHaveBeenCalled();
    fireEvent.keyDown(field(ui), { key: "Escape" });
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it("follows a controlled value", () => {
    const ui = render(<SearchField label="Search" value="fixed" />);
    expect(field(ui).value).toBe("fixed");
    ui.rerender(<SearchField label="Search" value="" />);
    expect(clearButton(ui).hidden).toBe(true);
  });

  it("becomes a GET form with the search landmark and a submit button when given an action", () => {
    const ui = render(<SearchField action="/search" label="Search" name="q" submit="Go" />);
    const form = ui.getByRole("search");
    expect(form.tagName).toBe("FORM");
    expect(form.getAttribute("action")).toBe("/search");
    expect(form.getAttribute("method")).toBe("get");
    expect(ui.getByRole("button", { name: "Go" }).getAttribute("type")).toBe("submit");
  });

  it("keeps a visually hidden label as the input's name", () => {
    const ui = render(<SearchField label="Search" labelVisuallyHidden />);
    expect(ui.container.querySelector(".sk-search-field")?.hasAttribute("data-label-visually-hidden")).toBe(true);
    expect(field(ui)).toBeTruthy();
  });
});
