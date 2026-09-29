import { beforeAll, describe, expect, it } from "vitest";
import { badgeContract } from "@skryensya/core/badge";
import { buildFigmaManifest } from "./build.js";
import type { ComponentSet, FigmaManifest } from "./manifest-types.js";
import { badgeRealization } from "./realizations/badge.js";
import { buttonRealization } from "./realizations/button.js";

let both: FigmaManifest;
let badge: ComponentSet[];

beforeAll(async () => {
  both = await buildFigmaManifest([buttonRealization, badgeRealization]);
  badge = both.components.filter((c): c is ComponentSet => c.kind === "component-set" && c.id.startsWith("badge/"));
});

describe("Badge", () => {
  it("draws one set per appearance, every tone and size, and no state axis", () => {
    expect(badge.map((s) => s.id)).toEqual(badgeContract.options.appearance.values.map((a) => `badge/${a}`));
    for (const set of badge) {
      expect(set.axes.map((a) => a.name).sort()).toEqual(["size", "tone"]);
      expect(set.cells).toHaveLength(badgeContract.options.tone.values.length * badgeContract.options.size.values.length);
      expect(set.interactions).toEqual([]);
    }
  });

  it("realizes every cell: no cell left out as unsupported", () => {
    expect(both.diagnostics.filter((d) => d.severity === "warning")).toEqual([]);
  });

  it("reads its padding shorthand and the page's font", () => {
    const cell = badge[0].cells.find((c) => c.props.tone === "danger" && c.props.size === "md")!;
    expect(both.styles.boxes[cell.box].padding.left).toEqual({ variable: "--space-inset-sm" });
    const [text] = both.styles.layers[cell.layers];
    expect(text.kind === "text" && text.text.fontFamily).toEqual({ variable: "--font-family-body" });
  });

  it("names its component variables under its own contract, beside Button's", () => {
    const names = both.variables.filter((v) => v.collection === "component").map((v) => v.name);
    expect(names.some((n) => n.startsWith("badge/"))).toBe(true);
    expect(names.every((n) => n.startsWith("badge/") || n.startsWith("button/") || n.startsWith("component-preview/"))).toBe(true);
  });

  it("changes nothing about Button's sets by being added", async () => {
    const alone = await buildFigmaManifest(buttonRealization);
    const hashes = (m: FigmaManifest) => m.components.filter((c) => c.id.startsWith("button/")).map((c) => (c as ComponentSet).visualHash);
    expect(hashes(both)).toEqual(hashes(alone));
  });
});
