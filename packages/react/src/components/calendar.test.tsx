import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./calendar.js";

describe("Calendar", () => {
  it("shows consecutive months for a range and can be kept to one month", () => {
    const ui = render(<Calendar label="Stay" locale="en" selectionMode="range" defaultValue="2026-03-28 2026-04-04" />);
    expect(ui.getAllByRole("grid")).toHaveLength(2);
    expect(ui.container.querySelector(".sk-calendar__view-trigger")).toBeNull();
    expect(ui.getByRole("grid", { name: "March 2026" })).toBeTruthy();
    expect(ui.getByRole("grid", { name: "April 2026" })).toBeTruthy();
    expect(ui.container.querySelectorAll(".sk-calendar__cell-trigger[data-outside-range]").length).toBeGreaterThan(0);
    const ids = [...ui.container.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    ui.rerender(<Calendar label="Stay" locale="en" selectionMode="range" numOfMonths={1} defaultValue="2026-03-28 2026-04-04" />);
    expect(ui.getAllByRole("grid")).toHaveLength(1);
  });

  it("opens the month selector on the year of the chosen month header", async () => {
    const ui = render(<Calendar label="Date" locale="en" numOfMonths={2} defaultValue="2026-12-28" />);
    const january = ui.getByRole("grid", { name: "January 2027" });
    fireEvent.click(january.querySelector(".sk-calendar__view-trigger")!);
    await waitFor(() => expect(ui.container.querySelector(".sk-calendar__month-grid")).toBeTruthy());
    expect(ui.container.querySelector(".sk-calendar__view-trigger")?.textContent?.trim()).toBe("2027");
  });

  it("names every control in the language `locale` names, Spanish here", () => {
    const ui = render(<Calendar locale="es" label="Fecha" />);

    // Zag's own `defaultTranslations` is English-only and unconditional: `locale` drove
    // `DateFormatter` before this fix, and nothing else. A day cell's accessible name comes from
    // `aria-label`, not its text content (that's just the day number), so this queries by role.
    expect(ui.getAllByRole("button", { name: /^Elegir /i }).length).toBeGreaterThan(0);
    expect(ui.getByRole("button", { name: /^Mes anterior$/ })).toBeTruthy();
    expect(ui.getByRole("button", { name: /^Mes siguiente$/ })).toBeTruthy();
  });

  it("switches every default to English when `locale` says so", () => {
    const ui = render(<Calendar label="Date" locale="en" />);

    expect(ui.getAllByRole("button", { name: /^Choose /i }).length).toBeGreaterThan(0);
    expect(ui.getByRole("button", { name: /^Switch to previous month$/ })).toBeTruthy();
    expect(ui.getByRole("button", { name: /^Switch to next month$/ })).toBeTruthy();
  });

  /*
   * ONE tier across the widget, asserted on the day AND on the header together: the day cell used
   * to be `xs` against an `sm` header, and a diff that quietly reintroduces that split (or drops
   * the header to match) would read as deliberate density work rather than as the regression it
   * is. The vanilla binding writes these attributes by hand (`CalendarView.svelte`) while this one
   * serializes them from a prop, so the same assertion lives on both sides.
   */
  it("paints every control in the calendar at one size tier, day cells included", () => {
    const ui = render(<Calendar locale="es" label="Fecha" />);

    const [day] = ui.getAllByRole("button", { name: /^Elegir /i });
    expect(day.getAttribute("data-size")).toBe("sm");
    // Same SHAPE as prev/next: a square holding one piece of content, now at the same size too.
    expect(day.getAttribute("data-icon-only")).toBe("");
    expect(ui.getByRole("button", { name: /^Mes anterior$/ }).getAttribute("data-size")).toBe("sm");
    expect(ui.getByRole("button", { name: /^Mes siguiente$/ }).getAttribute("data-size")).toBe("sm");
  });

  it("lets a consumer override a single label without losing the locale-aware defaults for the rest", () => {
    const ui = render(<Calendar locale="es" label="Fecha" prevTriggerLabel={() => "Atrás"} />);

    expect(ui.getByRole("button", { name: "Atrás" })).toBeTruthy();
    // nextTrigger was not overridden: still the locale-aware default.
    expect(ui.getByRole("button", { name: /^Mes siguiente$/ })).toBeTruthy();
  });

  it("dispatches sk:calendarvaluechange on the root for DOM parity with vanilla", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <Calendar locale="es" defaultValue="2026-09-16" label="Fecha" onValueChange={onValueChange} />,
    );
    const root = ui.container.querySelector(".sk-calendar")!;
    expect(root.hasAttribute("data-sk-calendar")).toBe(true);
    const onDom = vi.fn();
    root.addEventListener("sk:calendarvaluechange", onDom);

    const other = ui
      .getAllByRole("button", { name: /^Elegir /i })
      .find(
        (button) =>
          !button.hasAttribute("data-selected") &&
          button.getAttribute("aria-disabled") !== "true" &&
          !button.hasAttribute("disabled"),
      )!;
    fireEvent.click(other);

    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    expect(onDom).toHaveBeenCalled();
  });

  it("names the heading after the month actually being viewed, not the grid's leading spillover day", () => {
    /*
     * The grid always renders full weeks: June 2026 starts on a Monday, so the first cell is
     * Sunday, May 31. The heading used to read `api.visibleRange.start` (that first cell) instead
     * of `api.focusedValue` (the date actually in view), so a June default showed "May 2026" -
     * reproduced live under a non-UTC timezone too, confirming it was never about time zones.
     */
    const ui = render(<Calendar defaultValue="2026-06-17" label="Date" locale="en" />);
    const heading = ui.container.querySelector(".sk-calendar__view-trigger")!;

    expect(heading.textContent).toBe("June 2026");
  });

  it("moves focus between days with the arrow keys when inline", async () => {
    const ui = render(<Calendar label="Fecha" locale="en" defaultValue="2026-11-10" />);
    const day = ui.getByRole("button", { name: /November 10, 2026/ });
    day.focus();
    fireEvent.keyDown(day, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement?.getAttribute("aria-label")).toMatch(/November 11, 2026/));
  });
});
