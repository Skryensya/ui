import { describe, expect, it } from "vitest";
import { commit, redo, startHistory, undo } from "./history.js";
import { findNode } from "./node.js";
import { createPage, parse, serialize, type MakerPage } from "./page.js";
import { pending, problemsOf } from "./problems.js";
import { counterIds } from "./project.js";
import { layoutRole } from "./role.js";
import { node, samplePage } from "./test-page.js";

const page = (): MakerPage => ({ ...createPage("hash-a", counterIds()), root: samplePage() });

describe("pending", () => {
  it("is what the validator says, placed on the nodes it concerns", () => {
    const state = pending(
      node("main", "layout", "Main", [node("w", "wrapper", "Wrapper", [node("s", "layout", "Stack")])]),
    );
    expect(state.valid).toBe(false);
    expect(problemsOf(state, "s").map((problem) => problem.rule)).toContain("missing-required-slot");
    expect(pending(samplePage()).valid).toBe(true);
  });
});

describe("layout role", () => {
  it("says what a node is to its parent, never where it is", () => {
    const role = layoutRole(samplePage(), "b2")!;
    expect(role).toMatchObject({ parent: "Inline", parentId: "i", position: 2, of: 2 });
    expect(role.summary).toBe("Item in a row that wraps when it runs out of room; sized to its content.");
    expect(Object.keys(role)).not.toEqual(expect.arrayContaining(["x", "y"]));
  });

  it("follows the child attribute the parent publishes", () => {
    const root = samplePage();
    const sized = JSON.parse(JSON.stringify(root));
    sized.slots.children.children[0].slots.children.children[0].slots.children.children[2].slots.children.children[0].attrs = { "data-sizing": "fill" };
    expect(layoutRole(sized, "b1")!.summary).toContain("fills the leftover space");
  });

  it("describes an auto-fit grid by its floor", () => {
    const root = node("main", "layout", "Main", [node("g", "layout", "Grid", [node("c", "tile", "Tile")], { minColumn: "md" })]);
    expect(layoutRole(root, "c")!.summary).toBe("Cell in a grid that fits as many columns of at least md as its width allows.");
  });
});

describe("page", () => {
  it("round-trips through its file, and says when the catalogue has moved", () => {
    const saved = serialize(page(), "hash-a");
    const same = parse(saved, "hash-a");
    expect(same.ok && same.page.root).toEqual(samplePage());
    expect(same.ok && same.catalogueChanged).toBe(false);
    const moved = parse(saved, "hash-b");
    expect(moved.ok && moved.catalogueChanged).toBe(true);
  });

  it("refuses what is not a maker page", () => {
    expect(parse("{}", "h").ok).toBe(false);
    expect(parse("not json", "h").ok).toBe(false);
    expect(parse(JSON.stringify({ ...page(), root: samplePage().slots }), "h").ok).toBe(false);
  });

  it("stores nothing the browser measured", () => {
    expect(serialize(page(), "hash-a")).not.toMatch(/"(x|y|top|left|width|height|transform|position)"/);
  });
});

describe("history", () => {
  it("makes one gesture one step, and undo and redo walk the steps", () => {
    const start = startHistory(page());
    const one = commit(start, [
      { type: "setOption", node: "s", name: "gap", value: "lg" },
      { type: "setOption", node: "i", name: "justify", value: "end" },
    ]);
    if (!one.ok) throw new Error(one.reason);
    expect(one.history.past).toHaveLength(1);
    const back = undo(one.history);
    expect(findNode(back.present.root, "s")!.options).toBeUndefined();
    expect(findNode(redo(back).present.root, "i")!.options).toEqual({ justify: "end" });
  });

  it("records nothing for a refused gesture or one that changes nothing", () => {
    const start = startHistory(page());
    expect(commit(start, [{ type: "setOption", node: "s", name: "padding", value: "md" }]).ok).toBe(false);
    const none = commit(start, []);
    expect(none.ok && none.history).toBe(start);
  });
});
