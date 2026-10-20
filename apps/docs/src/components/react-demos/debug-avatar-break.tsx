/*
 * Diagnostic only, for /debug/avatar-break. Renders the REAL `@skryensya/react` Avatar family
 * (Avatar, AvatarGroup) once per stress scenario. The page around it adds labels and fixed-width
 * containers and nothing else: no fonts, no token overrides, no simulated themes. An avatar
 * observed under any of those is a different avatar.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Avatar, AvatarGroup } from "@skryensya/react/avatar";
import { Box } from "@skryensya/react/layout";
import type { ReactNode } from "react";

const SIZES = ["sm", "md", "lg", "xl"] as const;
const APPEARANCES = ["plain", "brutalist"] as const;

const NAMES = {
  typical: "Dana Reyes",
  oneWord: "Jo",
  longHyphenated: "Aleksandra Wiśniewska-Kowalczyk",
  emoji: "🎨 Priya Shah",
  rtl: "سارة أحمد",
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

export function AvatarBreak() {
  return (
    <>
      <Group title="Baseline. Size × appearance, initials and a real image">
        <Case label="Initials, every size × appearance">
          <div className="break-row">
            {SIZES.map((size) =>
              APPEARANCES.map((appearance) => (
                <Avatar appearance={appearance} key={`${size}-${appearance}`} name={NAMES.typical} size={size} />
              )),
            )}
          </div>
        </Case>
        <Case label="A real image, every size × appearance">
          <div className="break-row">
            {SIZES.map((size) =>
              APPEARANCES.map((appearance) => (
                <Avatar
                  appearance={appearance}
                  key={`${size}-${appearance}`}
                  name={NAMES.typical}
                  size={size}
                  src="https://i.pravatar.cc/128?img=5"
                />
              )),
            )}
          </div>
        </Case>
      </Group>

      <Group title="Name. What avatarInitials has to turn into a glyph">
        <Case label="One word">
          <Avatar name={NAMES.oneWord} />
        </Case>
        <Case label="Two words, one of them hyphenated">
          <Avatar name={NAMES.longHyphenated} />
        </Case>
        <Case label="RTL script">
          <div dir="rtl">
            <Avatar name={NAMES.rtl} />
          </div>
        </Case>
        <Case
          fixed="keeps the emoji whole: avatarInitials walks code points (Array.from), not UTF-16 units."
          label="An emoji glued to the front of the name"
          note={`"${NAMES.emoji}" - a real pattern (Slack, Discord, a lot of chat profiles). The emoji is outside the BMP, a surrogate pair.`}
        >
          <Avatar name={NAMES.emoji} />
        </Case>
      </Group>

      <Group title="Image. Failure, not just success">
        <Case broke="the browser's broken-image placeholder stays visible; nothing replaces it." label="A broken src without a fallback">
          <span className="sk-avatar" data-size="md" aria-hidden="true">
            <img src="https://example.invalid/missing.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </span>
        </Case>
        <Case fixed="shows initials. onError flips imageFailed; verified in avatar.test.tsx." label="The same broken src through Avatar">
          <Avatar name={NAMES.typical} src="https://example.invalid/missing.jpg" />
        </Case>
      </Group>

      <Group title="AvatarGroup. The cap, the overflow label, and the two ways to lie about both">
        <Case label="max caps the row into a +N counter">
          <AvatarGroup max={3}>
            <Avatar name="A A" />
            <Avatar name="B B" />
            <Avatar name="C C" />
            <Avatar name="D D" />
            <Avatar name="E E" />
          </AvatarGroup>
        </Case>
        <Case
          fixed={'shows nobody, "+2": max is read with typeof, not truthiness.'}
          label="max=0 - collapse everyone behind the count"
          note="0 is falsy in JS; `max && …` treated max=0 the same as no max at all and showed every avatar."
        >
          <AvatarGroup max={0}>
            <Avatar name="A A" />
            <Avatar name="B B" />
          </AvatarGroup>
        </Case>
        <Case
          fixed="shows no badge: max already proved nothing overflowed, so the static label is dropped."
          label='A static overflow label alongside a max that is not reached'
          note='AvatarGroup max={5} overflow="+99 more" with only 2 avatars. The label used to show up anyway.'
        >
          <AvatarGroup max={5} overflow="+99 more">
            <Avatar name="A A" />
            <Avatar name="B B" />
          </AvatarGroup>
        </Case>
        <Case label="A static overflow label with no max at all - still the documented use" note="No counting to defer to, so the given label is trusted as-is.">
          <AvatarGroup overflow="+40 more">
            <Avatar name="A A" />
            <Avatar name="B B" />
          </AvatarGroup>
        </Case>
        <Case
          label="Uncapped group past twelve"
          fixed="the stack order now uses sibling-count() and sibling-index(), so every avatar stays behind the one before it at any group length."
        >
          <AvatarGroup>
            {Array.from({ length: 16 }, (_, i) => (
              <Avatar key={i} name={`${String.fromCharCode(65 + (i % 26))} ${i}`} />
            ))}
          </AvatarGroup>
        </Case>
      </Group>

      <Group title="AvatarGroup on a real surface, not the plain page">
        <Case
          fixed="the ring now reads --sk-avatar-group-ring (default --color-bg-surface), overridable like every other Avatar color."
          label="A group inside a raised card"
          note="Demo data (the plain page background) hides this: the ring was hardcoded to --color-bg-surface, visibly off against any other surface."
        >
          <Box border="subtle" padding="md" radius="surface" surface="raised">
            <AvatarGroup max={4}>
              <Avatar name="A A" />
              <Avatar name="B B" />
              <Avatar name="C C" />
              <Avatar name="D D" />
              <Avatar name="E E" />
            </AvatarGroup>
          </Box>
        </Case>
        <Case label="The same card, ring matched to the surface via the hook">
          <Box border="subtle" padding="md" radius="surface" style={{ "--sk-avatar-group-ring": "var(--color-bg-surface-raised)" } as never} surface="raised">
            <AvatarGroup max={4}>
              <Avatar name="A A" />
              <Avatar name="B B" />
              <Avatar name="C C" />
              <Avatar name="D D" />
              <Avatar name="E E" />
            </AvatarGroup>
          </Box>
        </Case>
      </Group>
    </>
  );
}
