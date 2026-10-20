/*
 * Diagnostic only, for /debug/badge-break. Renders the REAL `@skryensya/react` Badge family
 * (Badge, BadgeDot, BadgeHolder) once per stress scenario. The page around it adds labels and
 * fixed-width/clipped containers and nothing else: no fonts, no token overrides, no simulated
 * themes. A badge observed under any of those is a different badge.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Badge, BadgeDot, BadgeHolder } from "@skryensya/react/badge";
import { Button } from "@skryensya/react/button";
import { Icon, IconSetProvider } from "@skryensya/react/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import type { ReactNode } from "react";

const TONES = ["neutral", "accent", "success", "warning", "danger"] as const;
const SIZES = ["xs", "sm", "md"] as const;

const LABELS = {
  word: "New",
  typical: "3 new",
  // German compound, 30 chars, no spaces: CATALOG.md's own "labels, titles and copy from data" row.
  longWord: "Benachrichtigungseinstellungen",
  sentence: "Invitation expired 12 days ago",
  rtl: "إشعارات جديدة",
  htmlish: "<b>New</b> & unread",
};

const countNumberFormat = new Intl.NumberFormat("es");
const countPluralRules = new Intl.PluralRules("es");
/** The fixed row's label: a count goes through Intl, never straight into a template string. */
function countLabel(n: number): string {
  const word = countPluralRules.select(n) === "one" ? "nuevo" : "nuevos";
  return `${countNumberFormat.format(n)} ${word}`;
}

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

export function BadgeBreak() {
  return (
    <IconSetProvider set={lucideIcons}>
      <Group title="Baseline. Tone × size">
        {TONES.map((tone) => (
          <Case key={tone} label={`tone="${tone}" × every size`}>
            {SIZES.map((size) => (
              <Badge key={size} tone={tone} size={size}>
                {`${tone}/${size}`}
              </Badge>
            ))}
          </Case>
        ))}
      </Group>

      <Group title="Content length">
        <Case label="One word">
          <Badge>{LABELS.word}</Badge>
        </Case>
        <Case label="Typical count phrase">
          <Badge tone="accent">{LABELS.typical}</Badge>
        </Case>
        <Case
          label="Long unbreakable word, inline"
          fixed="capped. `.sk-badge` had no `overflow-wrap`, `max-inline-size` or `overflow: clip` at all — unlike Button's own root rule, which measured and fixed this exact shape. It now carries the same trio (badge.css's `.sk-badge` base rule): `min-inline-size: 0` + `max-inline-size: 100%` + `overflow: clip`, never an ellipsis (a truncated status word reads as a different, wrong one)."
        >
          <Badge tone="warning">{LABELS.longWord}</Badge>
        </Case>
        <Case
          label="Long unbreakable word, inside a 320px row beside a sibling"
          fixed="contained. The badge now clips at its own share of the row instead of forcing the paragraph's line around it."
        >
          <div className="break-w-320 break-squeeze">
            <p className="break-squeeze__text">Your plan renews soon.</p>
            <Badge tone="warning">{LABELS.longWord}</Badge>
          </div>
        </Case>
        <Case label="Full sentence as badge content, 320px container" fixed="contained. Clips at the column edge instead of scrolling the page.">
          <div className="break-w-320">
            <Badge tone="danger">{LABELS.sentence}</Badge>
          </div>
        </Case>
      </Group>

      <Group title="Counts and pluralization">
        <Case
          label="Caller-owned count formatting, 0 / 1 / 1284"
          note="Badge renders the text it receives. The first row shows an unformatted caller string; the second uses Intl.PluralRules + Intl.NumberFormat."
        >
          <div className="break-row">
            {[0, 1, 1284].map((n) => (
              <Badge key={n} tone="accent">{`${n} nuevos`}</Badge>
            ))}
          </div>
          <div className="break-row">
            {[0, 1, 1284].map((n) => (
              <Badge key={n} tone="accent">
                {countLabel(n)}
              </Badge>
            ))}
          </div>
        </Case>
      </Group>

      <Group title="BadgeHolder — the corner badge">
        <Case label="Short count on an icon button, normal layout">
          <BadgeHolder>
            <Button iconOnly aria-label="Account">
              <Icon name="user" />
            </Button>
            <Badge tone="danger" size="sm">
              3
            </Badge>
          </BadgeHolder>
        </Case>
        <Case
          label="Realistic count, capped at 99+ before it reaches Badge"
          note="Badge stays generic and does not truncate counts: the caller caps the value, so the corner mark stays compact and legible."
        >
          <div className="break-row">
            <BadgeHolder>
              <Button iconOnly aria-label="Account">
                <Icon name="user" />
              </Button>
              <Badge tone="danger" size="sm">
                99+
              </Badge>
            </BadgeHolder>
          </div>
        </Case>
        <Case
          label="Holder inside a rounded, overflow:hidden rail (icon rail, card header)"
          note="Composition constraint, not a Badge defect: the badge intentionally extends beyond its holder, so a clipping ancestor can cut it off. Allow overflow, or round a separate background layer instead of clipping the ancestor's contents."
        >
          <div className="break-clip">
            <BadgeHolder>
              <Button iconOnly aria-label="Settings">
                <Icon name="settings" />
              </Button>
              <Badge tone="danger" size="sm">
                9
              </Badge>
            </BadgeHolder>
          </div>
        </Case>
        <Case
          label="Dot + pulse, same clipped rail"
          note="The ancestor clips the expanding halo too. This is the same composition constraint; the dot itself allows the pulse to expand, but cannot escape an ancestor's clipping boundary."
        >
          <div className="break-clip">
            <BadgeHolder>
              <Button iconOnly aria-label="Account">
                <Icon name="user" />
              </Button>
              <BadgeDot tone="accent" pulse label="New activity" />
            </BadgeHolder>
          </div>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="RTL text, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Badge tone="accent">{LABELS.rtl}</Badge>
          </div>
        </Case>
        <Case label="HTML-looking text and a raw ampersand" note="React text nodes escape by construction; this checks Badge adds no second rendering layer that would un-escape it.">
          <Badge>{LABELS.htmlish}</Badge>
        </Case>
      </Group>

      <Group title="BadgeDot">
        <Case label="Plain, every tone">
          <div className="break-row">
            {TONES.map((tone) => (
              <BadgeDot key={tone} tone={tone} label={`${tone} status`} />
            ))}
          </div>
        </Case>
        <Case label="Pulse, every tone">
          <div className="break-row">
            {TONES.map((tone) => (
              <BadgeDot key={tone} tone={tone} pulse label={`${tone} status, live`} />
            ))}
          </div>
        </Case>
      </Group>
    </IconSetProvider>
  );
}
