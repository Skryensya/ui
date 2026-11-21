import { describe, expect, it } from "vitest";
import { layoutColumns } from "./canvas-layout";

describe("canvas layout", () => {
  const items = Array.from({ length: 40 }, (_, i) => ({ id: i, w: 20 + (i % 5) * 6, h: 10 + (i % 7) * 4 }));
  const columns = layoutColumns(items, (i) => i);

  it("places every part exactly once", () => {
    expect(columns.flatMap((c) => c.parts.map((p) => p.id)).sort((a, b) => a - b)).toEqual(items.map((i) => i.id));
  });

  it("is roughly square and every column is as wide as its widest part", () => {
    const width = columns.reduce((s, c) => s + c.w, 0) + columns.length - 1;
    const height = Math.max(...columns.map((c) => c.h));
    expect(width / height).toBeGreaterThan(0.6);
    expect(width / height).toBeLessThan(1.6);
    for (const c of columns) expect(c.w).toBe(Math.max(...c.parts.map((p) => p.w)));
  });
});
