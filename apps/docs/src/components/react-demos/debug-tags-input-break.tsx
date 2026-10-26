import { TagsInput } from "@skryensya/react/tags-input";

type Scenario = { label: string; tags: string[]; max?: number };

const SCENARIOS: readonly Scenario[] = [
  { label: "Demo data", tags: ["frontend", "design", "accessibility"] },
  {
    label: "Worst case",
    tags: [
      "international-billing-reconciliation",
      "security-notifications",
      "Đặng Thị Ngọc Hân",
      "王秀英",
      "مرحبا-بالعالم",
      "customer-operations",
      "platform-infrastructure",
      "finanzas",
    ],
    max: 12,
  },
  { label: "Empty", tags: [] },
  { label: "One tag", tags: ["Jo"] },
  {
    label: "At the 12-tag cap",
    max: 12,
    tags: [
      "billing",
      "security",
      "operations",
      "accessibility",
      "international-team",
      "customer-success",
      "finance",
      "platform",
      "design-systems",
      "incident-response",
      "compliance",
      "documentation",
    ],
  },
];

function Field({ scenario, id }: { scenario: Scenario; id: string }) {
  return (
    <TagsInput
      id={id}
      label="Workspace tags"
      placeholder="Add a tag"
      defaultValue={scenario.tags}
      max={scenario.max}
      removeLabel="Remove tag"
    />
  );
}

export function TagsInputBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: TagsInput</h1>
        <p className="break-intro">
          User-entered tags at 320px: multilingual and long values, no values, one value, and a field
          filled to its explicit 12-tag cap. Type and press Enter to exercise the commit boundary.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <section className="break-case" key={scenario.label}>
            <h2 className="break-case__label">TagsInput - {scenario.label}</h2>
            <div className="break-case__stage">
              <div className="break-w-320"><Field scenario={scenario} id={`tags-${index}`} /></div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
