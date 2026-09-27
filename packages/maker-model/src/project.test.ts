import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { emitReact } from "@skryensya/ai-compiler/emit";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { describe, expect, it } from "vitest";
import { corpus } from "./test-corpus.js";
import { walk, walkChildren } from "./node.js";
import { counterIds, fromUsageTree, reidentify, toUsageTree } from "./project.js";

describe("projection", () => {
  /*
   * The claim decision 31 rests on: a maker node is a usage-tree node plus an identity and nothing
   * else. Every tree the repository holds goes in and comes back out emitting the same bytes in
   * both bindings, and validating the same way.
   */
  it.each(corpus.map((entry) => [entry.name, entry.tree] as const))("%s survives the round trip", (_name, tree) => {
    const back = toUsageTree(fromUsageTree(tree, counterIds()));
    expect(emitMarkup(back)).toBe(emitMarkup(tree));
    expect(emitReact(back)).toBe(emitReact(tree));
    expect(validateUsageTree(back).valid).toBe(validateUsageTree(tree).valid);
  });

  it("gives every node and every text run its own identity", () => {
    const { tree } = corpus.find((entry) => entry.name === "snippet/hero-with-actions")!;
    const node = fromUsageTree(tree, counterIds());
    const ids = [node.id, ...[...walkChildren(node)].map((child) => child.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves no identity in the projected tree", () => {
    const { tree } = corpus.find((entry) => entry.name === "snippet/hero-with-actions")!;
    const projected = JSON.stringify(toUsageTree(fromUsageTree(tree, counterIds("zz"))));
    expect(projected).not.toMatch(/"id":"zz\d+"|zz\d+/);
  });

  it("re-identifies a copy completely, the way duplicate needs", () => {
    const { tree } = corpus.find((entry) => entry.name === "snippet/hero-with-actions")!;
    const node = fromUsageTree(tree, counterIds("a"));
    const copy = reidentify(node, counterIds("b"));
    const before = new Set([...walk(node)].map((n) => n.id));
    expect([...walk(copy as typeof node)].some((n) => before.has(n.id))).toBe(false);
    expect(emitMarkup(toUsageTree(copy as typeof node))).toBe(emitMarkup(toUsageTree(node)));
  });
});
