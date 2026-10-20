import { Clipboard } from "@skryensya/react/clipboard";
import { BreakCaseFindings } from "./debug-case-findings";

const CASES = [
  {
    label: "Demo",
    fieldLabel: "Share link",
    value: "https://example.com/project",
    copiedLabel: "Copied",
    errorLabel: "Copy failed",
  },
  {
    label: "Worst case",
    fieldLabel:
      "Link to the international billing reconciliation and security review",
    value:
      "https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved",
    copiedLabel:
      "The complete workspace audit link was copied to your clipboard",
    errorLabel:
      "The browser refused clipboard access. Copy the complete workspace audit link manually.",
  },
  {
    label: "Empty value",
    fieldLabel: "Optional reference",
    value: "",
    copiedLabel: "Copied",
    errorLabel: "No value available to copy",
  },
  {
    label: "Multilingual",
    fieldLabel: "Reference / 参考",
    value: "王秀英 · Đặng Thị Ngọc Hân · نور الهدى عبد الرحمن",
    copiedLabel: "Copié dans le presse-papiers",
    errorLabel: "Impossible de copier cette référence",
  },
];

export function ClipboardBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Clipboard</h1>
        <p className="break-intro">
          Long values and translated feedback, a missing value and mixed
          scripts. Click copies fixture text to your clipboard; test denial with
          browser clipboard permissions.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, fieldLabel, value, copiedLabel, errorLabel }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Clipboard — {label}</h2>
            <BreakCaseFindings component="clipboard" label={label} />
            <div className="break-case__stage">
              <div style={{ inlineSize: "100%" }}>
                <Clipboard
                  fieldLabel={fieldLabel}
                  value={value}
                  label={`Copy ${label}`}
                  copiedLabel={copiedLabel}
                  errorLabel={errorLabel}
                  timeout={8000}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
