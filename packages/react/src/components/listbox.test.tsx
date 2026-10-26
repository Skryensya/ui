import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Listbox, type ListboxItem } from "./listbox.js";

const items: ListboxItem[] = [
  { value: "a", label: "Alfa" },
  { value: "b", label: "Beta", defaultSelected: true },
  { value: "c", label: "Gamma" },
  { value: "d", label: "Delta", disabled: true },
];

/* Zag's React adapter applies a machine update after the event handler returns; read the DOM after it. */
const click = async (el: HTMLElement) => {
  fireEvent.click(el);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const selected = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>("[role='option'][aria-selected='true']")].map((o) => o.dataset.value);

describe("Listbox", () => {
  it("is a listbox named by its label, starting from the items marked selected", () => {
    const ui = render(<Listbox items={items} label="Letras" />);

    expect(ui.getByRole("listbox", { name: "Letras" })).toBeTruthy();
    expect(selected(ui.container)).toEqual(["b"]);
  });

  it("replaces the choice in single mode and reports it", async () => {
    const changes: string[][] = [];
    const ui = render(<Listbox items={items} label="Letras" onValueChange={(d) => changes.push(d.value)} />);

    await click(ui.getByRole("option", { name: "Gamma" }));

    expect(selected(ui.container)).toEqual(["c"]);
    expect(changes).toEqual([["c"]]);
  });

  it("toggles options in multiple mode and skips disabled ones", async () => {
    const ui = render(<Listbox items={items} label="Letras" selectionMode="multiple" />);
    expect(ui.getByRole("listbox").getAttribute("aria-multiselectable")).toBe("true");

    await click(ui.getByRole("option", { name: "Alfa" }));
    await click(ui.getByRole("option", { name: "Delta" }));

    expect(selected(ui.container)).toEqual(["a", "b"]);
  });

  it("recovers a truncated option's full text through title", () => {
    const long = "Benachrichtigungseinstellungen für Projekt-Updates";
    const ui = render(
      <Listbox items={[{ value: "x", label: long }]} label="Opciones" />,
    );
    expect(ui.getByRole("option", { name: long }).getAttribute("title")).toBe(long);
  });

  it("clears the choice on a second click only when deselectable", async () => {
    const keeps = render(<Listbox items={items} label="Letras" />);
    await click(keeps.getByRole("option", { name: "Beta" }));
    expect(selected(keeps.container)).toEqual(["b"]);
    keeps.unmount();

    const clears = render(<Listbox deselectable items={items} label="Letras" />);
    await click(clears.getByRole("option", { name: "Beta" }));
    expect(selected(clears.container)).toEqual([]);
  });

  it("describes an option by its description, which is not part of its name", () => {
    const ui = render(
      <Listbox items={[{ value: "a", label: "Alfa", description: "Primera letra" }, { value: "b", label: "Beta" }]} label="Letras" />,
    );
    const option = ui.getByRole("option", { name: "Alfa" });
    expect(option.getAttribute("aria-describedby")).toBeTruthy();
    expect(ui.getByRole("option", { description: "Primera letra" })).toBe(option);
    expect(ui.getByRole("option", { name: "Beta" }).hasAttribute("aria-describedby")).toBe(false);
  });

  it("marks the choice by its fill alone when the indicator is none", () => {
    const ui = render(<Listbox indicator="none" items={items} label="Letras" />);
    expect(ui.container.querySelector("[data-sk-listbox]")!.getAttribute("data-indicator")).toBe("none");
    expect(ui.container.querySelector("[data-sk-listbox-item-indicator]")).toBeNull();
    expect(selected(ui.container)).toEqual(["b"]);
  });
  it("never shows the check in a horizontal list", () => {
    const ui = render(<Listbox items={items} label="Letras" orientation="horizontal" />);
    expect(ui.container.querySelector("[data-sk-listbox-item-indicator]")).toBeNull();
  });
});
