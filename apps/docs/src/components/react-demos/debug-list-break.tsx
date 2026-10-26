import { List, ListItem } from "@skryensya/react/list";

type Row = { title: string; description?: string; trailing?: string };
const DEMO: Row[] = [
  { title: "Quarterly planning", description: "Updated yesterday", trailing: "4" },
  { title: "Design review", description: "Notes and decisions", trailing: "2" },
  { title: "Release checklist", description: "Due Friday" },
];
const WORST: Row[] = [
  { title: "Aleksandra Wiśniewska-Kowalczyk", description: "Senior Product Design Engineer, Platform Infrastructure", trailing: "1,284" },
  { title: "bartholomew.fitzgerald@northwind-industries-holdings.example.com", description: "https://example.com/workspaces/acme/projects/q3-launch/docs/9f8e7d6c5b4a?tab=comments&filter=unresolved" },
  { title: "Jo", description: "" },
  { title: "王秀英", description: "产品团队 · Q3 计划" },
  { title: "International billing reconciliation and security review", description: "Paramètres de confidentialité et de sécurité" },
  { title: "Literal markup: <script>alert(1)</script> &amp; **bold**", description: "Line one\nLine two" },
];
const HUNDRED = Array.from({ length: 1000 }, (_, i) => ({ title: `Workspace item ${i + 1}`, description: `Owner ${i % 37 + 1} · updated ${i % 28 + 1} days ago`, trailing: String(i + 1) }));
const SCENARIOS = [
  { label: "Demo", rows: DEMO },
  { label: "Worst case", rows: WORST },
  { label: "Empty", rows: [] },
  { label: "One", rows: [WORST[2]] },
  { label: "1,000 rows", rows: HUNDRED },
] as const;

export function ListBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header><h1>break: List</h1><p className="break-intro">Long names and URLs, optional descriptions, escaping, zero/one rows and a scrollable 1,000-row collection.</p></header>
      <div className="break-scenario-grid">
        {SCENARIOS.map(({ label, rows }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">List - {label}</h2>
            <div className="break-case__stage">
              <div className={label === "1,000 rows" ? "break-list-viewport" : "break-w-320"}>
                <List aria-label={`Workspace items - ${label}`}>
                  {rows.map((row, i) => <ListItem key={`${row.title}-${i}`} title={row.title} description={row.description || undefined} trailing={row.trailing} />)}
                </List>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
