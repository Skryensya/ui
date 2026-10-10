import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SplitButton, SplitButtonVertical } from "./split-button.js";
import { Button } from "./button.js";

const items = [
  { value: "export-csv", label: "Exportar CSV" },
  { value: "export-pdf", label: "Exportar PDF" },
];

describe("SplitButtonVertical (React)", () => {
  it("groups two independent actions vertically without a menu", () => {
    const zoomIn = vi.fn();
    const zoomOut = vi.fn();
    const ui = render(<SplitButtonVertical label="Zoom"
      first={<Button iconOnly aria-label="Zoom in" onClick={zoomIn}>+</Button>}
      second={<Button iconOnly aria-label="Zoom out" onClick={zoomOut}>−</Button>}
    />);
    expect(ui.getByRole("group", { name: "Zoom" }).getAttribute("data-orientation")).toBe("vertical");
    fireEvent.click(ui.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(ui.getByRole("button", { name: "Zoom out" }));
    expect(zoomIn).toHaveBeenCalledTimes(1);
    expect(zoomOut).toHaveBeenCalledTimes(1);
    expect(ui.queryByRole("menu")).toBeNull();
  });
});

describe("SplitButton (React)", () => {
  it("renders a labelled group holding the action button and the menu's icon-only trigger", () => {
    const ui = render(<SplitButton label="Guardar opciones">Guardar</SplitButton>);
    const group = ui.getByRole("group", { name: "Guardar opciones" });

    expect(ui.getByRole("button", { name: "Guardar" })).toBeTruthy();
    expect(ui.getByRole("button", { name: "More options" })).toBeTruthy();
    // The menu trigger is icon-only (no visible `children`) but never unnamed.
    const buttons = group.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
  });

  it("gives both halves the same appearance from one prop", () => {
    const ui = render(
      <SplitButton appearance="brutalist" menuLabel="Más opciones" menuItems={items}>
        Guardar
      </SplitButton>,
    );
    expect(ui.getByRole("button", { name: "Guardar" }).getAttribute("data-appearance")).toBe("brutalist");
    expect(ui.getByRole("button", { name: "Más opciones" }).getAttribute("data-appearance")).toBe("brutalist");
  });

  it("clicking the action button fires onClick, independent of the menu", () => {
    const onClick = vi.fn();
    const ui = render(
      <SplitButton onClick={onClick} menuLabel="Más opciones" menuItems={items}>
        Guardar
      </SplitButton>,
    );
    fireEvent.click(ui.getByRole("button", { name: "Guardar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("opens the fallback menu from its trigger and selects an item", async () => {
    const onSelect = vi.fn();
    const ui = render(
      <SplitButton menuLabel="Más opciones" menuItems={items} onSelect={onSelect}>
        Guardar
      </SplitButton>,
    );
    fireEvent.click(ui.getByRole("button", { name: "Más opciones" }));

    const option = await ui.findByRole("menuitem", { name: "Exportar CSV" });
    fireEvent.click(option);

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({ value: "export-csv" }));
  });

  it("disables both the action button and the menu trigger together", () => {
    const ui = render(
      <SplitButton disabled menuLabel="Más opciones" menuItems={items}>
        Guardar
      </SplitButton>,
    );
    expect((ui.getByRole("button", { name: "Guardar" }) as HTMLButtonElement).disabled).toBe(true);
    expect((ui.getByRole("button", { name: "Más opciones" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  /*
   * A real, previously-shipped regression (docs/aria-apg-audit.md's own "Menu Button" notes, sixth
   * amendment): the fallback trigger has to PAIR with the action button's own `variant`/`size` and
   * carry the icon-only+welded shape, or the two halves stop reading as one control. The divider
   * between them is CSS keyed to `data-weld-start`/`.sk-button:not(:first-child)`, so a trigger
   * missing any of these renders as two unrelated buttons with a visible gap and a mismatched color.
   */
  it("pairs the fallback trigger's shape and variant/size with the action button", () => {
    const ui = render(
      <SplitButton menuLabel="Más opciones" menuItems={items} tone="danger" size="lg">
        Guardar
      </SplitButton>,
    );
    const trigger = ui.getByRole("button", { name: "Más opciones" });
    expect(trigger.getAttribute("data-tone")).toBe("danger");
    expect(trigger.getAttribute("data-variant")).toBe("solid");
    expect(trigger.getAttribute("data-size")).toBe("lg");
    expect(trigger.hasAttribute("data-icon-only")).toBe(true);
    expect(trigger.hasAttribute("data-weld-start")).toBe(true);
  });

  it("renders a hand-composed action and menu verbatim instead of the flat-prop fallback", () => {
    const ui = render(
      <SplitButton
        action={<button type="button">Custom action</button>}
        menu={<div data-testid="custom-menu">Custom menu</div>}
      >
        Ignored children
      </SplitButton>,
    );
    expect(ui.getByRole("button", { name: "Custom action" })).toBeTruthy();
    expect(ui.getByTestId("custom-menu")).toBeTruthy();
    expect(ui.queryByText("Ignored children")).toBeNull();
  });
});
