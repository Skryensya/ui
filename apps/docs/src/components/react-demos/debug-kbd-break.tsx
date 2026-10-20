/*
 * Diagnostic only, for /debug/kbd-break. Renders the REAL `@skryensya/react` Kbd once per stress
 * scenario. The page around it adds labels and fixed-width containers and nothing else: no fonts,
 * no token overrides, no simulated themes. A key observed under any of those is a different key.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Kbd } from "@skryensya/react/kbd";
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

export function KbdBreak() {
  return (
    <>
      <Group title="Baseline. Tone × appearance, one glyph and a multi-glyph legend">
        <Case label="A single letter, every tone × appearance">
          <div className="break-row">
            <Kbd>K</Kbd>
            <Kbd tone="accent">K</Kbd>
            <Kbd appearance="brutalist">K</Kbd>
            <Kbd appearance="brutalist" tone="accent">K</Kbd>
          </div>
        </Case>
        <Case label="A multi-glyph legend ('Esc'), which gets the padding a single key does not need">
          <div className="break-row">
            <Kbd>Esc</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>Tab</Kbd>
          </div>
        </Case>
        <Case label="Pressed, reflecting a real key held down" note="data-pressed is written by whoever is watching the keyboard, not by Kbd itself.">
          <div className="break-row">
            <Kbd data-pressed="">K</Kbd>
            <Kbd data-pressed="" tone="accent">K</Kbd>
          </div>
        </Case>
      </Group>

      <Group title="Icon legends. The text stays for semantics, the glyph is drawn">
        <Case label="Every recognized spelling of the same key">
          <div className="break-row">
            <Kbd>↑</Kbd>
            <Kbd>ArrowUp</Kbd>
            <Kbd>up</Kbd>
            <Kbd>Enter</Kbd>
            <Kbd>return</Kbd>
            <Kbd>↵</Kbd>
          </div>
        </Case>
        <Case label="A combo the icon map does not know (by design: combos stay text)" note="Shift+↑ does not match any single-key spelling, so it falls back to plain text rather than drawing a half-matched icon.">
          <Kbd>Shift+↑</Kbd>
        </Case>
      </Group>

      <Group title="Content. What a computed legend can come up as">
        <Case
          fixed="warns in dev (console.error): the keycap still renders at its full square size, with nothing to announce."
          label="An empty legend (a platform-specific shortcut absent on this OS)"
          note='A ⌘ key computed for macOS and shown unconditionally on Windows would render Kbd with children=""; nothing told anyone before this.'
        >
          <Kbd>{""}</Kbd>
        </Case>
        <Case label="A long legend ('PageDown') next to a short one, same baseline">
          <div className="break-row">
            <Kbd>K</Kbd>
            <Kbd>PageDown</Kbd>
          </div>
        </Case>
      </Group>
    </>
  );
}
