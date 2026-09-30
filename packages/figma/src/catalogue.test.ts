import { beforeAll, describe, expect, it } from "vitest";
import { buildFigmaManifest } from "./build.js";
import type { ComponentSet, FigmaManifest } from "./manifest-types.js";
import { catalogue } from "./realizations/index.js";

let manifest: FigmaManifest;

beforeAll(async () => {
  manifest = await buildFigmaManifest(catalogue);
});

/* Every contract in the catalogue, held to the same bar: it compiles, and every cell it draws is real. */
describe("the catalogue", () => {
  it("compiles every component with no warning", () => {
    expect(manifest.diagnostics.filter((d) => d.severity === "warning")).toEqual([]);
  });

  it.each(catalogue.map((r) => [`${r.contract} ${r.signature}`, r] as const))("draws %s", (_, realization) => {
    const sets = manifest.components.filter(
      (c): c is ComponentSet =>
        c.kind === "component-set" && (c.id === (realization.id ?? realization.contract) || c.id.startsWith(`${realization.id ?? realization.contract}/`)),
    );
    expect(sets.length).toBeGreaterThan(0);
    for (const set of sets) expect(set.cells.length).toBeGreaterThan(0);
  });
});
