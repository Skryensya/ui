import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker, CompactColorPicker, NativeColorPicker, SwatchColorPicker } from "./color-picker.js";

describe("ColorPicker", () => {
  it("opens the panel from the trigger and renders the full anatomy", async () => {
    const ui = render(<ColorPicker label="Color de marca" defaultValue="#3366ff" />);
    const trigger = ui.getByRole("button");

    fireEvent.click(trigger);

    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());
    expect(ui.getByDisplayValue("#3366FF")).toBeTruthy();
    // One hex field and nothing else to switch between.
    expect(document.querySelectorAll(".sk-color-picker__channel-input")).toHaveLength(1);
    expect(document.querySelector(".sk-color-picker__format-switch")).toBeNull();
  });

  it("commits a typed hex value and updates the swatch", async () => {
    const onValueChange = vi.fn();
    const onDom = vi.fn();
    const ui = render(
      <ColorPicker defaultValue="#000000" label="Color" onValueChange={onValueChange} />,
    );
    const root = ui.container.querySelector(".sk-color-picker")!;
    expect(root.hasAttribute("data-sk-color-picker")).toBe(true);
    root.addEventListener("sk:colorpickervaluechange", onDom);
    fireEvent.click(ui.getByRole("button"));
    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());

    const hex = ui.getByDisplayValue("#000000");
    fireEvent.change(hex, { target: { value: "#3366ff" } });
    fireEvent.blur(hex);

    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    expect((root as HTMLElement).style.getPropertyValue("--value")).toBe("rgba(51, 102, 255, 1)");
    expect(onDom).toHaveBeenCalled();
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      value: "rgba(51, 102, 255, 1)",
    });
    expect(onValueChange).toHaveBeenCalledWith({ value: "rgba(51, 102, 255, 1)" });
  });

  it("selects a preset swatch and updates the current color", async () => {
    const ui = render(
      <ColorPicker
        defaultValue="#000000"
        label="Color"
        swatches={["#ff0000", "#00ff00", "#0000ff"]}
      />,
    );
    fireEvent.click(ui.getByRole("button"));
    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());

    // `ColorPicker` portals its panel to `document.body`, outside `ui.container`'s own subtree.
    const swatchTriggers = document.querySelectorAll(".sk-color-picker__swatch-trigger");
    expect(swatchTriggers).toHaveLength(3);
    fireEvent.click(swatchTriggers[1]!);

    const root = ui.container.querySelector(".sk-color-picker")!;
    await waitFor(() =>
      expect((root as HTMLElement).style.getPropertyValue("--value")).toBe("rgba(0, 255, 0, 1)"),
    );
  });

  it("also accepts swatches as the compiler's own space-separated string", () => {
    // The contract's `swatches` option has no array/list type, so this space-separated string is
    // the literal shape the compiler emits as JSX; the array form above is the ergonomic one for
    // hand-authored React.
    const ui = render(
      <ColorPicker defaultValue="#000000" label="Color" swatches="#ff0000 #00ff00 #0000ff" />,
    );
    fireEvent.click(ui.getByRole("button"));
    expect(document.querySelectorAll(".sk-color-picker__swatch-trigger")).toHaveLength(3);
  });

  it("renders a field-like trigger with a preview swatch and text value", () => {
    const ui = render(<ColorPicker defaultValue="#3366ff" label="Color" name="brand" />);
    const hidden = ui.container.querySelector('input[name="brand"]');
    expect(hidden).toBeTruthy();
    expect(ui.container.querySelector(".sk-color-picker__swatch")).toBeTruthy();
    expect(ui.container.querySelector(".sk-color-picker__value")?.textContent).toBe("rgba(51, 102, 255, 1)");
    // The value ellipsizes at narrow widths with no way to read it fully without this.
    expect(ui.container.querySelector(".sk-color-picker__value")?.getAttribute("title")).toBe(
      "rgba(51, 102, 255, 1)",
    );
  });

  it("a consumer's own triggerLabel overrides Zag's color-describing default", () => {
    const ui = render(
      <ColorPicker defaultValue="#3366ff" label="Color" triggerLabel="Elegir color de marca" />,
    );
    expect(ui.getByRole("button", { name: "Elegir color de marca" })).toBeTruthy();
  });
});

describe("CompactColorPicker", () => {
  it("drops the channel-input rows entirely, keeping the area, hue rail and presets", async () => {
    const ui = render(
      <CompactColorPicker defaultValue="#3366ff" label="Acento" swatches={["#ff0000"]} />,
    );
    fireEvent.click(ui.getByRole("button"));
    await waitFor(() => expect(ui.getByRole("dialog", { hidden: true })).toBeTruthy());

    // Portaled to `document.body`, same note as above.
    expect(document.querySelector(".sk-color-picker__channels")).toBeNull();
    expect(document.querySelector(".sk-color-picker__area")).toBeTruthy();
    expect(document.querySelector(".sk-color-picker__hue-slider")).toBeTruthy();
    expect(document.querySelector(".sk-color-picker__swatch-trigger")).toBeTruthy();
  });
});

describe("NativeColorPicker", () => {
  it("renders a real type=color input, named through aria-labelledby", () => {
    const ui = render(<NativeColorPicker defaultValue="#3366ff" label="Fondo" name="bg" />);
    const input = ui.container.querySelector('input[type="color"]')!;
    expect(input.getAttribute("name")).toBe("bg");
    const labelId = input.getAttribute("aria-labelledby");
    expect(ui.container.querySelector(`#${labelId}`)?.textContent).toBe("Fondo");
  });

  it("shows the hex beside the swatch and keeps the two in step", () => {
    const ui = render(<NativeColorPicker defaultValue="#3366ff" label="Fondo" name="bg" />);
    const swatch = ui.container.querySelector<HTMLInputElement>('input[type="color"]')!;
    const hex = ui.container.querySelector<HTMLInputElement>('input[type="text"]')!;
    expect(hex.value).toBe("#3366ff");
    expect(hex.hasAttribute("name")).toBe(false);

    fireEvent.change(hex, { target: { value: "F80" } });
    expect(swatch.value).toBe("#ff8800");

    fireEvent.change(swatch, { target: { value: "#00ff00" } });
    expect(hex.value).toBe("#00ff00");
  });
});

describe("SwatchColorPicker", () => {
  it("renders the preview square with no value text, still named", () => {
    const ui = render(<SwatchColorPicker defaultValue="#22aabb" label="Acento" triggerLabel="Elegir color" />);
    const trigger = ui.container.querySelector(".sk-color-picker__trigger")!;
    expect(trigger.querySelector(".sk-color-picker__swatch")).toBeTruthy();
    expect(trigger.querySelector(".sk-color-picker__value")).toBeNull();
    expect(trigger.getAttribute("aria-label")).toBe("Elegir color");
  });
});
