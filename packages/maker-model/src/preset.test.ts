import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { describe, expect, it } from "vitest";
import { withChildren } from "./node.js";
import { presetFor } from "./preset.js";
import { counterIds, toUsageTree } from "./project.js";
import { catalogue } from "./structure.js";

/*
 * A preset may be PENDING (a Stack nobody has filled, a Hero still waiting for its heading), but
 * never wrong in a way the author did not cause: it must not break a rule about what it already
 * holds or which values it gives. These are the rules that mean "what is here is wrong", as against
 * "something is still missing".
 */
const WRONG = new Set([
  "unknown-option",
  "invalid-option-value",
  "restricted-option-value",
  "excluded-option",
  "slot-accepts",
  "unknown-slot",
  "invalid-child",
  "content-model",
  "unknown-attr",
  "invalid-attr-value",
  "shadowed-attr",
  "unknown-item-option",
  "duplicate-item-key",
]);

describe("presets", () => {
  const refs = catalogue();

  it("exist for every signature in the catalogue", () => {
    for (const ref of refs) expect(presetFor(ref, counterIds()), `${ref.contract}/${ref.signature}`).toBeDefined();
  });

  it.each(refs.map((ref) => [`${ref.contract}/${ref.signature}`, ref] as const))("%s is at worst pending", (_name, ref) => {
    const preset = presetFor(ref, counterIds())!;
    const wrong = validateUsageTree(toUsageTree(preset)).problems.filter((problem) => WRONG.has(problem.rule));
    expect(wrong).toEqual([]);
  });

  it("insert an empty layout container, pending, rather than filling it with placeholder text", () => {
    const stack = presetFor({ contract: "layout", signature: "Stack" }, counterIds())!;
    expect(stack.slots.children).toEqual({ kind: "nodes", children: [] });
  });

  it("satisfy Box's at-least-one rule on their own", () => {
    const box = presetFor({ contract: "box", signature: "Box" }, counterIds())!;
    const filled = withChildren(box, "children", [{ id: "x", text: "content" }]);
    expect(validateUsageTree(toUsageTree(filled)).valid).toBe(true);
  });
});
