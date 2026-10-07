import { sheetsForTree } from "@skryensya/ai-compiler/sheets-for-tree";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalogView } from "./catalog-view";

/*
 * THE CATALOG PAGE AGAINST THE LIBRARY. The examples themselves are held to their contracts, their
 * review and their words by the library's own gate (`packages/ai-compiler/src/examples.test.ts`). What
 * only the page can get wrong is its stylesheets: the emitter writes the classes and does not carry
 * the styles, so an example whose sheet the page does not import renders unstyled here while passing
 * everything else.
 */
const page = readFileSync(new URL("../components/pages/CatalogPage.astro", import.meta.url), "utf8");

describe("the Catalog page", () => {
  for (const locale of ["en", "es"] as const) {
    it(`imports every stylesheet its examples need (${locale})`, () => {
      const view = catalogView(locale);
      const missing = new Set<string>();
      for (const subject of view.subjects) for (const group of subject.scales) for (const variant of group.variants) for (const sheet of sheetsForTree(variant.tree).sheets) if (!page.includes(`"${sheet}"`)) missing.add(`${sheet} (${variant.id})`);
      expect([...missing]).toEqual([]);
    });
  }

  it("shows each subject's examples smallest first", () => {
    const order = ["fragment", "component", "composition"];
    for (const subject of catalogView("en").subjects) {
      const scales = subject.scales.map((group) => group.scale);
      expect(scales).toEqual(order.filter((scale) => scales.includes(scale as never)));
    }
  });

  it("lists every intent that has an example, and links only the examples that have a card", () => {
    const view = catalogView("en");
    const shown = new Set(view.subjects.flatMap((subject) => subject.scales.flatMap((group) => group.variants.map((variant) => variant.id))));
    for (const domain of view.intents) for (const area of domain.areas) for (const intent of area.intents) for (const example of intent.examples) expect(example.shown, example.id).toBe(shown.has(example.id));
  });
});
