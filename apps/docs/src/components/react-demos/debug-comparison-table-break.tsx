import {
  ComparisonTable,
  ComparisonTableScroll,
  ComparisonColumn,
  ComparisonRow,
  ComparisonCell,
} from "@skryensya/react/comparison-table";
import { BreakCaseFindings } from "./debug-case-findings";

type Row = { label: string; cells: string[] };
const DEMO: Row[] = [
  { label: "Monthly price", cells: ["$12.00", "$24.00"] },
  { label: "Members", cells: ["1", "1,284"] },
  { label: "Support", cells: ["Email", "Priority email"] },
];
const WORST: Row[] = [
  {
    label: "International billing reconciliation and security audit export",
    cells: [
      "Included",
      "Included",
      "Administrator approval required",
      "Not available",
    ],
  },
  {
    label: "Billing contact",
    cells: [
      "bartholomew.fitzgerald@northwind-industries-holdings.example.com",
      "Jo",
      "王秀英",
      "",
    ],
  },
  {
    label: "Maximum annual contract",
    cells: ["$12,345,678.90", "−$42.50 credit", "$0.00", "$1.00"],
  },
  {
    label: "Benachrichtigungseinstellungen",
    cells: [
      "Paramètres de confidentialité et de sécurité",
      "Configured by administrator",
      "Not configured",
      "Read only",
    ],
  },
  {
    label: "Literal text",
    cells: [
      "<script>alert(1)</script>",
      "&amp;",
      "**bold**",
      "Line one\nLine two",
    ],
  },
];
const CASES = [
  { label: "Demo", columns: ["Starter", "Team"], rows: DEMO },
  {
    label: "Worst case",
    columns: [
      "International enterprise workspace",
      "Regional administration",
      "Compliance archive",
      "Read-only guest",
    ],
    rows: WORST,
  },
  { label: "Empty rows", columns: ["Starter", "Team"], rows: [] },
  { label: "One row", columns: ["Starter", "Team"], rows: [DEMO[0]] },
  {
    label: "1,000 aspects",
    columns: ["Current API", "Replacement API"],
    rows: Array.from({ length: 1000 }, (_, i) => ({
      label: `Configuration option ${i + 1}`,
      cells: ["Supported", i % 2 ? "Supported" : "Migration required"],
    })),
  },
];

export function ComparisonTableBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: ComparisonTable</h1>
        <p className="break-intro">
          Two/four columns with long headings, contacts, large/negative amounts,
          missing cells and zero/one/1,000 aspects. Wrapped in{" "}
          <code>ComparisonTableScroll</code>, the opt-in fix for a comparison
          wider than its container: the table's own{" "}
          <code>table-layout: auto</code> means <code>overflow</code>/
          <code>max-inline-size</code> on the table itself can't cap it in
          real layout engines.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, columns, rows }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">ComparisonTable - {label}</h2>
            <BreakCaseFindings component="comparison-table" label={label} />
            <div className="break-case__stage">
              <div
                style={{
                  inlineSize: "100%",
                  ...(rows.length === 1000
                    ? { maxBlockSize: "32rem", overflow: "auto" }
                    : {}),
                }}
              >
                <ComparisonTableScroll>
                  <ComparisonTable
                    aspectLabel="Plan feature"
                    caption={`Workspace plans - ${label}`}
                    columns={columns.map((column) => (
                      <ComparisonColumn key={column}>{column}</ComparisonColumn>
                    ))}
                  >
                    {rows.map((row, i) => (
                      <ComparisonRow key={i} label={row.label}>
                        {row.cells.map((cell, j) => (
                          <ComparisonCell key={j}>{cell}</ComparisonCell>
                        ))}
                      </ComparisonRow>
                    ))}
                  </ComparisonTable>
                </ComparisonTableScroll>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
