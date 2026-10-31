import { calendarContract } from "@skryensya/core/calendar";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import {
  calendarParts,
  calendarMonthCount,
  calendarMonths,
  calendarEvents,
  defaultDayLabel,
  defaultNextTriggerLabel,
  defaultPrevTriggerLabel,
  defaultViewTriggerLabel,
  getTwoLetterWeekdayLabel,
  parseCalendarDate,
  unusedIntlTranslations,
  type DateValue,
  type DateView,
  type DayTableCellState,
} from "@skryensya/core/calendar";
import { datePicker } from "@skryensya/core/machines";
import { normalizeProps, useMachine, type PropTypes } from "@zag-js/react";
import { useId, useRef, type MouseEvent, type ReactNode } from "react";
import { Button } from "./button.js";
import { Icon } from "./icon.js";

/* Derived, never restated: the default lives in the contract. */
const { locale: localeOption, selectionMode: selectionModeOption, timeZone: timeZoneOption } = calendarContract.options;

// Without depending on `@zag-js/date-picker` directly (react does not bring it as a dependency of its
// own, core only re-exports it via `machines.ts`): the `api`'s type comes from the same `connect` function.
type DatePickerApi = ReturnType<typeof datePicker.connect<PropTypes>>;

/*
 * The calendar BODY, shared between the standalone `Calendar` below and `DatePicker`'s popover:
 * header (prev/next + the view-switch button) and the three grids (day/month/year). No native
 * `<select>`: the heading itself is `api.getViewTriggerProps()`, a button that steps
 * day → month → year on click, and clicking a month/year cell steps back down.
 */
