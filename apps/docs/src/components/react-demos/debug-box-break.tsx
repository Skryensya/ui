/*
 * Diagnostic only, for /debug/box-break. Renders the REAL `@skryensya/react` Box once per stress
 * scenario. The page around it adds labels and fixed-width containers and nothing else: no fonts,
 * no token overrides, no simulated themes. A Box observed under any of those is a different Box.
 *
 * Not linked from the site nav. Delete with its page when the run is done.
 */
import { Avatar } from "@skryensya/react/avatar";
import { Badge } from "@skryensya/react/badge";
import { Button } from "@skryensya/react/button";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import type { ReactNode } from "react";

const SURFACES = ["none", "sunken", "surface", "raised"] as const;
const BORDERS = ["none", "subtle", "default"] as const;
const PADDINGS = ["none", "xs", "sm", "md", "lg", "xl"] as const;

const LABELS = {
  empty: "",
  word: "Save",
  typical: "Your changes are saved automatically.",
  sentences:
    "Your workspace has four unresolved invitations waiting on somebody. Review them before the trial ends, or new members will not be able to join.",
  unbreakable: "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerk",
};

/*
 * A card is not a component here - it is Box plus whatever a consumer puts in it (the catalog's
 * own `product-card-in-grid` example: "image, title, lead text, a trailing link"). These three
 * people are the realistic worst case for that composition, not three different components:
 * - Aleksandra: the long name AND the long title AND the long, dot-and-domain-heavy email AND the
 *   four-digit member count, all on one card, the way one real row usually carries more than one
 *   failure at once (Hard Rule 3).
 * - Jo: the short name (tests Avatar's one-word initials branch) with no role at all (the missing
 *   optional field) and a count of exactly one (the pluralization trap).
 * - Dana: the kind demo data, kept in the SAME grid so the worst case is read by contrast, not in
 *   isolation.
 */
type Person = { name: string; role?: string; email: string; members: number; src?: string };

const PEOPLE: Record<"dana" | "aleksandra" | "jo" | "priya", Person> = {
  dana: { name: "Dana Reyes", role: "Product designer", email: "dana@acme.com", members: 12 },
  aleksandra: {
    name: "Aleksandra Wiśniewska-Kowalczyk",
    role: "Senior infrastructure and platform reliability engineer",
    email: "aleksandra.wisniewska-kowalczyk@northwind-industries-holdings.example.com",
    members: 1284,
  },
  jo: { name: "Jo", role: undefined, email: "jo@acme.com", members: 1 },
  priya: { name: "🎨 Priya Shah", role: "Design systems", email: "priya@acme.com", members: 48 },
};

/*
 * The card itself: nothing from Box but surface, border, padding and radius. Everything else -
 * whether the header row's text column can shrink, whether the email wraps, whether "members"
 * knows about one - is the CONSUMER'S code, same as it would be in a real app. `fill` toggles the
 * one opt-in `Inline` asks for (`data-sizing="fill"` on the row's middle child) so the same markup
 * can show the trap sprung and the trap avoided side by side.
 */
function PersonCard({ person, fill }: { person: Person; fill?: boolean }) {
  return (
    <Box surface="raised" border="subtle" padding="md" radius="surface">
      <Stack gap="sm">
        <Inline align="center" gap="sm" wrap={false}>
          <Avatar name={person.name} src={person.src} />
          <Stack gap="none" data-sizing={fill ? "fill" : undefined}>
            <strong>{person.name}</strong>
            {person.role ? <span>{person.role}</span> : null}
          </Stack>
          <Badge tone="neutral">{person.members} members</Badge>
        </Inline>
        <p>{person.email}</p>
        <Inline gap="sm">
          <Button size="sm" variant="ghost">
            Message
          </Button>
          <Button size="sm" tone="accent" variant="solid">
            Invite
          </Button>
        </Inline>
      </Stack>
    </Box>
  );
}

