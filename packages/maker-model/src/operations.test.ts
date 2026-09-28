import { describe, expect, it } from "vitest";
import { childrenOf, findNode, locate, type MakerNode } from "./node.js";
import { apply, applyAll, type Applied, type Operation } from "./operations.js";
import { counterIds, fromUsageTree, toUsageTree } from "./project.js";
import { samplePage } from "./test-page.js";

const page = samplePage;

function ok(result: Applied): MakerNode {
  if (!result.ok) throw new Error(result.reason);
  return result.root;
}

const order = (root: MakerNode, parent: string) => childrenOf(findNode(root, parent)!, "children").map((child) => child.id);

describe("move", () => {
  it("reorders siblings: the index is a gap in the list as it stands", () => {
    /* Button b2 is at 1; the gap before b1 is 0. */
    const root = ok(apply(page(), { type: "move", child: "b2", to: { parent: "i", slot: "children", index: 0 } }));
    expect(order(root, "i")).toEqual(["b2", "b1"]);
    /* Heading at 0 to the gap after Text (2) lands between Text and Inline. */
    const down = ok(apply(page(), { type: "move", child: "h", to: { parent: "s", slot: "children", index: 2 } }));
    expect(order(down, "s")).toEqual(["t", "h", "i"]);
  });

  it("changes parent, and the spec's example holds: a button between Heading and Text", () => {
    const root = ok(apply(page(), { type: "move", child: "b1", to: { parent: "s", slot: "children", index: 1 } }));
    expect(order(root, "s")).toEqual(["h", "b1", "t", "i"]);
    expect(order(root, "i")).toEqual(["b2"]);
  });

  it("leaves the old parent's child attributes behind, and keeps them on a reorder", () => {
    const sized = ok(apply(page(), { type: "setAttr", node: "b1", name: "data-sizing", value: "fill" }));
    const reordered = ok(apply(sized, { type: "move", child: "b1", to: { parent: "i", slot: "children", index: 2 } }));
    expect(findNode(reordered, "b1")!.attrs).toEqual({ "data-sizing": "fill" });
    const moved = ok(apply(sized, { type: "move", child: "b1", to: { parent: "s", slot: "children", index: 0 } }));
    expect(findNode(moved, "b1")!.attrs).toBeUndefined();
  });

  it("refuses to put a node inside itself", () => {
    const result = apply(page(), { type: "move", child: "s", to: { parent: "i", slot: "children", index: 0 } });
    expect(result.ok).toBe(false);
  });

  it("refuses what the contract forbids: a Wrapper inside a Wrapper, at any depth", () => {
    const wrapper: MakerNode = { id: "w2", contract: "wrapper", signature: "Wrapper", slots: { children: { kind: "nodes", children: [] } } };
    const result = apply(page(), { type: "insert", at: { parent: "i", slot: "children", index: 0 }, child: wrapper });
    expect(result.ok).toBe(false);
  });

  it("refuses what HTML's content model forbids: a paragraph inside a button", () => {
    const result = apply(page(), { type: "move", child: "t", to: { parent: "b1", slot: "children", index: 0 } });
    expect(result.ok).toBe(false);
  });

  it("refuses a node in a slot that takes text", () => {
    const top: MakerNode = { id: "top", contract: "back-to-top", signature: "BackToTop", slots: { children: { kind: "text", text: "Top" } } };
    const withTop = ok(apply(page(), { type: "insert", at: { parent: "s", slot: "children", index: 3 }, child: top }));
    expect(apply(withTop, { type: "move", child: "h", to: { parent: "top", slot: "children", index: 0 } }).ok).toBe(false);
  });

  it("never moves the root", () => {
    expect(apply(page(), { type: "move", child: "main", to: { parent: "s", slot: "children", index: 0 } }).ok).toBe(false);
  });
});

describe("insert and remove", () => {
  it("inserts at a gap and refuses an identity already in the page", () => {
    const text: MakerNode = { id: "t2", contract: "typography", signature: "Text", slots: { children: { kind: "nodes", children: [{ id: "t2-t", text: "More" }] } } };
    const root = ok(apply(page(), { type: "insert", at: { parent: "s", slot: "children", index: 3 }, child: text }));
    expect(order(root, "s")).toEqual(["h", "t", "i", "t2"]);
    expect(apply(root, { type: "insert", at: { parent: "s", slot: "children", index: 0 }, child: text }).ok).toBe(false);
  });

  it("removes a subtree but never the root, and leaves an emptied container in place", () => {
    const root = ok(applyAll(page(), [
      { type: "remove", child: "b1" },
      { type: "remove", child: "b2" },
    ]));
    expect(order(root, "i")).toEqual([]);
    expect(findNode(root, "i")).toBeDefined();
    expect(apply(root, { type: "remove", child: "main" }).ok).toBe(false);
  });
});

