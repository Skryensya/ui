/*
 * Diagnostic only, for /debug/checkbox-break. Renders the REAL `@skryensya/react` Checkbox and
 * CheckboxGroup once per stress scenario. The page around it adds labels and fixed-width
 * containers and nothing else: no fonts, no token overrides, no simulated themes. A checkbox
 * observed under any of those is a different checkbox.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Checkbox, CheckboxGroup, type CheckboxGroupItem } from "@skryensya/react/selection";
import type { ReactNode } from "react";

const APPEARANCES = ["plain", "tactile", "brutalist", "frosted"] as const;

const LABELS = {
  word: "Design",
  typical: "Email me about product updates",
  sentence:
    "I have read and agree to the Terms of Service, the Privacy Policy, and the Acceptable Use Policy for this workspace.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
  rtl: "أوافق على شروط الخدمة",
  diacritics: "Hiển thị Ẩn Giấy tờ सहेजें",
  emoji: "I agree 🎉 to the terms",
};

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

const manyItems: CheckboxGroupItem[] = [
  { label: "Design", value: "design" },
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "QA", value: "qa", disabled: true },
];

const duplicateValueItems: CheckboxGroupItem[] = [
  { label: "Design (first)", value: "design" },
  { label: "Design (second, same value)", value: "design" },
  { label: "Frontend", value: "frontend" },
];

export function CheckboxBreak() {
  return (
    <>
      <Group title="Baseline. Every state × every appearance">
        {APPEARANCES.map((appearance) => (
          <Case key={appearance} label={`appearance="${appearance}": unchecked, checked, indeterminate`}>
            <div className="break-row">
              <Checkbox appearance={appearance}>{LABELS.word}</Checkbox>
              <Checkbox appearance={appearance} defaultChecked>
                {LABELS.word}
              </Checkbox>
              <Checkbox appearance={appearance} defaultIndeterminate>
                {LABELS.word}
              </Checkbox>
            </div>
          </Case>
        ))}
        <Case label="No label at all (the select-all-in-a-table-header shape)">
          <Checkbox aria-label="Select all" />
        </Case>
      </Group>

      <Group title="Content length">
        <Case label="Typical label">
          <Checkbox>{LABELS.typical}</Checkbox>
        </Case>
        <Case label="Full sentence, inside a 320px container" note="No white-space:nowrap on the label, so this should wrap rather than overflow or scroll - checking it actually does.">
          <div className="break-w-320">
            <Checkbox>{LABELS.sentence}</Checkbox>
          </div>
        </Case>
        <Case label="One unbreakable 52-character string, inside a 320px container">
          <div className="break-w-320">
            <Checkbox>{LABELS.unbreakable}</Checkbox>
          </div>
        </Case>
        <Case
          label="Wrapped label, checked (does the box stay aligned to the FIRST line, or drift to the vertical center of all three)"
          note="The control aligns to the label's first line, even when the text wraps."
        >
          <div className="break-w-320">
            <Checkbox defaultChecked>{LABELS.sentence}</Checkbox>
          </div>
        </Case>
        <Case
          label="Label containing a real link (a genuine 'accept terms' checkbox - Checkbox's own contract lists accept-terms as an intent)"
          note="The link and the checkbox are both inside one <label>. Clicking the link text should navigate; does it ALSO toggle the checkbox, the classic native <label> gotcha?"
        >
          <Checkbox>
            I agree to the <a href="/terms">Terms of Service</a>
          </Checkbox>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL text, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Checkbox defaultChecked>{LABELS.rtl}</Checkbox>
          </div>
        </Case>
        <Case label="Stacked diacritics and tall scripts">
          <Checkbox>{LABELS.diacritics}</Checkbox>
        </Case>
        <Case label="Emoji mixed into text">
          <Checkbox>{LABELS.emoji}</Checkbox>
        </Case>
        <Case label="Empty string children" note="`children` is optional and falsy-checked (`children ? <span>…</span> : null`); an empty string takes the SAME branch as no label at all - same shape as the no-label case above, not a separate bug, but worth confirming it does not render a hollow, zero-height label span instead.">
          <Checkbox>{""}</Checkbox>
        </Case>
      </Group>

      <Group title="CheckboxGroup">
        <Case label="Typical group, vertical">
          <CheckboxGroup label="Team" name="team" items={manyItems} />
        </Case>
        <Case label="Horizontal orientation, 320px container, many items" note="CATALOG.md's 'tag rows that wrap into a wall' case, applied to checkboxes: does the row wrap cleanly?">
          <div className="break-w-320">
            <CheckboxGroup
              label="Teams"
              name="teams-h"
              orientation="horizontal"
              items={[
                { label: "Design", value: "design" },
                { label: "Frontend", value: "frontend" },
                { label: "Backend", value: "backend" },
                { label: "Accessibility", value: "a11y" },
                { label: "Infrastructure", value: "infra" },
                { label: "Documentation", value: "docs" },
              ]}
            />
          </div>
        </Case>
        <Case
          label="Two items sharing the same value"
          fixed="flagged. The underlying mechanics are unchanged - checking one still visually checks both, since the group's own selection state is a Set keyed by value, and that's a correct reading of two items that share one value, not a rendering bug - but `warnDuplicateItemValues` now logs which values collide, in dev, the same posture as Button's and Tag's own authoring-mistake warnings."
        >
          <CheckboxGroup label="Topics" name="topics-dup" items={duplicateValueItems} />
        </Case>
        <Case label="Empty items array (the 0-item collection case)">
          <CheckboxGroup label="Topics" name="topics-empty" items={[]} />
        </Case>
        <Case
          label="Every eligible item disabled, one of them checked"
          note="groupState() excludes disabled items from 'eligible' entirely, so the parent reads unchecked even though a disabled child is visibly checked. Deliberate per the code's own comment ('a disabled box nobody can reach is not a vote') - a decision, not a bug, but worth seeing: the parent box and a checked-but-disabled child disagree on screen."
        >
          <CheckboxGroup
            label="Locked topics"
            name="topics-locked"
            items={[
              { label: "Design", value: "design", disabled: true, defaultChecked: true },
              { label: "Frontend", value: "frontend", disabled: true },
            ]}
          />
        </Case>
        <Case label="Long parent label and long item labels, 320px container">
          <div className="break-w-320">
            <CheckboxGroup
              label={LABELS.sentence}
              name="topics-long"
              items={[
                { label: LABELS.unbreakable, value: "a" },
                { label: "Short", value: "b" },
              ]}
            />
          </div>
        </Case>
      </Group>

      <Group title="States">
        <Case label="Disabled, every check state">
          <div className="break-row">
            <Checkbox disabled>{LABELS.word}</Checkbox>
            <Checkbox disabled defaultChecked>
              {LABELS.word}
            </Checkbox>
            <Checkbox disabled defaultIndeterminate>
              {LABELS.word}
            </Checkbox>
          </div>
        </Case>
        <Case label="Disabled beside enabled, same appearance" note="Does disabled read as clearly unavailable next to an identical enabled box, for every appearance - brutalist's hard black edge in particular?">
          <div className="break-row">
            <Checkbox appearance="brutalist" defaultChecked>
              {LABELS.word}
            </Checkbox>
            <Checkbox appearance="brutalist" defaultChecked disabled>
              {LABELS.word}
            </Checkbox>
          </div>
        </Case>
      </Group>
    </>
  );
}
