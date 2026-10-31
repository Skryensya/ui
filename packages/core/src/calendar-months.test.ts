import { describe, expect, it } from "vitest";
import { calendarMonthCount, calendarMonths, parseCalendarDate } from "./calendar.js";

describe("calendar month count", () => {
  it.each([
    [undefined, "single", 1], [undefined, "range", 2],
    [1, "range", 1], [2, "single", 2],
    [0, "range", 2], [3, "single", 1], [NaN, "range", 2],
  ] as const)("resolves %s for %s to %s", (count, mode, expected) => {
    expect(calendarMonthCount(count, mode)).toBe(expected);
  });

  it("gives each grid its own month boundaries across the year", () => {
    const start = parseCalendarDate("2026-12-01")!;
    const months = calendarMonths({
      numOfMonths: 2,
      getOffset: ({ months }) => ({
        visibleRange: { start: start.add({ months }), end: start.add({ months: months + 2 }) },
        weeks: [],
        visibleRangeText: { start: "", end: "" },
      }),
    });
    expect(months.map(({ visibleRange }) => [visibleRange.start.toString(), visibleRange.end.toString()])).toEqual([
      ["2026-12-01", "2026-12-31"], ["2027-01-01", "2027-01-31"],
    ]);
  });
});