describe("wrap and unwrap", () => {
  const inline = (id: string): MakerNode => ({ id, contract: "layout", signature: "Inline", slots: { children: { kind: "nodes", children: [] } } });

  it("\"Put these two next to each other\" is a wrap in an Inline, never a coordinate", () => {
    const root = ok(apply(page(), { type: "wrap", children: ["h", "t"], container: inline("row") }));
    expect(order(root, "s")).toEqual(["row", "i"]);
    expect(order(root, "row")).toEqual(["h", "t"]);
  });

  it("refuses siblings that are not contiguous, or not siblings", () => {
    expect(apply(page(), { type: "wrap", children: ["h", "i"], container: inline("row") }).ok).toBe(false);
    expect(apply(page(), { type: "wrap", children: ["h", "b1"], container: inline("row") }).ok).toBe(false);
  });

  it("unwrap undoes wrap exactly", () => {
    const wrapped = ok(apply(page(), { type: "wrap", children: ["t", "i"], container: inline("row") }));
    const back = ok(apply(wrapped, { type: "unwrap", node: "row" }));
    expect(toUsageTree(back)).toEqual(toUsageTree(page()));
  });

  it("refuses a wrap that would put a Wrapper inside a Wrapper", () => {
    const wrapper: MakerNode = { id: "w2", contract: "wrapper", signature: "Wrapper", slots: { children: { kind: "nodes", children: [] } } };
    expect(apply(page(), { type: "wrap", children: ["s"], container: wrapper }).ok).toBe(false);
  });
});

describe("options and attributes: the contract's vocabulary and nothing else", () => {
  it("sets a declared option with an allowed value, and removes it with undefined", () => {
    const root = ok(apply(page(), { type: "setOption", node: "s", name: "gap", value: "lg" }));
    expect(findNode(root, "s")!.options).toEqual({ gap: "lg" });
    const back = ok(apply(root, { type: "setOption", node: "s", name: "gap" }));
    expect(findNode(back, "s")!.options).toEqual({});
  });

  it("refuses an option the signature does not declare: Stack has no padding and no justify", () => {
    expect(apply(page(), { type: "setOption", node: "s", name: "padding", value: "md" }).ok).toBe(false);
    expect(apply(page(), { type: "setOption", node: "s", name: "justify", value: "center" }).ok).toBe(false);
  });

  it("refuses a value outside the scale", () => {
    expect(apply(page(), { type: "setOption", node: "s", name: "gap", value: "23px" }).ok).toBe(false);
  });

  it("refuses style, class and handlers outright", () => {
    for (const name of ["style", "class", "onclick"]) {
      expect(apply(page(), { type: "setAttr", node: "h", name, value: "x" }).ok).toBe(false);
    }
  });

  it("takes a child attribute only from the parent that publishes it, within its vocabulary", () => {
    expect(apply(page(), { type: "setAttr", node: "b1", name: "data-sizing", value: "fill" }).ok).toBe(true);
    expect(apply(page(), { type: "setAttr", node: "b1", name: "data-sizing", value: "342px" }).ok).toBe(false);
    /* The Heading's parent is a Stack, which publishes no sizing. */
    expect(apply(page(), { type: "setAttr", node: "h", name: "data-sizing", value: "fill" }).ok).toBe(false);
  });

  it("refuses an attribute an option already writes", () => {
    expect(apply(page(), { type: "setAttr", node: "s", name: "data-gap", value: "lg" }).ok).toBe(false);
  });
});

describe("text", () => {
  it("edits a slot that takes text, and a text run in a slot of nodes", () => {
    const labelled = ok(apply(page(), { type: "setText", node: "b1", slot: "children", text: "Uno" }));
    expect(childrenOf(findNode(labelled, "b1")!, "children")).toEqual([{ id: "b1-t", text: "Uno" }]);
    const retitled = ok(apply(page(), { type: "setText", node: "h-t", slot: "children", text: "Nuevo" }));
    expect(childrenOf(findNode(retitled, "h")!, "children")).toEqual([{ id: "h-t", text: "Nuevo" }]);
  });
});

describe("a gesture", () => {
  it("lands whole or not at all", () => {
    const gesture: Operation[] = [
      { type: "setOption", node: "s", name: "gap", value: "lg" },
      { type: "setOption", node: "s", name: "padding", value: "md" },
    ];
    expect(applyAll(page(), gesture).ok).toBe(false);
  });

  it("replays to the same page, since every identity it mints travels with it", () => {
    const newId = counterIds("x");
    const box = fromUsageTree({ contract: "box", signature: "Box", options: { padding: "md" } }, newId);
    const gesture: Operation[] = [{ type: "wrap", children: ["s"], container: box }];
    expect(ok(applyAll(page(), gesture))).toEqual(ok(applyAll(page(), gesture)));
    expect(locate(ok(applyAll(page(), gesture)), "s")!.parent.id).toBe(box.id);
  });
});
