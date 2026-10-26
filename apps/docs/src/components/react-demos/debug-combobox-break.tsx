import type { ReactNode } from "react";
import { Combobox } from "@skryensya/react/combobox";
import { countries, slug } from "../../demos/data/countries";

type Item = { value: string; label: string; description?: string };
type Scenario = {
  label: string;
  items: readonly Item[];
  selected?: string | readonly string[];
  multiple?: boolean;
  max?: number;
};

const DEMO = countries.en.slice(0, 20).map((label) => ({ value: slug(label), label }));
const LONG_LABEL = "United Kingdom of Great Britain and Northern Ireland";
const WORST = countries.en.map((name) => ({
  value: slug(name),
  label: name === "United Kingdom" ? LONG_LABEL : name,
  ...(name === "United Kingdom" ? { description: "ISO 3166-1 alpha-2 · GB" } : {}),
}));
// Single-select is Combobox's own identity - type to filter, the chosen label sits as TEXT in the
// field, same as the host `<input>` it enhances. These scenarios never set `multiple`, so the
// break page cannot be mistaken for TagsInput's chip-based one.
const SCENARIOS: readonly Scenario[] = [
  { label: "Demo data - 20 countries", items: DEMO, selected: DEMO[2]?.value },
  {
    label: "Worst case - full source list, long selected label",
    items: WORST,
    selected: "united-kingdom",
  },
  { label: "Empty", items: [] },
  { label: "One option", items: [{ value: "united-states", label: "United States" }], selected: "united-states" },
];
// `multiple` is its own worst case (removable Tags above the input instead of a chosen label
// inside it) and is kept apart from the SCENARIOS above so the two layouts are never confused.
const MULTIPLE_SCENARIO: Scenario = {
  label: "Multiple selection - three Tags",
  items: WORST,
  selected: ["united-kingdom", "democratic-republic-of-the-congo", "saint-vincent-and-the-grenadines"],
  multiple: true,
};
// `max` at its own limit: every unselected option disables and the placeholder drops, so there is
// nothing inviting a search that could not go anywhere.
const MAX_SCENARIO: Scenario = {
  label: "Multiple selection - max 3, already at the limit",
  items: WORST,
  selected: ["united-kingdom", "democratic-republic-of-the-congo", "saint-vincent-and-the-grenadines"],
  multiple: true,
  max: 3,
};

function Case({ label, width, children }: { label: string; width: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h2 className="break-case__label">{label}</h2>
      <div className="break-case__stage"><div className={width}>{children}</div></div>
    </section>
  );
}

function Field({ scenario, id }: { scenario: Scenario; id: string }) {
  return (
    <Combobox
      key={id}
      defaultValue={scenario.selected}
      hint="Write to filter. Use the arrows to scroll."
      items={scenario.items}
      label="Country"
      max={scenario.max}
      multiple={scenario.multiple}
      placeholder="Search country"
    />
  );
}

export function ComboboxBreak() {
  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Combobox</h1>
        <p className="break-intro">
          All four single-select scenarios are visible inline at 320px: Combobox picks ONE value
          and shows it as text in the field. Multiple selection (removable Tags above the input) is
          its own scenario below, at the regular and widest supported container widths.
        </p>
      </header>
      <div className="break-scenario-grid">
        {SCENARIOS.map((scenario, index) => (
          <Case key={scenario.label} label={`Combobox - ${scenario.label}`} width="break-w-320">
            <Field scenario={scenario} id={`combobox-${index}-320`} />
          </Case>
        ))}
      </div>
      {[{ label: "Regular demo width (18rem)", width: "break-w-18rem" }, { label: "Wide container (1100px)", width: "break-w-1100" }].map(({ label, width }) => (
        <Case key={label} label={`Combobox - ${MULTIPLE_SCENARIO.label} - ${label}`} width={width}>
          <Field scenario={MULTIPLE_SCENARIO} id={`combobox-worst-${width}`} />
        </Case>
      ))}
      <Case label={`Combobox - ${MAX_SCENARIO.label}`} width="break-w-18rem">
        <Field scenario={MAX_SCENARIO} id="combobox-max" />
      </Case>
    </div>
  );
}
