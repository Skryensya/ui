import { BreakCaseFindings } from "./debug-case-findings";
import { NavList, NavListGroup, NavListLink } from "@skryensya/react/nav-list";
import { Icon } from "@skryensya/react/icon";

const CASES = [
  { label: "Demo", items: ["Overview", "Projects", "Members"] },
  {
    label: "Worst case",
    items: [
      "International product infrastructure",
      "Benachrichtigungseinstellungen",
      "Paramètres de confidentialité et de sécurité",
      "王秀英 · 产品团队",
      "Jo",
    ],
  },
  { label: "Empty", items: [] },
  { label: "One", items: ["Overview"] },
  {
    label: "Large workspace",
    items: Array.from(
      { length: 1000 },
      (_, i) => `Project ${i + 1} — Release planning`,
    ),
  },
];

export function NavListBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: NavList</h1>
        <p className="break-intro">
          Sidebar-width navigation, long destination labels, icons and counts.
          Collapsible groups and a 1,000-project workspace stay inline.
        </p>
      </header>
      <div className="break-scenario-grid">
        {CASES.map(({ label, items }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">NavList — {label}</h2>
            <BreakCaseFindings component="nav-list" label={label} />
            <div className="break-case__stage">
              <div
                style={{
                  inlineSize: "min(100%, 18rem)",
                  ...(label === "Large workspace"
                    ? { maxBlockSize: "32rem", overflow: "auto" }
                    : {}),
                }}
              >
                <NavList aria-label={`Projects — ${label}`}>
                  <NavListGroup label="Workspace projects" collapsible>
                    {items.map((name, i) => (
                      <NavListLink
                        key={i}
                        href={`#project-${i}`}
                        current={i === 0}
                        icon={<Icon name="folder" />}
                        trailing={i === 0 ? "1,284" : undefined}
                      >
                        {name}
                      </NavListLink>
                    ))}
                  </NavListGroup>
                </NavList>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
