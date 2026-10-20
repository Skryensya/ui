import type { CommandPaletteEntry } from "@skryensya/core/command-palette";
import { Button } from "@skryensya/react/button";
import { CommandPalette } from "@skryensya/react/command-palette";

const DEMO: CommandPaletteEntry[] = [
  { label: "Open settings", href: "#settings", section: "Workspace" },
  { label: "Review billing", href: "#billing", section: "Finance" },
  { label: "Invite a member", href: "#invite", section: "People" },
];
const WORST: CommandPaletteEntry[] = Array.from({ length: 1000 }, (_, i) => ({
  label: i === 0
    ? "Export the complete billing and security audit history for this workspace"
    : i === 1
      ? "Aleksandra Wiśniewska-Kowalczyk · International product infrastructure"
      : `Workspace destination ${i + 1} — ${i % 2 ? "Paramètres de confidentialité" : "王秀英 产品团队"}`,
  href: `#workspace-${i + 1}`,
  section: i % 2 ? "People · Operations" : "Finance and compliance",
}));
const SCENARIOS = [
  { label: "Demo", entries: DEMO },
  { label: "Worst case · 1,000 entries", entries: WORST },
  { label: "Empty", entries: [] },
] as const;

export function CommandPaletteBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header><h1>break: CommandPalette</h1><p className="break-intro">Open each inline example, then search long localized labels, empty results and a 1,000-entry index.</p></header>
      <div className="break-scenario-grid">
        {SCENARIOS.map(({ label, entries }, i) => {
          const id = `break-palette-${i}`;
          return (
            <section className="break-case" key={label}>
              <h2 className="break-case__label">CommandPalette — {label}</h2>
              <div className="break-case__stage">
                <Button onClick={() => (document.getElementById(id) as HTMLDialogElement | null)?.showModal()} variant="solid">Open {label}</Button>
                <CommandPalette
                  id={id}
                  label={`Search workspace — ${label}`}
                  placeholder="Search destinations or commands…"
                  emptyLabel="No matching destinations"
                  closeLabel="Close search"
                  items={entries}
                  vaul={false}
                  onSelect={() => {}}
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
