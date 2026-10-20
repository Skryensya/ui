import { FormField } from "@skryensya/react/form-field";
import { NativeSelect } from "@skryensya/react/select-native";
import { Select } from "@skryensya/react/select";
import type { ReactNode } from "react";

type Item = { value: string; label: string; disabled?: boolean };
type Scenario = { label: string; options: readonly Item[]; selected?: string };

const DEMO: readonly Item[] = [
  { value: "billing", label: "Billing" },
  { value: "security", label: "Security" },
  { value: "support", label: "Support" },
  { value: "operations", label: "Operations" },
];
const WORST: readonly Item[] = [
  { value: "billing", label: "International billing and security notifications" },
  { value: "settings", label: "Abrechnungsbenachrichtigungseinstellungen" },
  { value: "support", label: "Aleksandra Wiśniewska-Kowalczyk — Customer support" },
  { value: "regional", label: "王秀英 — 国際請求とセキュリティ通知" },
  { value: "short", label: "Jo" },
  { value: "disabled", label: "Former billing contact", disabled: true },
];
const HUGE = Array.from({ length: 1_000 }, (_, index) => {
  const number = String(index + 1).padStart(4, "0");
  return { value: `workspace-${number}`, label: `Workspace ${number}` };
});
const SCENARIOS: readonly Scenario[] = [
  { label: "Demo data", options: DEMO, selected: "billing" },
  { label: "Worst case", options: WORST, selected: "billing" },
  { label: "Empty", options: [] },
  { label: "One option", options: [{ value: "only", label: "Jo" }], selected: "only" },
  { label: "1,000 options", options: HUGE, selected: "workspace-0001" },
];

function Case({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h2 className="break-case__label">{label}</h2>
      <div className="break-case__stage">
        <div className="break-w-320">{children}</div>
      </div>
    </section>
  );
}

function Fields({ scenario, id }: { scenario: Scenario; id: string }) {
  return (
    <div className="break-select-scenario">
      <FormField id={`${id}-native`} label="Billing owner" className="break-select-field">
        <NativeSelect options={scenario.options} defaultValue={scenario.selected} />
      </FormField>
      <FormField
        id={`${id}-select`}
        label="Billing owner"
        hint="Choose who receives account notices."
        className="break-select-field"
      >
        <Select options={scenario.options} defaultValue={scenario.selected} placeholder="Choose an owner" />
      </FormField>
    </div>
  );
}

export function SelectBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Select</h1>
        <p className="break-intro">
          NativeSelect and Select under the same inline scenarios, at 320px. The enhanced worst case
          is repeated at its regular and widest supported container widths below.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <Case key={scenario.label} label={`NativeSelect / Select — ${scenario.label}`}>
            <Fields scenario={scenario} id={`scenario-${index}`} />
          </Case>
        ))}
      </div>
      {[{ label: "Regular field (18rem)", width: "break-w-18rem" }, { label: "Wide container (1100px)", width: "break-w-1100" }].map(({ label, width }) => (
        <Case key={label} label={`Select — Worst case — ${label}`}>
          <div className={width}>
            <FormField id={`select-${width}`} label="Billing owner" className="break-select-field">
              <Select options={WORST} defaultValue="billing" placeholder="Choose an owner" />
            </FormField>
          </div>
        </Case>
      ))}
    </div>
  );
}
