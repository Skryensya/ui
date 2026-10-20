import { BreakCaseFindings } from "./debug-case-findings";
import { Procedure, ProcedureStep } from "@skryensya/react/procedure";

const CASES = [
  {
    label: "Demo",
    instructions: [
      { title: "Create a workspace", body: "Choose a name." },
      { title: "Invite your team", body: "Send an invitation." },
    ],
  },
  {
    label: "Worst case",
    instructions: [
      {
        title: "Confirm international billing and security administrators",
        body: "bartholomew.fitzgerald@northwind-industries-holdings.example.com",
      },
      {
        title: "Benachrichtigungseinstellungen",
        body: "https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved",
      },
      { title: "王秀英 · 产品团队", body: "" },
      {
        title: "Review literal markup",
        body: "<script>alert(1)</script> &amp; **bold**",
      },
    ],
  },
  { label: "Empty", instructions: [] },
  { label: "One", instructions: [{ title: "Done", body: "" }] },
  {
    label: "100 instructions",
    instructions: Array.from({ length: 100 }, (_, i) => ({
      title: `Migration verification ${i + 1}`,
      body: "Confirm the workspace record matches the migration checklist before proceeding.",
    })),
  },
];

export function ProcedureBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Procedure</h1>
        <p className="break-intro">
          Unbreakable support details, missing bodies, escaped markup and
          three-digit numbering in a long migration runbook.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, instructions }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Procedure — {label}</h2>
            <BreakCaseFindings component="procedure" label={label} />
            <div className="break-case__stage">
              <div
                style={{
                  inlineSize: "100%",
                  ...(label === "100 instructions"
                    ? { maxBlockSize: "32rem", overflow: "auto" }
                    : {}),
                }}
              >
                <Procedure aria-label={`Instructions — ${label}`}>
                  {instructions.map(({ title, body }, i) => (
                    <ProcedureStep key={i} title={title}>
                      {body ? <p>{body}</p> : null}
                    </ProcedureStep>
                  ))}
                </Procedure>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
