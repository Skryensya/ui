/*
 * Diagnostic only, for /debug/progress-break. Renders the REAL `@skryensya/react` Progress once
 * per stress scenario. The page around it adds labels and fixed-width containers and nothing
 * else: no fonts, no token overrides, no simulated themes. A progress bar observed under any of
 * those is a different progress bar.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Progress } from "@skryensya/react/progress";
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

export function ProgressBreak() {
  return (
    <>
      <Group title="Baseline. Every tone">
        <div className="break-stack">
          {TONES.map((tone) => (
            <Progress key={tone} label={`${tone} upload`} max={100} tone={tone} value={62} />
          ))}
        </div>
      </Group>

      <Group title="Numbers">
        <Case label="Exactly 0 and exactly max (the bounds themselves)">
          <div className="break-stack">
            <Progress label="Upload" max={100} value={0} />
            <Progress label="Upload" max={100} value={100} />
          </div>
        </Case>
        <Case label="value past max (140 with max=100) - CATALOG.md's own 'progress bars past their bounds' case">
          <Progress label="Upload" max={100} value={140} />
        </Case>
        <Case label="A negative value (-20)">
          <Progress label="Upload" max={100} value={-20} />
        </Case>
        <Case label="A large, realistic max (a 1,284 MB file, value in MB)">
          <Progress label="Download" max={1284} value={842} />
        </Case>
        <Case label="max=0 (a 0-byte file: already done, or nothing to measure?)" note="progressFraction clamps this to a safe 0% rather than dividing by zero - which reading is correct ('0 of 0 bytes' vs 'upload of an empty file is instantly complete') is a product decision CATALOG.md itself flags under division-by-zero percentages, not something the component can decide on the caller's behalf.">
          <Progress label="Upload" max={0} value={0} />
        </Case>
        <Case label="value is NaN (an upstream computation that divided by zero before reaching here)">
          <Progress label="Upload" max={100} value={Number.NaN} />
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container" note="inline-size is a logical property, so the fill should still grow from the reading-direction start automatically - no separate RTL rule exists in progress.css, which is itself worth confirming rather than assuming.">
          <div dir="rtl" className="break-rtl">
            <Progress label="تحميل" max={100} value={70} />
          </div>
        </Case>
      </Group>
    </>
  );
}
