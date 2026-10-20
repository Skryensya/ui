/*
 * Diagnostic only, for /debug/stat-break. Renders the REAL `@skryensya/react` Stat once per
 * stress scenario. The page around it adds labels and nothing else: no fonts, no token overrides,
 * no simulated themes. A stat observed under those is a different stat.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Stat } from "@skryensya/react/stat";
import type { ReactNode } from "react";

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

export function StatBreak() {
  return (
    <>
      <Group title="Baseline. Plain text, trend, no animation">
        <Case label="A plain text value (the default static path)">
          <Stat label="Users" value="3,914" />
        </Case>
        <Case label="A change chip, colored by trend, not by sign">
          <Stat change="▼ 2.3%" label="Churn" trend="up" value="0.9%" />
        </Case>
      </Group>

      <Group title="A plain numeric value - no separate count - the documented React path">
        <Case
          fixed='renders "82%": formatting now turns on because the value itself is numeric, not because a separate count was also given.'
          label="suffix on a plain numeric value, static"
          note='<Stat value={82} suffix="%" /> with no count used to render a bare "82" - the suffix prop was silently inert unless a second, redundant count prop repeated the same number.'
        >
          <Stat animate={false} label="Usage" suffix="%" value={82} />
        </Case>
        <Case
          fixed='both the sizer and the ticking value carry the suffix.'
          label="suffix on a plain numeric value, animated"
        >
          <Stat animate={{ duration: 0, whenVisible: false }} label="Usage" suffix="%" value={82} />
        </Case>
        <Case label="locale and fractionDigits on a plain numeric value">
          <Stat animate={false} fractionDigits={1} label="Conversion" locale="es" suffix="%" value={3.6} />
        </Case>
        <Case label="A non-numeric value stays static even with animate on" note="Correct: formatting and the count-up both require a numeric metric, and this one deliberately is not.">
          <Stat animate label="Ingresos" value="48.200 €" />
        </Case>
      </Group>

      <Group title="The authored-text path. A pre-formatted value string plus the raw count beside it" >
        <Case label="count drives the animation; the authored string is the value it lands on" note="This is the vanilla/usage-tree shape count exists for, and it is unchanged by the fix above.">
          <Stat
            animate={{ duration: 0, whenVisible: false }}
            count={48200}
            format={(n) => `${n} €`}
            label="Ingresos"
            value="48.200 €"
          />
        </Case>
      </Group>
    </>
  );
}
