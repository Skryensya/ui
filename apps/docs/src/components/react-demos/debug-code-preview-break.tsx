import { CodePreview } from "@skryensya/react/code-preview";
import { BreakCaseFindings } from "./debug-case-findings";

const LONG_LINE =
  'const auditUrl = "https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved";';
const CONFIG = Array.from(
  { length: 1000 },
  (_, i) =>
    `  { route: "/workspace-${i + 1}/billing", access: "administrator" },`,
).join("\n");
const CASES = [
  {
    label: "Demo",
    filename: "settings.ts",
    note: "TypeScript",
    code: "const pageSize = 20;\nexport default pageSize;",
  },
  {
    label: "Worst case",
    filename:
      "international-billing-reconciliation-and-security-notification-configuration.generated.ts",
    note: "Configuration de production pour l’équipe internationale",
    code: `${LONG_LINE}\nconst owner = "bartholomew.fitzgerald@northwind-industries-holdings.example.com";\nconst literal = "<script>alert(1)</script> &amp; **bold**";`,
  },
  { label: "Empty", filename: "empty.ts", note: "", code: "" },
  {
    label: "One line",
    filename: undefined,
    note: undefined,
    code: "export default 1;",
  },
  {
    label: "1,002 lines",
    filename: "routing.generated.ts",
    note: "Generated routing rules",
    code: `export const routes = [\n${CONFIG}\n];`,
    collapsible: true,
  },
];

export function CodePreviewBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: CodePreview</h1>
        <p className="break-intro">
          Long metadata and code lines, escaped markup, zero/one lines and a
          generated 1,002-line file with the real disclosure. No syntax
          highlighter or harness clipping is added.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, filename, note, code, collapsible }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">CodePreview — {label}</h2>
            <BreakCaseFindings component="code-preview" label={label} />
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <CodePreview
                  label={filename}
                  note={note}
                  lines={code ? code.split("\n").length : 0}
                  previewLines={15}
                  collapsible={collapsible}
                  moreLabel="Show remaining lines"
                  lessLabel="Show fewer lines"
                >
                  <pre>
                    <code>{code}</code>
                  </pre>
                </CodePreview>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
