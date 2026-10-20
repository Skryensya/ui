import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { comboboxEvents } from "@skryensya/core/combobox";
import { Combobox } from "./combobox.js";

const items = [
  { value: "argelia", label: "Argelia" },
  { value: "argentina", label: "Argentina" },
  { value: "chile", label: "Chile" },
];

const setup = (props: Partial<Parameters<typeof Combobox>[0]> = {}) => {
  const ui = render(<Combobox items={items} label="País" {...props} />);
  const input = ui.getByRole("combobox", { name: "País" }) as HTMLInputElement;
  return { ui, input };
};

describe("Combobox", () => {
  it("writes an appearance on the root only when asked", () => {
    const plain = render(<Combobox items={items} label="Plain" />);
    expect(plain.container.querySelector(".sk-combobox")?.hasAttribute("data-appearance")).toBe(false);
    const frosted = render(<Combobox appearance="frosted" items={items} label="Frosted" />);
    expect(frosted.container.querySelector(".sk-combobox")?.getAttribute("data-appearance")).toBe("frosted");
  });

  it("keeps the typed search when the field is left without a selection", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "arg" } });
    await waitFor(() => expect(ui.getAllByRole("option")).toHaveLength(2));

    // Leaving with nothing chosen: the machine would revert the input, `selectionBehavior: preserve`
    // is what keeps the user's work on screen.
    fireEvent.blur(input);

    await waitFor(() => expect(input.value).toBe("arg"));
  });

  it("writes the chosen label and reopens on the whole list", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "arg" } });
    fireEvent.click(await ui.findByRole("option", { name: "Argentina" }));

    await waitFor(() => expect(input.value).toBe("Argentina"));

    fireEvent.click(input);
    await waitFor(() =>
      expect(ui.getAllByRole("option")).toHaveLength(items.length),
    );
  });

  it("spends the query on each Tag when multiple", async () => {
    const { ui, input } = setup({ multiple: true });

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "arg" } });
    fireEvent.click(await ui.findByRole("option", { name: "Argentina" }));

    // The Tag carries the answer, so the input is free for the next search. On the whole list.
    await waitFor(() => expect(input.value).toBe(""));
    expect(ui.getAllByRole("option")).toHaveLength(items.length);
    const tag = ui.getByRole("listitem");
    expect(tag.classList.contains("sk-tag")).toBe(true);
    expect(tag.getAttribute("data-removable")).toBe("");
    expect(tag.textContent).toContain("Argentina");
    expect(tag.querySelector(".sk-tag__label")?.getAttribute("title")).toBe("Argentina");
  });

  it("removes a selected Tag and disables its remove action with the field", async () => {
    const { ui } = setup({ multiple: true, defaultValue: ["argentina"] });

    fireEvent.click(ui.getByRole("button", { name: "Quitar Argentina" }));
    await waitFor(() => expect(ui.queryByRole("listitem")).toBeNull());
    ui.unmount();

    const disabled = setup({ multiple: true, defaultValue: ["argentina"], disabled: true });
    expect(disabled.ui.getByRole("listitem").getAttribute("aria-disabled")).toBe("true");
    const remove = disabled.ui.getByRole("button", { name: "Quitar Argentina" }) as HTMLButtonElement;
    expect(remove.disabled).toBe(true);
  });

  it("marks the highlight as keyboard-driven so the option can carry the focus ring", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    const listbox = await ui.findByRole("listbox");
    // `pointer` at rest, matching the enhancer: no key has moved the highlight yet, and only
    // `keyboard` changes what is drawn. This read `toBeUndefined()` while the two bindings
    // disagreed about the attribute before anyone had touched the control.
    expect(listbox.dataset.highlightSource).toBe("pointer");

    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => expect(listbox.dataset.highlightSource).toBe("keyboard"));
    // The control gives its ring up while an option holds it. One ring on screen at a time.
    expect(
      ui.container.querySelector(".sk-combobox")?.hasAttribute("data-virtual-focus"),
    ).toBe(true);

    fireEvent.pointerMove(listbox);

    await waitFor(() => expect(listbox.dataset.highlightSource).toBe("pointer"));
    expect(
      ui.container.querySelector(".sk-combobox")?.hasAttribute("data-virtual-focus"),
    ).toBe(false);
  });

  it("moves aria-selected onto the highlighted option before Enter commits anything", async () => {
    const { ui, input } = setup();

    fireEvent.click(input);
    await ui.findAllByRole("option");

    // Nothing chosen yet, nothing highlighted yet: no option should claim to be "selected".
    for (const option of ui.getAllByRole("option"))
      expect(option.hasAttribute("aria-selected")).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Matches the WAI reference implementation (`combobox-autocomplete.js`,
    // `setCurrentOptionStyle`): the option under `aria-activedescendant` carries
    // `aria-selected="true"` while the user is only previewing it, not the previously chosen value.
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argelia" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Argentina" }).hasAttribute("aria-selected"),
    ).toBe(false);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argentina" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Argelia" }).hasAttribute("aria-selected"),
    ).toBe(false);
  });

  it("keeps aria-selected tied to the chosen Tags when multiple, not the highlight", async () => {
    const { ui, input } = setup({ multiple: true });

    fireEvent.click(input);
    await ui.findAllByRole("option");
    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Nothing chosen yet: the highlight alone must not produce aria-selected in multiple mode
    // either. Only single-select borrows the highlight for it.
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argelia" }).hasAttribute("data-highlighted"),
      ).toBe(true),
    );
    expect(
      ui.getByRole("option", { name: "Argelia" }).hasAttribute("aria-selected"),
    ).toBe(false);

    fireEvent.click(ui.getByRole("option", { name: "Argelia" }));

    // Choosing it as a Tag is what turns aria-selected on: with Tags, it means "part of the
    // chosen set" (`aria-multiselectable="true"`), not "currently previewed".
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Argelia" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
  });

  it("dispatches sk:comboboxvaluechange and sk:comboboxinputvaluechange for DOM parity with vanilla", async () => {
    const onValue = vi.fn();
    const onInput = vi.fn();
    const onDomValue = vi.fn();
    const onDomInput = vi.fn();
    const { ui, input } = setup({
      onValueChange: onValue,
      onInputValueChange: onInput,
    });
    const root = ui.container.querySelector(".sk-combobox")!;
    expect(root.hasAttribute("data-sk-combobox")).toBe(true);
    root.addEventListener("sk:comboboxvaluechange", onDomValue);
    root.addEventListener("sk:comboboxinputvaluechange", onDomInput);

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "arg" } });
    await waitFor(() => expect(onDomInput).toHaveBeenCalled());
    expect((onDomInput.mock.calls.at(-1)![0] as CustomEvent).detail).toEqual({
      inputValue: "arg",
    });

    fireEvent.click(await ui.findByRole("option", { name: "Argentina" }));
    await waitFor(() => expect(onDomValue).toHaveBeenCalled());
    expect((onDomValue.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      value: ["argentina"],
    });
    expect(onValue).toHaveBeenCalledWith({ value: ["argentina"] });
  });

  it("accepts Select's own options shape as an alias for items", async () => {
    const ui = render(<Combobox label="País" options={items} />);
    const input = ui.getByRole("combobox", { name: "País" });
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => expect(ui.getAllByRole("option")).toHaveLength(items.length));
  });

  it("prefers items over options when both are given", async () => {
    const ui = render(
      <Combobox
        items={[{ value: "chile", label: "Chile" }]}
        label="País"
        options={items}
      />,
    );
    const input = ui.getByRole("combobox", { name: "País" });
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => expect(ui.getAllByRole("option")).toHaveLength(1));
  });

  it("accepts aria-label as a hidden accessible name, with no visible label", () => {
    const ui = render(<Combobox aria-label="País" items={items} />);
    expect(ui.getByRole("combobox", { name: "País" })).toBeTruthy();
    expect(ui.container.querySelector("label")).toBeNull();
  });
});
