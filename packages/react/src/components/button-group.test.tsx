import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ButtonGroup, ButtonGroupLabel, ButtonGroupSeparator, ButtonGroupText } from "./button-group.js";
import { Button } from "./button.js";
import { Menu } from "./menu.js";

const items = [
  { value: "export-csv", label: "Exportar CSV" },
  { value: "export-pdf", label: "Exportar PDF" },
];

describe("ButtonGroup (React)", () => {
  it("groups independent actions vertically without a menu", () => {
    const zoomIn = vi.fn();
    const zoomOut = vi.fn();
    const ui = render(
      <ButtonGroup label="Zoom" orientation="vertical">
        <Button iconOnly aria-label="Zoom in" onClick={zoomIn}>+</Button>
        <Button iconOnly aria-label="Zoom out" onClick={zoomOut}>−</Button>
      </ButtonGroup>,
    );
    expect(ui.getByRole("group", { name: "Zoom" }).getAttribute("data-orientation")).toBe("vertical");
    fireEvent.click(ui.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(ui.getByRole("button", { name: "Zoom out" }));
    expect(zoomIn).toHaveBeenCalledTimes(1);
    expect(zoomOut).toHaveBeenCalledTimes(1);
  });

  it("defaults to horizontal and writes nothing on its members", () => {
    const ui = render(
      <ButtonGroup aria-label="Mail">
        <Button>Archive</Button>
        <ButtonGroupSeparator />
        <Button>Report</Button>
      </ButtonGroup>,
    );
    const group = ui.getByRole("group", { name: "Mail" });
    expect(group.getAttribute("data-orientation")).toBe("horizontal");
    expect(group.querySelector(".sk-button-group__separator")?.getAttribute("aria-hidden")).toBe("true");
    // The weld is the group's CSS: members carry no per-edge attribute.
    for (const button of group.querySelectorAll("button")) expect(button.getAttributeNames().some((n) => n.includes("weld"))).toBe(false);
  });

  it("inset is the default and draws one separator between each pair; full and none draw none of their own", () => {
    const inset = render(
      <ButtonGroup aria-label="Inset">
        <Button>A</Button>
        <Button>B</Button>
        <Button>C</Button>
      </ButtonGroup>,
    );
    const group = inset.getByRole("group", { name: "Inset" });
    expect(group.getAttribute("data-separator")).toBe("inset");
    expect(group.querySelectorAll(".sk-button-group__separator")).toHaveLength(2);
    for (const separator of ["full", "none"] as const) {
      const ui = render(<ButtonGroup separator={separator} aria-label={separator}><Button>A</Button><Button>B</Button></ButtonGroup>);
      const other = ui.getByRole("group", { name: separator });
      expect(other.getAttribute("data-separator")).toBe(separator);
      expect(other.querySelector(".sk-button-group__separator")).toBeNull();
    }
  });

  it("does not add a separator beside one the caller wrote", () => {
    const ui = render(<ButtonGroup aria-label="Own"><Button>A</Button><ButtonGroupSeparator /><Button>B</Button></ButtonGroup>);
    expect(ui.getByRole("group", { name: "Own" }).querySelectorAll(".sk-button-group__separator")).toHaveLength(1);
  });

  it("labels the input beside it with ButtonGroupLabel, and ButtonGroupText stays plain text", () => {
    const ui = render(
      <ButtonGroup>
        <ButtonGroupLabel htmlFor="url">URL</ButtonGroupLabel>
        <ButtonGroupText>https://</ButtonGroupText>
        <input id="url" className="sk-input" />
      </ButtonGroup>,
    );
    expect(ui.getByLabelText("URL").id).toBe("url");
    expect(ui.getByText("https://").tagName).toBe("SPAN");
  });
});

/* A split button is not a component: a ButtonGroup of a Button and an icon-only Menu. */
describe("ButtonGroup as a split button (React)", () => {
  const split = (props: { onClick?: () => void; onSelect?: (d: { value: string }) => void } = {}) =>
    render(
      <ButtonGroup label="Guardar opciones">
        <Button tone="accent" variant="solid" onClick={props.onClick}>Guardar</Button>
        <Menu
          items={items}
          label="Más opciones"
          triggerLabel="Más opciones"
          triggerTone="accent"
          triggerVariant="solid"
          triggerIconOnly
          onSelect={props.onSelect}
        />
      </ButtonGroup>,
    );

  it("holds the action and the menu's icon-only trigger as one named group", () => {
    const ui = split();
    const group = ui.getByRole("group", { name: "Guardar opciones" });
    expect(group.querySelectorAll(":scope > .sk-button, :scope > .sk-menu > .sk-button")).toHaveLength(2);
    expect(ui.getByRole("button", { name: "Más opciones" }).hasAttribute("data-icon-only")).toBe(true);
  });

  it("keeps the action and the menu independent", async () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    const ui = split({ onClick, onSelect });
    fireEvent.click(ui.getByRole("button", { name: "Guardar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.click(ui.getByRole("button", { name: "Más opciones" }));
    fireEvent.click(await ui.findByRole("menuitem", { name: "Exportar CSV" }));
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({ value: "export-csv" }));
  });
});
