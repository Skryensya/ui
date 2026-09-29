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

describe("Separator", () => {
  const first = (id: string) => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === id)!;
    return set.cells[0];
  };

  it("draws its rule as a top border alone, as tall as that border", () => {
    const box = manifest.styles.boxes[first("separator").box];
    expect(box.height).toBeUndefined();
    expect(box.strokeSides?.right).toEqual({ value: 0, expression: "0" });
    expect(box.strokeSides?.top).not.toEqual({ value: 0, expression: "0" });
  });

  it("tells its labelled version's two rules apart, both filling the row", () => {
    const layers = manifest.styles.layers[first("labelled-separator").layers];
    expect(layers.map((l) => l.slot)).toEqual(["rule", "children", "rule 2"]);
    for (const layer of layers) if (layer.kind === "frame") expect(manifest.styles.boxes[layer.box].grow).toBe(true);
  });
});

describe("Quote, drawn at a reading width", () => {
  it("wraps the quotation inside the rule, and keeps the attribution and its source on their own widths", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "quote")!;
    const cell = set.cells.find((c) => c.props.variant === "block")!;
    const [body, attribution] = manifest.styles.layers[cell.layers];
    expect(body.kind === "frame" && manifest.styles.boxes[body.box].stretch).toBe(true);
    expect(body.kind === "frame" && body.layers[0]).toMatchObject({ kind: "text", slot: "children", fill: true });
    expect(body.kind === "frame" && manifest.styles.boxes[body.box].padding.left).not.toEqual({ value: 0, expression: "0" });
    expect(attribution.kind === "frame" && attribution.layers.every((l) => l.kind === "text" && !l.fill)).toBe(true);
  });
});

describe("EmptyState", () => {
  it("centres a bold title and a wrapping description down its column", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "empty-state")!;
    const layers = manifest.styles.layers[set.cells[0].layers];
    expect(layers.map((l) => `${l.kind} ${l.slot}`)).toEqual(["frame icon", "text title", "text description"]);
    const title = layers[1];
    expect(title.kind === "text" && title.text).toMatchObject({ fontWeight: { value: 700 }, align: "CENTER" });
    expect(layers[2]).toMatchObject({ fill: true, text: { align: "CENTER" } });
  });
});

describe("Progress", () => {
  it("draws its bar as the given share of the track, full height, in the track's corners", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "progress")!;
    const [bar] = manifest.styles.layers[set.cells[0].layers];
    expect(bar.kind).toBe("frame");
    if (bar.kind !== "frame") return;
    expect(manifest.styles.boxes[bar.box]).toMatchObject({ width: { value: 144 }, stretch: true, radius: { variable: "--radius-pill" } });
  });
});

describe("Meter", () => {
  it("prints its label and value from options, over a track filled as the binding mounts it", () => {
    const set = manifest.components.find((c): c is ComponentSet => c.kind === "component-set" && c.id === "meter")!;
    expect(set.properties.map((p) => p.name)).toEqual(["label", "value", "show value"]);
    const [header, track] = manifest.styles.layers[set.cells[0].layers];
    expect(header.kind === "frame" && header.layers.map((l) => l.slot)).toEqual(["label", "value"]);
    const bar = track.kind === "frame" ? track.layers[0] : undefined;
    expect(bar?.kind === "frame" && manifest.styles.boxes[bar.box].width).toMatchObject({ value: 163.2 });
  });
});
