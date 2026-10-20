import { Listbox } from "@skryensya/react/listbox";
import type { ListboxItem } from "@skryensya/core/listbox";

const DEMO: ListboxItem[] = [
  { value: "list", label: "List", defaultSelected: true },
  { value: "board", label: "Board" },
  { value: "calendar", label: "Calendar" },
  { value: "timeline", label: "Timeline" },
];
const WORST: ListboxItem[] = [
  { value: "design", label: "Design systems and international product infrastructure", defaultSelected: true },
  { value: "billing", label: "Paramètres de confidentialité et de sécurité" },
  { value: "legal", label: "Legal and compliance — records retention" },
  { value: "cjk", label: "王秀英 · 产品团队" },
  { value: "disabled", label: "Archived workspace (read only)", disabled: true },
  { value: "literal", label: "Literal text: <script>alert(1)</script> &amp; **bold**" },
];
const HUNDRED: ListboxItem[] = Array.from({ length: 1000 }, (_, i) => ({
  value: `workspace-${i + 1}`,
  label: `Workspace ${i + 1} — ${i % 2 ? "Design review" : "International billing"}`,
  ...(i === 0 ? { defaultSelected: true } : {}),
}));
const SCENARIOS = [
  { label: "Demo", items: DEMO },
  { label: "Worst case", items: WORST },
  { label: "Empty", items: [] },
  { label: "One", items: [DEMO[0]] },
  { label: "1,000 items", items: HUNDRED },
] as const;

export function ListboxBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header><h1>break: Listbox</h1><p className="break-intro">Long translated options, disabled and selected states, empty and single-item lists, plus 1,000 choices.</p></header>
      <div className="break-scenario-grid">
        {SCENARIOS.map(({ label, items }) => (
          <section className="break-case" key={label}>
            <h2 className="break-case__label">Listbox — {label}</h2>
            <div className="break-case__stage">
              <div className={label === "1,000 items" ? "break-listbox-viewport" : "break-w-320"}>
                <Listbox label={`Workspace view — ${label}`} items={items} selectionMode="multiple" />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
