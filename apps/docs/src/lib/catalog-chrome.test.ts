import { sheetsForTree } from "@skryensya/ai-compiler/sheets-for-tree";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { backTree, headerTree, introTree, metaTree, pagerTree, resultsTree, searchTree, type ChromeWords } from "./catalog-chrome";
import { catalogView } from "./catalog-view";

/*
 * THE CATALOG'S OWN CONTROLS AGAINST THE KIT. The page is made of the contracts it documents, so each tree it
 * emits is held to them like an example is: valid, and with every stylesheet it needs imported by the page.
 */
const page = readFileSync(new URL("../components/pages/CatalogPage.astro", import.meta.url), "utf8");

const words: ChromeWords = { search: "Search examples", searchPlaceholder: "Name, purpose or intent", advanced: "Advanced filters", facetSubject: "Subject", facetScale: "Scale", facetDomain: "Intent", facetComponent: "Component", remove: "Remove", clearAll: "Clear all", results: "Results", back: "Back to results", metaIntent: "Intent", metaLayout: "Layout", metaComponents: "Components", previous: "Previous", next: "Next", pagerLabel: "More examples" };

const treesFor = (locale: "en" | "es") => {
  const view = catalogView(locale);
  const named: [string, Parameters<typeof validateUsageTree>[0]][] = [
    ["intro", introTree("Catalog", "Every example.")],
    ["pager both", pagerTree(words, { id: "a", title: "A" }, { id: "b", title: "B" })],
    ["pager first", pagerTree(words, undefined, { id: "b", title: "B" })],
    ["pager last", pagerTree(words, { id: "a", title: "A" })],
    ["search", searchTree(words, view.facets)],
    ["results", resultsTree(words, view.subjects.flatMap((subject) => subject.scales.flatMap((group) => group.variants.map((variant) => ({ id: variant.id, title: variant.title, context: variant.context, scaleLabel: group.label })))))],
    ["back", backTree(words)],
  ];
  for (const subject of view.subjects)
    for (const group of subject.scales)
      for (const variant of group.variants) {
        const caption = { id: variant.id, title: variant.title, purpose: variant.purpose, subjectLabel: subject.title, scaleLabel: group.label, intentLabel: variant.intentLabel, layoutLabel: variant.layoutTitle, components: variant.components, relations: variant.relations };
        named.push([`header ${variant.id}`, headerTree(caption)], [`meta ${variant.id}`, metaTree(words, caption)]);
      }
  return named;
};

describe("the Catalog page's own controls", () => {
  for (const locale of ["en", "es"] as const) {
    it(`are valid usage trees (${locale})`, () => {
      const problems: string[] = [];
      for (const [name, tree] of treesFor(locale)) for (const problem of validateUsageTree(tree).problems ?? []) if (problem.severity === "error") problems.push(`${name} ${problem.path}: ${problem.message}`);
      expect(problems).toEqual([]);
    });

    it(`import every stylesheet they need (${locale})`, () => {
      const missing = new Set<string>();
      for (const [name, tree] of treesFor(locale)) for (const sheet of sheetsForTree(tree).sheets) if (!page.includes(`"${sheet}"`)) missing.add(`${sheet} (${name})`);
      expect([...missing]).toEqual([]);
    });
  }
});
