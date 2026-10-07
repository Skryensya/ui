import { contractsIn, signaturesIn, type UsageTree } from "@skryensya/core/usage-tree";
import { fixed } from "../fixed/index.js";
import { modules } from "../library/index.js";
import { resolveContent, textIn } from "./resolve.js";
import { intentOf, type IntentId } from "./taxonomy.js";
import type { Fixed, Locale, Pattern, Relation, Scale, SubjectId, Use } from "./types.js";

/*
 * THE REGISTRY: every pattern, use and fixed example in one place, built per locale, with the graph
 * between them derived rather than written.
 *
 * What is DERIVED (so it cannot drift): same layout (uses of one pattern), same intent (alternatives
 * for one job), containment (a composition rendering a use), and structural similarity (how much of
 * their signatures two trees share). What is WRITTEN is only a judgement: "prefer that one when…".
 */

export interface Entry {
  readonly id: string;
  readonly kind: "use" | "fixed";
  readonly subject: SubjectId;
  readonly scale: Scale;
  readonly intent: IntentId;
  /** The pattern a use is written against; absent for a fixed example. */
  readonly pattern?: string;
  readonly title: string;
  readonly purpose: string;
  readonly notes: readonly string[];
  /** False for a use that exists to be held by a composition. */
  readonly catalog: boolean;
  readonly tree: UsageTree;
  /** The contract families the tree touches: the component axis, read off the tree. */
  readonly contracts: readonly string[];
  readonly signatures: readonly string[];
}

export interface Relations {
  /** Other uses of the same pattern: the same layout put to other jobs. */
  readonly sameLayout: readonly string[];
  /** Other examples for the same intent: alternatives for one job. */
  readonly sameIntent: readonly string[];
  /** The uses this composition renders. */
  readonly contains: readonly string[];
  /** The compositions that render this use. */
  readonly containedIn: readonly string[];
  /** Structurally close trees under another pattern and intent, by shared signatures (0 to 1). */
  readonly similar: readonly { readonly id: string; readonly score: number }[];
  /** Written judgements. */
  readonly related: readonly { readonly id: string; readonly kind: Relation["kind"]; readonly why: string }[];
}

export const patterns: readonly Pattern[] = modules.map((module) => module.pattern);
export const uses: readonly Use[] = modules.flatMap((module) => module.uses);
export const fixedExamples: readonly Fixed[] = fixed;

const patternById = new Map(patterns.map((pattern) => [pattern.id, pattern]));
const useById = new Map(uses.map((use) => [use.id, use]));
const fixedById = new Map(fixed.map((entry) => [entry.id, entry]));

export const patternOf = (id: string): Pattern | undefined => patternById.get(id);
export const useOf = (id: string): Use | undefined => useById.get(id);

/** Every id in the library, with the problems of ids that are taken twice. */
export function duplicateIds(): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of [...patterns.map((p) => p.id), ...uses.map((u) => u.id), ...fixed.map((f) => f.id)]) {
    if (seen.has(id)) out.push(id);
    seen.add(id);
  }
  return out;
}

const cache = new Map<Locale, readonly Entry[]>();
let trace: Map<string, Set<string>> | undefined;

function buildUse(use: Use, locale: Locale, stack: readonly string[]): UsageTree {
  const pattern = patternById.get(use.pattern);
  if (!pattern) throw new Error(`${use.id}: no pattern "${use.pattern}"`);
  return pattern.build(resolveContent(use.content, locale), {
    locale,
    ns: use.id,
    render(childId) {
      const child = useById.get(childId);
      if (!child) throw new Error(`${use.id}: renders "${childId}", which is not a use`);
      if (stack.includes(childId)) throw new Error(`${use.id}: renders itself through ${[...stack, childId].join(" > ")}`);
      trace?.get(use.id)?.add(childId);
      return buildUse(child, locale, [...stack, use.id]);
    },
  });
}

function entryOf(base: Omit<Entry, "contracts" | "signatures">): Entry {
  return { ...base, contracts: contractsIn(base.tree), signatures: signaturesIn(base.tree) };
}

