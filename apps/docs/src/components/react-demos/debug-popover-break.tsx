import { Popover } from "@skryensya/react/popover";

const CASES = [
  {
    label: "Demo",
    title: "Billing details",
    description: "Invoices are sent monthly to the billing contact.",
    body: "Update the billing email in workspace settings.",
  },
  {
    label: "Worst case",
    title: "International billing reconciliation and security review",
    description: "Paramètres de confidentialité et de sécurité · Changes apply to all workspace administrators and the next invoice cycle.",
    body: "Contact bartholomew.fitzgerald@northwind-industries-holdings.example.com or review https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved.",
  },
  {
    label: "Short / missing detail",
    title: "Jo",
    description: "",
    body: "王秀英 · 产品团队",
  },
] as const;

export function PopoverBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header><h1>break: Popover</h1><p className="break-intro">Open the inline examples to inspect short, translated and unbreakable content at the trigger's real container width.</p></header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, title, description, body }, i) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Popover — {label}</h2>
            <div className="break-case__stage">
              <div className="break-w-320">
                <Popover
                  id={`break-popover-${i}`}
                  trigger={`Open ${label}`}
                  title={title}
                  description={description || undefined}
                  arrow
                >
                  <p>{body}</p>
                </Popover>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
