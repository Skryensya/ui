import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A page that shares the `tile` contract must say which exports it imports, or its install snippet
// lists every Tile export (and grows with each new one).
describe("Tile family pages", () => {
  const pages = readdirSync(__dirname).filter((f) => /^(Tile|ExpandableTile).*Page\.astro$/.test(f));
  it("finds the pages", () => expect(pages.length).toBeGreaterThan(0));
  for (const page of pages) {
    it(`${page} names its imports`, () => {
      expect(readFileSync(`${__dirname}/${page}`, "utf8")).toMatch(/importNames=\{\[/);
    });
  }
});
