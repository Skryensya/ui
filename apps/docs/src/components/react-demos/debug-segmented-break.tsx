import { BreakCaseFindings } from "./debug-case-findings";
import { SegmentedControl } from "@skryensya/react/segmented";
import type { SegmentedOption } from "@skryensya/core/segmented";

const CASES: { label: string; options: SegmentedOption[] }[] = [
  {
    label: "Demo",
    options: [
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
    ],
  },
  {
    label: "Worst case",
    options: [
      { value: "previous", label: "Vorheriger Abrechnungszeitraum" },
      { value: "current", label: "Aktueller Abrechnungszeitraum" },
      { value: "next", label: "Nächster Abrechnungszeitraum", disabled: true },
    ],
  },
  { label: "Empty", options: [] },
  { label: "One", options: [{ value: "only", label: "日" }] },
  {
    label: "All disabled",
    options: [
      { value: "day", label: "Day", disabled: true },
      { value: "month", label: "Month", disabled: true },
    ],
  },
];

export function SegmentedBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: SegmentedControl</h1>
        <p className="break-intro">
          Translated labels, disabled options, no choices and one choice. Check
          the moving indicator and arrow-key selection after resizing.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, options }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">SegmentedControl — {label}</h2>
            <BreakCaseFindings component="segmented" label={label} />
            <div className="break-case__stage">
              <SegmentedControl label={`Period — ${label}`} options={options} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
