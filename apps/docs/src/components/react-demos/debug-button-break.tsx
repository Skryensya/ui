/*
 * Diagnostic only, for /debug/button-break. Renders the REAL `@skryensya/react` Button once per
 * stress scenario. The page around it adds labels and fixed-width containers and nothing else: no
 * fonts, no token overrides, no simulated themes. A button observed under any of those is a
 * different button.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Button } from "@skryensya/react/button";
import { ButtonGroup } from "@skryensya/react/button-group";
import { Icon, IconSetProvider } from "@skryensya/react/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import type { ReactNode } from "react";

const VARIANTS = ["solid", "soft", "ghost"] as const;
const TONES = ["neutral", "accent", "danger"] as const;
const SIZES = ["xs", "sm", "md", "lg"] as const;

const LABELS = {
  empty: "",
  word: "Save",
  typical: "Save changes",
  sentences:
    "Save your changes now. This overwrites the previous draft, and the draft cannot be recovered afterwards.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
  emojiAlone: "🎉",
  emojiMixed: "Save 🎉 now",
  rtl: "احفظ التغييرات",
  mixed: "احفظ إلى Google Drive الآن",
  diacritics: "Hiển thị Ẩn Giấy tờ सहेजें",
  htmlish: "<b>Save</b> now & continue",
  newline: "Line one\nLine two",
};

const countPluralRules = new Intl.PluralRules("es");
const countNumberFormat = new Intl.NumberFormat("es");
/** The fixed row's label: a count goes through Intl, never straight into a template string. */
function deleteLabel(n: number): string {
  const word = countPluralRules.select(n) === "one" ? "elemento" : "elementos";
  return `Eliminar ${countNumberFormat.format(n)} ${word}`;
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

export function ButtonBreak() {
  return (
    <IconSetProvider set={lucideIcons}>
      <Group title="Baseline. Variant × tone, size md">
        {VARIANTS.map((variant) => (
          <Case key={variant} label={`variant="${variant}" × every tone`}>
            {TONES.map((tone) => (
              <Button key={tone} variant={variant} tone={tone}>
                {`${variant}/${tone}`}
              </Button>
            ))}
          </Case>
        ))}
      </Group>

      <Group title="Baseline. Sizes">
        <Case label="plain label, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              {`size ${size}`}
            </Button>
          ))}
        </Case>
        <Case label="pre icon + label, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size} pre={<Icon name="download" />}>
              {`size ${size}`}
            </Button>
          ))}
        </Case>
        <Case label="iconOnly, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size} iconOnly aria-label={`Settings, ${size}`}>
              <Icon name="settings" />
            </Button>
          ))}
        </Case>
        <Case label="pre + label + post, xs → lg">
          {SIZES.map((size) => (
            <Button key={size} size={size} pre={<Icon name="upload" />} post={<Icon name="chevron-down" />}>
              {`size ${size}`}
            </Button>
          ))}
        </Case>
      </Group>

      <Group title="Content length">
        <Case label="Empty string children" fixed="React now logs a `renders nothing` error in dev and the vanilla enhancer throws. It also carries the same dashed danger outline an unlabelled iconOnly button gets (`[data-sk-a11y-warn]`, dev-only): the console error alone left the empty button pixel-identical to a real one right beside it.">
          <Button>{LABELS.empty}</Button>
          <Button variant="ghost">{LABELS.empty}</Button>
        </Case>
        <Case label="One word">
          <Button>{LABELS.word}</Button>
        </Case>
        <Case label="Typical content">
          <Button>{LABELS.typical}</Button>
        </Case>
        <Case label="Several sentences">
          <Button>{LABELS.sentences}</Button>
        </Case>
        <Case label="One unbreakable 52-character string">
          <Button>{LABELS.unbreakable}</Button>
        </Case>
        <Case label="Several sentences, inside a 320px container" fixed="contained. The label clips at the container edge instead of the button leaving it.">
          <div className="break-w-320">
            <Button>{LABELS.sentences}</Button>
          </div>
        </Case>
        <Case label="Unbreakable string, inside a 320px container" fixed="contained.">
          <div className="break-w-320">
            <Button>{LABELS.unbreakable}</Button>
          </div>
        </Case>
        <Case label="Long label with pre and post icons, 320px container" fixed="contained. The post chevron is clipped with the label rather than landing outside the column.">
          <div className="break-w-320">
            <Button pre={<Icon name="upload" />} post={<Icon name="chevron-down" />}>
              {LABELS.sentences}
            </Button>
          </div>
        </Case>
      </Group>

      <Group title="Content shape">
        <Case label="Emoji alone">
          <Button>{LABELS.emojiAlone}</Button>
          <Button size="xs">{LABELS.emojiAlone}</Button>
          <Button size="lg">{LABELS.emojiAlone}</Button>
        </Case>
        <Case label="Emoji mixed into text">
          <Button>{LABELS.emojiMixed}</Button>
          <Button pre={<Icon name="download" />}>{LABELS.emojiMixed}</Button>
        </Case>
        <Case label="RTL text, dir=rtl on the container">
          <div dir="rtl" className="break-rtl">
            <Button pre={<Icon name="download" />} post={<Icon name="chevron-right" />}>
              {LABELS.rtl}
            </Button>
            <Button variant="soft" tone="danger">
              {LABELS.rtl}
            </Button>
          </div>
        </Case>
        <Case label="Mixed-direction text (LTR product name inside an RTL label)">
          <div dir="rtl" className="break-rtl">
            <Button pre={<Icon name="upload" />}>{LABELS.mixed}</Button>
          </div>
        </Case>
        <Case label="Stacked diacritics and tall scripts" fixed="cleared. `xs` had no leading (`line-height: 1`) and not enough slack to make up for it; it now gets `--scale-line-height-snug` of its own (button.css's data-size=xs rule).">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              {LABELS.diacritics}
            </Button>
          ))}
        </Case>
      </Group>

      <Group title="Container">
        <Case label="320px container, two buttons in a row">
          <div className="break-w-320 break-row">
            <Button variant="ghost">Cancel</Button>
            <Button tone="accent">Save changes</Button>
          </div>
        </Case>
        <Case
          label="Squeezed by a flex sibling"
          note="The paragraph takes flex:1; the button is a plain flex item with no flex-shrink of its own."
        >
          <div className="break-w-320 break-squeeze">
            <p className="break-squeeze__text">
              Your workspace still has four unresolved invitations waiting on somebody.
            </p>
            <Button tone="accent">Review invitations</Button>
          </div>
        </Case>
        <Case label="Stretch column (align-items default, 320px grid cell)">
          <div className="break-w-320 break-stretch">
            <Button tone="accent">Save changes</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Case>
        <Case label="Very wide container (1100px), single button">
          <div className="break-w-1100">
            <Button tone="accent">Save changes</Button>
          </div>
        </Case>
        <Case label="Very wide container (1100px), stretch column">
          <div className="break-w-1100 break-stretch">
            <Button tone="accent">Save changes</Button>
          </div>
        </Case>
      </Group>

      <Group title="State">
        <Case label="disabled, every variant (neutral)">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {`${variant} disabled`}
            </Button>
          ))}
        </Case>
        <Case
          label="disabled, every variant (accent)"
          fixed="all four now paint the disabled tokens."
        >
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} tone="accent" disabled>
              {`${variant} disabled`}
            </Button>
          ))}
        </Case>
        <Case
          label="disabled, every variant (danger)"
          fixed="all four now paint the disabled tokens."
        >
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} tone="danger" disabled>
              {`${variant} disabled`}
            </Button>
          ))}
        </Case>
        <Case
          label="disabled beside enabled, solid danger"
          fixed="the two are now clearly different."
        >
          <div className="break-row">
            <Button tone="danger">Delete project</Button>
            <Button tone="danger" disabled>
              Delete project
            </Button>
          </div>
        </Case>
        <Case label="pressed=true, every variant × tone">
          {VARIANTS.map((variant) => (
            <div key={variant} className="break-row">
              {TONES.map((tone) => (
                <Button key={tone} variant={variant} tone={tone} pressed>
                  {`${variant}/${tone} on`}
                </Button>
              ))}
            </div>
          ))}
        </Case>
        <Case label="pressed=false beside pressed=true (same variant × tone)">
          {TONES.map((tone) => (
            <div key={tone} className="break-row">
              <Button tone={tone} pressed={false}>{`${tone} off`}</Button>
              <Button tone={tone} pressed>{`${tone} on`}</Button>
              <Button variant="ghost" tone={tone} pressed={false}>{`ghost ${tone} off`}</Button>
              <Button variant="ghost" tone={tone} pressed>{`ghost ${tone} on`}</Button>
            </div>
          ))}
        </Case>
        <Case label="ButtonGroup pair, every variant">
          {VARIANTS.map((variant) => (
            <ButtonGroup key={variant} data-press-scale-note={variant}>
              <Button variant={variant}>
                {`${variant} primary`}
              </Button>
              <Button variant={variant} iconOnly aria-label={`More ${variant} options`}>
                <Icon name="chevron-down" />
              </Button>
            </ButtonGroup>
          ))}
        </Case>
        <Case label="href anchor (Button.navigation), every variant">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} href="/components/button" post={<Icon name="external-link" />}>
              {`${variant} link`}
            </Button>
          ))}
        </Case>
        <Case label="Long label, disabled + pressed, 320px container" fixed="contained. This was the grid-column case that `max-inline-size` alone could not reach; `min-inline-size: 0` is what closed it.">
          <div className="break-w-320 break-stretch">
            <Button disabled>{LABELS.sentences}</Button>
            <Button pressed>{LABELS.unbreakable}</Button>
          </div>
        </Case>
        <Case label="ButtonGroup pair, disabled" note="Does the seam (the one shared border column) still read as one control once disabled fades both halves?">
          <ButtonGroup>
            <Button disabled>
              Save
            </Button>
            <Button iconOnly aria-label="More options" disabled>
              <Icon name="chevron-down" />
            </Button>
          </ButtonGroup>
        </Case>
        <Case label="ButtonGroup pair, long label in a 320px container">
          <div className="break-w-320">
            <ButtonGroup>
              <Button tone="accent">
                {LABELS.sentences}
              </Button>
              <Button iconOnly aria-label="More options" tone="accent">
                <Icon name="chevron-down" />
              </Button>
            </ButtonGroup>
          </div>
        </Case>
      </Group>

      <Group title="Loading">
        <Case
          label="Short label"
          fixed="inline. The spinner used to float over the label with `visibility: hidden` on the label underneath - which never reached `Save`, since plain text has no element of its own to hide. The label sat fully visible right under the spinner. It now takes the `pre` icon's own place instead, in flow, and the label keeps showing beside it."
        >
          <Button loading>Save</Button>
        </Case>
        <Case label="Long label" note="No `loadingText` given, so the label keeps showing beside the spinner; the button still holds the width the label gives it, same as before, just for a different reason now (real content, not an invisible one).">
          <Button loading>{LABELS.sentences}</Button>
        </Case>
        <Case label="Long label, with loadingText" note="`loadingText` replaces the label while loading; the button is free to reflow to the shorter phrase, since its content genuinely changed.">
          <Button loading loadingText="Guardando…">
            {LABELS.sentences}
          </Button>
        </Case>
        <Case
          label="iconOnly"
          fixed="the spinner now takes the icon's own place instead of sitting beside it in a square with no room for both (button.css's `[data-icon-only]` rule)."
        >
          <Button loading iconOnly aria-label="Uploading">
            <Icon name="upload" />
          </Button>
        </Case>
        <Case
          label="Every size, spinner scaled to match"
          fixed="the spinner used to be pinned at one size (`sm`) regardless of the button's own, reading undersized on `md`/`lg` and oversized on `xs` - the actual 'se ve raro' this group started from. It now scales off `data-size` like every other icon in button.css."
        >
          {SIZES.map((size) => (
            <Button key={size} size={size} loading>
              {`size ${size}`}
            </Button>
          ))}
        </Case>
        <Case
          label="Grouped pair, one half loading"
          note="Two Buttons in a ButtonGroup, not a Menu: nothing couples the two halves, so the button beside a loading action stays fully clickable. Disabling the alternatives while the action runs is the author's call."
        >
          <ButtonGroup>
            <Button loading>
              Save
            </Button>
            <Button iconOnly aria-label="More options">
              <Icon name="chevron-down" />
            </Button>
          </ButtonGroup>
        </Case>
      </Group>

      <Group title="Accessible name (not in the first pass)">
        <Case label="iconOnly with NO aria-label or aria-labelledby" fixed="flagged. Dev console still logs the `<Button iconOnly> has no accessible name` error, and now the button itself carries a dashed danger outline (`[data-sk-a11y-warn]`, dev-only, button.tsx + button.css) instead of sitting pixel-identical to every correctly-labelled button around it.">
          <Button iconOnly>
            <Icon name="settings" />
          </Button>
        </Case>
      </Group>

      <Group title="Escaping and whitespace (not in the first pass)">
        <Case label="HTML-looking text and a raw ampersand" note="React text nodes escape by construction; this checks Button adds no second rendering layer (dangerouslySetInnerHTML, a markdown pass) that would un-escape it.">
          <Button>{LABELS.htmlish}</Button>
        </Case>
        <Case label="Embedded newline" note="white-space: nowrap collapses it to a space rather than wrapping or being dropped — checking that holds with an embedded \\n specifically, not just a long run-on sentence.">
          <Button>{LABELS.newline}</Button>
        </Case>
      </Group>

      <Group title="Count baked into the label (not in the first pass)">
        <Case
          label="Hardcoded plural / no thousands separator, 0 / 1 / 1284"
          note="Not a Button bug — Button renders whatever string it's given — but this is where the classic caller bug (Intl.PluralRules, CATALOG.md) actually surfaces, since a count baked into a button's label is one of the most common real call sites for it."
          broke="the naive row's `Eliminar ${n} elementos` reads “Eliminar 1 elementos” at n=1 and “Eliminar 1284 elementos” with no separator at n=1284."
          fixed="the row below it, same three counts, built with Intl.PluralRules + Intl.NumberFormat instead of string interpolation."
        >
          <div className="break-row">
            {[0, 1, 1284].map((n) => (
              <Button key={n} tone="danger">{`Eliminar ${n} elementos`}</Button>
            ))}
          </div>
          <div className="break-row">
            {[0, 1, 1284].map((n) => (
              <Button key={n} tone="danger">
                {deleteLabel(n)}
              </Button>
            ))}
          </div>
        </Case>
      </Group>
    </IconSetProvider>
  );
}
