import { Details, DetailsGroup } from "@skryensya/react/details";
import { BreakCaseFindings } from "./debug-case-findings";

const CASES = [
  {
    label: "Demo",
    items: [
      {
        title: "How are invoices sent?",
        body: "Invoices are sent to the billing contact each month.",
      },
      {
        title: "Can I change the contact?",
        body: "Workspace administrators can update it in settings.",
      },
    ],
  },
  {
    label: "Worst case",
    items: [
      {
        title:
          "How can Aleksandra Wiśniewska-Kowalczyk update international billing reconciliation and security notification preferences?",
        body: "Contact bartholomew.fitzgerald@northwind-industries-holdings.example.com and review https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved.",
      },
      {
        title: "Benachrichtigungseinstellungen",
        body: "<script>alert(1)</script> &amp; **bold**",
      },
      { title: "王秀英 · 产品团队", body: "" },
    ],
  },
  { label: "Empty", items: [] },
  { label: "One", items: [{ title: "Jo", body: "" }] },
  {
    label: "1,000 entries",
    items: Array.from({ length: 1000 }, (_, i) => ({
      title: `How can I download archived invoice ${i + 1}?`,
      body: "Ask a billing administrator for an export from the workspace archive.",
    })),
  },
];

export function DetailsBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Details</h1>
        <p className="break-intro">
          Native disclosures with long summaries, missing bodies, literal
          markup, an empty group and 1,000 archived invoice entries. Each group
          uses native single-open behavior.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, items }, index) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Details - {label}</h2>
            <BreakCaseFindings component="details" label={label} />
            <div className="break-case__stage">
              <div
                style={{
                  inlineSize: "100%",
                  ...(items.length === 1000
                    ? { maxBlockSize: "32rem", overflow: "auto" }
                    : {}),
                }}
              >
                <DetailsGroup aria-label={`Invoice questions - ${label}`}>
                  {items.map(({ title, body }, i) => (
                    <Details
                      key={i}
                      name={`break-details-${index}`}
                      open={i === 0}
                    >
                      <Details.Summary>{title}</Details.Summary>
                      <Details.Content>
                        {body ? <p>{body}</p> : null}
                      </Details.Content>
                    </Details>
                  ))}
                </DetailsGroup>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
