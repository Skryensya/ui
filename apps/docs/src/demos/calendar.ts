import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import {
  anatomyCanvas,
  anatomyHints,
  namePart,
} from "./annotation-parts";

/*
 * The three calendar demos, from the contract published for it.
 *
 * The authored HTML on both pages drew `<div class="sk-calendar" data-sk-calendar>` with NO label
 * while the React half passed `label="Disponibilidad"`, one demo documenting two components, which
 * is the whole reason these moved here.
 *
 * `demo.calendar.locale` is a BCP-47 tag rather than a word, and it is still a translated key: it is
 * the one option on this component that genuinely differs per language, and a Spanish page showing
 * an English month header would be the demo contradicting the page around it.
 */

/** Anchored to TODAY rather than a fixed date, so the range demo never reads as expired. */
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/*
 * After the enhancer mounts, the header and day grid exist to be named. The specimen is inert so
 * nothing here is a control; the live demos below are.
 *
 * Day view: every part that exists once the machine has painted a month. `heading` is published in
 * `calendarParts` but never applied in the DOM (the month name is the view-trigger's own text).
 * Month and year views are separate frozen diagrams below: the contract has no `defaultView`, so a
 * live Calendar always opens on day and cannot be held on the climbed grids inside an inert frame.
 *
 * SIDES: the header's three controls share one row, so previous and the header itself read from
 * inline-start while view-trigger and next read from inline-end. The table stack (table → header →
 * body → cell → cell-trigger) alternates gutters the same way Table's anatomy does, so leaders do
 * not all land on one edge.
 *
 * CELL / TRIGGER aim at TODAY (`[data-today]`), not the first cell in the grid: the part is the same
 * on every day, and the day that already carries the today outline is the one worth ringing.
 */
export const calendarAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: {
    ...anatomyCanvas(t),
    label: t("calendar.anatomyLabel"),
    inert: true,
  },
  slots: {
    ...anatomyHints(t),
    subject: calendarTree(t),
    items: [
      namePart(".sk-calendar", "block-start", {
        mark: "bracket",
        ringPlacement: "offset",
        ringDistance: 6,
      }),
      namePart(".sk-calendar__label", "block-start", {
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-calendar__header", "inline-start"),
      namePart(".sk-calendar__previous", "inline-start", {
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-calendar__view-trigger", "inline-end"),
      namePart(".sk-calendar__next", "inline-end", {
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-calendar__table", "inline-start", {
        ringPlacement: "offset",
        ringDistance: 4,
      }),
      namePart(".sk-calendar__table-header", "inline-end", {
        ringPlacement: "offset",
        ringDistance: 2,
      }),
      namePart(".sk-calendar__table-body", "inline-start"),
      {
        options: {
          for: ".sk-calendar__cell:has([data-today])",
          side: "block-end",
          ringPlacement: "offset",
          ringDistance: 2,
        },
        slots: { children: "sk-calendar__cell" },
      },
      {
        options: {
          for: ".sk-calendar__cell-trigger[data-today]",
          side: "inline-end",
          ringPlacement: "offset",
          ringDistance: 2,
        },
        slots: { children: "sk-calendar__cell-trigger" },
      },
    ],
  },
});

/*
 * MONTH / YEAR ANATOMY: frozen open markup, same reason Menu and Popover freeze theirs.
 *
 * A live Calendar always mounts on day view (no `defaultView` on the contract), and an inert
 * specimen cannot click the view-trigger to climb. So the month and year grids are authored as the
 * emitter would paint them (header + `sk-calendar__table` carrying the modifier class), with no
 * `data-sk-calendar` so `initComponents` never replaces the body. Part classes and button attrs match
 * `CalendarView.svelte`; labels are locale-aware via `Intl`.
 *
 * `sk-calendar__month-grid` / `sk-calendar__year-grid` sit on the SAME node as `sk-calendar__table`
 * (modifier hooks, see the contract notes). The diagram names the modifier: that is the part that
 * appears only in that view. Naming both would put two rings on one box.
 */

const ghostAttrs =
  'type="button" tabindex="-1" data-variant="ghost" data-tone="neutral" data-size="sm"';
const iconBtn = (part: string): string =>
  `<button class="${part} sk-button sk-interactive" ${ghostAttrs} data-icon-only>`;
const textBtn = (part: string): string =>
  `<button class="${part} sk-button sk-interactive" ${ghostAttrs}>`;

const calendarHeader = (
  heading: string,
): string => `<div class="sk-calendar__header">
  ${iconBtn("sk-calendar__previous")}
    <span aria-hidden="true"><span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span></span>
  </button>
  ${textBtn("sk-calendar__view-trigger")}
    ${heading}
    <span aria-hidden="true"><span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span></span>
  </button>
  ${iconBtn("sk-calendar__next")}
    <span aria-hidden="true"><span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span></span>
  </button>
</div>`;

const gridCell = (label: string): string => `<td class="sk-calendar__cell">
  ${textBtn("sk-calendar__cell-trigger")}${label}</button>
</td>`;

const gridRows = (labels: readonly string[], columns: number): string => {
  const rows: string[] = [];
  for (let i = 0; i < labels.length; i += columns) {
    rows.push(
      `<tr>${labels
        .slice(i, i + columns)
        .map(gridCell)
        .join("")}</tr>`,
    );
  }
  return rows.join("");
};

/** Twelve short month names in the demo's BCP-47 locale (same source the live grid uses). */
const shortMonths = (locale: string): string[] =>
  Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(2026, month, 1)),
    ),
  );

