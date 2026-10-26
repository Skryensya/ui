import { BreakCaseFindings } from "./debug-case-findings";
import { Menubar, MenubarItem } from "@skryensya/react/menubar";
import type { MenuItem } from "@skryensya/core/menu";

const COMMANDS: MenuItem[] = [
  {
    value: "export",
    label: "Export the complete billing and security audit history",
  },
  {
    value: "notify",
    label: "Notify administrators",
    kind: "checkbox",
    checked: true,
  },
  { value: "archive", label: "Archive workspace", disabled: true },
  {
    value: "legal",
    label: "Legal records",
    children: [
      {
        value: "retention",
        label: "Review data retention and deletion requirements",
      },
    ],
  },
];
const CASES = [
  { label: "Demo", labels: ["File", "Edit", "View"] },
  {
    label: "Worst case",
    labels: [
      "International billing",
      "Benachrichtigungseinstellungen",
      "Paramètres de confidentialité",
    ],
  },
  { label: "Empty", labels: [] },
  { label: "One", labels: ["Actions"] },
];

export function MenubarBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Menubar</h1>
        <p className="break-intro">
          Long top-level commands, nested menus and zero/one groups. Open with
          ArrowDown, move between groups with arrows and dismiss with Escape.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, labels }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Menubar - {label}</h2>
            <BreakCaseFindings component="menubar" label={label} />
            <div className="break-case__stage">
              <Menubar label={`Workspace commands - ${label}`}>
                {labels.map((name, i) => (
                  <MenubarItem
                    key={name}
                    items={i === 2 ? undefined : COMMANDS}
                  >
                    {name}
                  </MenubarItem>
                ))}
              </Menubar>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
