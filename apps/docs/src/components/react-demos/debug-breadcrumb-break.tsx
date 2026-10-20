import { Breadcrumb } from "@skryensya/react/breadcrumb";
import type { BreadcrumbItem } from "@skryensya/core/breadcrumb";

const CASES: { label: string; items: BreadcrumbItem[] }[] = [
  {
    label: "Demo",
    items: [
      { label: "Workspace", href: "#workspace" },
      { label: "Projects", href: "#projects" },
      { label: "Overview" },
    ],
  },
  {
    label: "Worst case",
    items: [
      { label: "International product infrastructure", href: "#workspace" },
      { label: "Aleksandra Wiśniewska-Kowalczyk", href: "#owner" },
      {
        label: "Paramètres de confidentialité et de sécurité",
        href: "#settings",
      },
      { label: "Benachrichtigungseinstellungen" },
    ],
  },
  {
    label: "Deep path",
    items: Array.from({ length: 12 }, (_, i) => ({
      label: `Project folder ${i + 1}`,
      href: `#folder-${i + 1}`,
    })),
  },
  { label: "Empty", items: [] },
  { label: "One", items: [{ label: "王秀英 · 产品团队" }] },
];

export function BreadcrumbBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Breadcrumb</h1>
        <p className="break-intro">
          Long endpoints, translated labels, a twelve-level path and zero/one
          crumbs. Open collapsed ancestors with pointer or keyboard.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, items }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Breadcrumb — {label}</h2>
            <div className="break-case__stage">
              <div style={{ inlineSize: "min(100%, 20rem)" }}>
                <Breadcrumb items={items} label={`Path — ${label}`} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
