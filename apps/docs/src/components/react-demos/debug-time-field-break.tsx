import type { ReactNode } from "react";
import { TimeField } from "@skryensya/react/time-field";

type Scenario = {
  label: string;
  fieldLabel: string;
  defaultValue?: string;
  locale: string;
  hourCycle?: "h12" | "h24";
  optionsStep?: number;
  hint?: string;
  disabled?: boolean;
};

const SCENARIOS: readonly Scenario[] = [
  {
    label: "Demo data",
    fieldLabel: "Departure time",
    defaultValue: "09:30",
    locale: "en-US",
  },
  {
    label: "Midnight",
    fieldLabel: "Quiet hours start",
    defaultValue: "00:00",
    locale: "en-GB",
    hourCycle: "h24",
  },
  {
    label: "Last minute, dense options",
    fieldLabel: "International billing reconciliation cutoff time",
    defaultValue: "23:59",
    locale: "en-US",
    optionsStep: 15,
    hint: "The list contains 96 quarter-hour options, including the final minute of the day.",
  },
  {
    label: "Empty",
    fieldLabel: "Optional reminder time",
    locale: "es-DO",
  },
  {
    label: "Disabled",
    fieldLabel: "Confirmed handoff time",
    defaultValue: "12:00",
    locale: "es-CL",
    hourCycle: "h24",
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

function Field({ scenario, id }: { scenario: Scenario; id: string }) {
  return (
    <TimeField
      id={id}
      label={scenario.fieldLabel}
      defaultValue={scenario.defaultValue}
      locale={scenario.locale}
      hourCycle={scenario.hourCycle}
      optionsStep={scenario.optionsStep}
      hint={scenario.hint}
      disabled={scenario.disabled}
    />
  );
}

export function TimeFieldBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: TimeField</h1>
        <p className="break-intro">
          Both time formats, midnight, the final minute of the day, empty/disabled fields, and a
          96-option picker are shown inline. Open each option list to test keyboard and popover behavior.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <Case key={scenario.label} label={`TimeField — ${scenario.label}`} width="break-w-320">
            <Field scenario={scenario} id={`time-${index}`} />
          </Case>
        ))}
      </div>
      <Case label="TimeField — dense options — wide container (1100px)" width="break-w-1100">
        <Field scenario={SCENARIOS[2]} id="time-wide" />
      </Case>
    </div>
  );
}
