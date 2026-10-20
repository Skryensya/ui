/*
 * Diagnostic only, for /debug/accordion-break. Renders the REAL `@skryensya/react` Accordion once
 * per stress scenario. The page around it adds labels and fixed-width containers and nothing
 * else: no fonts, no token overrides, no simulated themes. An accordion observed under any of
 * those is a different accordion.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Accordion } from "@skryensya/react/accordion";
import type { ReactNode } from "react";

const LABELS = {
  sentence: "Set up billing, invite your team, and connect your first integration before go-live.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
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

export function AccordionBreak() {
  return (
    <>
      <Group title="Baseline">
        <Case label="type=single (default), one open at a time">
          <Accordion>
            <Accordion.Item defaultOpen value="a">
              <Accordion.Trigger>Billing</Accordion.Trigger>
              <Accordion.Content>Set up a payment method.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="b">
              <Accordion.Trigger>Team</Accordion.Trigger>
              <Accordion.Content>Invite your team.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Case>
        <Case label="type=multiple, several open at once">
          <Accordion type="multiple">
            <Accordion.Item defaultOpen value="a">
              <Accordion.Trigger>Billing</Accordion.Trigger>
              <Accordion.Content>Set up a payment method.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item defaultOpen value="b">
              <Accordion.Trigger>Team</Accordion.Trigger>
              <Accordion.Content>Invite your team.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Case>
        <Case label="collapsible=false (single), the one open item cannot close itself">
          <Accordion collapsible={false}>
            <Accordion.Item defaultOpen value="a">
              <Accordion.Trigger>Billing</Accordion.Trigger>
              <Accordion.Content>Set up a payment method.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="b">
              <Accordion.Trigger>Team</Accordion.Trigger>
              <Accordion.Content>Invite your team.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Case>
      </Group>

      <Group title="Items">
        <Case
          label="Two items sharing the same value"
          fixed="flagged. warnDuplicateAccordionItemValues (accordion.tsx) now logs a dev console error. Verified against the real component before writing the fix, not assumed: clicking either trigger opens AND closes both together, since the open set is keyed on the shared value string - the exact same class of bug as CheckboxGroup's and RadioGroup's own duplicate-value gap, just reached through JSX children instead of a data array."
        >
          <Accordion>
            <Accordion.Item value="a">
              <Accordion.Trigger>First A</Accordion.Trigger>
              <Accordion.Content>Content one.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="a">
              <Accordion.Trigger>Second A (same value)</Accordion.Trigger>
              <Accordion.Content>Content two.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Case>
        <Case label="Full sentence as the trigger text, inside a 320px container">
          <div className="break-w-320">
            <Accordion>
              <Accordion.Item value="a">
                <Accordion.Trigger>{LABELS.sentence}</Accordion.Trigger>
                <Accordion.Content>Details.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Case>
        <Case label="One unbreakable 52-character string as the trigger text, inside a 320px container">
          <div className="break-w-320">
            <Accordion>
              <Accordion.Item value="a">
                <Accordion.Trigger>{LABELS.unbreakable}</Accordion.Trigger>
                <Accordion.Content>Details.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Case>
        <Case label="Every headingLevel, including out-of-range (0 and 9, clamped to 1..6)" note="clampHeadingLevel (accordion.tsx) already guards this - checking it against the real DOM, not just reading the function.">
          <div className="break-row">
            <Accordion>
              <Accordion.Item value="a">
                <Accordion.Trigger headingLevel={0}>headingLevel=0</Accordion.Trigger>
                <Accordion.Content>Clamped to 1.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
            <Accordion>
              <Accordion.Item value="a">
                <Accordion.Trigger headingLevel={9}>headingLevel=9</Accordion.Trigger>
                <Accordion.Content>Clamped to 6.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Case>
        <Case label="A disabled item beside an enabled one">
          <Accordion>
            <Accordion.Item value="a">
              <Accordion.Trigger>Enabled</Accordion.Trigger>
              <Accordion.Content>Reachable.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item disabled value="b">
              <Accordion.Trigger>Disabled</Accordion.Trigger>
              <Accordion.Content>Not reachable.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Case>
        <Case label="Root disabled, every item">
          <Accordion disabled>
            <Accordion.Item value="a">
              <Accordion.Trigger>Billing</Accordion.Trigger>
              <Accordion.Content>Set up a payment method.</Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="b">
              <Accordion.Trigger>Team</Accordion.Trigger>
              <Accordion.Content>Invite your team.</Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Accordion>
              <Accordion.Item defaultOpen value="a">
                <Accordion.Trigger>الفواتير</Accordion.Trigger>
                <Accordion.Content>إعداد وسيلة الدفع.</Accordion.Content>
              </Accordion.Item>
            </Accordion>
          </div>
        </Case>
      </Group>
    </>
  );
}
