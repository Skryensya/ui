import { useState, type ReactNode } from "react";
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
  locale?: string;
  timeZone?: string;
  placeholder?: string;
  dir?: "rtl";
};

type DataMode = "demo" | "worst";

const DEMO: readonly Scenario[] = [
  {
    label: "Typical single date",
    fieldLabel: "Check-in date",
    value: "2026-06-15",
    nativeValue: "2026-06-15",
  },
  {
    label: "Range across year boundary",
    fieldLabel: "Stay dates",
    value: ["2025-12-29", "2026-01-04"],
    nativeValue: "2025-12-29",
    selectionMode: "range",
  },
  { label: "Empty", fieldLabel: "Optional renewal date" },
  {
    label: "Disabled",
    fieldLabel: "Confirmed invoice date",
    value: "2026-09-30",
    nativeValue: "2026-09-30",
    disabled: true,
  },
];

const WORST: readonly Scenario[] = [
  {
    label: "Long localized label, placeholder, and upper bound",
    fieldLabel: "Benachrichtigungseinstellungen für internationale Abrechnungsänderungen",
    value: "2100-12-31",
    nativeValue: "2100-12-31",
    min: "1900-01-01",
    max: "2100-12-31",
    locale: "de-DE",
    timeZone: "Pacific/Kiritimati",
    placeholder: "Bitte wählen Sie das Datum der Abrechnungsänderung aus",
  },
  {
    label: "RTL range across the year boundary",
    fieldLabel: "تاريخ بدء الإقامة ونهايتها بعد مراجعة الحساب السنوية",
    value: ["2099-12-29", "2100-01-04"],
    nativeValue: "2099-12-29",
    selectionMode: "range",
    min: "1900-01-01",
    max: "2100-12-31",
    locale: "ar-EG",
    timeZone: "Pacific/Kiritimati",
    placeholder: "اختر تاريخ بداية الإقامة ونهايتها",
    dir: "rtl",
  },
  {
    label: "Empty value and long placeholder",
    fieldLabel: "Optional date after the annual billing review is complete",
    locale: "vi-VN",
    placeholder: "Select the date after the billing review has been completed",
  },
  {
    label: "One-character label and lower bound",
    fieldLabel: "J",
    value: "1900-01-01",
    nativeValue: "1900-01-01",
    min: "1900-01-01",
    max: "2100-12-31",
    locale: "en-GB",
  },
  {
    label: "Disabled at the upper bound",
    fieldLabel: "Date on which the confirmed international billing transition takes effect",
    value: "2100-12-31",
    nativeValue: "2100-12-31",
    min: "1900-01-01",
    max: "2100-12-31",
    disabled: true,
    locale: "de-DE",
  },
];

function initialMode(): DataMode {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("data") === "worst"
    ? "worst"
    : "demo";
}

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
    <div className="break-date-picker-fields" dir={scenario.dir}>
      <NativeDatePicker
        id={`${id}-native`}
        label={`${scenario.fieldLabel} - native`}
        locale={scenario.locale}
        value={scenario.nativeValue}
        min={scenario.min}
        max={scenario.max}
        disabled={scenario.disabled}
      />
      <DatePicker
        id={`${id}-enhanced`}
        label={`${scenario.fieldLabel} - enhanced`}
        defaultValue={scenario.value}
        selectionMode={scenario.selectionMode}
        min={scenario.min}
        max={scenario.max}
        disabled={scenario.disabled}
        locale={scenario.locale ?? "en-US"}
        timeZone={scenario.timeZone}
        placeholder={scenario.placeholder ?? "Select date"}
      />
    </div>
  );
}

export function DatePickerBreak() {
  const [mode, setMode] = useState<DataMode>(initialMode);
  const scenarios = mode === "worst" ? WORST : DEMO;
  const wideScenario = scenarios.find((scenario) => scenario.selectionMode === "range") ?? scenarios[0];

  function selectMode(next: DataMode) {
    setMode(next);
    const url = new URL(window.location.href);
    if (next === "worst") url.searchParams.set("data", "worst");
    else url.searchParams.delete("data");
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="break-page date-picker-break-page" data-toc-transparent>
      <header>
        <h1>break: DatePicker</h1>
        <p className="break-intro">
          Native and enhanced date fields under realistic boundary conditions. Open the enhanced
          picker to test its calendar, keyboard navigation, and positioning.
        </p>
      </header>
      <div className="break-scenario-grid" key={mode}>
        {scenarios.map((scenario, index) => (
          <Case key={scenario.label} label={`DatePicker - ${scenario.label}`} width="break-w-320">
            <Fields scenario={scenario} id={`date-${mode}-${index}`} />
          </Case>
        ))}
      </div>
      <Case label="DatePicker - worst range in a wide container (1100px)" width="break-w-1100">
        <Fields scenario={wideScenario} id={`date-${mode}-wide`} />
      </Case>
      <nav className="break-data-toggle" aria-label="DatePicker test data">
        {(["demo", "worst"] as const).map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={mode === item}
            onClick={() => selectMode(item)}
          >
            {item === "demo" ? "Demo data" : "Worst case"}
          </button>
        ))}
      </nav>
    </div>
  );
}
