import { describe, expect, it } from "vitest";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { bentoSets, bentoSlots, phoneSlots } from "./landing-bento";

/*
 * Boxes that may be a single component: there is nothing that fits beside them in their cell, or the
 * component is already a composition of its own (a callout with its actions, a tab set, an empty state).
 * Anything else has to be a layout built from several components.
 */
const standalone = new Set([
  "switch",
  "dark",
  "pages",
  "tabs",
  "empty",
  "notice",
  "volume",
  "phone",
]);

describe.each([
  ["en", false],
  ["es", true],
])("landing bento (%s)", (_locale, es) => {
  const sets = bentoSets(es);

  it("has six sets, each laid out on the grid, with ids that never repeat", () => {
    expect(sets).toHaveLength(6);
    expect(new Set(sets.flat().map((tile) => tile.id)).size).toBe(
      sets.flat().length,
    );
    // Five sets share the twelve default boxes; one has its own layout with a phone in it.
    const layouts = sets.map((set) => set.map((tile) => tile.area));
    expect(
      layouts.filter(
        (areas) =>
          JSON.stringify(areas) ===
          JSON.stringify(bentoSlots.map((slot) => slot.area)),
      ),
    ).toHaveLength(5);
    expect(
      layouts.filter(
        (areas) =>
          JSON.stringify(areas) ===
          JSON.stringify(phoneSlots.map((slot) => slot.area)),
      ),
    ).toHaveLength(1);
  });

  it("covers each set's grid without overlapping boxes, leaving at most the deliberate hole", () => {
    for (const set of sets) {
      const cells = new Map<string, number>();
      for (const { area } of set) {
        const [row, column, rowSpan, columnSpan] = area;
        for (let r = row; r < row + rowSpan; r++) {
          for (let c = column; c < column + columnSpan; c++) {
            expect(r).toBeGreaterThanOrEqual(1);
            expect(r).toBeLessThanOrEqual(6);
            expect(c).toBeGreaterThanOrEqual(1);
            expect(c).toBeLessThanOrEqual(12);
            const key = `${r}:${c}`;
            cells.set(key, (cells.get(key) ?? 0) + 1);
          }
        }
      }
      expect([...cells.values()].every((count) => count === 1)).toBe(true);
      expect(72 - cells.size).toBeLessThanOrEqual(5);
    }
  });

  it("has exactly one phone, and it is tall enough to be one", () => {
    const phones = sets.flat().filter((tile) => tile.phone);
    expect(phones).toHaveLength(1);
    const [, , rowSpan, columnSpan] = phones[0].area;
    expect(rowSpan).toBe(6);
    expect(columnSpan).toBe(3);
  });

  it.each(
    sets.flatMap((set, index) =>
      set.map((tile) => [`${"AFBCDE"[index]}:${tile.id}`, tile] as const),
    ),
  )("%s is a valid usage tree", (_name, tile) => {
    const result = validateUsageTree(tile.tree);
    expect(
      result.problems.filter((problem) => problem.severity === "error"),
    ).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("is a composition, not a specimen, unless the box has room for nothing else", () => {
    for (const tile of sets.flat()) {
      if (standalone.has(tile.id)) continue;
      expect(tile.tree.contract, `${tile.id} should be a layout`).toBe(
        "layout",
      );
    }
  });
});
