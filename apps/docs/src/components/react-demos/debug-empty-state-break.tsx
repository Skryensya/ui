/*
 * Diagnostic only, for /debug/empty-state-break. Renders the REAL `@skryensya/react` EmptyState
 * once per stress scenario. The page around it adds labels and fixed-width containers and
 * nothing else: no fonts, no token overrides, no simulated themes. A state observed under any of
 * those is a different state.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { EmptyState } from "@skryensya/react/empty-state";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import type { ReactNode } from "react";

const LABELS = {
  title: "No results found",
  sentence: "Try a different search term, or clear your filters to see every item in this workspace.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
  rtl: "لا توجد نتائج",
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

export function EmptyStateBreak() {
  return (
    <>
      <Group title="Baseline">
        <Case label="Title only">
          <EmptyState title={LABELS.title} />
        </Case>
        <Case label="Icon + title + description + one action">
          <EmptyState
            actions={<Button tone="accent" variant="soft">Clear filters</Button>}
            description="Try a different search term, or clear your filters."
            icon={<Icon name="search" />}
            title={LABELS.title}
          />
        </Case>
        <Case label="Every heading level renders the right element (checked via the DOM, not just visually)">
          <div className="break-row">
            {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((level) => (
              <EmptyState headingElement={level} key={level} title={`As ${level}`} />
            ))}
          </div>
        </Case>
      </Group>

      <Group title="The icon slot">
        <Case
          label="Oversized icon content (a 96px block, not a system Icon), inside a 320px container"
          fixed="clipped. `.sk-empty-state__icon` is a fixed-size box - the contract restricts this slot to a system Icon, but the React prop (icon?: ReactNode) is looser, same gap Callout's own icon slot had and was already fixed for. It now clips to the box instead of spilling past it."
        >
          <div className="break-w-320">
            <EmptyState
              icon={<div style={{ width: "96px", height: "96px", background: "var(--color-border-danger)", borderRadius: "999px" }} />}
              title="Oversized icon"
            />
          </div>
        </Case>
      </Group>

      <Group title="Content length">
        <Case
          label="One unbreakable 52-character string as the title, inside a 320px container"
          fixed="contained. The title had no overflow-wrap and no min-inline-size:0 - a plain grid item's automatic minimum is its own content width, so a long unbroken word pushed the whole section wider than its 320px container instead of breaking. It now wraps mid-word rather than overflowing."
        >
          <div className="break-w-320">
            <EmptyState title={LABELS.unbreakable} />
          </div>
        </Case>
        <Case label="Full sentence as description, inside a 320px container, same fix" fixed="contained, same overflow-wrap + min-inline-size:0 added to the description.">
          <div className="break-w-320">
            <EmptyState description={LABELS.sentence} title={LABELS.title} />
          </div>
        </Case>
        <Case label="Several actions, wrapping, inside a 320px container">
          <div className="break-w-320">
            <EmptyState
              actions={
                <>
                  <Button tone="accent" variant="soft">Clear filters</Button>
                  <Button tone="neutral" variant="ghost">Go back</Button>
                </>
              }
              title={LABELS.title}
            />
          </div>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <EmptyState description="جرّب كلمة بحث مختلفة." icon={<Icon name="search" />} title={LABELS.rtl} />
          </div>
        </Case>
      </Group>
    </>
  );
}