/** A decade padded to a 4×3 grid, matching Zag's `getYearsGrid({ columns: 4 })` shape. */
const decadeYears = (start = 2020): string[] =>
  Array.from({ length: 12 }, (_, i) => String(start - 1 + i));

/** Frozen day-grid markup for Do/Don't specimens, whose inert wrapper intentionally skips mounting. */
const calendarGuideMarkup = (
  t: Translate,
  {
    range = false,
    limits = false,
    compact = false,
    endpoint,
    label: customLabel,
  }: {
    range?: boolean;
    limits?: boolean;
    compact?: boolean;
    endpoint?: "start" | "end";
    label?: string;
  } = {},
): string => {
  const locale = t("demo.calendar.locale");
  const month = new Date(Date.UTC(2026, 6, 1));
  const heading = new Intl.DateTimeFormat(locale, {
    month: compact ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(month);
  const weekdays = Array.from({ length: 7 }, (_, day) => {
    const date = new Date(Date.UTC(2026, 0, 4 + day));
    return new Intl.DateTimeFormat(locale, {
      weekday: compact ? "narrow" : "short",
      timeZone: "UTC",
    }).format(date);
  });
  const firstWeekday = month.getUTCDay();
  const daysInMonth = new Date(Date.UTC(2026, 7, 0)).getUTCDate();
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > daysInMonth)
      return '<td class="sk-calendar__cell"></td>';
    const outside = limits && (day < 8 || day > 23);
    const selected = endpoint
      ? day === (endpoint === "start" ? 17 : 12)
      : range && (day === 12 || day === 17);
    const inRange = range && !endpoint && day > 12 && day < 17;
    const attrs = [
      'class="sk-calendar__cell-trigger sk-button sk-interactive"',
      'type="button" data-variant="ghost" data-tone="neutral" data-size="sm"',
      outside ? "disabled data-outside-range" : "",
      selected ? "data-selected" : "",
      inRange ? "data-in-range" : "",
      (endpoint === "start" ? day === 17 : range && day === 12)
        ? "data-range-start"
        : "",
      (endpoint === "end" ? day === 12 : range && day === 17)
        ? "data-range-end"
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `<td class="sk-calendar__cell"><button ${attrs}>${day}</button></td>`;
  });
  const rows = Array.from(
    { length: 6 },
    (_, row) => `<tr>${days.slice(row * 7, row * 7 + 7).join("")}</tr>`,
  ).join("");
  const label =
    customLabel ??
    (range ? t("demo.calendar.stay") : t("demo.calendar.availability"));
  const style = compact
    ? ' style="--sk-calendar-inline-size: 9.75rem; --sk-calendar-cell-size: 1.125rem;"'
    : "";
  return `<div class="sk-calendar"${style}>
    <p class="sk-calendar__label">${label}</p>
    <div class="sk-calendar__header"><button class="sk-calendar__previous sk-button sk-interactive" data-icon-only type="button" aria-label="${t("demo.calendar.previousMonth")}">‹</button><button class="sk-calendar__view-trigger sk-button sk-interactive" type="button">${heading}</button><button class="sk-calendar__next sk-button sk-interactive" data-icon-only type="button" aria-label="${t("demo.calendar.nextMonth")}">›</button></div>
    <table class="sk-calendar__table" role="grid"><thead class="sk-calendar__table-header"><tr>${weekdays.map((day) => `<th scope="col"><abbr>${day}</abbr></th>`).join("")}</tr></thead><tbody class="sk-calendar__table-body">${rows}</tbody></table>
  </div>`;
};

export const calendarRangeGuideHtml = (t: Translate): string =>
  calendarGuideMarkup(t, { range: true });
export const calendarTwoGuideHtml = (t: Translate): string =>
  `<div style="display:flex;gap:var(--space-inline-sm);align-items:start">${calendarGuideMarkup(t, { compact: true, endpoint: "end", label: t("demo.datePicker.dd.end") })}${calendarGuideMarkup(t, { compact: true, endpoint: "start", label: t("demo.datePicker.dd.start") })}</div>`;
export const calendarLimitsGuideHtml = (t: Translate): string =>
  calendarGuideMarkup(t, { limits: true });
export const calendarNoLimitsGuideHtml = (t: Translate): string =>
  calendarGuideMarkup(t);

export const calendarTree = (t: Translate): UsageTree => ({
  contract: "calendar",
  signature: "Calendar",
  options: { locale: t("demo.calendar.locale") },
  slots: { label: t("demo.calendar.availability") },
});

export const calendarRangeTree = (t: Translate): UsageTree => ({
  contract: "calendar",
  signature: "Calendar",
  options: { locale: t("demo.calendar.locale"), selectionMode: "range" },
  slots: { label: t("demo.calendar.stay") },
});

export const calendarMinMaxTree = (t: Translate): UsageTree => {
  const today = new Date();
  const max = new Date(today);
  max.setDate(max.getDate() + 14);

  return {
    contract: "calendar",
    signature: "Calendar",
    options: {
      locale: t("demo.calendar.locale"),
      min: isoDate(today),
      max: isoDate(max),
    },
    slots: { label: t("demo.calendar.availability") },
  };
};

/* Don't: a range picked on two calendars, one per end. */
export const calendarDontTwoTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "start" },
  children: [
    {
      contract: "calendar",
      signature: "Calendar",
      options: { locale: t("demo.calendar.locale") },
      slots: { label: t("demo.datePicker.dd.start") },
    },
    {
      contract: "calendar",
      signature: "Calendar",
      options: { locale: t("demo.calendar.locale") },
      slots: { label: t("demo.datePicker.dd.end") },
    },
  ],
});
