import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FormField } from "./form-field.js";
import { Select } from "./select.js";

const options = [
  { value: "default", label: "Default" },
  { value: "ember", label: "Ember" },
  { value: "dusk", label: "Dusk", disabled: true },
];

describe("Select", () => {
  // jsdom does no real layout - every element's `offsetHeight` is 0, and the content list is now
  // virtualized (`@tanstack/virtual-core`, which reads exactly that property for both its own
  // viewport and each row's measured size). Unstubbed, a 0px viewport renders no rows at all, same
  // as the zero-height feedback loop `select.test.ts` (Vanilla) hit and documents in full.
  let offsetHeight: PropertyDescriptor | undefined;
  beforeEach(() => {
    offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 44 });
  });
  afterEach(() => {
    if (offsetHeight) Object.defineProperty(HTMLElement.prototype, "offsetHeight", offsetHeight);
    else delete (HTMLElement.prototype as { offsetHeight?: unknown }).offsetHeight;
  });

  it("writes an appearance on the root only when asked", () => {
    const plain = render(<Select label="Plain" name="plain" options={options} />);
    expect(plain.container.querySelector(".sk-select")?.hasAttribute("data-appearance")).toBe(false);
    const brutalist = render(<Select appearance="brutalist" label="Brutalist" name="brutalist" options={options} />);
    expect(brutalist.container.querySelector(".sk-select")?.getAttribute("data-appearance")).toBe("brutalist");
  });

  it("uses the Zag select machine for popup selection and form value", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <Select
        indicator={<svg className="sk-icon" data-testid="chevron-down" />}
        openIndicator={<svg className="sk-icon" data-testid="chevron-up" />}
        itemIndicator={<svg className="sk-icon" data-testid="check" />}
        label="Brand"
        name="brand"
        options={options}
        onValueChange={onValueChange}
      />,
    );

    expect(ui.getByTestId("chevron-down").classList).toContain("sk-icon");
    expect(ui.getByTestId("chevron-up").classList).toContain("sk-icon");
    fireEvent.click(ui.getByRole("combobox", { name: "Brand" }));
    const content = document.body.querySelector(".sk-select__content");
    expect(content?.classList.contains("sk-scrollbar")).toBe(true);
    expect(content?.parentElement?.classList.contains("sk-select__panel")).toBe(true);
    expect(ui.getAllByTestId("check")).toHaveLength(options.length);
    expect(ui.getAllByTestId("check").every((icon) => icon.classList.contains("sk-icon"))).toBe(true);
    fireEvent.click(await ui.findByRole("option", { name: "Ember" }));

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["ember"] })));
    expect((ui.container.querySelector('select[name="brand"]') as HTMLSelectElement).value).toBe("ember");
  });

  it("dispatches sk:selectvaluechange on the root for DOM parity with vanilla", async () => {
    const onDom = vi.fn();
    const ui = render(<Select label="Brand" name="brand" options={options} />);
    const root = ui.container.querySelector("[data-sk-select]")!;
    expect(root).toBeTruthy();
    root.addEventListener("sk:selectvaluechange", onDom);

    fireEvent.click(ui.getByRole("combobox", { name: "Brand" }));
    fireEvent.click(await ui.findByRole("option", { name: "Ember" }));

    await waitFor(() => expect(onDom).toHaveBeenCalled());
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: ["ember"] });
  });

  it("accepts aria-label as a hidden accessible name, with no visible label", () => {
    const ui = render(<Select aria-label="Brand" name="brand" options={options} />);
    expect(ui.getByRole("combobox", { name: "Brand" })).toBeTruthy();
  });

  it("shows the label of an item whose value is the empty string, not the placeholder", async () => {
    const withEmpty = [{ value: "", label: "Sin asignar" }, ...options];
    const ui = render(<Select label="Owner" name="owner" options={withEmpty} placeholder="Choose" />);
    fireEvent.click(ui.getByRole("combobox", { name: "Owner" }));
    fireEvent.click(await ui.findByRole("option", { name: "Sin asignar" }));
    await waitFor(() => expect(ui.getByRole("combobox", { name: "Owner" }).textContent).toBe("Sin asignar"));
  });

  it("moves aria-selected onto the highlighted option before Enter commits anything", async () => {
    const ui = render(<Select label="Brand" name="brand" options={options} />);
    const trigger = ui.getByRole("combobox", { name: "Brand" });

    fireEvent.click(trigger);
    await ui.findAllByRole("option");

    // Nothing chosen yet, nothing highlighted yet: no option should claim to be "selected".
    for (const option of ui.getAllByRole("option"))
      expect(option.hasAttribute("aria-selected")).toBe(false);

    // Unlike Combobox's virtual-focus-on-input model, Select moves REAL DOM focus into the
    // listbox on open (`setInitialFocus`, deferred to `raf`). Arrow keys are dispatched wherever
    // focus actually landed, not on the trigger. Waiting for "not the trigger" alone is a race:
    // the trigger blurs to `document.body` synchronously, one tick before the deferred `raf`
    // actually lands focus on the listbox, and `not.toBe(trigger)` is already true during that
    // window. The assertion below then fires the key on `<body>`, which nothing is listening on.
    await waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("listbox"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

    // Matches the WAI reference implementation (`combobox-autocomplete.js`,
    // `setCurrentOptionStyle`), and the same fix already applied to Combobox: the option under
    // `aria-activedescendant` carries `aria-selected="true"` while merely previewed, not just the
    // previously chosen value.
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Default" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Ember" }).hasAttribute("aria-selected"),
    ).toBe(false);

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Ember" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Default" }).hasAttribute("aria-selected"),
    ).toBe(false);
  });

  it("keeps Zag's positioning reference when FormField supplies the trigger id", async () => {
    const ui = render(
      <FormField id="owner" label="Owner">
        <Select name="owner" options={options} />
      </FormField>,
    );
    fireEvent.click(ui.getByRole("combobox", { name: "Owner" }));

    const positioner = ui.container.ownerDocument.querySelector<HTMLElement>(".sk-select__positioner")!;
    await waitFor(() => expect(positioner.style.getPropertyValue("--x")).not.toBe(""));
  });

  it("inside a FormField with no label of its own, names itself from the field's label with no second visible one", () => {
    const ui = render(
      <FormField label="Brand" required>
        <Select name="brand" options={options} />
      </FormField>,
    );
    // One label, the field's; Select painted none of its own.
    expect(ui.container.querySelectorAll("label")).toHaveLength(1);
    const trigger = ui.getByRole("combobox", { name: "Brand" });
    expect(trigger.id).toBe(ui.getByText("Brand").closest("label")!.getAttribute("for"));
    // The field's `required` reaches the machine too, same as Input/NativeSelect.
    expect(trigger.getAttribute("aria-required")).toBe("true");
  });

  it("keeps its own label and id pairing when both Select's own label and a FormField are given", () => {
    const ui = render(
      <FormField label="Field label">
        <Select label="Brand" name="brand" options={options} />
      </FormField>,
    );
    expect(ui.container.querySelectorAll("label")).toHaveLength(2);
    const trigger = ui.getByRole("combobox", { name: "Brand" });
    expect(trigger.id).not.toBe(ui.container.querySelector(".sk-form-field__label")?.getAttribute("for"));
  });
});
