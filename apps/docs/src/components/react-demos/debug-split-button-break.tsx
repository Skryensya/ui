import { useState } from "react";
import { SplitButton } from "@skryensya/react/split-button";
import type { MenuItem } from "@skryensya/core/menu";
import { BreakCaseFindings } from "./debug-case-findings";

const DEMO: MenuItem[] = [
  { value: "csv", label: "Export CSV" },
  { value: "pdf", label: "Export PDF" },
];
const WORST: MenuItem[] = [
  {
    value: "full",
    label: "Export complete international billing and security audit history",
  },
  { value: "settings", label: "Benachrichtigungseinstellungen" },
  { value: "legacy", label: "Archived records", disabled: true },
];
const CASES = [
  { label: "Demo", action: "Export", items: DEMO },
  {
    label: "Worst case",
    action: "Export international billing reconciliation",
    items: WORST,
  },
  { label: "Empty menu", action: "Export", items: [] },
  { label: "One alternative", action: "Export", items: [DEMO[0]] },
  { label: "Disabled", action: "Export", items: DEMO, disabled: true },
  {
    label: "Loading",
    action: "Preparing the international audit export",
    items: DEMO,
    loading: true,
  },
];

function SplitCase({ scenario }: { scenario: (typeof CASES)[number] }) {
  const [action, setAction] = useState("No action yet");
  return (
    <section className="break-case">
      <h2 className="break-case__label">SplitButton — {scenario.label}</h2>
      <BreakCaseFindings component="split-button" label={scenario.label} />
      <div className="break-case__stage">
        <SplitButton
          label={`Export options — ${scenario.label}`}
          menuLabel="More export options"
          menuItems={scenario.items}
          disabled={scenario.disabled}
          loading={scenario.loading}
          onClick={() => setAction("Primary export")}
          onSelect={({ value }) => setAction(value)}
        >
          {scenario.action}
        </SplitButton>
      </div>
      <output className="break-case__note">{action}</output>
    </section>
  );
}

export function SplitButtonBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: SplitButton</h1>
        <p className="break-intro">
          Primary/alternative actions with long labels, an empty menu, a single
          alternative, loading and disabled states. Outputs show which action
          ran; no network request is made.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map((scenario) => (
          <SplitCase key={scenario.label} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