/** Every example, built in `locale`. Memoised: the trees are read, never edited. */
export function entries(locale: Locale): readonly Entry[] {
  const hit = cache.get(locale);
  if (hit) return hit;
  const built: Entry[] = [
    ...uses.map((use) => {
      const pattern = patternById.get(use.pattern)!;
      return entryOf({
        id: use.id,
        kind: "use",
        subject: use.subject ?? pattern.subject,
        scale: pattern.scale,
        intent: use.intent,
        pattern: pattern.id,
        title: textIn(use.title, locale),
        purpose: textIn(use.purpose, locale),
        notes: (pattern.notes ?? []).map((note) => textIn(note, locale)),
        catalog: use.catalog !== false,
        tree: buildUse(use, locale, []),
      });
    }),
    ...fixed.map((entry) =>
      entryOf({
        id: entry.id,
        kind: "fixed",
        subject: entry.subject,
        scale: entry.scale,
        intent: entry.intent,
        title: textIn(entry.title, locale),
        purpose: textIn(entry.purpose, locale),
        notes: entry.notes.map((note) => textIn(note, locale)),
        catalog: entry.scale !== "page",
        tree: entry.tree,
      }),
    ),
  ];
  cache.set(locale, built);
  return built;
}

export const entryById = (id: string, locale: Locale): Entry | undefined => entries(locale).find((entry) => entry.id === id);

let graph: ReadonlyMap<string, Relations> | undefined;

/** The derived graph, built once from the English build (it does not depend on the words). */
function relationGraph(): ReadonlyMap<string, Relations> {
  if (graph) return graph;
  trace = new Map(uses.map((use) => [use.id, new Set<string>()]));
  cache.delete("en");
  const all = entries("en");
  const traced = trace;
  trace = undefined;

  const contains = new Map<string, readonly string[]>(uses.map((use) => [use.id, [...(traced.get(use.id) ?? [])]]));
  const containedIn = new Map<string, string[]>();
  for (const [parent, children] of contains) for (const child of children) containedIn.set(child, [...(containedIn.get(child) ?? []), parent]);

  /*
   * STRUCTURAL SIMILARITY, weighted by how rare a signature is. An unweighted overlap says every card is
   * like every other card, because they all share Box, Stack, Heading and Text; what makes two trees kin is
   * the signatures few trees use (a Meter, a Tab set, an Avatar group). Each signature weighs
   * log(N / trees that use it), so Stack weighs next to nothing and a QR code a lot.
   */
  const docs = new Map<string, number>();
  for (const entry of all) for (const signature of entry.signatures) docs.set(signature, (docs.get(signature) ?? 0) + 1);
  const weight = (signature: string): number => Math.log(all.length / (docs.get(signature) ?? 1));
  const similarity = (a: readonly string[], b: readonly string[]): number => {
    const right = new Set(b);
    let shared = 0;
    let union = 0;
    for (const signature of new Set([...a, ...b])) {
      const w = weight(signature);
      union += w;
      if (a.includes(signature) && right.has(signature)) shared += w;
    }
    return union === 0 ? 0 : shared / union;
  };

  const out = new Map<string, Relations>();
  for (const entry of all) {
    const sameLayout = entry.pattern ? all.filter((other) => other.pattern === entry.pattern && other.id !== entry.id).map((other) => other.id) : [];
    /* Other ways to do the job: another pattern. The same pattern under the same intent is a sibling, already in `sameLayout`. */
    const sameIntent = all.filter((other) => other.intent === entry.intent && other.id !== entry.id && (!entry.pattern || other.pattern !== entry.pattern)).map((other) => other.id);
    const held = new Set([...(contains.get(entry.id) ?? []), ...(containedIn.get(entry.id) ?? []), ...sameLayout, ...sameIntent]);
    const similar = all
      .filter((other) => other.id !== entry.id && !held.has(other.id) && other.scale === entry.scale)
      .map((other) => ({ id: other.id, score: Math.round(similarity(entry.signatures, other.signatures) * 100) / 100 }))
      .filter((other) => other.score >= 0.35)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
      .slice(0, 5);
    const written = useById.get(entry.id)?.related ?? fixedById.get(entry.id)?.related ?? [];
    out.set(entry.id, {
      sameLayout,
      sameIntent,
      contains: contains.get(entry.id) ?? [],
      containedIn: containedIn.get(entry.id) ?? [],
      similar,
      related: written.map((relation) => ({ id: relation.id, kind: relation.kind, why: textIn(relation.why, "en") })),
    });
  }
  graph = out;
  return out;
}

export const relationsOf = (id: string): Relations | undefined => relationGraph().get(id);

/** How many examples sit under each intent id, for a facet. */
export function intentCounts(): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries("en")) counts.set(entry.intent, (counts.get(entry.intent) ?? 0) + 1);
  return counts;
}

export { intentOf };
