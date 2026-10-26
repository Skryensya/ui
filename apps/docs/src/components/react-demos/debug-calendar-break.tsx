import { Calendar } from "@skryensya/react/calendar";

const SCENARIOS = [
  { label: "Demo", props: { label: "Choose a date", locale: "en-US" } },
  {
    label: "Range",
    props: { label: "Travel dates", locale: "en-US", selectionMode: "range" as const, defaultValue: "2026-06-12 2026-06-17" },
  },
  {
    label: "Localized",
    props: { label: "Verfügbarkeit für die internationale Produktentwicklungsplanung", locale: "de-DE" },
  },
  {
    label: "Constrained",
    props: { label: "Available dates", locale: "en-US", min: "2026-06-08", max: "2026-06-23", defaultValue: "2026-06-17" },
  },
] as const;

export function CalendarBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Calendar</h1>
        <p className="break-intro">Single and range selection, localized labels, month boundaries and constrained dates.</p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map(({ label, props }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Calendar - {label}</h2>
            <div className="break-case__stage"><Calendar {...props} /></div>
          </section>
        ))}
      </div>
    </div>
  );
}
