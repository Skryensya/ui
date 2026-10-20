/*
 * Diagnostic only, for /debug/tag-break. Renders the REAL `@skryensya/react` Tag family (its three
 * signatures: inert/removable `<span>`, navigable `<a>`, and the new `<button>` toggle) once per
 * stress scenario. The page around it adds labels and fixed-width containers and nothing else: no
 * fonts, no token overrides, no simulated themes. A tag observed under any of those is a different
 * tag.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Tag } from "@skryensya/react/tag";
import type { ReactNode } from "react";

const LABELS = {
  empty: "",
  word: "Design",
  typical: "Frontend",
  sentence: "Invitation expired 12 days ago",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
  longGerman: "Benachrichtigungseinstellungen",
  emojiAlone: "🎉",
  emojiMixed: "Design 🎉",
  rtl: "تصميم",
  mixed: "Design في Google Drive",
  diacritics: "Hiển thị Ẩn Giấy tờ सहेजें",
  htmlish: "<b>Design</b> & more",
};

const countNumberFormat = new Intl.NumberFormat("es");
const countPluralRules = new Intl.PluralRules("es");
function resultsLabel(n: number): string {
  const word = countPluralRules.select(n) === "one" ? "resultado" : "resultados";
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

export function TagBreak() {
  return (
    <>
      <Group title="Baseline. The three shapes">
        <Case label="Inert (no removable, no href, no selected)">
          <Tag>{LABELS.word}</Tag>
        </Case>
        <Case label="Removable">
          <Tag removable removeLabel={`Remove ${LABELS.word}`}>
            {LABELS.word}
          </Tag>
        </Case>
        <Case label="Link">
          <Tag href="/topics/design">{LABELS.word}</Tag>
        </Case>
        <Case label="Toggle, off and on">
          <div className="break-row">
            <Tag selected={false}>{LABELS.word}</Tag>
            <Tag selected tone="accent">
              {LABELS.typical}
            </Tag>
          </div>
        </Case>
        <Case label="tone × appearance, every shape">
          <div className="break-row">
            <Tag tone="accent" appearance="brutalist">
              {LABELS.word}
            </Tag>
            <Tag tone="accent" appearance="brutalist" href="/x">
              {LABELS.word}
            </Tag>
            <Tag tone="accent" appearance="brutalist" selected>
              {LABELS.word}
            </Tag>
          </div>
        </Case>
      </Group>

      <Group title="Content length">
        <Case label="Empty string children, every shape" fixed="React now logs a `renders nothing` error in dev, on all three shapes (`warnEmptyTag`, mirroring Button's own `warnEmptyButton`). The paint is unchanged: this is an authoring bug, not a CSS one, so the three empty tags below still look exactly like this - a focusable, clickable blank control on the link and toggle shapes, with no `aria-label` escape hatch like an icon-only Button has.">
          <div className="break-row">
            <Tag>{LABELS.empty}</Tag>
            <Tag href="/x">{LABELS.empty}</Tag>
            <Tag selected>{LABELS.empty}</Tag>
          </div>
        </Case>
        <Case label="One word, one unbreakable 52-character string">
          <div className="break-row">
            <Tag>{LABELS.word}</Tag>
            <Tag>{LABELS.unbreakable}</Tag>
          </div>
        </Case>
        <Case label="Full sentence, every shape">
          <div className="break-row">
            <Tag removable removeLabel="Remove">
              {LABELS.sentence}
            </Tag>
            <Tag href="/x">{LABELS.sentence}</Tag>
            <Tag selected>{LABELS.sentence}</Tag>
          </div>
        </Case>
        <Case label="Full sentence, inside a 320px container, every shape">
          <div className="break-w-320 break-row">
            <Tag removable removeLabel="Remove">
              {LABELS.sentence}
            </Tag>
            <Tag selected tone="accent">
              {LABELS.sentence}
            </Tag>
          </div>
        </Case>
        <Case label="Unbreakable string, inside a 320px container, every shape">
          <div className="break-w-320 break-row">
            <Tag removable removeLabel="Remove">
              {LABELS.unbreakable}
            </Tag>
            <Tag href="/x">{LABELS.unbreakable}</Tag>
          </div>
        </Case>
        <Case label="Squeezed by a flex sibling, 320px" note="The paragraph takes flex:1; the tag is a plain flex item next to it, same shape as the squeeze case button.css's own fix was measured against.">
          <div className="break-w-320 break-squeeze">
            <p className="break-squeeze__text">Your workspace still has four unresolved invitations.</p>
            <Tag removable removeLabel="Remove" tone="accent">
              {LABELS.longGerman}
            </Tag>
          </div>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="Emoji alone, emoji mixed into text">
          <div className="break-row">
            <Tag>{LABELS.emojiAlone}</Tag>
            <Tag selected>{LABELS.emojiMixed}</Tag>
          </div>
        </Case>
        <Case label="RTL text, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Tag removable removeLabel="أزل التصميم">
              {LABELS.rtl}
            </Tag>
            <Tag href="/x" tone="accent">
              {LABELS.rtl}
            </Tag>
          </div>
        </Case>
        <Case label="Mixed-direction text (LTR product name inside an RTL label)">
          <div dir="rtl" className="break-rtl">
            <Tag selected>{LABELS.mixed}</Tag>
          </div>
        </Case>
        <Case label="Stacked diacritics and tall scripts, every shape">
          <div className="break-row">
            <Tag>{LABELS.diacritics}</Tag>
            <Tag href="/x">{LABELS.diacritics}</Tag>
            <Tag selected>{LABELS.diacritics}</Tag>
          </div>
        </Case>
        <Case label="HTML-looking text and a raw ampersand" note="React text nodes escape by construction; checks Tag adds no second rendering layer that would un-escape it.">
          <Tag>{LABELS.htmlish}</Tag>
        </Case>
      </Group>

      <Group title="A row of many tags (the collection, not the tag)">
        <Case label="Twelve short tags, 320px container" note="CATALOG.md's own 'tag rows that wrap into a wall' case: does the row wrap onto new lines, or run off the edge?">
          <div className="break-w-320 break-row">
            {["design", "frontend", "q3", "urgent", "needs-review", "backend", "a11y", "perf", "docs", "security", "ci", "release"].map((label) => (
              <Tag key={label}>{label}</Tag>
            ))}
          </div>
        </Case>
        <Case label="One tag much wider than the rest, 320px container">
          <div className="break-w-320 break-row">
            <Tag>design</Tag>
            <Tag>customer-feedback-from-enterprise-onboarding</Tag>
            <Tag>q3</Tag>
          </div>
        </Case>
      </Group>

      <Group title="Counts baked into the label">
        <Case
          label="Hardcoded plural / no thousands separator, 0 / 1 / 1284"
          note="Not a Tag bug — Tag renders whatever string it's given — same caller mistake already flagged on Button and Badge, surfacing here too since a result count is a realistic tag label."
          broke="naive `${n} resultados` reads “1 resultados” at n=1, no separator at n=1284."
          fixed="the row below it, same three counts, via Intl.PluralRules + Intl.NumberFormat."
        >
          <div className="break-row">
            {[0, 1, 1284].map((n) => (
              <Tag key={n}>{`${n} resultados`}</Tag>
            ))}
          </div>
          <div className="break-row">
            {[0, 1, 1284].map((n) => (
              <Tag key={n}>{resultsLabel(n)}</Tag>
            ))}
          </div>
        </Case>
      </Group>

      <Group title="States">
        <Case label="Disabled, removable: the chip and the remove button together">
          <Tag disabled removable removeLabel="Remove">
            {LABELS.word}
          </Tag>
        </Case>
        <Case label="Disabled beside enabled, removable">
          <div className="break-row">
            <Tag removable removeLabel="Remove">
              {LABELS.word}
            </Tag>
            <Tag disabled removable removeLabel="Remove">
              {LABELS.word}
            </Tag>
          </div>
        </Case>
        <Case label="Disabled toggle, selected and unselected">
          <div className="break-row">
            <Tag disabled selected={false}>
              {LABELS.word}
            </Tag>
            <Tag disabled selected tone="accent">
              {LABELS.typical}
            </Tag>
          </div>
        </Case>
        <Case label="Disabled, brutalist appearance" note="Does the hard black offset still read as unavailable, or does the strong edge make it look pressable?">
          <Tag disabled removable removeLabel="Remove" appearance="brutalist">
            {LABELS.word}
          </Tag>
        </Case>
      </Group>
    </>
  );
}
