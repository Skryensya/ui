import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { canonical } from "@skryensya/ai-compiler/manifest";
import { surfaceHash } from "@skryensya/ai-compiler/surface";
import { buttonContract } from "@skryensya/core/button";
import { parseTokens } from "@skryensya/core/parse";
import { buildFigmaManifest } from "./build.js";
import { evalColor, evalQuantity } from "./evaluate.js";
import type { ComponentSet, FigmaManifest } from "./manifest-types.js";
import { buttonRealization } from "./realizations/button.js";

const root = join(import.meta.dirname, "../../..");
let manifest: FigmaManifest;
let sets: ComponentSet[];

beforeAll(async () => {
  manifest = await buildFigmaManifest(root, buttonRealization);
  sets = manifest.components.filter((c): c is ComponentSet => c.kind === "component-set");
});

const variable = (id: string) => manifest.variables.find((v) => v.id === id);

describe("determinism", () => {
  it("builds byte-identical output twice", async () => {
    const again = await buildFigmaManifest(root, buttonRealization);
    expect(canonical(again)).toBe(canonical(manifest));
  });

  it("orders variables by collection, then name", () => {
    const keys = manifest.variables.map((v) => `${v.collection}\u0000${v.name}`);
    expect(keys).toEqual([...keys].sort((a, b) => a.localeCompare(b)));
  });

  it("hashes each cell over its own content", () => {
    for (const cell of sets[0].cells.slice(0, 20)) {
      const { hash, ...body } = cell;
      expect(createHash("sha256").update(canonical(body)).digest("hex").slice(0, 16)).toBe(hash);
    }
  });

  it("reuses surfaceHash for the contract hash, unchanged in meaning", () => {
    for (const set of sets) expect(set.contractHash).toBe(surfaceHash(buttonContract));
  });
});

describe("derived from the contract", () => {
  const enumValues = (name: string) => [...(buttonContract.options[name as keyof typeof buttonContract.options] as { values: readonly string[] }).values];

  it("takes every axis and value from buttonContract", () => {
    const axes = Object.fromEntries(sets[0].axes.map((a) => [a.name, a.values]));
    expect(axes.variant).toEqual(enumValues("variant"));
    expect(axes.tone).toEqual(enumValues("tone"));
    expect(axes.size).toEqual(enumValues("size"));
    expect(axes.iconOnly).toEqual(["false", "true"]);
    expect(sets.map((s) => s.id)).toEqual(enumValues("appearance").map((v) => `button/${v}`));
  });

  it("finds the non-visual options by the cascade, not by a list", () => {
    const report = manifest.report as { options: { visual: string[]; nonVisual: string[] } };
    expect(report.options.nonVisual).toEqual(["type"]);
    expect(report.options.visual).toContain("pressed");
    expect(report.options.visual).toContain("disabled");
  });

  it("puts the contract's defaults top-left", () => {
    const defaults = buttonContract.options;
    expect(sets[0].defaultCell).toBe(
      `variant=${defaults.variant.default}, tone=${defaults.tone.default}, size=${defaults.size.default}, state=rest, iconOnly=false`,
    );
    for (const axis of [...sets[0].grid.columns, ...sets[0].grid.rows]) {
      const d = axis.name in defaults ? String((defaults as Record<string, { default?: unknown }>)[axis.name].default) : "rest";
      expect(axis.values[0]).toBe(d === "undefined" ? "rest" : d);
    }
  });

  it("restates no option value in the Figma realization", () => {
    const source = readFileSync(join(import.meta.dirname, "realizations/button.ts"), "utf8");
    const report = manifest.report as { options: { visual: string[] } };
    for (const name of report.options.visual) {
      const option = (buttonContract.options as Record<string, { type: string; values?: readonly string[] }>)[name];
      for (const value of option.values ?? []) expect(source).not.toMatch(new RegExp(`["']${value}["']`));
    }
  });
});

describe("tokens", () => {
  it("keeps a semantic colour as an alias of the palette entry the CSS names, per mode", () => {
    const authored = parseTokens().tokens.find((t) => t.name === "--color-action-accent")!.value;
    const [light, dark] = [...authored.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]);
    expect(variable("--color-action-accent")?.values).toEqual({
      light: { kind: "alias", variable: light },
      dark: { kind: "alias", variable: dark },
    });
    expect(variable(light)?.collection).toBe("primitives");
  });

  it("evaluates a density formula and says so", () => {
    const v = variable("--space-inset-md")!;
    expect(v.source.light).toBe("evaluated");
    expect(v.expression).toContain("--sk-density");
    expect(v.values.light).toEqual({ kind: "literal", value: 16 });
  });

  it("includes only tokens Button reaches", () => {
    const report = manifest.report as { tokens: { reached: number; variables: number } };
    expect(report.tokens.variables).toBeLessThanOrEqual(report.tokens.reached);
    expect(report.tokens.reached).toBeLessThan(parseTokens().tokens.length / 10);
    expect(variable("--color-bg-accent-subtle")).toBeUndefined();
  });

  it("binds a hook to its token rather than copying the value", () => {
    const cell = sets[0].cells.find((c) => c.key === "variant=solid, tone=accent, size=sm, state=rest, iconOnly=false")!;
    const surface = manifest.styles.surfaces[cell.surface];
    expect(surface.fills[0]).toEqual({ type: "SOLID", color: { variable: "--color-action-accent" } });
    expect(manifest.styles.boxes[cell.box].minHeight).toEqual({ variable: "--size-control-sm" });
  });

  it("reports nothing it could not evaluate as a warning", () => {
    expect(manifest.diagnostics.filter((d) => d.severity === "warning")).toEqual([]);
  });
});

describe("representation", () => {
  it("stays far below the naive product", () => {
    const report = manifest.report as { variants: { naiveAllOptions: number; variantsTotal: number } };
    expect(report.variants.naiveAllOptions).toBe(27648);
    for (const set of sets) expect(set.cells.length).toBeLessThanOrEqual(300);
    expect(report.variants.variantsTotal).toBe(sets.reduce((n, s) => n + s.cells.length, 0));
  });

  it("mirrors the docs previews on the specimen, every one landing on a cell", () => {
    expect(manifest.specimen.length).toBeGreaterThanOrEqual(15);
    for (const entry of manifest.specimen) {
      const set = sets.find((s) => s.id === entry.set)!;
      expect(set.cells.some((c) => c.key === entry.cell)).toBe(true);
    }
  });
});

describe("the evaluator", () => {
  it("mixes with transparent into alpha, as CSS does", () => {
    expect(evalColor("color-mix(in oklab, oklch(50% 0.1 250) 28%, transparent)").a).toBeCloseTo(0.28, 4);
    expect(evalColor("oklch(from oklch(0% 0 0 / 0.22) l c h / 1)").a).toBe(1);
  });

  it("does the length maths the tokens use", () => {
    expect(evalQuantity("max(round(calc(24px * 1), 2px), 24px)")).toEqual({ value: 24, unit: "px" });
    expect(evalQuantity("round(nearest, calc(5px * 0.4), 1px)")).toEqual({ value: 2, unit: "px" });
    expect(() => evalQuantity("calc(1px + 1%)")).toThrow();
  });
});
