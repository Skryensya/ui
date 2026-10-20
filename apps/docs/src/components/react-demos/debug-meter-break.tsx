/*
 * Diagnostic only, for /debug/meter-break. Renders the REAL `@skryensya/react` Meter once per
 * stress scenario. The page around it adds labels and fixed-width containers and nothing else: no
 * fonts, no token overrides, no simulated themes. A meter observed under any of those is a
 * different meter.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Meter } from "@skryensya/react/meter";
import type { ReactNode } from "react";

const TONES = ["accent", "success", "warning", "danger"] as const;

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

export function MeterBreak() {
  return (
    <>
      <Group title="Baseline. Every tone">
        <div className="break-stack">
          {TONES.map((tone) => (
            <Meter key={tone} label={`${tone} usage`} max={100} min={0} tone={tone} value={62} valueText="62%" />
          ))}
        </div>
      </Group>

      <Group title="Numbers">
        <Case label="Exactly 0 and exactly 100 (the bounds themselves)">
          <div className="break-stack">
            <Meter label="Disk usage" value={0} valueText="0%" />
            <Meter label="Disk usage" value={100} valueText="100%" />
          </div>
        </Case>
        <Case label="A non-zero min, temperature-style scale (-10..40)">
          <Meter label="Temperature" max={40} min={-10} tone="warning" value={15} valueText="15°C" />
        </Case>
        <Case
          label="value past max (142 with max=100) - CATALOG.md's own 'progress bars and meters past their bounds' case"
          fixed="flagged. The bar was already correctly clamped to 100% (meterFraction, shared with Progress/Slider/Chart) - what was missing is that aria-valuenow still announced 142 verbatim, outside [aria-valuemin, aria-valuemax], which is invalid per the ARIA meter role whether or not the paint agrees. warnMeterRange (meter.tsx) now flags it in dev; the announced value is left as the caller supplied it, same posture as Pagination's non-integer warning - not silently rewritten."
        >
          <Meter label="Storage" value={142} valueText="142%" />
        </Case>
        <Case label="A negative value (-5 with min=0)">
          <Meter label="Battery" value={-5} valueText="-5%" />
        </Case>
        <Case
          label="An inverted range (min=100, max=0)"
          fixed="flagged by the same warnMeterRange check - meterFraction already guarded it (returns 0 rather than crashing or dividing by zero), but nothing said the range itself was nonsensical."
        >
          <Meter label="Misconfigured" max={0} min={100} value={50} />
        </Case>
      </Group>

      <Group title="Content length">
        <Case
          label="Long label and long valueText together, inside a 320px container"
          fixed="contained. `.sk-meter-group__label` had `overflow: hidden; text-overflow: ellipsis` but no `min-inline-size: 0` - the same gap Button's own root rule once had (button.css's own WHY comment on it): without it, a flex item's automatic minimum is its content width, so the label never actually got narrow enough to need the ellipsis, and the header overflowed its container instead. It now ellipsizes properly."
        >
          <div className="break-w-320">
            <Meter
              label="Workspace storage used across every connected device and shared drive"
              max={100}
              min={0}
              value={81}
              valueText="81% (12.4 GB of 15.3 GB)"
            />
          </div>
        </Case>
        <Case label="No valueText at all (optional per WAI, not required)">
          <Meter label="CPU load" value={34} />
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Meter label="استخدام القرص" value={70} valueText="٧٠٪" />
          </div>
        </Case>
      </Group>
    </>
  );
}
