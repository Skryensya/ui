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
  relations: { kind: "sameLayout" | "sameIntent" | "contains" | "containedIn" | "similar" | "related"; label: string; items: { id: string; title: string; shown: boolean }[] }[];
}

export function catalogView(locale: Locale) {
  const t = useTranslations(locale);
  const all = library.entries(locale);
  const shownIds = new Set(all.filter((entry) => entry.catalog && entry.scale !== "page").map((entry) => entry.id));
  const byId = new Map(all.map((entry) => [entry.id, entry]));
  const ref = (id: string) => ({ id, title: byId.get(id)?.title ?? id, shown: shownIds.has(id) });

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
              return {
                id: entry.id,
                title: entry.title,
                purpose: entry.purpose,
                tree: entry.tree,
                intentLabel: library.intent(entry.intent, locale)?.label ?? entry.intent,
                layoutLabel: pattern ? `${t("catalog.meta.layout")}: ${pattern.title}` : t("catalog.meta.fixed"),
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

  return { subjects, intents };
}
