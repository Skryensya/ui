import { DataGrid, DataGridCell, DataGridRow } from "@skryensya/react/data-grid";

type Member = {
  name: string;
  role?: string;
  email: string;
  workspaces: number;
};
type Scenario = { label: string; members: Member[] };

const DEMO: Member[] = [
  { name: "Sophie Chen", role: "Product designer", email: "sophie.chen@example.com", workspaces: 12 },
  { name: "Marcus Cole", role: "Engineering manager", email: "marcus.cole@example.com", workspaces: 8 },
];
const WORST: Member[] = [
  {
    name: "Aleksandra Wiśniewska-Kowalczyk",
    role: "Senior Product Design Engineer, Platform Infrastructure",
    email: "aleksandra.wisniewska-kowalczyk@northwind-industries-holdings.example.com",
    workspaces: 1_284,
  },
  { name: "Jo", email: "jo@acme.com", workspaces: 1 },
  {
    name: "Đặng Thị Ngọc Hân",
    role: "International billing and security administrator",
    email: "dang.ngoc.han@northwind-industries-holdings.example.com",
    workspaces: 0,
  },
  {
    name: "نور الهدى عبد الرحمن",
    role: "Customer operations",
    email: "nour.abdelrahman@example.com",
    workspaces: 48,
  },
];
const ONE: Member[] = [{ name: "J", email: "j@example.com", workspaces: 1 }];
const ROLES = ["Product designer", "Engineering manager", "Billing administrator", "Support lead"];
const number = new Intl.NumberFormat("en-US");
const plural = new Intl.PluralRules("en-US");
const MANY: Member[] = Array.from({ length: 1_000 }, (_, index) => {
  const id = String(index + 1).padStart(4, "0");
  return {
    name: `Workspace member ${id}`,
    role: ROLES[index % ROLES.length],
    email: `member.${id}@northwind-industries.example.com`,
    workspaces: index % 13 === 0 ? 1_284 : index % 5,
  };
});
const SCENARIOS: Scenario[] = [
  { label: "Demo data", members: DEMO },
  { label: "Worst case", members: WORST },
  { label: "Empty", members: [] },
  { label: "One row", members: ONE },
];

function countLabel(count: number) {
  const unit = plural.select(count) === "one" ? "workspace" : "workspaces";
  return `${number.format(count)} ${unit}`;
}

function Grid({ members, id }: { members: Member[]; id: string }) {
  return (
    <DataGrid label="Workspace directory">
      {members.map((member) => (
        <DataGridRow key={`${id}-${member.email}`}>
          <DataGridCell>
            <span className="break-grid__identity">
              <strong>{member.name}</strong>
              {member.role ? <span>{member.role}</span> : null}
            </span>
          </DataGridCell>
          <DataGridCell>
            <span className="break-grid__contact">
              <a href={`mailto:${member.email}`}>{member.email}</a>
              <small>{countLabel(member.workspaces)}</small>
            </span>
          </DataGridCell>
        </DataGridRow>
      ))}
    </DataGrid>
  );
}

export function DataGridBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Data Grid</h1>
        <p className="break-intro">
          Demo, long multilingual data, empty and one-row cases are all visible at 320px. The full
          1,000-member collection is shown once at the widest supported container.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map(({ label, members }, index) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">DataGrid — {label}</h2>
            <div className="break-case__stage">
              <div className="break-w-320"><Grid members={members} id={`${index}-320`} /></div>
            </div>
          </section>
        ))}
      </div>
      <section className="break-case">
        <h2 className="break-case__label">DataGrid — 1,000 rows — wide container (1100px)</h2>
        <div className="break-case__stage">
          <div className="break-grid-viewport break-w-1100"><Grid members={MANY} id="thousand-wide" /></div>
        </div>
      </section>
    </div>
  );
}
