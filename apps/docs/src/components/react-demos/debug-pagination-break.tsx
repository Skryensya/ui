/*
 * Diagnostic only, for /debug/pagination-break. Renders the REAL `@skryensya/react` Pagination
 * once per stress scenario. The page around it adds labels and fixed-width containers and
 * nothing else: no fonts, no token overrides, no simulated themes. A pager observed under any of
 * those is a different pager.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Pagination } from "@skryensya/react/pagination";
import type { ReactNode } from "react";

const APPEARANCES = ["plain", "tactile", "brutalist", "frosted"] as const;

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

export function PaginationBreak() {
  return (
    <>
      <Group title="Baseline. Every appearance, middle page current">
        <div className="break-stack">
          {APPEARANCES.map((appearance) => (
            <Pagination appearance={appearance} key={appearance} page={5} total={10} />
          ))}
        </div>
      </Group>

      <Group title="Edges">
        <Case label="First page (previous disabled), last page (next disabled)">
          <div className="break-stack">
            <Pagination page={1} total={6} />
            <Pagination page={6} total={6} />
          </div>
        </Case>
        <Case label="Only 1 page (CATALOG.md's own 0/1-item collection case)" note="paginationRange() returns [] for total <= 1 - checking the component renders an empty, inert nav rather than a lone, pointless page-1 button.">
          <Pagination page={1} total={1} />
        </Case>
        <Case label="siblings=0 vs siblings=4, same page/total">
          <div className="break-stack">
            <Pagination page={10} siblings={0} total={20} />
            <Pagination page={10} siblings={4} total={20} />
          </div>
        </Case>
      </Group>

      <Group title="Numbers">
        <Case label="A realistic 1,000+ page result set (CATALOG.md's own 'huge' collection case)" note="Checking the ellipsis collapse still reads cleanly at this scale, not just the small examples everywhere else in the docs use.">
          <Pagination page={842} total={1284} />
        </Case>
        <Case
          label="A non-integer total (12.5 pages) - the realistic version is `total / pageSize` without Math.ceil"
          fixed="flagged, not silently rounded. `warnNonIntegerPaginationProp` (pagination.tsx) now logs a dev console error naming which prop and what to do - the button below still renders 12.5 literally, same as before, since silently coercing the caller's value could just as easily hide a different real bug."
        >
          <Pagination page={10} total={12.5} />
        </Case>
        <Case
          label="A 5-digit total (99,999 pages), current page also 5 digits"
          fixed="the page button was a fixed square (inline-size tied to block-size) with no escape for a wider label; it's now min-inline-size plus inline padding, so the square floor holds for one or two digits and the box grows instead of colliding with its neighbours past that. The two arrow buttons keep their real fixed square - they only ever hold one glyph."
        >
          <Pagination page={54321} total={99999} />
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container" note="Checking the chevrons still point the reading-correct direction (previous toward the start of the line, which is the RIGHT in RTL) rather than staying visually left/right-fixed.">
          <div dir="rtl" className="break-rtl">
            <Pagination page={5} total={10} />
          </div>
        </Case>
      </Group>
    </>
  );
}
