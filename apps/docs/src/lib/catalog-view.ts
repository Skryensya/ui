import { library, SCALES, type Locale } from "@skryensya/examples";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { useTranslations, type UIKey } from "../i18n";

/*
 * THE CATALOG PAGE'S MODEL, read off the example library. The page owns how it looks; what is on it, in
 * what order and how the examples relate is the library's, so the page, the MCP and a person reading
 * `contracts/examples` all see one thing.
 *
 * Only examples that earn a card are shown (a use that exists to sit inside a composition is shown inside
 * it, and a whole page lives on the Templates page); the intent index still lists them, unlinked, so the
 * taxonomy reads whole.
 */
export interface CatalogVariant {
  id: string;
  title: string;
  purpose: string;
  tree: UsageTree;
  intentLabel: string;
  layoutLabel: string;
  /** The pattern's name alone, or "Fixed tree": for a record whose term already says "Layout". */
  layoutTitle: string;
  /** The filing, for the page's filters: the intent id (`domain/area/intent`), the scale and the contract families the tree touches. */
  intent: string;
  scale: string;
  components: string[];
  /** What the catalog's palette matches besides the title: the intent at its three levels, the layout, the scale, the components and the purpose. */
  aliases: string[];
  /** The line a search result shows under its title: subject › domain › area › intent. */
  context: string;
  /** The intent's first level, for the domain facet. */
  domain: string;
  relations: { kind: "sameLayout" | "sameIntent" | "contains" | "containedIn" | "similar" | "related"; label: string; items: { id: string; title: string; shown: boolean }[] }[];
}

export function catalogView(locale: Locale) {
  const t = useTranslations(locale);
  const all = library.entries(locale);
  const shownIds = new Set(all.filter((entry) => entry.catalog && entry.scale !== "page").map((entry) => entry.id));
  const byId = new Map(all.map((entry) => [entry.id, entry]));
  const ref = (id: string) => ({ id, title: byId.get(id)?.title ?? id, shown: shownIds.has(id) });

  const taxonomy = library.tree(locale);
  const labelOf = new Map<string, string>();
  for (const domain of taxonomy) {
    labelOf.set(domain.id, domain.label);
    for (const area of domain.areas) for (const intent of area.intents) labelOf.set(intent.id, intent.label);
  }
  const pathLabels = (intentId: string) => {
    const [domain, area] = intentId.split("/");
    const areaLabel = taxonomy.find((entry) => entry.id === domain)?.areas.find((entry) => entry.id === area)?.label;
    return [labelOf.get(domain!), areaLabel, labelOf.get(intentId)].filter(Boolean) as string[];
  };

  const subjects = library
    .subjects(locale)
    .map((subject) => ({
      ...subject,
      scales: SCALES.filter((scale) => scale !== "page")
        .map((scale) => ({
          scale,
          label: t(`catalog.scale.${scale}` as UIKey),
          variants: all
            .filter((entry) => shownIds.has(entry.id) && entry.subject === subject.id && entry.scale === scale)
            .map((entry): CatalogVariant => {
              const relations = library.relations(entry.id);
              const pattern = entry.pattern ? library.pattern(entry.pattern, locale) : undefined;
              const group = (kind: CatalogVariant["relations"][number]["kind"], ids: readonly string[]): CatalogVariant["relations"][number] => ({ kind, label: t(`catalog.rel.${kind}` as UIKey), items: ids.map(ref) });
              const groups: CatalogVariant["relations"] = [
                group("contains", relations?.contains ?? []),
                group("containedIn", relations?.containedIn ?? []),
                group("sameLayout", relations?.sameLayout ?? []),
                group("sameIntent", relations?.sameIntent ?? []),
                group("related", (relations?.related ?? []).map((related) => related.id)),
                group("similar", (relations?.similar ?? []).map((similar) => similar.id)),
              ];
              const layoutTitle = pattern ? pattern.title : "";
              return {
                id: entry.id,
                title: entry.title,
                purpose: entry.purpose,
                tree: entry.tree,
                intentLabel: library.intent(entry.intent, locale)?.label ?? entry.intent,
                layoutLabel: pattern ? `${t("catalog.meta.layout")}: ${pattern.title}` : t("catalog.meta.fixed"),
                layoutTitle: pattern ? pattern.title : t("catalog.meta.fixed"),
                intent: entry.intent,
                scale: entry.scale,
                components: [...entry.contracts],
                aliases: [...pathLabels(entry.intent), layoutTitle, t(`catalog.scale.${entry.scale}` as UIKey), ...entry.contracts, entry.purpose].filter(Boolean),
                context: `${subject.title} › ${pathLabels(entry.intent).join(" › ")}`,
                domain: entry.intent.split("/")[0]!,
                relations: groups.filter((group) => group.items.length > 0),
              };
            }),
        }))
        .filter((group) => group.variants.length > 0),
    }))
    .filter((subject) => subject.scales.length > 0);

  const intents = library.tree(locale).map((domain) => ({
    id: domain.id,
    label: domain.label,
    count: domain.areas.reduce((sum, area) => sum + area.intents.reduce((inner, intent) => inner + intent.examples.length, 0), 0),
    areas: domain.areas
      .map((area) => ({
        id: area.id,
        label: area.label,
        intents: area.intents
          .filter((intent) => intent.examples.length > 0)
          .map((intent) => ({ id: intent.id, label: intent.label, examples: intent.examples.map((example) => ({ id: example.id, title: example.title, shown: example.catalog })) })),
      }))
      .filter((area) => area.intents.length > 0),
  }));

  /*
   * THE FACETS of the advanced search, counted over what the page shows. Each is one axis of the filing: the
   * subject, the scale, the intent's domain and the components a tree touches. A value nothing carries has no
   * option, so no checkbox ever leads to an empty result on its own.
   */
  const variants = subjects.flatMap((subject) => subject.scales.flatMap((group) => group.variants.map((variant) => ({ subject: subject.id, variant }))));
  const tally = (keys: (entry: (typeof variants)[number]) => string[]) => {
    const counts = new Map<string, number>();
    for (const entry of variants) for (const key of new Set(keys(entry))) counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  };
  const bySubject = tally((entry) => [entry.subject]);
  const byScale = tally((entry) => [entry.variant.scale]);
  const byDomain = tally((entry) => [entry.variant.domain]);
  const byComponent = tally((entry) => entry.variant.components);
  const facets = {
    subject: subjects.map((subject) => ({ value: subject.id, label: subject.title, count: bySubject.get(subject.id) ?? 0 })).filter((option) => option.count > 0),
    scale: SCALES.filter((scale) => byScale.has(scale)).map((scale) => ({ value: scale as string, label: t(`catalog.scale.${scale}` as UIKey), count: byScale.get(scale)! })),
    domain: taxonomy.filter((domain) => byDomain.has(domain.id)).map((domain) => ({ value: domain.id, label: domain.label, count: byDomain.get(domain.id)! })),
    component: [...byComponent].sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => ({ value, label: value, count })),
  };

  return { subjects, intents, facets };
}
