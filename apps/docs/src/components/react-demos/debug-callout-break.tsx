/*
 * Diagnostic only, for /debug/callout-break. Renders the REAL `@skryensya/react` Callout once per
 * stress scenario. The page around it adds labels and fixed-width containers and nothing else: no
 * fonts, no token overrides, no simulated themes. A callout observed under any of those is a
 * different callout.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Callout } from "@skryensya/react/callout";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import type { ReactNode } from "react";

const TONES = ["neutral", "info", "success", "warning", "danger"] as const;
const APPEARANCES = ["plain", "brutalist", "frosted"] as const;

const LABELS = {
  title: "Plan expiring soon",
  sentence:
    "Your workspace has four unresolved invitations waiting on somebody, and the trial period ends in three days.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
  longUrl: "https://example.com/workspaces/acme/billing/invoices/9f8e7d6c5b4a3210?tab=overdue&highlight=true",
  rtl: "انتهت صلاحية الدعوة منذ 12 يومًا",
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

export function CalloutBreak() {
  return (
    <>
      <Group title="Baseline. Every tone × appearance">
        {TONES.map((tone) => (
          <Case key={tone} label={`tone="${tone}"`}>
            <div className="break-stack">
              {APPEARANCES.map((appearance) => (
                <Callout key={appearance} appearance={appearance} icon={<Icon name="info" />} tone={tone} title={LABELS.title}>
                  {LABELS.sentence}
                </Callout>
              ))}
            </div>
          </Case>
        ))}
      </Group>

      <Group title="Content length">
        <Case label="No title, short description">
          <Callout tone="info" icon={<Icon name="info" />}>
            Autosaved a minute ago.
          </Callout>
        </Case>
        <Case label="Full sentence as title (no separate description)">
          <Callout tone="warning" icon={<Icon name="warning" />} title={LABELS.sentence}>
            {LABELS.title}
          </Callout>
        </Case>
        <Case label="One unbreakable 52-character string, inside a 320px container, as title and as description">
          <div className="break-w-320">
            <Callout tone="danger" title={LABELS.unbreakable}>
              {LABELS.unbreakable}
            </Callout>
          </div>
        </Case>
        <Case label="A long unbroken URL in the description, inside a 320px container">
          <div className="break-w-320">
            <Callout tone="neutral" title="Payment failed">
              See the invoice: {LABELS.longUrl}
            </Callout>
          </div>
        </Case>
        <Case label="Icon + long title + long description, inside a 320px container">
          <div className="break-w-320">
            <Callout tone="danger" icon={<Icon name="danger" />} title={LABELS.sentence}>
              {LABELS.sentence}
            </Callout>
          </div>
        </Case>
      </Group>

      <Group title="The icon slot">
        <Case
          label="Oversized icon content (a 96px block, not a system Icon)"
          fixed="clipped. `.sk-callout__icon` had no `overflow: hidden` - the contract restricts the slot to `Icon` (of: Icon), but the React prop type is plain `icon?: ReactNode`, same looseness Button's own `pre`/`post` slots accept. It now clips to the box instead of spilling past it, the same fallback-of-last-resort Avatar's own fixed-size disc already relies on."
        >
          <Callout
            icon={<div style={{ width: "96px", height: "96px", background: "var(--color-border-danger)", borderRadius: "999px" }} />}
            title="Oversized icon"
            tone="danger"
          >
            The icon box is sized for a system Icon; this one is not.
          </Callout>
        </Case>
        <Case label="Icon present, no title (does it align to the description's first line, or float high against a smaller line-height)">
          <Callout icon={<Icon name="success" />} tone="success">
            {LABELS.title}
          </Callout>
        </Case>
      </Group>

      <Group title="Actions">
        <Case label="One Button action, neutral and danger tone">
          <div className="break-stack">
            <Callout actions={<Button size="sm" tone="neutral" variant="soft">Review</Button>} title={LABELS.title} tone="warning">
              {LABELS.sentence}
            </Callout>
            <Callout actions={<Button size="sm" tone="danger" variant="soft">Delete workspace</Button>} title="Workspace will be deleted" tone="danger">
              {LABELS.sentence}
            </Callout>
          </div>
        </Case>
        <Case label="Several actions, wrapping, inside a 320px container">
          <div className="break-w-320">
            <Callout
              actions={
                <>
                  <Button size="sm" tone="neutral" variant="soft">Dismiss for now</Button>
                  <Button size="sm" tone="danger" variant="soft">Cancel subscription</Button>
                  <Button size="sm" tone="neutral" variant="ghost">Learn more</Button>
                </>
              }
              title={LABELS.title}
              tone="warning"
            >
              {LABELS.sentence}
            </Callout>
          </div>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL text, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Callout icon={<Icon name="warning" />} tone="warning" title={LABELS.rtl}>
              {LABELS.rtl}
            </Callout>
          </div>
        </Case>
        <Case label="Brutalist, every tone" note="Does the hard offset still read as the tone's own color, or does the black edge dominate it?">
          <div className="break-row">
            {TONES.map((tone) => (
              <Callout key={tone} appearance="brutalist" tone={tone}>
                {`${tone}`}
              </Callout>
            ))}
          </div>
        </Case>
      </Group>

      <Group title="Accessibility: the live region itself">
        <Case
          label="Danger mounts with role=alert + aria-live=assertive already in the initial markup"
          note="Not visible in a screenshot, and not something this harness can prove either way: several screen reader / browser combinations only announce a LIVE REGION'S CHANGES after it exists, not content already present when the node is first inserted. A Callout that mounts fresh (an inline form error appearing after submit) may render correctly and announce nothing. Toast (content.ts) shares this exact mechanism - worth checking there too. Inferred from the pattern, not verified with a real screen reader."
        >
          <Callout tone="danger" title="Something went wrong">
            {LABELS.sentence}
          </Callout>
        </Case>
      </Group>
    </>
  );
}
