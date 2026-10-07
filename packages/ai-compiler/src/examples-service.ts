import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * BROWSING AND FETCHING THE EXAMPLE LIBRARY, as pure functions over a library that is handed in.
 *
 * The library is a taxonomy (intent, subject, scale), a graph (same layout, same intent, containment,
 * structural similarity, written judgements) and the trees themselves. This file is the one place that
 * turns that into what an agent is told, so the MCP, a CLI and the eval harness answer alike. It is typed
 * against the library structurally: `@skryensya/examples` satisfies `ExampleLibrary`, and a test can pass
 * a fixture.
 */

export type ExampleLocale = "en" | "es";

export type LibraryEntry = {
  readonly id: string;
  readonly kind: "use" | "fixed";
  readonly subject: string;
  readonly scale: string;
  readonly intent: string;
  readonly pattern?: string;
  readonly title: string;
  readonly purpose: string;
  readonly notes: readonly string[];
  readonly catalog: boolean;
  readonly contracts: readonly string[];
  readonly tree: UsageTree;
};

export type LibraryRelations = {
  readonly sameLayout: readonly string[];
  readonly sameIntent: readonly string[];
  readonly contains: readonly string[];
  readonly containedIn: readonly string[];
  readonly similar: readonly { readonly id: string; readonly score: number }[];
  readonly related: readonly { readonly id: string; readonly kind: string; readonly why: string }[];
};

export type PatternInfo = {
  readonly id: string;
  readonly title: string;
  readonly layout: string;
  readonly fields: Readonly<Record<string, string>>;
  readonly notes: readonly string[];
};

export type Facets = {
  readonly intents: readonly { readonly id: string; readonly label: string; readonly job: string; readonly count: number }[];
  readonly subjects: readonly { readonly id: string; readonly title: string; readonly count: number }[];
  readonly scales: readonly { readonly scale: string; readonly count: number }[];
};

export interface ExampleLibrary {
  entries(locale: ExampleLocale): readonly LibraryEntry[];
  relations(id: string): LibraryRelations | undefined;
  pattern(id: string, locale: ExampleLocale): PatternInfo | undefined;
  content(id: string, locale: ExampleLocale): unknown;
  facets(locale: ExampleLocale): Facets;
  intent(id: string, locale: ExampleLocale): { readonly id: string; readonly label: string; readonly job: string } | undefined;
}

export type ExamplesFilter = {
  /** An intent id, or a prefix of one: `metrics/` is every figure, `metrics/money/` the money ones. */
  readonly intent?: string;
  readonly subject?: string;
  readonly scale?: string;
  /** Every use of one pattern: the same layout put to other jobs. */
  readonly pattern?: string;
  /** Examples whose tree touches this contract family. */
  readonly contract?: string;
  /** Words that must all appear in an example's id, title, purpose or intent. */
  readonly query?: string;
  readonly locale?: ExampleLocale;
};

export type ExampleSummary = {
  readonly id: string;
  readonly kind: "use" | "fixed";
  readonly title: string;
  readonly intent: string;
  readonly subject: string;
  readonly scale: string;
  readonly pattern?: string;
};

export type ExamplesIndex = {
  readonly locale: ExampleLocale;
  readonly total: number;
  readonly matched: number;
  readonly examples: readonly ExampleSummary[];
  /** Only on an unfiltered call: the taxonomy with a count under each line, to pick a filter from. */
  readonly facets?: Facets;
};

type Ref = { readonly id: string; readonly title: string; readonly intent: string; readonly scale: string };

export type ExampleDetail = {
  readonly id: string;
  readonly kind: "use" | "fixed";
  readonly locale: ExampleLocale;
  readonly title: string;
  readonly purpose: string;
  readonly notes: readonly string[];
  readonly intent: { readonly id: string; readonly label: string; readonly job: string };
  readonly subject: string;
  readonly scale: string;
  readonly contracts: readonly string[];
  /** The layout this use is written against, and the fields a new use of it fills. */
  readonly pattern?: PatternInfo;
  /** The content that fills the pattern in this use: replace it to put the same layout to another job. */
  readonly content?: unknown;
  readonly relations: {
    readonly sameLayout: readonly Ref[];
    readonly sameIntent: readonly Ref[];
    readonly contains: readonly Ref[];
    readonly containedIn: readonly Ref[];
    readonly similar: readonly (Ref & { readonly score: number })[];
    readonly related: readonly (Ref & { readonly kind: string; readonly why: string })[];
  };
  readonly tree: UsageTree;
};

