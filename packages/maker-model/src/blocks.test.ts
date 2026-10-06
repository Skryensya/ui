import { describe, expect, it } from "vitest";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { BLOCK_CATEGORIES, blocks } from "./blocks.js";
import { fromUsageTree } from "./project.js";
import { canPlaceAt } from "./structure.js";
import { counterIds } from "./project.js";

describe("blocks", () => {
  it("have one id each, and a known category", () => {
    expect(new Set(blocks.map((block) => block.id)).size).toBe(blocks.length);
    for (const block of blocks) expect(BLOCK_CATEGORIES).toContain(block.category);
  });
  it.each(blocks.map((block) => [block.id, block] as const))("%s is a valid composition, and fits in the page's Main", (_id, block) => {
    const result = validateUsageTree(block.tree);
    expect(result.problems.filter((p) => p.severity === "error").map((p) => p.message)).toEqual([]);
    const main = fromUsageTree({ contract: "layout", signature: "Main", children: [] } as never, counterIds("m"));
    expect(canPlaceAt(main, { parent: main.id, slot: "children", index: 0 }, fromUsageTree(block.tree, counterIds("b")))).toBe(true);
  });
});
