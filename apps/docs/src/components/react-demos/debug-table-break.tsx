import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@skryensya/react/table";

type RecordRow = { name: string; role?: string; email: string; workspaces: number; status: string };
type Scenario = { label: string; rows: readonly RecordRow[] };

const DEMO: readonly RecordRow[] = [
  { name: "Sophie Chen", role: "Product designer", email: "sophie.chen@example.com", workspaces: 12, status: "Active" },
  { name: "Marcus Cole", role: "Engineering manager", email: "marcus.cole@example.com", workspaces: 8, status: "Invited" },
];
const WORST: readonly RecordRow[] = [
  {
    name: "Aleksandra Wiśniewska-Kowalczyk",
    role: "Senior Product Design Engineer, Platform Infrastructure",
    email: "aleksandra.wisniewska-kowalczyk@northwind-industries-holdings.example.com",
    workspaces: 1_284,
    status: "Active",
  },
  { name: "Jo", email: "jo@acme.com", workspaces: 1, status: "Invited" },
  {
    name: "Đặng Thị Ngọc Hân",
    role: "International billing and security administrator",
    email: "dang.ngoc.han@northwind-industries-holdings.example.com",
    workspaces: 0,
    status: "Suspended",
  },
  { name: "نور الهدى عبد الرحمن", role: "Customer operations", email: "nour.abdelrahman@example.com", workspaces: 48, status: "Active" },
];
const ONE: readonly RecordRow[] = [
  { name: "J", email: "j@example.com", workspaces: 1, status: "Active" },
];
const MANY: readonly RecordRow[] = Array.from({ length: 1_000 }, (_, index) => {
  const id = String(index + 1).padStart(4, "0");
  return {
    name: `Workspace member ${id}`,
    role: ["Product designer", "Engineering manager", "Billing administrator", "Support lead"][index % 4],
    email: `member.${id}@northwind-industries.example.com`,
    workspaces: index % 13 === 0 ? 1_284 : index % 5,
    status: index % 7 === 0 ? "Invited" : "Active",
  };
});
const SCENARIOS: readonly Scenario[] = [
  { label: "Demo data", rows: DEMO },
  { label: "Worst case", rows: WORST },
  { label: "Empty", rows: [] },
  { label: "One row", rows: ONE },
];

function TableCase({
  label,
  rows,
  id,
  width,
  resizable = false,
  maxBlockSize,
}: {
  label: string;
  rows: readonly RecordRow[];
  id: string;
  width: string;
  resizable?: boolean;
  maxBlockSize?: string;
}) {
  return (
    <section className="break-case">
      <h2 className="break-case__label">{label}</h2>
      <div className="break-case__stage">
        <div className={width}>
          <TableScroll
            role="region"
            tabIndex={0}
            aria-label="Workspace directory table"
            stickyColumn
            stickyHeader
            style={maxBlockSize ? { maxBlockSize, overflow: "auto" } : undefined}
          >
            <Table resizableColumns={resizable} resizeLabel="Resize column">
              <TableCaption>Workspace directory</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader scope="col">Member</TableHeader>
                  <TableHeader scope="col">Role</TableHeader>
                  <TableHeader scope="col" sortable sortDirection="none" sortLabel="Sort by email">
                    Email
                  </TableHeader>
                  <TableHeader scope="col">Workspaces</TableHeader>
                  <TableHeader scope="col">Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={`${id}-${index}`}>
                    <TableHeader scope="row">{row.name}</TableHeader>
                    <TableCell>{row.role ?? "—"}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.workspaces.toLocaleString("en-US")}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableScroll>
        </div>
      </div>
    </section>
  );
}

export function TableBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Table</h1>
        <p className="break-intro">
          Long and multilingual cells, missing role, one-count plural, empty body and 1,000 rows.
          Narrow tables keep a keyboard-scrollable region; the large collection is bounded to a
          scroll panel rather than extending the page indefinitely.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map(({ label, rows }, index) => (
          <TableCase key={label} label={`Table — ${label}`} rows={rows} id={`table-${index}`} width="break-w-320" />
        ))}
      </div>
      <TableCase label="Table — Worst case — wide container (1100px)" rows={WORST} id="table-wide" width="break-w-1100" resizable />
      <TableCase label="Table — 1,000 rows — wide container (1100px)" rows={MANY} id="table-huge" width="break-w-1100" maxBlockSize="42rem" />
    </div>
  );
}
