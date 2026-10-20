import type { ReactNode } from "react";
import { NumberField } from "@skryensya/react/number-field";

type Scenario = {
  label: string;
  fieldLabel: string;
  defaultValue: string;
  locale?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
};

const SCENARIOS: readonly Scenario[] = [
  {
    label: "Typical bounded quantity",
    fieldLabel: "Seats",
    defaultValue: "5",
    min: 0,
    max: 20,
    step: 1,
  },
  {
    label: "Single allowed unit",
    fieldLabel: "Nights",
    defaultValue: "1",
    min: 1,
    max: 1,
    step: 1,
  },
  {
    label: "Large boundary value",
    fieldLabel: "Annual transactions",
    defaultValue: "999999999",
    min: 0,
    max: 999_999_999,
    step: 1,
  },
  {
    label: "Localized decimal",
    fieldLabel: "Importe total",
    defaultValue: "1234567,89",
    locale: "es-CL",
    step: 0.01,
    hint: "Formato regional con separador de miles y decimales.",
  },
  {
    label: "Long label and hint",
    fieldLabel: "Maximum monthly adjustment for international billing reconciliation",
    defaultValue: "-125000.75",
    locale: "en-US",
    min: -1_000_000,
    max: 1_000_000,
    step: 0.01,
    hint: "This value is shared with the finance and security teams and may include a fractional adjustment.",
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

export function NumberFieldBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: NumberField</h1>
        <p className="break-intro">
          Locale formatting, bounded and unbounded values, a one-value range, decimals, and long
          label/help text are shown together at 320px.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map(({ label, fieldLabel, ...props }) => (
          <Case key={label} label={`NumberField — ${label}`} width="break-w-320">
            <NumberField {...props} label={fieldLabel} />
          </Case>
        ))}
      </div>
      <Case label="NumberField — wide container (1100px)" width="break-w-1100">
        <NumberField
          label="Annual transactions"
          defaultValue="999999999"
          min={0}
          max={999_999_999}
          step={1}
        />
      </Case>
    </div>
  );
}
