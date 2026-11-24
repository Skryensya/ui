import manifest from "@artifacts/ai-manifest.json";
import { canonicalPath, locales } from "../i18n";
import { getComponentDescription } from "./component-catalog";
import { getNavigation } from "./navigation";

export interface ComponentSearchEntry {
  names: string[];
  context: string;
}

type Intents = { signatures?: Record<string, { intent?: readonly string[] }> };
const kebab = (name: string): string => name.replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();

/**
 * What each page is FOR, in the words the contracts file it under (`intent`: "pan-zoom", "figma-like-view"), keyed by the page's
 * slug. A page named after a signature (progressive-carousel) gets that signature's intents; one named after a contract gets every
 * signature's. So "zoom" finds Canvas although its one-line description never says it. Only `intent`: `useWhen` is long English
 * prose, and the catalogue's prose match wants the query's words inside it, so it would add noise in the wrong language.
 */
function intentsBySlug(): Map<string, string> {
  const bySlug = new Map<string, string>();
  const add = (slug: string, intents: readonly string[] = []): void => {
    bySlug.set(slug, `${bySlug.get(slug) ?? ""} ${intents.map((intent) => intent.replaceAll("-", " ")).join(" ")}`);
  };
  for (const [id, contract] of Object.entries((manifest as { contracts: Record<string, Intents> }).contracts)) {
    for (const [name, signature] of Object.entries(contract.signatures ?? {})) {
      add(kebab(name), signature.intent);
      add(id, signature.intent);
    }
  }
  return bySlug;
}

/** One bilingual index for either locale, built from the same inventory the catalogue displays. */
export function buildComponentSearchIndex(): Map<string, ComponentSearchEntry> {
  const index = new Map<string, ComponentSearchEntry>();
  const intents = intentsBySlug();
  for (const locale of locales) {
    const section = getNavigation(locale).find((entry) => entry.id === "components")!;
    for (const group of section.groups) for (const item of group.items) {
      if (item.todo) continue;
      const href = canonicalPath(item.href);
      const entry = index.get(href) ?? { names: [], context: "" };
      entry.names = [...new Set([...entry.names, item.label, ...(item.aliases ?? [])])];
      entry.context += ` ${getComponentDescription(item.href, locale)} ${group.group} ${group.blurb ?? ""} ${intents.get(href.split("/").pop()!) ?? ""}`;
      index.set(href, entry);
    }
  }
  return index;
}
