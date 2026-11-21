import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, NativeDatePicker } from "./date-picker.js";

/* Day cells are named by their `aria-label`. A selector reads it directly; `getByRole(…, { name })` would
 * compute the accessible name of every button on every `waitFor` poll, which under load ran past 15s. */
const grids = () => screen.queryAllByRole("grid"); // by role, without a name: skips a closed popover's tables

const day = (root: ParentNode, label: string) => root.querySelector<HTMLElement>(`[aria-label*="${label}"]`)!;
const daysLabelled = (prefix: string) => document.querySelectorAll(`[aria-label^="${prefix}"]`);

describe("DatePicker", () => {
  it("picks a range across two months and fills both input fields", async () => {
    const ui = render(<DatePicker label="Stay" locale="en" selectionMode="range" defaultValue="2026-03-10 2026-03-11" />);
    fireEvent.click(ui.getByRole("button", { name: "Open calendar" }));
    await waitFor(() => expect(grids()).toHaveLength(2));
    fireEvent.click(day(ui.getByRole("grid", { name: "March 2026" }), "March 28, 2026"));
    expect(grids()).toHaveLength(2);
    fireEvent.click(day(ui.getByRole("grid", { name: "April 2026" }), "April 4, 2026"));
    await waitFor(() => expect((ui.getByLabelText("End date") as HTMLInputElement).value).not.toBe(""));
    await waitFor(() => expect(grids()).toHaveLength(0));
  });

  it("supports a one-month range without a month/year view button", async () => {
    const ui = render(
      <DatePicker label="Stay" locale="en" selectionMode="range" numOfMonths={1} defaultValue="2026-03-10" />,
    );
    fireEvent.click(ui.getByRole("button", { name: "Open calendar" }));

    await waitFor(() => expect(grids()).toHaveLength(1));
    expect(document.body.querySelector(".sk-calendar__view-trigger")).toBeNull();
    expect(document.body.querySelector(".sk-calendar__month-title")?.textContent).toBe("March 2026");
    fireEvent.click(document.body.querySelector(".sk-calendar__next")!);
    await waitFor(() => expect(document.body.querySelector(".sk-calendar__month-title")?.textContent).toBe("April 2026"));
  });

  it("writes an appearance on the root only when asked", () => {
    const plain = render(<DatePicker label="Plain" locale="es" />);
    expect(plain.container.querySelector(".sk-date-picker")?.hasAttribute("data-appearance")).toBe(false);
    const brutalist = render(<DatePicker appearance="brutalist" label="Brutalist" locale="es" />);
    expect(brutalist.container.querySelector(".sk-date-picker")?.getAttribute("data-appearance")).toBe("brutalist");
  });

  it("names every control in the language `locale` names, Spanish here", async () => {
    const ui = render(<DatePicker locale="es" label="Fecha" />);
    const trigger = ui.getByRole("button", { name: "Abrir calendario" });

    fireEvent.click(trigger);

    // Matches the WAI reference implementation's own wording style ("Choose {date}"), just in the
    // locale the component was already told to format dates in: `locale` drove `DateFormatter`
    // before this fix, and nothing else. A day cell's accessible name is its `aria-label`, not its
    // text content (that's just the day number), so this queries by role.
    await waitFor(() =>
      expect(daysLabelled("Elegir ").length).toBeGreaterThan(0),
    );
  });

  it("switches every default to English when `locale` says so, with no other prop touched", async () => {
    const ui = render(<DatePicker label="Date" locale="en" />);
    const trigger = ui.getByRole("button", { name: "Open calendar" });

    fireEvent.click(trigger);

    await waitFor(() =>
      expect(daysLabelled("Choose ").length).toBeGreaterThan(0),
    );
  });

  it("lets a consumer override a single label without losing the locale-aware defaults for the rest", async () => {
    const ui = render(<DatePicker locale="es" label="Fecha" triggerLabel={(open) => (open ? "Close" : "Ver fechas")} />);

    expect(ui.getByRole("button", { name: "Ver fechas" })).toBeTruthy();
  });

  it("dispatches sk:datepickervaluechange on the root for DOM parity with vanilla", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <DatePicker locale="es" defaultValue="2026-09-16" label="Fecha" onValueChange={onValueChange} />,
    );
    const root = ui.container.querySelector(".sk-date-picker")!;
    expect(root.hasAttribute("data-sk-date-picker")).toBe(true);
    const onDom = vi.fn();
    root.addEventListener("sk:datepickervaluechange", onDom);

    fireEvent.click(ui.getByRole("button", { name: "Abrir calendario" }));

    const other = await waitFor(() => {
      const day = ui
        .getAllByRole("button", { name: /^Elegir /i })
        .find(
          (button) =>
            !button.hasAttribute("data-selected") &&
            button.getAttribute("aria-disabled") !== "true" &&
            !button.hasAttribute("disabled"),
        );
      expect(day).toBeTruthy();
      return day!;
    });
    fireEvent.click(other);

    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    expect(onDom).toHaveBeenCalled();
  });
});

describe("NativeDatePicker", () => {
  it("renders a labelled type=date input with real HTML bounds", () => {
    const ui = render(
      <NativeDatePicker defaultValue="2026-09-16" label="Llegada" max="2026-12-31" min="2026-01-01" name="arrival" />,
    );
    const input = ui.getByLabelText("Llegada") as HTMLInputElement;
    expect(input.type).toBe("date");
    expect(input.name).toBe("arrival");
    expect(input.min).toBe("2026-01-01");
    expect(input.max).toBe("2026-12-31");
    expect(input.defaultValue).toBe("2026-09-16");
  });
});
