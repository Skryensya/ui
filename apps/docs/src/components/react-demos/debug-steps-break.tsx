import { BreakCaseFindings } from "./debug-case-findings";
import { Steps, type ReactStep } from "@skryensya/react/steps";

const CASES: { label: string; steps: ReactStep[]; current?: number }[] = [
  {
    label: "Demo",
    steps: [{ label: "Account" }, { label: "Workspace" }, { label: "Review" }],
    current: 1,
  },
  {
    label: "Worst case",
    current: 1,
    steps: [
      {
        label: "Verify international billing details",
        description: "Aleksandra Wiśniewska-Kowalczyk",
      },
      {
        label: "Benachrichtigungseinstellungen",
        description:
          "bartholomew.fitzgerald@northwind-industries-holdings.example.com",
      },
      { label: "Paramètres de confidentialité et de sécurité" },
      { label: "王秀英 · 产品团队", description: "" },
    ],
  },
  { label: "Empty", steps: [] },
  {
    label: "One completed",
    steps: [{ label: "Workspace created", status: "complete" }],
  },
  {
    label: "12 stages",
    current: 10,
    steps: Array.from({ length: 12 }, (_, i) => ({
      label: `Release stage ${i + 1}`,
      description: i % 2 ? "" : "Security and compliance approval",
    })),
  },
];

export function StepsBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Steps</h1>
        <p className="break-intro">
          Long labels and descriptions, optional metadata,
          complete/current/upcoming status and a twelve-stage release.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, steps, current }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Steps - {label}</h2>
            <BreakCaseFindings component="steps" label={label} />
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <Steps
                  aria-label={`Progress - ${label}`}
                  steps={steps}
                  current={current}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
