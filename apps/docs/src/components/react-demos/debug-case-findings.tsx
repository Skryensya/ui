import { breakFindings } from "../../lib/break-findings";

export function BreakCaseFindings({
  component,
  label,
}: {
  component: string;
  label: string;
}) {
  const findings = (breakFindings[component] ?? []).filter((finding) =>
    finding.cases?.includes(label),
  );
  if (!findings.length) return null;
  return (
    <div data-break-case-findings>
      {findings.map((finding) => (
        <div key={finding.error} data-break-status={finding.status}>
          <p
            className={
              finding.status === "open"
                ? "break-case__broke"
                : "break-case__fixed"
            }
          >
            <strong>
              {finding.status === "open"
                ? "ERROR ABIERTO:"
                : "ERROR CORREGIDO:"}
            </strong>{" "}
            {finding.error}
          </p>
          <p className="break-case__note">
            <strong>
              {finding.status === "open"
                ? "Fix propuesto — SIN APLICAR:"
                : "Fix aplicado:"}
            </strong>{" "}
            {finding.fix}
          </p>
        </div>
      ))}
    </div>
  );
}
