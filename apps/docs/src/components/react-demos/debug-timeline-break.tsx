/*
 * Diagnostic only, for /debug/timeline-break. Renders the REAL `@skryensya/react` Timeline once
 * per stress scenario. The page around it adds labels and fixed-width containers and nothing
 * else: no fonts, no token overrides, no simulated themes. A timeline observed under those is a
 * different timeline.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Icon } from "@skryensya/react/icon";
import { Timeline, TimelineItem } from "@skryensya/react/timeline";
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

export function TimelineBreak() {
  return (
    <>
      <Group title="Baseline. Machine time, visible label, an icon, a tone">
        <Case label="Both halves of the time, a detail line">
          <Timeline>
            <TimelineItem heading="Pedido entregado" time="2026-03-14" timeLabel="14 mar 2026">
              Firmado por L. Ortiz.
            </TimelineItem>
            <TimelineItem heading="En reparto" time="2026-03-12" timeLabel="12 mar 2026" />
          </Timeline>
        </Case>
        <Case label="An icon in the dot, and a tone">
          <Timeline>
            <TimelineItem heading="Pago rechazado" icon={<Icon name="close" />} tone="danger" />
            <TimelineItem heading="Pedido confirmado" icon={<Icon name="success" />} tone="success" />
          </Timeline>
        </Case>
      </Group>

      <Group title="Content. What a computed time or detail can come up as">
        <Case
          fixed="omits the <time> entirely, same as neither half being given."
          label="An empty timeLabel (a relative-time formatter with nothing to say yet)"
          note='timeLabel="" used to still warrant an empty <time>, with no datetime and nothing to read.'
        >
          <Timeline>
            <TimelineItem heading="Evento reciente" timeLabel="" />
          </Timeline>
        </Case>
        <Case label="A machine time alone, label empty - still keeps the element" note="Correct: the datetime alone is still a reason for <time> to exist; only the visible half is empty.">
          <Timeline>
            <TimelineItem heading="Solo máquina" time="2026-03-14" timeLabel="" />
          </Timeline>
        </Case>
        <Case
          fixed="omits the detail element entirely, same as children being absent."
          label="An empty detail (children='')"
        >
          <Timeline>
            <TimelineItem heading="Pedido entregado">{""}</TimelineItem>
          </Timeline>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container" note="Verified: the marker rail sits at inline-start (right in RTL), and the events keep their top-to-bottom order.">
          <div dir="rtl">
            <Timeline aria-label="سجل الطلب">
              <TimelineItem heading="تم تسليم الطلب" time="2026-03-14" timeLabel="١٤ مارس ٢٠٢٦">
                وقّع على الاستلام.
              </TimelineItem>
              <TimelineItem heading="خرج للتوصيل" time="2026-03-12" timeLabel="١٢ مارس ٢٠٢٦" />
              <TimelineItem heading="تم تأكيد الطلب" time="2026-03-10" timeLabel="١٠ مارس ٢٠٢٦" />
            </Timeline>
          </div>
        </Case>
      </Group>

      <Group title="The rail, by its container, not the window">
        <Case
          fixed="the rail now narrows (1.75rem) because the fallback is @container (decision 35), not @media."
          label="A narrow sidebar (320px) on this otherwise wide page"
          note="This page's own viewport is nowhere near 30rem; the rail used to stay at its full 2.5rem gutter here regardless, because the breakpoint read the window, not this container."
        >
          <div className="break-w-320">
            <Timeline>
              <TimelineItem heading="Pedido entregado" time="2026-03-14" timeLabel="14 mar 2026" />
              <TimelineItem heading="En reparto" time="2026-03-12" timeLabel="12 mar 2026" />
              <TimelineItem heading="Pedido confirmado" time="2026-03-10" timeLabel="10 mar 2026" />
            </Timeline>
          </div>
        </Case>
      </Group>
    </>
  );
}
