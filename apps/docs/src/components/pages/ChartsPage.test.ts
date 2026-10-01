import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/*
 * The two claims this page makes about itself, checked against its own source.
 *
 * `astro check` is happy either way if someone adds a `<ChartCard>` export or leaks TanStack's
 * grammar back onto the documented path. The page would keep rendering, and the paragraph explaining
 * that Chart is a contract (a list of points) would quietly become false.
 */
const page = readFileSync(fileURLToPath(new URL("./ChartsPage.astro", import.meta.url)), "utf8");
/* The cards and every kind are usage trees now (`demos/charts.ts`): one source for both bindings. */
const cards = readFileSync(fileURLToPath(new URL("../../demos/charts.ts", import.meta.url)), "utf8");
const kinds = cards;

describe("ChartsPage.astro", () => {
  it("composes the dashboard cards from Box, Stat, Chart and Button", () => {
    expect(cards).toContain('contract: "box"');
    expect(cards).toContain('contract: "stat"');
    expect(cards).toContain('contract: "button"');
    expect(cards).toContain('contract: "chart"');
    expect(cards).not.toContain("<ChartCard>");
    expect(cards).not.toContain("sk-card");
    expect(cards).not.toContain("BarChart");
  });

  it("does not expose TanStack's grammar on the documented path", () => {
    expect(cards).not.toContain("@tanstack/charts");
    expect(kinds).not.toContain("@tanstack/charts");
    expect(kinds).not.toContain("defineChart");
    expect(page).not.toContain("defineChart");
    expect(page).not.toContain("lineY(");
    expect(page).toContain("@skryensya/charts/react/tanstack");
  });

  it("shows every chart from a usage tree, with no React-only island", () => {
    const cardsHeading = page.indexOf('id="cards"');
    const pieceHeading = page.indexOf('id="chart"');
    expect(cardsHeading).toBeGreaterThan(-1);
    expect(pieceHeading).toBeGreaterThan(cardsHeading);
    // Line and area draw in both bindings now: a hand-written React demo here would be a second
    // source that only one binding can show.
    expect(page).not.toMatch(/Demo client:visible/);
  });

});
