import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalogBreaks } from "./debug-catalog";
import { getBreakCoverage } from "./debug-coverage";
import { componentItems } from "./navigation";

const index = readFileSync(new URL("../pages/debug/index.astro", import.meta.url), "utf8");
const existing = [...index.matchAll(/href: "(\/debug\/[^"/]+-break)"/g)].map((match) => ({ href: match[1] }));

describe("remaining break catalog", () => {
  it("covers every catalog entry without inflating coverage or duplicating routes", () => {
    const all = [...existing, ...catalogBreaks];
    expect(new Set(all.map(({ href }) => href)).size).toBe(all.length);
    const coverage = getBreakCoverage(all, componentItems);
    expect(coverage.covered).toBe(coverage.total);
    expect(coverage.total).toBe(componentItems.length);
  });

  it.each(catalogBreaks)("$id has a real renderer and canonical docs target", ({ id, group, docsHref }) => {
    expect(componentItems.some(({ href }) => href === docsHref)).toBe(true);
    const renderer = readFileSync(new URL(`../components/react-demos/break-catalog-${group}.tsx`, import.meta.url), "utf8");
    expect(renderer).toContain(group === "utilities" ? `"${id}"` : `case "${id}":`);
    expect(renderer).toContain("FixtureCases");
    expect(renderer).not.toContain("dangerouslySetInnerHTML");
  });
});
