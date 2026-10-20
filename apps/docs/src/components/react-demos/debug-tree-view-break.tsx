import { TreeView } from "@skryensya/react/tree-view";
import type { TreeNode } from "@skryensya/core/tree-view";

type Scenario = {
  label: string;
  nodes: readonly TreeNode[];
  expanded?: string[];
  selected?: string[];
};

const DEMO: readonly TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "components", label: "components", children: [{ id: "button", label: "button.tsx" }, { id: "input", label: "input.tsx" }] },
      { id: "index", label: "index.ts" },
    ],
  },
  { id: "readme", label: "README.md" },
];
const WORST: readonly TreeNode[] = [
  {
    id: "northwind",
    label: "Northwind Holdings — international billing and security workspace",
    children: [
      {
        id: "finance",
        label: "Finance and account operations",
        children: [
          { id: "invoice", label: "Q3 consolidated invoice — final approved by Finance and Legal.pdf" },
          { id: "short", label: "Jo" },
          { id: "dang", label: "Đặng Thị Ngọc Hân — billing contact history.csv" },
          { id: "arabic", label: "نور الهدى عبد الرحمن — account-notes.md" },
          { id: "disabled", label: "Archived workspace", disabled: true },
        ],
      },
    ],
  },
  { id: "chinese", label: "王秀英 — 国际账单与安全通知" },
];
const MANY: readonly TreeNode[] = [
  {
    id: "archive",
    label: "Workspace archive",
    children: Array.from({ length: 1_000 }, (_, index) => {
      const number = String(index + 1).padStart(4, "0");
      return { id: `archive-${number}`, label: `Workspace archive item ${number}.json` };
    }),
  },
];
const SCENARIOS: readonly Scenario[] = [
  { label: "Demo data", nodes: DEMO, expanded: ["src", "components"], selected: ["button"] },
  { label: "Worst case", nodes: WORST, expanded: ["northwind", "finance"], selected: ["invoice"] },
  { label: "Empty", nodes: [] },
  { label: "One node", nodes: [{ id: "only", label: "Jo" }], selected: ["only"] },
];

export function TreeViewBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: TreeView</h1>
        <p className="break-intro">
          Long multilingual node labels, deep nesting, disabled and selected nodes, empty and single
          trees, plus 1,000 children. The large tree is clipped to a scrollable region.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <section className="break-case" key={scenario.label}>
            <h2 className="break-case__label">TreeView — {scenario.label}</h2>
            <div className="break-case__stage">
              <div className="break-w-320">
                <TreeView
                  id={`tree-${index}`}
                  label="Workspace files"
                  nodes={scenario.nodes}
                  defaultExpandedValue={scenario.expanded}
                  defaultSelectedValue={scenario.selected}
                  selectionMode="multiple"
                  wrap
                />
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="break-case">
        <h2 className="break-case__label">TreeView — 1,000 leaves — wide container (1100px)</h2>
        <div className="break-case__stage">
          <div className="break-tree-viewport break-w-1100">
            <TreeView id="tree-huge" label="Workspace archive" nodes={MANY} defaultExpandedValue={["archive"]} wrap />
          </div>
        </div>
      </section>
    </div>
  );
}
