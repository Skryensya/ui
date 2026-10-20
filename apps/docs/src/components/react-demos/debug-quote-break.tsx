/*
 * Diagnostic only, for /debug/quote-break. Renders the REAL `@skryensya/react` Quote once per
 * stress scenario. The page around it adds labels and fixed-width containers and nothing else:
 * no fonts, no token overrides, no simulated themes. A quote observed under those is a different
 * quote.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Avatar } from "@skryensya/react/avatar";
import { Quote } from "@skryensya/react/quote";
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

export function QuoteBreak() {
  return (
    <>
      <Group title="Baseline. Attribution, source, image - every combination that makes a caption">
        <Case label="Neither: no caption at all">
          <Quote>An unattributed passage.</Quote>
        </Case>
        <Case label="Attribution alone">
          <Quote attribution="Ursula K. Le Guin">We will not be free if we do not imagine freedom.</Quote>
        </Case>
        <Case label="Source alone: a work quoted anonymously is still worth naming">
          <Quote source="The Dispossessed">An unattributed passage.</Quote>
        </Case>
        <Case label="Attribution, source and a picture together">
          <Quote
            attribution="Ursula K. Le Guin,"
            image={<Avatar name="Ursula K. Le Guin" />}
            source="A Non-Euclidean View of California"
          >
            We will not be free if we do not imagine freedom.
          </Quote>
        </Case>
        <Case label="A picture alone makes no caption: nothing for it to decorate">
          <Quote image={<Avatar name="Ursula K. Le Guin" />}>An unattributed passage.</Quote>
        </Case>
      </Group>

      <Group title="Content. What a computed attribution or source can come up as">
        <Case
          fixed="omits the caption entirely, same as attribution being absent."
          label="An empty attribution (a computed value with no author found)"
          note='attribution="" used to still pass attribution !== undefined, so an empty figcaption rendered - visible chrome with nothing inside.'
        >
          <Quote attribution="">An unattributed passage, computed.</Quote>
        </Case>
        <Case
          fixed="omits the <cite> entirely, keeping the rest of the caption."
          label="A real attribution with an empty source"
          note='source="" used to still render an empty <cite> beside a real name.'
        >
          <Quote attribution="Someone" source="">
            Words.
          </Quote>
        </Case>
        <Case label="A long attribution and a long source together, pull variant" note="min-inline-size: 0 and flex-wrap on .sk-quote__author let both wrap instead of overflowing.">
          <div className="break-w-320">
            <Quote
              attribution="Dr. Aleksandra Wiśniewska-Kowalczyk,"
              source="Proceedings of the International Conference on Distributed Systems, Volume 14"
              variant="pull"
            >
              The whole system is a single point of failure disguised as redundancy.
            </Quote>
          </div>
        </Case>
      </Group>
    </>
  );
}
