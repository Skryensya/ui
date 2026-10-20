/*
 * Diagnostic only, for /debug/separator-break. Renders the REAL `@skryensya/react` Separator
 * family (Separator, LabelledSeparator) once per stress scenario. The page around it adds labels
 * and fixed-width containers and nothing else: no fonts, no token overrides, no simulated themes.
 * A separator observed under any of those is a different separator.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { LabelledSeparator, Separator } from "@skryensya/react/separator";
import type { ReactNode } from "react";

const TONES = ["subtle", "default", "strong"] as const;
const SPACINGS = ["none", "sm", "md", "lg"] as const;

const LABELS = {
  word: "or",
  typical: "since 2019",
  // A realistic computed label: metadata nobody wrote by hand, which can run long.
  computed: "Imported from Google Contacts on March 3rd, 2019",
  rtl: "أو",
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
  /** What visibly broke in this scenario, written after the look. The page reads as the report. */
  broke?: string;
  /** A scenario that broke and has since been fixed, so the page shows the before as well as the after. */
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

export function SeparatorBreak() {
  return (
    <>
      <Group title="Baseline. Tone × spacing, horizontal">
        <Case label="Every tone">
          <div className="break-w-320">
            {TONES.map((tone) => (
              <Separator key={tone} tone={tone} />
            ))}
          </div>
        </Case>
        <Case label="Every spacing">
          <div className="break-w-320">
            {SPACINGS.map((spacing) => (
              <Separator key={spacing} spacing={spacing} />
            ))}
          </div>
        </Case>
        <Case label="Decorative: out of the accessibility tree">
          <Separator decorative />
        </Case>
      </Group>

      <Group title="Vertical. Takes its height from whatever holds it">
        <Case label="Inside a row with a defined height" note="Correct: the row gives it something to stretch to.">
          <div style={{ display: "flex", height: 48 }}>
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
        </Case>
        <Case
          label="Inside a row with NO defined height"
          note="Already documented in separator.ts's own comment: a separator has no content of its own to give it a height. Not fixed here - it is the row's job to have one."
        >
          <div style={{ display: "flex" }}>
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
        </Case>
      </Group>

      <Group title="LabelledSeparator. The word between the rules">
        <Case label="A short word">
          <div className="break-w-320">
            <LabelledSeparator>{LABELS.word}</LabelledSeparator>
          </div>
        </Case>
        <Case label="RTL">
          <div className="break-w-320" dir="rtl">
            <LabelledSeparator>{LABELS.rtl}</LabelledSeparator>
          </div>
        </Case>
        <Case
          fixed='renders one continuous rule with no text gap and omits aria-labelledby, falling back to the nameless "separator" role instead of an explicit, empty one.'
          label="An empty label (a computed value that came up blank)"
          note='children="" used to wire aria-labelledby to a textless span: an explicit, empty accessible name, worse than no label at all.'
        >
          <div className="break-w-320">
            <LabelledSeparator>{""}</LabelledSeparator>
          </div>
        </Case>
        <Case
          label="A long, realistic computed label in a 320px container"
          fixed="the one-line label now ellipsizes instead of overflowing; its full text remains the accessible name."
        >
          <div className="break-w-320">
            <LabelledSeparator>{LABELS.computed}</LabelledSeparator>
          </div>
        </Case>
      </Group>
    </>
  );
}