const words = (text: string): string[] => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

export function browseExamples(library: ExampleLibrary, filter: ExamplesFilter = {}): ExamplesIndex {
  const locale = filter.locale ?? "en";
  const all = library.entries(locale);
  const terms = filter.query ? words(filter.query) : [];
  const filtered = Boolean(filter.intent || filter.subject || filter.scale || filter.pattern || filter.contract || terms.length > 0);

  const matched = all.filter((entry) => {
    if (filter.intent && !(entry.intent === filter.intent || entry.intent.startsWith(filter.intent.endsWith("/") ? filter.intent : `${filter.intent}/`))) return false;
    if (filter.subject && entry.subject !== filter.subject) return false;
    if (filter.scale && entry.scale !== filter.scale) return false;
    if (filter.pattern && entry.pattern !== filter.pattern) return false;
    if (filter.contract && !entry.contracts.includes(filter.contract)) return false;
    if (terms.length > 0) {
      const intent = library.intent(entry.intent, locale);
      const haystack = `${entry.id} ${entry.title} ${entry.purpose} ${entry.intent} ${intent?.label ?? ""} ${intent?.job ?? ""} ${entry.subject}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return false;
    }
    return true;
  });

  return {
    locale,
    total: all.length,
    matched: matched.length,
    examples: matched.map((entry) => ({ id: entry.id, kind: entry.kind, title: entry.title, intent: entry.intent, subject: entry.subject, scale: entry.scale, ...(entry.pattern ? { pattern: entry.pattern } : {}) })),
    ...(filtered ? {} : { facets: library.facets(locale) }),
  };
}

/** The example, or undefined: the caller owns the wording of "no such example". */
export function fetchExample(library: ExampleLibrary, id: string, locale: ExampleLocale = "en"): ExampleDetail | undefined {
  const all = library.entries(locale);
  const entry = all.find((candidate) => candidate.id === id);
  if (!entry) return undefined;
  const byId = new Map(all.map((candidate) => [candidate.id, candidate]));
  const ref = (refId: string): Ref | undefined => {
    const target = byId.get(refId);
    return target ? { id: target.id, title: target.title, intent: target.intent, scale: target.scale } : undefined;
  };
  const refs = (ids: readonly string[]): Ref[] => ids.map(ref).filter((value): value is Ref => value !== undefined);
  const relations = library.relations(id);

  return {
    id: entry.id,
    kind: entry.kind,
    locale,
    title: entry.title,
    purpose: entry.purpose,
    notes: entry.notes,
    intent: library.intent(entry.intent, locale) ?? { id: entry.intent, label: entry.intent, job: "" },
    subject: entry.subject,
    scale: entry.scale,
    contracts: entry.contracts,
    ...(entry.pattern ? { pattern: library.pattern(entry.pattern, locale) } : {}),
    ...(entry.kind === "use" ? { content: library.content(entry.id, locale) } : {}),
    relations: {
      sameLayout: refs(relations?.sameLayout ?? []),
      sameIntent: refs(relations?.sameIntent ?? []),
      contains: refs(relations?.contains ?? []),
      containedIn: refs(relations?.containedIn ?? []),
      similar: (relations?.similar ?? []).flatMap((similar) => {
        const found = ref(similar.id);
        return found ? [{ ...found, score: similar.score }] : [];
      }),
      related: (relations?.related ?? []).flatMap((related) => {
        const found = ref(related.id);
        return found ? [{ ...found, kind: related.kind, why: related.why }] : [];
      }),
    },
    tree: entry.tree,
  };
}
