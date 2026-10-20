/*
 * Diagnostic only, for /debug/description-list-break. Renders the REAL `@skryensya/react`
 * DescriptionList/DescriptionItem once per stress scenario. The page around it adds labels and
 * fixed-width containers and nothing else: no fonts, no token overrides, no simulated themes. A
 * list observed under those is a different list.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { DescriptionItem, DescriptionList } from "@skryensya/react/description-list";
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

export function DescriptionListBreak() {
  return (
    <>
      <Group title="Baseline. Layout × dividers × density">
        <Case label="Stacked, the default">
          <DescriptionList>
            <DescriptionItem term="Order">#4821</DescriptionItem>
            <DescriptionItem term="Placed">10 March 2026</DescriptionItem>
            <DescriptionItem term="Status">Shipped</DescriptionItem>
          </DescriptionList>
        </Case>
        <Case label="Columns, dividers, compact density, all together">
          <DescriptionList density="compact" dividers layout="columns">
            <DescriptionItem term="Order">#4821</DescriptionItem>
            <DescriptionItem term="Placed">10 March 2026</DescriptionItem>
            <DescriptionItem term="Status">Shipped</DescriptionItem>
          </DescriptionList>
        </Case>
      </Group>

      <Group title="Container width, not viewport width">
        <Case label="Columns at a wide width: side by side">
          <div className="break-w-1100">
            <DescriptionList layout="columns">
              <DescriptionItem term="Order">#4821</DescriptionItem>
              <DescriptionItem term="Status">Shipped</DescriptionItem>
            </DescriptionList>
          </div>
        </Case>
        <Case
          fixed="falls back to stacked: the breakpoint is now @container (decision 35), not the viewport."
          label="Columns inside a 220px rail - the viewport this page runs at is nowhere near narrow"
          note="A term column at a fixed --sk-description-list-term-size (10rem) cannot shrink; the fallback to stacked used to read @media, the window's width, not this rail's. A sidebar's own DescriptionList never fell back just because the WINDOW was wide."
        >
          <div className="break-w-220">
            <DescriptionList layout="columns">
              <DescriptionItem term="Order">#4821</DescriptionItem>
              <DescriptionItem term="Placed">10 March 2026</DescriptionItem>
              <DescriptionItem term="Status">Shipped</DescriptionItem>
            </DescriptionList>
          </div>
        </Case>
      </Group>

      <Group title="Content. What a real value can run as long as">
        <Case label="A long value in stacked layout - wraps, no term column to share with">
          <div className="break-w-320">
            <DescriptionList>
              <DescriptionItem term="Shipping address">
                4821 Northwind Industries Holdings Boulevard, Suite 1284, Unit B
              </DescriptionItem>
            </DescriptionList>
          </div>
        </Case>
        <Case label="A long value in columns at 320px - the fallback (fixed above) is what makes this wrap instead of overflow">
          <div className="break-w-320">
            <DescriptionList layout="columns">
              <DescriptionItem term="Shipping address">
                4821 Northwind Industries Holdings Boulevard, Suite 1284, Unit B
              </DescriptionItem>
            </DescriptionList>
          </div>
        </Case>
        <Case label="Markup in the value, plain text in the name">
          <DescriptionList>
            <DescriptionItem term="Tracking">
              <a href="https://example.org/t/4821">4821</a>
            </DescriptionItem>
          </DescriptionList>
        </Case>
      </Group>
    </>
  );
}
