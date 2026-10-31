import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountDatePicker } from "./date-picker.js";

/*
 * DatePicker splits the work by owner: the CONTROL (label, input, trigger, clear) is authored markup
 * the enhancer patches, and the CALENDAR is chrome it renders inside its own popover. The native
 * `type="date"` field is the layer below, sharing `.sk-date-picker__control`, so with no JS the
 * consumer authors that instead and the field looks the same.
 */
function markup(root = 'data-locale="es-DO"', clear = true) {
  document.body.innerHTML = `<div class="sk-date-picker" data-sk-date-picker ${root}>
    <label class="sk-date-picker__label">Llegada</label>
    <div class="sk-date-picker__control">
      <input class="sk-date-picker__input" placeholder="dd/mm/aaaa" type="text" />
      ${clear ? '<button class="sk-date-picker__clear" aria-label="Clear" type="button">×</button>' : ""}
      <button class="sk-date-picker__trigger" type="button">Abrir</button>
    </div>
  </div>`;
  const element = document.querySelector<HTMLElement>("[data-sk-date-picker]")!;
  expect(mountDatePicker(document)).toBe(1);
  return element;
}

const input = () => document.querySelector<HTMLInputElement>(".sk-date-picker__input")!;
const trigger = () => document.querySelector<HTMLButtonElement>(".sk-date-picker__trigger")!;
const clearButton = () => document.querySelector<HTMLButtonElement>(".sk-date-picker__clear")!;
const content = () => document.querySelector<HTMLElement>(".sk-date-picker__content")!;
const dayLabelled = (fragment: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(".sk-calendar__cell-trigger")).find((cell) =>
    !cell.hasAttribute("data-outside-range") && cell.getAttribute("aria-label")?.includes(fragment),
  )!;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DatePicker Vanilla contracts", () => {
  it("picks a range across two months and fills both input fields", async () => {
    markup('data-locale="en-US" data-selection-mode="range" data-value="2026-03-10 2026-03-11"');
    const inputs = document.querySelectorAll<HTMLInputElement>(".sk-date-picker__input");
    expect(inputs).toHaveLength(2);
    expect(inputs[0].value).toBe("03/10/2026");
    expect(inputs[1].value).toBe("03/11/2026");
    expect(inputs[1].getAttribute("aria-label")).toBe("End date");
    fireEvent.click(trigger());
    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));
    expect(content().querySelectorAll("table[data-view=day]")).toHaveLength(2);
    fireEvent.click(dayLabelled("March 28, 2026"));
    await waitFor(() => expect(inputs[0].value).not.toBe(""));
    expect(content().getAttribute("data-state")).toBe("open");
    fireEvent.click(dayLabelled("April 4, 2026"));
    await waitFor(() => expect(inputs[1].value).not.toBe(""));
    await waitFor(() => expect(content().getAttribute("data-state")).toBe("closed"));
  });

  it("supports a one-month range and keeps its month heading static", async () => {
    markup('data-locale="en-US" data-selection-mode="range" data-num-of-months="1" data-value="2026-03-10"');
    fireEvent.click(trigger());
    await waitFor(() => expect(content().querySelectorAll("table[data-view=day]")).toHaveLength(1));
    expect(content().querySelector(".sk-calendar__view-trigger")).toBeNull();
    expect(content().querySelector(".sk-calendar__month-title")?.textContent).toBe("March 2026");
    fireEvent.click(content().querySelector(".sk-calendar__next")!);
    await waitFor(() => expect(content().querySelector(".sk-calendar__month-title")?.textContent).toBe("April 2026"));
  });

  it("refuses markup that is missing a part it must patch", () => {
    document.body.innerHTML = `<div class="sk-date-picker" data-sk-date-picker></div>`;
    // Loud rather than half-mounted: a field with no control is not a field.
    expect(() => mountDatePicker(document)).toThrow(/sk-date-picker__control/);
  });

  it("patches the authored control and renders the popover around a calendar", () => {
    const root = markup('data-locale="es-DO"');
    expect(mountDatePicker(document)).toBe(0);

    const label = root.querySelector<HTMLLabelElement>(".sk-date-picker__label")!;
    // A real `for`, not an aria-* stand-in: the label was already a `<label>` in the markup.
    expect(label.getAttribute("for")).toBe(input().id);
    expect(root.querySelector(".sk-date-picker__positioner")).toBeTruthy();
    expect(content().classList.contains("sk-calendar")).toBe(true);
    expect(content().querySelector(".sk-calendar__table")).toBeTruthy();
    // The anchor half of the Anclaje pattern goes on the control, which is what the popup measures.
    expect(root.querySelector(".sk-date-picker__control")?.classList.contains("sk-anchor")).toBe(true);
  });

  it("keeps the placeholder the author wrote", () => {
    markup('data-locale="es-DO"');
    // The machine writes its own; the authored one wins, because it is the one in the page's language.
    expect(input().placeholder).toBe("dd/mm/aaaa");
  });

  it("opens the calendar from the trigger and closes it again", async () => {
    markup('data-locale="es-DO"');
    expect(content().getAttribute("data-state")).toBe("closed");

    fireEvent.click(trigger());

    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));
    expect(trigger().getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(trigger());
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
  });

  it("fills the field with the day the reader picked", async () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15"');
    const onChange = vi.fn();
    root.addEventListener("sk:datepickervaluechange", onChange);

    expect(input().value).toBe("15/03/2024");

    fireEvent.click(trigger());
    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));
    fireEvent.click(dayLabelled("20 de marzo de 2024"));

    await waitFor(() => expect(input().value).toBe("20/03/2024"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: ["20/03/2024"] } }),
    );
  });

  it("shows the clear control only once there is a date to clear", async () => {
    markup('data-locale="es-DO"');
    // Hidden, not absent: the enhancer patches authored markup and can only toggle `hidden`.
    expect(clearButton().hidden).toBe(true);

    document.body.innerHTML = "";
    markup('data-locale="es-DO" data-value="2024-03-15"');
    expect(clearButton().hidden).toBe(false);
    // The authored label survives the patch, so the field keeps speaking the page's language.
    expect(clearButton().getAttribute("aria-label")).toBe("Clear");

    fireEvent.click(clearButton());

    await waitFor(() => expect(input().value).toBe(""));
    expect(clearButton().hidden).toBe(true);
  });

  it("works with no clear control authored at all", () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15"', false);
    expect(root.querySelector(".sk-date-picker__clear")).toBeNull();
    expect(input().value).toBe("15/03/2024");
  });

  it("respects the authored range and flags", () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15" data-min="2024-03-10" data-max="2024-03-20" data-required');

    fireEvent.click(trigger());
    expect(dayLabelled("5 de marzo de 2024").getAttribute("aria-disabled")).toBe("true");
    expect(input().getAttribute("required")).toBe("");

    document.body.innerHTML = "";
    const disabled = markup('data-locale="es-DO" data-disabled');
    expect(disabled.getAttribute("data-disabled")).toBe("");
    expect(input().disabled).toBe(true);
  });

  it("names the field for a form under the name the markup gave it", () => {
    markup('data-locale="es-DO" data-name="llegada" data-value="2024-03-15"');
    expect(document.querySelector<HTMLInputElement>('input[name="llegada"]')).toBeTruthy();
  });

  it("names the trigger and the popover in Spanish by default, not Zag's own English", async () => {
    markup('data-locale="es-DO" data-value="2024-03-15"');

    // Zag's `defaultTranslations` (`@zag-js/date-picker`) is English-only, unconditionally.
    expect(trigger().getAttribute("aria-label")).toBe("Abrir calendario");
    expect(content().getAttribute("aria-label")).toBe("calendario");

    fireEvent.click(trigger());
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("true"));
    expect(trigger().getAttribute("aria-label")).toBe("Cerrar calendario");
  });

  it("switches the trigger and popover names to English when the locale says so", () => {
    markup('data-locale="en-US" data-value="2024-03-15"');

    expect(trigger().getAttribute("aria-label")).toBe("Open calendar");
    expect(content().getAttribute("aria-label")).toBe("calendar");
  });
});