function Case({
  label,
  note,
  broke,
  children,
}: {
  label: string;
  note?: string;
  /** What visibly broke in this scenario, written after the look. The page reads as the report. */
  broke?: string;
  children: ReactNode;
}) {
  return (
    <section className="break-case">
      <h3 className="break-case__label">{label}</h3>
      {note ? <p className="break-case__note">{note}</p> : null}
      {broke ? <p className="break-case__broke">BROKE. {broke}</p> : null}
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

export function BoxBreak() {
  return (
    <>
      <Group title="Baseline. Surface × border, padding md">
        {SURFACES.map((surface) => (
          <Case key={surface} label={`surface="${surface}", border none / subtle / default`}>
            <div className="break-row">
              {BORDERS.map((border) => (
                <Box key={border} surface={surface} border={border} padding="md">
                  {`${surface}/${border}`}
                </Box>
              ))}
            </div>
          </Case>
        ))}
      </Group>

      <Group title="Baseline. Padding scale">
        <Case label='padding none → xl, surface="surface" border="subtle"'>
          <div className="break-row">
            {PADDINGS.map((padding) => (
              <Box key={padding} surface="surface" border="subtle" padding={padding}>
                {`padding ${padding}`}
              </Box>
            ))}
          </div>
        </Case>
      </Group>

      <Group title="Content length. surface=raised border=default padding=md, 220px container">
        <Case label="No children at all">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md" />
          </div>
        </Case>
        <Case label="Empty string child">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.empty}
            </Box>
          </div>
        </Case>
        <Case label="One word">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.word}
            </Box>
          </div>
        </Case>
        <Case label="Typical content">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.typical}
            </Box>
          </div>
        </Case>
        <Case label="Several sentences">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.sentences}
            </Box>
          </div>
        </Case>
        <Case label="One unbreakable 52-character string">
          <div className="break-w-220">
            <Box surface="raised" border="default" padding="md">
              {LABELS.unbreakable}
            </Box>
          </div>
        </Case>
      </Group>

      <Group title="Container. Typical content, surface=raised border=default padding=md">
        <Case label="320px container">
          <div className="break-w-320">
            <Box surface="raised" border="default" padding="md">
              {LABELS.typical}
            </Box>
          </div>
        </Case>
        <Case
          label="Squeezed by a flex sibling"
          note="The paragraph takes flex:1; the Box is a plain flex item with no flex-shrink of its own."
        >
          <div className="break-w-320 break-squeeze">
            <p className="break-squeeze__text">
              Your workspace still has four unresolved invitations waiting on somebody.
            </p>
            <Box surface="raised" border="default" padding="md">
              {LABELS.word}
            </Box>
          </div>
        </Case>
        <Case label="Very wide container (1100px)">
          <div className="break-w-1100">
            <Box surface="raised" border="default" padding="md">
              {LABELS.typical}
            </Box>
          </div>
        </Case>
      </Group>

      <Group title="Card composition. Box + Avatar + Badge + Button, a real card">
        <Case
          label="3-up grid, demo data next to the worst case"
          note="Dana is the kind demo data. Aleksandra stacks a long name, title, email and a 4-digit
            count on one card; Jo is the short name with no role and a count of exactly one. None of
            the three middle columns carry data-sizing=&quot;fill&quot;."
        >
          <div className="break-w-1100">
            <Grid gap="md" minColumn="sm">
              <PersonCard person={PEOPLE.dana} />
              <PersonCard person={PEOPLE.aleksandra} />
              <PersonCard person={PEOPLE.jo} />
            </Grid>
          </div>
        </Case>
        <Case
          label="Same three, with data-sizing=&quot;fill&quot; on the header's middle column"
          note="The only change is the fill attribute Inline documents as opt-in. Compare this row's
            Aleksandra card against the one above."
        >
          <div className="break-w-1100">
            <Grid gap="md" minColumn="sm">
              <PersonCard fill person={PEOPLE.dana} />
              <PersonCard fill person={PEOPLE.aleksandra} />
              <PersonCard fill person={PEOPLE.jo} />
            </Grid>
          </div>
        </Case>
        <Case label="The worst-case card alone, 320px container, no fill">
          <div className="break-w-320">
            <PersonCard person={PEOPLE.aleksandra} />
          </div>
        </Case>
        <Case label="A card with a broken avatar image src" note="Avatar's onError fallback should show initials.">
          <div className="break-w-320">
            <PersonCard fill person={{ ...PEOPLE.dana, src: "https://example.invalid/missing.jpg" }} />
          </div>
        </Case>
        <Case
          label="An emoji-prefixed display name"
          note="A real pattern (Slack, Discord, a lot of chat profiles): an emoji glued to the front of
            the name. avatarInitials (packages/core/src/avatar.ts) takes part[0] per word; an emoji
            outside the BMP is a surrogate pair, and part[0] only grabs the first half of it."
        >
          <div className="break-w-320">
            <PersonCard fill person={PEOPLE.priya} />
          </div>
        </Case>
      </Group>
    </>
  );
}
