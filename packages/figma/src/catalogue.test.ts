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

/* A nested realization draws the markup's own structure, not a flat row of slots. */
describe("Callout, drawn as it nests", () => {
  it("puts the icon beside a content column that fills the row", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id.startsWith("callout/"))!;
    const cell = set.cells[0];
    const host = manifest.styles.boxes[cell.box];
    const layers = manifest.styles.layers[cell.layers];
    expect(host.direction).toBe("HORIZONTAL");
    const content = layers.find((l) => l.kind === "frame" && l.slot === "content");
    expect(content?.kind).toBe("frame");
    if (content?.kind !== "frame") return;
    expect(manifest.styles.boxes[content.box]).toMatchObject({ direction: "VERTICAL", grow: true });
    expect(content.layers.map((l) => `${l.kind} ${l.slot}`)).toEqual(["text title", "text children"]);
  });
});
