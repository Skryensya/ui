/*
 * Diagnostic only, for /debug/rating-break. Renders the REAL `@skryensya/react` Rating and
 * RatingDisplay (Zag-backed input, pure-CSS display) once per stress scenario. The page around it
 * adds labels and nothing else: no fonts, no token overrides, no simulated themes. A rating
 * observed under any of those is a different rating.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Rating, RatingDisplay } from "@skryensya/react/rating";
import type { ReactNode } from "react";

const SIZES = ["sm", "md", "lg"] as const;

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

export function RatingBreak() {
  return (
    <>
      <Group title="Baseline. Every symbol size, input and display">
        {SIZES.map((symbolSize) => (
          <Case key={symbolSize} label={`symbolSize="${symbolSize}"`}>
            <div className="break-row">
              <Rating defaultValue={3} label="Score" name={`score-${symbolSize}`} symbolSize={symbolSize} />
              <RatingDisplay label="4.3 out of 5" symbolSize={symbolSize} value={4.3} valueText="4.3" />
            </div>
          </Case>
        ))}
      </Group>

      <Group title="Numbers">
        <Case label="At the bounds themselves: 0 and max">
          <div className="break-row">
            <Rating defaultValue={0} label="Unrated" name="unrated" />
            <Rating defaultValue={5} label="Perfect" name="perfect" />
          </div>
        </Case>
        <Case
          label="Fractional defaultValue on the INPUT (3.5), where the contract says whole steps only"
          note="Verified against the real Zag machine before assuming anything: the strip does NOT render blank - it rounds (3.5 shows 4 stars checked). What actually disagrees is the hidden form field, which still carries the raw 3.5."
          fixed="flagged. warnNonIntegerRatingValue (rating.tsx) now logs a dev console error naming the value and what it does - the strip still rounds and the hidden input still submits 3.5 verbatim, same posture as Pagination's own non-integer warning (named, not silently rewritten)."
        >
          <Rating defaultValue={3.5} label="Fractional seed" name="fractional" />
        </Case>
        <Case label="RatingDisplay value past max (7.8 with max=5) and negative (-2)" note="--sk-rating-fill is already clamp(0px, …, 100%) in rating.css - checking that holds for both directions, which it should by construction.">
          <div className="break-row">
            <RatingDisplay label="7.8 out of 5" value={7.8} valueText="7.8" />
            <RatingDisplay label="-2 out of 5" value={-2} valueText="-2" />
          </div>
        </Case>
        <Case label="A realistic average with a count: 4.3 out of 5, 1,284 reviews">
          <RatingDisplay count="1,284 reviews" label="4.3 out of 5, 1,284 reviews" value={4.3} valueText="4.3" />
        </Case>
      </Group>

      <Group title="States">
        <Case label="Disabled vs enabled, same value">
          <div className="break-row">
            <Rating defaultValue={3} label="Enabled" name="enabled" />
            <Rating defaultValue={3} disabled label="Disabled" name="disabled" />
          </div>
        </Case>
        <Case label="Read-only (shows the value, refuses to change it - not the same as disabled)">
          <Rating defaultValue={4} label="Read-only" name="readonly" readOnly />
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container" fixed="the input follows inherited direction in Zag; the display fill now grows from the inline start.">
          <div dir="rtl" className="break-rtl">
            <Rating defaultValue={3} label="التقييم" name="rtl-rating" />
            <RatingDisplay label="٤.٣ من ٥" value={4.3} valueText="٤.٣" />
          </div>
        </Case>
      </Group>
    </>
  );
}
