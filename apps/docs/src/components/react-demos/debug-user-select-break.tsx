import { UserSelect, type UserSelectUser } from "@skryensya/react/user-select";

type Scenario = { label: string; users: readonly UserSelectUser[]; selected?: readonly string[] };

const DEMO: readonly UserSelectUser[] = [
  { id: "sophie", name: "Sophie Chen", email: "sophie.chen@example.com" },
  { id: "marcus", name: "Marcus Cole", email: "marcus.cole@example.com" },
  { id: "priya", name: "Priya Shah", email: "priya.shah@example.com" },
];
const WORST: readonly UserSelectUser[] = [
  {
    id: "aleksandra",
    name: "Aleksandra Wiśniewska-Kowalczyk",
    email: "aleksandra.wisniewska-kowalczyk@northwind-industries-holdings.example.com",
  },
  { id: "jo", name: "Jo", email: "jo@acme.com" },
  { id: "dang", name: "Đặng Thị Ngọc Hân", email: "dang.ngoc.han@northwind-industries-holdings.example.com" },
  { id: "nour", name: "نور الهدى عبد الرحمن", email: "nour.abdelrahman@example.com" },
  { id: "wang", name: "王秀英" },
  { id: "disabled", name: "Former workspace owner", email: "former.owner@example.com", disabled: true },
];
const MANY: readonly UserSelectUser[] = Array.from({ length: 1_000 }, (_, index) => {
  const id = String(index + 1).padStart(4, "0");
  return { id: `member-${id}`, name: `Workspace member ${id}`, email: `member.${id}@northwind-industries.example.com` };
});
const SCENARIOS: readonly Scenario[] = [
  { label: "Demo data", users: DEMO, selected: ["sophie", "marcus"] },
  { label: "Worst case", users: WORST, selected: ["aleksandra", "jo", "nour"] },
  { label: "Empty", users: [] },
  { label: "One user", users: [{ id: "jo-only", name: "Jo", email: "jo@acme.com" }], selected: ["jo-only"] },
  { label: "1,000 users", users: MANY, selected: ["member-0001", "member-0002", "member-0003", "member-0004"] },
];

export function UserSelectBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: UserSelect</h1>
        <p className="break-intro">
          Names, email addresses, missing optional email, initials, disabled users, selected-avatar
          overflow, and the full 1,000-member list appear inline at 320px.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <section className="break-case" key={scenario.label}>
            <h2 className="break-case__label">UserSelect — {scenario.label}</h2>
            <div className="break-case__stage">
              <div className="break-w-320">
                <UserSelect
                  id={`users-${index}`}
                  users={scenario.users}
                  defaultValue={scenario.selected}
                  term="members"
                  placeholder="Choose members"
                  searchPlaceholder="Search members"
                  maxAvatars={3}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
