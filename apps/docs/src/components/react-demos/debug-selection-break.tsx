/*
 * Diagnostic only, for /debug/selection-break. Renders the REAL `@skryensya/react` Switch, Radio
 * and RadioGroup once per stress scenario. The page around it adds labels and fixed-width
 * containers and nothing else: no fonts, no token overrides, no simulated themes. A control
 * observed under any of those is a different control.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Radio, RadioGroup, Switch } from "@skryensya/react/selection";
import type { RadioGroupItem } from "@skryensya/react/selection";
import type { ReactNode } from "react";

const APPEARANCES = ["plain", "tactile", "brutalist", "frosted"] as const;

const LABELS = {
  word: "Autosave",
  sentence:
    "Automatically back up every document to the cloud as you type, even on a metered connection.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
  rtl: "حفظ تلقائي للمستندات",
};

const planItems: RadioGroupItem[] = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise", disabled: true },
];

const duplicateValueItems: RadioGroupItem[] = [
  { value: "free", label: "Free (first)" },
  { value: "free", label: "Free (second, same value)" },
  { value: "pro", label: "Pro" },
];

function Case({
  label,
  note,
  broke,
  fixed,
  children,
}: {
  label: string;
  note?: string;
  broke?: string;
  fixed?: string;
  children: ReactNode;
}) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      {note ? <p className="break-case__note">{note}</p> : null}
      {broke ? <p className="break-case__broke">BROKE. {broke}</p> : null}
      {fixed ? <p className="break-case__fixed">WAS BROKEN, NOW {fixed}</p> : null}
      <div className="break-case__stage">{children}</div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="break-group" data-toc-transparent>
      <h2 className="break-group__title">{title}</h2>
      {children}
    </section>
  );
}

export function SelectionBreak() {
  return (
    <>
      <Group title="Switch. Baseline × appearance">
        {APPEARANCES.map((appearance) => (
          <Case key={appearance} label={`appearance="${appearance}": off, on, disabled`}>
            <div className="break-row">
              <Switch appearance={appearance}>{LABELS.word}</Switch>
              <Switch appearance={appearance} defaultChecked>
                {LABELS.word}
              </Switch>
              <Switch appearance={appearance} disabled>
                {LABELS.word}
              </Switch>
            </div>
          </Case>
        ))}
      </Group>

      <Group title="Switch. Content">
        <Case
          label="No children, no aria-label, no aria-labelledby"
          fixed="flagged. `warnMissingSwitchName` now logs a dev console error - the contract's own a11y rule already required one of the three; nothing checked it at runtime. The paint is unchanged: still a nameless, focusable, clickable switch, same posture as Button's and Tag's own authoring-mistake warnings."
        >
          <Switch />
        </Case>
        <Case label="Full sentence, inside a 320px container" note="No white-space:nowrap on .sk-switch, so this should wrap like Checkbox's label does.">
          <div className="break-w-320">
            <Switch defaultChecked>{LABELS.sentence}</Switch>
          </div>
        </Case>
        <Case
          label="Wrapped label, checked (does the track stay aligned to the FIRST line, or drift to the vertical center of all three)"
          note="Same CATALOG.md failure signature as Checkbox's own case: .sk-switch uses align-items: center."
        >
          <div className="break-w-320">
            <Switch defaultChecked>{LABELS.sentence}</Switch>
          </div>
        </Case>
        <Case label="RTL text, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Switch defaultChecked>{LABELS.rtl}</Switch>
          </div>
        </Case>
      </Group>

      <Group title="Radio. One on its own (the matrix-cell shape)">
        <Case label="Named by aria-label, no visible text (a row/column header names it instead)">
          <Radio aria-label="Free plan, row 1" name="matrix-row-1" value="free" />
        </Case>
        <Case label="With visible text, every appearance">
          <div className="break-row">
            {APPEARANCES.map((appearance) => (
              <Radio appearance={appearance} key={appearance} name={`matrix-${appearance}`}>
                {appearance}
              </Radio>
            ))}
          </div>
        </Case>
        <Case label="Long paragraph, inside a 320px container">
          <div className="break-w-320">
            <Radio name="long-label" value="yes">{LABELS.sentence}</Radio>
          </div>
        </Case>
      </Group>

      <Group title="RadioGroup">
        <Case label="Typical group, vertical">
          <RadioGroup items={planItems} label="Plan" name="plan" />
        </Case>
        <Case
          label="Horizontal orientation, many items, inside a 320px container"
          fixed="wraps. The horizontal rule (data-orientation=horizontal) now uses display: flex; flex-wrap: wrap instead of grid-auto-flow: column, the same mechanism CheckboxGroup's own horizontal mode already used. Six items with real labels wrap to a second line inside the 320px column instead of extending the row sideways. [data-spread] stays on grid - a fixed equal-width scale meant to stay on one line, not wrap."
        >
          <div className="break-w-320">
            <RadioGroup
              items={[
                { value: "free", label: "Free" },
                { value: "starter", label: "Starter" },
                { value: "pro", label: "Pro" },
                { value: "team", label: "Team" },
                { value: "business", label: "Business" },
                { value: "enterprise", label: "Enterprise" },
              ]}
              label="Plan"
              name="plan-h"
              orientation="horizontal"
            />
          </div>
        </Case>
        <Case label="Horizontal, spread, inside a 320px container" note="spread forces minmax(0, 1fr) columns instead of max-content, which should contain this one even without a wrap mechanism - checking it actually does.">
          <div className="break-w-320">
            <RadioGroup
              items={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
              ]}
              label="Priority"
              name="priority"
              orientation="horizontal"
              spread
            />
          </div>
        </Case>
        <Case
          label="Two items sharing the same value"
          fixed="flagged. `warnDuplicateItemValues` (shared with CheckboxGroup, selection.tsx) now logs which values collide. The underlying mechanics are unchanged and worse here than on CheckboxGroup: `checked={value === item.value}` marks EVERY item with that value checked at once, which breaks the one guarantee a radio group makes - exactly one selected."
        >
          <RadioGroup items={duplicateValueItems} label="Plan" name="plan-dup" />
        </Case>
        <Case label="Long group label and long item labels, inside a 320px container">
          <div className="break-w-320">
            <RadioGroup
              items={[
                { value: "a", label: LABELS.unbreakable },
                { value: "b", label: "Short" },
              ]}
              label={LABELS.sentence}
              name="plan-long"
            />
          </div>
        </Case>
        <Case label="Disabled group, every item">
          <RadioGroup disabled items={planItems} label="Plan" name="plan-disabled" />
        </Case>
      </Group>
    </>
  );
}
