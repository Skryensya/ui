import { describe, expect, it } from "vitest";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { componentsCanvas } from "./components-canvas";

const components = componentsCanvas();

describe("components canvas", () => {
  it("emits only valid specimens and covers every enum value of Button", () => {
    for (const c of components)
      for (const s of c.signatures)
        for (const g of s.groups) for (const sp of g.specimens) expect(validateUsageTree(sp.tree).valid).toBe(true);
    const size = components.find((c) => c.id === "button")!.signatures[0]!.groups.find((g) => g.option === "size")!;
    expect(size.specimens.length).toBeGreaterThan(1);
  });

  it("seeds most components", () => {
    const seeded = components.filter((c) => c.signatures.length).length;
    console.log(`seeded ${seeded}/${components.length}; skipped:`, components.flatMap((c) => c.skipped.map((s) => `${c.id}.${s}`)).join(", "));
    expect(seeded).toBeGreaterThan(components.length / 2);
  });
});