export function CalendarBody({
  api,
  locale,
  previousIcon,
  nextIcon,
  viewIcon,
}: {
  api: DatePickerApi;
  locale: string;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  viewIcon?: ReactNode;
}) {
  // Machine-formatted months avoid labels shifting into the previous month in another time zone.
  const headingLabel =
    api.view === "day"
      ? api.visibleRangeText.start
      : api.view === "month"
        ? api.focusedValue.year.toLocaleString(locale, { useGrouping: false })
        : (() => {
            const decade = api.getDecade();
            return `${decade.start ?? ""}–${decade.end ?? ""}`;
          })();

  /*
   * The year view is the top of the escalation (day → month → year, clamped there): clicking the
   * trigger again is normally a no-op, a dead end that still looks clickable. Repurpose it as a
   * cancel instead. Jump straight back to day view on the REAL current month, not wherever the
   * decade grid happened to be browsing, since "cancel" should mean "never mind", not "one level
   * down from here".
   */
  function goToCurrentMonth() {
    const today = new Date();
    const target = api.focusedValue.set({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
    api.setFocusedValue(target);
    api.setView("day");
  }

  const defaultViewTriggerProps = api.getViewTriggerProps();
  const viewTriggerProps =
    api.view === "year"
      ? {
          ...defaultViewTriggerProps,
          "aria-label": locale.toLocaleLowerCase().startsWith("en")
            ? "Back to current month"
            : "Volver al mes actual",
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            goToCurrentMonth();
          },
        }
      : defaultViewTriggerProps;

  /*
   * Every trigger below IS the real `Button` component (ADR-19/8), not a hand-authored `<button>`
   * copying its classes/attrs. A rename in Button's shape shows up here for free. Prev/next and
   * the day cell share the SAME `iconOnly` shape: a control-sized square holding one piece of
   * content, a glyph for prev/next, a day number for the cell, rather than a second "icon button"
   * for what is one shape wearing two kinds of content. Month/year cells stay plain Buttons: their
   * label is a word, not a single glyph, and they stretch to fill their `<td>` (calendar.css).
   *
   * The SIZE is `sm` for EVERY control in here, day cells included. The day cell used to sit one
   * tier lower at `xs` (24px, the floor of the scale) on the argument that forty-two of them share
   * one grid; measured against the header it read as a second, weaker control tier inside one
   * widget, and 24px is the WCAG 2.2 SC 2.5.8 minimum rather than comfortable room for a digit you
   * aim at. One tier throughout, and the grid still fits the 18rem calendar. Spelled here rather
   * than left to CSS: React serializes `data-size` from this prop, so the attribute the vanilla
   * binding writes by hand has to be the one this prop produces or G2 reports the two halves as
   * divergent.
   */
  return (
    <>
      {(api.view !== "day" || api.numOfMonths === 1) && (
      <div className={calendarParts.header}>
        <Button
          {...api.getPrevTriggerProps()}
          className={calendarParts.previous}
          iconOnly
          size="sm"
          variant="ghost"
        >
          {previousIcon ?? <Icon name="chevron-left" size="sm" />}
        </Button>
        {api.selectionMode === "range" ? (
          <span className={calendarParts.monthTitle}>{headingLabel}</span>
        ) : (
        <Button
          {...viewTriggerProps}
          className={calendarParts.viewTrigger}
          size="sm"
          variant="ghost"
          post={viewIcon ?? <Icon name="chevron-down" size="sm" />}
        >
          {headingLabel}
        </Button>
        )}        <Button
          {...api.getNextTriggerProps()}
          className={calendarParts.next}
          iconOnly
          size="sm"
          variant="ghost"
        >
          {nextIcon ?? <Icon name="chevron-right" size="sm" />}
        </Button>
      </div>
      )}

      {api.view === "day" ? (
        <div className={calendarParts.months}>
          {calendarMonths(api, locale).map((month) => (
            <table
              {...api.getTableProps({ id: String(month.index) })}
              aria-label={api.numOfMonths > 1 ? month.visibleRangeText.start : undefined}
              className={calendarParts.table}
              key={month.index}
            >
              {api.numOfMonths > 1 && (
                <caption className={calendarParts.heading}>
                  <div className={calendarParts.header}>
                    {month.index === 0 ? (
                      <Button {...api.getPrevTriggerProps()} className={calendarParts.previous} iconOnly size="sm" variant="ghost">
                        {previousIcon ?? <Icon name="chevron-left" size="sm" />}
                      </Button>
                    ) : <span aria-hidden="true" />}
                    {api.selectionMode === "range" ? (
                      <span className={calendarParts.monthTitle}>
                        {month.monthLabel}
                        <span className={calendarParts.year}>{month.yearLabel}</span>
                      </span>
                    ) : (
                    <Button
                      {...defaultViewTriggerProps}
                      id={month.index === 0 ? defaultViewTriggerProps.id : `${defaultViewTriggerProps.id}-${month.index}`}
                      className={calendarParts.viewTrigger}
                      size="sm"
                      variant="ghost"
                      post={viewIcon ?? <Icon name="chevron-down" size="sm" />}
                      onClick={() => {
                        api.setFocusedValue(month.visibleRange.start);
                        api.setView("month");
                      }}
                    >
                      {month.monthLabel}
                      <span className={calendarParts.year}>{month.yearLabel}</span>
                    </Button>
                    )}
                    {month.index === api.numOfMonths - 1 ? (
                      <Button {...api.getNextTriggerProps()} className={calendarParts.next} iconOnly size="sm" variant="ghost">
                        {nextIcon ?? <Icon name="chevron-right" size="sm" />}
                      </Button>
                    ) : <span aria-hidden="true" />}
                  </div>
                </caption>
              )}
              <thead {...api.getTableHeadProps()} className={calendarParts.tableHeader}>
                <tr {...api.getTableRowProps()}>
                  {api.weekDays.map((day) => (
                    <th scope="col" key={day.short}>
                      <abbr title={day.long}>{getTwoLetterWeekdayLabel(day, locale)}</abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody {...api.getTableBodyProps()} className={calendarParts.tableBody}>
                {month.weeks.map((week, weekIndex) => (
                  <tr {...api.getTableRowProps()} key={weekIndex}>
                    {week.map((day) => {
                      const props = { value: day, visibleRange: month.visibleRange };
                      const triggerProps = api.getDayTableCellTriggerProps(props);
                      const outside = api.getDayTableCellState(props).outsideRange;
                      return (
                        <td {...api.getDayTableCellProps(props)} className={calendarParts.cell} key={day.toString()}>
                            <Button
                              {...triggerProps}
                              id={api.numOfMonths > 1 && outside ? undefined : triggerProps.id}
                              className={calendarParts.cellTrigger}
                              iconOnly
                              size="sm"
                              variant="ghost"
                            >
                              {day.day}
                            </Button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      ) : api.view === "month" ? (
        <table
          {...api.getTableProps({ view: "month" })}
          className={`${calendarParts.table} ${calendarParts.monthGrid}`}
        >
          <tbody
            {...api.getTableBodyProps({ view: "month" })}
            className={calendarParts.tableBody}
          >
            {api.getMonthsGrid({ columns: 4, format: "short" }).map((row, rowIndex) => (
              <tr {...api.getTableRowProps({ view: "month" })} key={rowIndex}>
                {row.map((month) => (
                  <td
                    {...api.getMonthTableCellProps({ value: month.value, columns: 4 })}
                    className={calendarParts.cell}
                    key={month.value}
                  >
                    <Button
                      {...api.getMonthTableCellTriggerProps({ value: month.value })}
                      className={calendarParts.cellTrigger}
                      disabled={month.disabled}
                      size="sm"
                      variant="ghost"
                    >
                      {month.label}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table
          {...api.getTableProps({ view: "year" })}
          className={`${calendarParts.table} ${calendarParts.yearGrid}`}
        >
          <tbody
            {...api.getTableBodyProps({ view: "year" })}
            className={calendarParts.tableBody}
          >
            {api.getYearsGrid({ columns: 4 }).map((row, rowIndex) => (
              <tr {...api.getTableRowProps({ view: "year" })} key={rowIndex}>
                {row.map((year) => (
                  <td
                    {...api.getYearTableCellProps({ value: year.value, columns: 4 })}
                    className={calendarParts.cell}
                    key={year.value}
                  >
                    <Button
                      {...api.getYearTableCellTriggerProps({ value: year.value })}
                      className={calendarParts.cellTrigger}
                      disabled={year.disabled}
                      size="sm"
                      variant="ghost"
                    >
                      {year.label}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// `selectionMode` and friends come from the contract, so Core stays the only place they are defined.
export type CalendarProps = Pick<
  SignatureOptionsOf<typeof calendarContract, "Calendar">,
  "selectionMode" | "numOfMonths"
> & {
  id?: string;
  /** Names the grid. Matches the contract slot: plain text. */
  label: string;
  locale?: string;
  timeZone?: string;
  /*
   * Dates as `DateValue` OR as the ISO strings authored markup can carry. The enhancer only ever
   * has an attribute to read, so a contract option is a string by construction; accepting both here
   * is what lets one emitted tree drive both bindings instead of the React half needing a parser at
   * the call site.
   */
  value?: readonly (DateValue | string)[] | string;
  defaultValue?: readonly (DateValue | string)[] | string;
  min?: DateValue | string;
  max?: DateValue | string;
  disabled?: boolean;
  readOnly?: boolean;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  viewIcon?: ReactNode;
  /** Accessible name for a day cell, by state. Default is locale-aware (`locale`), not just Spanish. */
  dayLabel?: (state: DayTableCellState) => string;
  /** Accessible name for the day/month/year view-switch button. */
  viewTriggerLabel?: (view: DateView) => string;
  /** Accessible name for "go back". Previous month/year/decade depending on the open view. */
  prevTriggerLabel?: (view: DateView) => string;
  /** Accessible name for "go forward". Next month/year/decade depending on the open view. */
  nextTriggerLabel?: (view: DateView) => string;
  onValueChange?: (details: { value: string[] }) => void;
};

export const asDate = (date: DateValue | string | undefined) =>
  typeof date === "string" ? parseCalendarDate(date) : date;
// Space-separated, so a range can name both ends the way authored markup reads it.
export const asDates = (value: readonly (DateValue | string)[] | string | undefined) =>
  value === undefined
    ? undefined
    : (typeof value === "string" ? value.split(" ").filter(Boolean) : value)
        .map((date) => asDate(date))
        .filter((date): date is DateValue => date !== undefined);

/** Standalone calendar grid: no field, no popover. The same machine as DatePicker, `inline: true`. */
export function Calendar({
  dayLabel,
  defaultValue,
  disabled,
  id,
  label,
  locale = localeOption.default,
  max,
  min,
  numOfMonths,
  nextIcon,
  nextTriggerLabel,
  onValueChange,
  prevTriggerLabel,
  previousIcon,
  readOnly,
  selectionMode = selectionModeOption.default,
  timeZone = timeZoneOption.default,
  value,
  viewIcon,
  viewTriggerLabel,
}: CalendarProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const service = useMachine(datePicker.machine, {
    id: id ?? generatedId,
      // Inline, nothing renders `getContentProps()`, and the machine looks for the focused day inside that element: point it at the grid's own wrapper or the arrow keys move nothing.
    ids: { root: id ?? generatedId, content: id ?? generatedId },
    locale,
    timeZone,
    selectionMode,
    numOfMonths: calendarMonthCount(numOfMonths, selectionMode),
    value: asDates(value),
    defaultValue: asDates(defaultValue),
    min: asDate(min),
    max: asDate(max),
    disabled,
    translations: {
      // `trigger`/`content` name a popover this component never renders (`inline: true`, no
      // `getTriggerProps()`/`getContentProps()` call in `CalendarBody`). Required by the type,
      // dead in practice.
      ...unusedIntlTranslations(),
      trigger: () => "",
      content: "",
      dayCell: dayLabel ?? defaultDayLabel(locale),
      viewTrigger: viewTriggerLabel ?? defaultViewTriggerLabel(locale),
      prevTrigger: prevTriggerLabel ?? defaultPrevTriggerLabel(locale),
      nextTrigger: nextTriggerLabel ?? defaultNextTriggerLabel(locale),
    },
    readOnly,
    inline: true,
    fixedWeeks: true,
    onValueChange(details) {
      const next = { value: details.valueAsString };
      onValueChange?.(next);
      rootRef.current?.dispatchEvent(
        new CustomEvent(calendarEvents.valueChange, { bubbles: true, detail: next }),
      );
    },
  });
  const api = datePicker.connect(service, normalizeProps);
  const labelId = `${id ?? generatedId}-label`;

  return (
    <div
      {...api.getRootProps()}
      aria-labelledby={labelId}
      className={calendarParts.root}
      data-sk-calendar=""
      data-num-of-months={api.numOfMonths}
      ref={rootRef}
    >
      <p className={calendarParts.label} id={labelId}>
        {label}
      </p>
      <CalendarBody
        api={api}
        locale={locale}
        nextIcon={nextIcon}
        previousIcon={previousIcon}
        viewIcon={viewIcon}
      />
    </div>
  );
}
