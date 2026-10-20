import { BreakCaseFindings } from "./debug-case-findings";
import { Tabs, type TabsItem } from "@skryensya/react/tabs";

const DEMO: TabsItem[] = ["Overview", "Activity", "Settings"].map(
  (label, i) => ({
    value: `tab-${i}`,
    label,
    children: <p>{label} content</p>,
  }),
);
const WORST: TabsItem[] = [
  {
    value: "overview",
    label: "International billing reconciliation",
    children: (
      <p>
        Contact bartholomew.fitzgerald@northwind-industries-holdings.example.com
        for the full report.
      </p>
    ),
  },
  {
    value: "privacy",
    label: "Paramètres de confidentialité et de sécurité",
    children: <p>王秀英 · 产品团队</p>,
  },
  {
    value: "disabled",
    label: "Benachrichtigungseinstellungen",
    disabled: true,
    children: <p>Unavailable</p>,
  },
  { value: "short", label: "Jo", children: <p>Jo's activity</p> },
];
const CASES = [
  { label: "Demo", items: DEMO },
  { label: "Worst case", items: WORST },
  { label: "Empty", items: [] },
  { label: "One", items: [DEMO[0]] },
  {
    label: "24 documents",
    items: Array.from({ length: 24 }, (_, i) => ({
      value: `doc-${i}`,
      label: `Q3 report v${i + 1}`,
      children: <p>Document {i + 1}</p>,
    })),
  },
];

export function TabsBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Tabs</h1>
        <p className="break-intro">
          Long translated tabs, disabled selection, unbreakable panel content
          and a workspace with 24 open documents.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, items }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Tabs — {label}</h2>
            <BreakCaseFindings component="tabs" label={label} />
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <Tabs
                  aria-label={`Documents — ${label}`}
                  items={items}
                  defaultValue={items[0]?.value}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
