import { Menu } from "@skryensya/react/menu";
import type { MenuItem } from "@skryensya/core/menu";

type Scenario = { label: string; items: readonly MenuItem[]; defaultOpen?: boolean; trigger?: string };

const DEMO: readonly MenuItem[] = [
  { value: "rename", label: "Rename" },
  { value: "duplicate", label: "Duplicate" },
  { value: "archive", label: "Archive" },
  { value: "delete", label: "Delete", tone: "danger" },
];
const WORST: readonly MenuItem[] = [
  {
    value: "export",
    label: "Export the complete billing and security audit history for this workspace",
  },
  { value: "copy-link", label: "Copy link to international billing reconciliation" },
  { value: "verified", label: "Verified by Finance", kind: "checkbox", checked: true },
  { value: "notification", label: "Security notifications", kind: "checkbox", checked: false },
  { value: "role-admin", label: "Workspace administrator", kind: "radio", group: "role", checked: true },
  { value: "role-billing", label: "Billing and compliance administrator", kind: "radio", group: "role" },
  {
    value: "more",
    label: "More account actions",
    children: [
      { value: "download", label: "Download the original invoice and attachments" },
      {
        value: "legal",
        label: "Legal records",
        children: [
          { value: "retention", label: "Review data retention and deletion requirements" },
          { value: "legal-export", label: "Export retention audit" },
        ],
      },
    ],
  },
  { value: "suspend", label: "Suspend member access", disabled: true },
  { value: "remove", label: "Remove this member from all workspaces", tone: "danger" },
];
const SCENARIOS: readonly Scenario[] = [
  { label: "Demo data", items: DEMO },
  { label: "Worst case", items: WORST, defaultOpen: true, trigger: "Workspace actions" },
  { label: "Empty", items: [] },
  { label: "One item", items: [{ value: "only", label: "Open settings" }] },
];

export function MenuBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Menu</h1>
        <p className="break-intro">
          Long action labels, checked and disabled items, radio groups and nested submenus are visible
          in one menu; empty and one-item cases sit beside them. Open other menus with keyboard or pointer.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <section className="break-case" key={scenario.label}>
            <h2 className="break-case__label">Menu — {scenario.label}</h2>
            <div className="break-case__stage">
              <div className="break-w-320">
                <Menu
                  id={`menu-${index}`}
                  label="Workspace actions"
                  trigger={scenario.trigger ?? "Actions"}
                  items={scenario.items}
                  defaultOpen={scenario.defaultOpen}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
