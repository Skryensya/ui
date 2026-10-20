import type { ReactNode } from "react";
import { DatePicker, NativeDatePicker } from "@skryensya/react/date-picker";

type Scenario = {
  label: string;
  fieldLabel: string;
  value?: string | readonly string[];
  nativeValue?: string;
  selectionMode?: "single" | "range";
  min?: string;
  max?: string;
  disabled?: boolean;
};

const SCENARIOS: readonly Scenario[] = [
  {
    label: "Demo date",
    fieldLabel: "Check-in date",
    value: "2026-06-15",
    nativeValue: "2026-06-15",
  },
  {
    label: "Earliest boundary and long label",
    fieldLabel: "Date the international billing contact change takes effect",
    value: "1900-01-01",
    nativeValue: "1900-01-01",
    min: "1900-01-01",
    max: "2100-12-31",
  },
  {
    label: "Range across year boundary",
    fieldLabel: "Stay dates",
    value: ["2025-12-29", "2026-01-04"],
    nativeValue: "2025-12-29",
    selectionMode: "range",
  },
  {
    label: "Empty",
    fieldLabel: "Optional renewal date",
  },
  {
    label: "Disabled",
    fieldLabel: "Confirmed invoice date",
    value: "2026-09-30",
    nativeValue: "2026-09-30",
    disabled: true,
  },
];

function Case({ label, width, children }: { label: string; width: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h2 className="break-case__label">{label}</h2>
      <div className="break-case__stage"><div className={width}>{children}</div></div>
    </section>
  );
}

function Fields({ scenario, id }: { scenario: Scenario; id: string }) {
  return (
    <div className="break-date-picker-fields">
      <NativeDatePicker
        id={`${id}-native`}
        label={`${scenario.fieldLabel} — native`}
        defaultValue={scenario.nativeValue}
        min={scenario.min}
        max={scenario.max}
        disabled={scenario.disabled}
      />
      <DatePicker
        id={`${id}-enhanced`}
        label={`${scenario.fieldLabel} — enhanced`}
        defaultValue={scenario.value}
        selectionMode={scenario.selectionMode}
        min={scenario.min}
        max={scenario.max}
        disabled={scenario.disabled}
        locale="en-US"
        placeholder="Select date"
      />
    </div>
  );
}

export function DatePickerBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: DatePicker</h1>
        <p className="break-intro">
          Native and enhanced date controls are paired for typical, boundary, range, empty and
          disabled states. Open the enhanced picker to inspect its calendar and positioning.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <Case key={scenario.label} label={`DatePicker — ${scenario.label}`} width="break-w-320">
            <Fields scenario={scenario} id={`date-${index}`} />
          </Case>
        ))}
      </div>
      <Case label="DatePicker — long-label boundary — wide container (1100px)" width="break-w-1100">
        <DatePicker
          id="date-wide"
          label={SCENARIOS[1].fieldLabel}
          defaultValue={SCENARIOS[1].value}
          min={SCENARIOS[1].min}
          max={SCENARIOS[1].max}
          locale="en-US"
          placeholder="Select date"
        />
      </Case>
    </div>
  );
}
