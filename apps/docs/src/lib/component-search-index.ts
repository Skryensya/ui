import { canonicalPath, locales } from "../i18n";
import { getComponentDescription } from "./component-catalog";
import { getNavigation } from "./navigation";

export interface ComponentSearchEntry {
  names: string[];
  context: string;
}

/** One bilingual index for either locale, built from the same inventory the catalogue displays. */
export function buildComponentSearchIndex(): Map<string, ComponentSearchEntry> {
  const index = new Map<string, ComponentSearchEntry>();
  for (const locale of locales) {
    const section = getNavigation(locale).find((entry) => entry.id === "components")!;
    for (const group of section.groups) for (const item of group.items) {
      if (item.todo) continue;
      const href = canonicalPath(item.href);
      const entry = index.get(href) ?? { names: [], context: "" };
      entry.names = [...new Set([...entry.names, item.label, ...(item.aliases ?? [])])];
      entry.context += ` ${getComponentDescription(item.href, locale)} ${group.group} ${group.blurb ?? ""}`;
      index.set(href, entry);
    }
  }
  return index;
}
