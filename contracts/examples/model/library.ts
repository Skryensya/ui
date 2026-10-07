import { resolveContent, textIn } from "./resolve.js";
import { entries, intentCounts, patternOf, relationsOf, useOf } from "./registry.js";
import { areaLabels, domainLabels, intentPath, intents, subjects } from "./taxonomy.js";
import { SCALES, type Locale } from "./types.js";

/*
 * THE LIBRARY AS A READER SEES IT: the registry with every `{ en, es }` already resolved to one locale. The
 * MCP and the docs ask this, never the registry, so no consumer re-implements locale resolution and none
 * can see a half-translated string.
 */

export const library = {
  entries,
  relations: relationsOf,

  /** A pattern as an author needs it: its layout and the fields a new use has to fill. */
  pattern(id: string, locale: Locale) {
    const pattern = patternOf(id);
    if (!pattern) return undefined;
    return {
      id: pattern.id,
      title: textIn(pattern.title, locale),
      layout: textIn(pattern.layout, locale),
      fields: Object.fromEntries(Object.entries(pattern.fields).map(([key, text]) => [key, textIn(text as never, locale)])),
      notes: (pattern.notes ?? []).map((note) => textIn(note, locale)),
    };
  },

  /** The content a use fills its pattern with, in `locale`: what a new use of the same layout replaces. */
  content(id: string, locale: Locale): unknown {
    const use = useOf(id);
    return use ? resolveContent(use.content, locale) : undefined;
  },

  /** The taxonomy in `locale`, with how many examples sit under each intent. */
  facets(locale: Locale) {
    const counts = intentCounts();
    const subjectCounts = new Map<string, number>();
    const scaleCounts = new Map<string, number>();
    for (const entry of entries(locale)) {
      subjectCounts.set(entry.subject, (subjectCounts.get(entry.subject) ?? 0) + 1);
      scaleCounts.set(entry.scale, (scaleCounts.get(entry.scale) ?? 0) + 1);
    }
    return {
      intents: intents.filter((intent) => counts.has(intent.id)).map((intent) => ({ id: intent.id, label: textIn(intent.label, locale), job: textIn(intent.job, locale), count: counts.get(intent.id)! })),
      subjects: [...subjects].sort((a, b) => a.order - b.order).map((subject) => ({ id: subject.id as string, title: textIn(subject.title, locale), count: subjectCounts.get(subject.id) ?? 0 })).filter((subject) => subject.count > 0),
      scales: SCALES.map((scale) => ({ scale: scale as string, count: scaleCounts.get(scale) ?? 0 })).filter((scale) => scale.count > 0),
    };
  },

  /** A subject's name and lede in `locale`, for the Catalog page. */
  subjects(locale: Locale) {
    return [...subjects].sort((a, b) => a.order - b.order).map((subject) => ({ id: subject.id as string, title: textIn(subject.title, locale), lede: textIn(subject.lede, locale) }));
  },

  /**
   * The intent hierarchy in `locale`: domains, their areas and the intents under each, with the examples
   * filed there. A reader that wants the whole taxonomy as a tree asks this; one that wants a single level
   * filters `entries` by an intent prefix.
   */
  tree(locale: Locale) {
    const all = entries(locale);
    const domains = new Map<string, Map<string, typeof intents[number][]>>();
    for (const intent of intents) {
      const [domain, area] = intentPath(intent.id);
      const areas = domains.get(domain) ?? new Map();
      areas.set(area, [...(areas.get(area) ?? []), intent]);
      domains.set(domain, areas);
    }
    return [...domains].map(([domain, areas]) => ({
      id: domain,
      label: textIn(domainLabels[domain] ?? domain, locale),
      areas: [...areas].map(([area, list]) => ({
        id: area,
        label: textIn(areaLabels[area] ?? area, locale),
        intents: list.map((intent) => ({ id: intent.id as string, label: textIn(intent.label, locale), job: textIn(intent.job, locale), examples: all.filter((entry) => entry.intent === intent.id).map((entry) => ({ id: entry.id, title: entry.title, catalog: entry.catalog && entry.scale !== "page" })) })),
      })),
    }));
  },

  /** An intent's label and job in `locale`. */
  intent(id: string, locale: Locale) {
    const intent = intents.find((entry) => entry.id === id);
    return intent ? { id: intent.id as string, label: textIn(intent.label, locale), job: textIn(intent.job, locale) } : undefined;
  },
};

export type Library = typeof library;
