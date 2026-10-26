import raw from "@skryensya/core/install-manifest.json" with { type: "json" };

/*
 * THE CATALOG THE CLI READS: the install manifest the core package generates from the contracts and
 * the stylesheets (so a new `@import` is a new line here with nothing typed by hand), plus the few
 * entries that are not contracts. The manifest is inlined when the CLI is built, so the command
 * works offline and always agrees with the version it shipped with.
 */

export type Binding = "react" | "vanilla";

export type ReactEntry = { entry: string; names: string[] };
export type VanillaEntry = { entry: string; mount: string | null; selectors: string[]; auto: boolean };

export type Entry = {
  id: string;
  kind: "component" | "integration" | "appearance";
  category: string;
  summary?: string;
  /** Stylesheets in the order they must load, each once. */
  css: string[];
  react: ReactEntry | null;
  vanilla: VanillaEntry | null;
  /** Packages the component needs besides the system's own. */
  peers: string[];
  /** On an `appearance` entry (`button.brutalist`): the component it dresses and the value. */
  appearance?: { of: string; value: string };
};

type RawEntry = {
  category: string;
  css: { entry: string; files: string[] };
  react: ReactEntry | null;
  vanilla: VanillaEntry | null;
  appearance?: { of: string; value: string };
};

/** What a component needs beyond the system's own packages. */
const PEERS: Record<string, string[]> = {
};

/**
 * Integrations are not contracts, so they are not in the manifest. They borrow their stylesheets
 * from the components they draw (`uses`), which keeps them from restating a CSS list that would drift.
 */
const INTEGRATIONS: Record<string, { uses: string[]; react: ReactEntry; peers: string[]; summary: string }> = {
  "hook-form": {
    uses: ["form-field"],
    react: { entry: "@skryensya/react/hook-form", names: ["ControlledField", "Form"] },
    peers: ["react-hook-form"],
    summary: "React Hook Form fields drawn as FormField, with adapters for every control.",
  },
  "data-table": {
    uses: ["table", "button", "checkbox", "pagination"],
    react: { entry: "@skryensya/react/data-table", names: ["DataTable", "DataTablePagination", "selectColumn"] },
    peers: ["@tanstack/react-table"],
    summary: "A TanStack Table (v9) drawn with Table: sorting, row selection and paging.",
  },
};

const unique = <T>(items: T[]): T[] => [...new Set(items)];

const manifest = raw as unknown as Record<string, RawEntry>;

function build(): Map<string, Entry> {
  const entries = new Map<string, Entry>();
  for (const [id, entry] of Object.entries(manifest)) {
    entries.set(id, {
      id,
      kind: entry.appearance ? "appearance" : "component",
      category: entry.category,
      ...(entry.appearance ? { summary: `The ${entry.appearance.value} look of ${entry.appearance.of}: its rules live in their own sheet.`, appearance: entry.appearance } : {}),
      css: entry.css.files,
      react: entry.react,
      vanilla: entry.vanilla,
      peers: PEERS[id] ?? [],
    });
  }
  for (const [id, integration] of Object.entries(INTEGRATIONS)) {
    entries.set(id, {
      id,
      kind: "integration",
      category: "integrations",
      summary: integration.summary,
      css: unique(integration.uses.flatMap((used) => manifest[used]?.css.files ?? [])),
      react: integration.react,
      vanilla: null,
      peers: integration.peers,
    });
  }
  return entries;
}

export const catalog: ReadonlyMap<string, Entry> = build();

/** The appearance entries of a component (`button.tactile`, `button.brutalist`, …), by value. */
export const appearancesOf = (id: string): Entry[] =>
  [...catalog.values()].filter((entry) => entry.appearance?.of === id).sort((a, b) => a.id.localeCompare(b.id));

export const categories = (): string[] => unique([...catalog.values()].map((entry) => entry.category)).sort();

/**
 * The path a project imports a core stylesheet by. The binding re-exports core's CSS under `css/`
 * (see scripts/generate-css-reexports.ts), so a project installs the binding and never core itself:
 * `@skryensya/core/components/button.css` is imported as `@skryensya/react/css/components/button.css`.
 */
export const consumerPath = (coreFile: string, binding: Binding): string =>
  coreFile.replace(/^@skryensya\/core\//, `@skryensya/${binding}/css/`);

/** The stylesheets of several entries, in load order, each once. */
/**
 * The stylesheets of these ids, in load order: each component, then its appearances right behind it.
 * An appearance sheet only adds to its component's, and a component sheet that loaded after it would win
 * every tie at equal specificity, so an appearance never goes ahead of its component; and it stays next to
 * it (not after every component) so that another component's late rule over this one, as Combobox's over
 * its inner Button, still comes after the whole of it. Components keep the order they were added in.
 */
export const cssOf = (ids: readonly string[]): string[] => {
  const component = (id: string) => catalog.get(id)?.appearance?.of ?? id;
  return unique(
    unique(ids.map(component)).flatMap((of) => [
      ...(catalog.get(of)?.css ?? []),
      ...ids.filter((id) => catalog.get(id)?.appearance?.of === of).flatMap((id) => catalog.get(id)?.css ?? []),
    ]),
  );
};

const distance = (a: string, b: string): number => {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const held = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = held;
    }
  }
  return row[b.length]!;
};

/** Ids that read like what was typed: shares a prefix or substring, or is a couple of keystrokes away. */
export function suggest(input: string, limit = 3): string[] {
  const needle = input.toLowerCase();
  return [...catalog.keys()]
    .map((id) => ({ id, score: id.includes(needle) || needle.includes(id) ? 0 : distance(id, needle) }))
    .filter((candidate) => candidate.score <= 2)
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((candidate) => candidate.id);
}
