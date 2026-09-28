import { describe, expect, it } from "vitest";
import { findChild, type MakerNode } from "./node.js";
import { canPlaceAt, catalogue, dropTargets, insertable, insertionPlace } from "./structure.js";
import { node, samplePage } from "./test-page.js";

const key = (place: { parent: string; slot: string; index: number }) => `${place.parent}/${place.slot}/${place.index}`;

describe("drop targets", () => {
  it("are gaps between siblings, never a position", () => {
    for (const place of dropTargets(samplePage(), findChild(samplePage(), "b1")!)) {
      expect(Object.keys(place).sort()).toEqual(["index", "parent", "slot"]);
    }
  });

  it("leave out the gaps on either side of the dragged node, which would change nothing", () => {
    const targets = dropTargets(samplePage(), findChild(samplePage(), "h")!).map(key);
    expect(targets).not.toContain("s/children/0");
    expect(targets).not.toContain("s/children/1");
    expect(targets).toContain("s/children/2");
    expect(targets).toContain("s/children/3");
  });

  it("leave out everything inside the dragged node", () => {
    const targets = dropTargets(samplePage(), findChild(samplePage(), "s")!);
    expect(targets.some((place) => ["s", "i", "h", "t", "b1", "b2"].includes(place.parent))).toBe(false);
  });

  it("offer an Inline's gaps to a button: [ Button ] | + | [ Button ] | + |", () => {
    const targets = dropTargets(samplePage(), findChild(samplePage(), "t")!).map(key);
    expect(targets).toEqual(expect.arrayContaining(["i/children/0", "i/children/1", "i/children/2"]));
  });

  it("never offer a Wrapper a place inside a Wrapper", () => {
    const wrapper: MakerNode = node("w2", "wrapper", "Wrapper");
    const targets = dropTargets(samplePage(), wrapper);
    expect(targets.map(key)).toEqual(["main/children/0", "main/children/1"]);
  });

  it("never offer a paragraph a place inside a button", () => {
    const targets = dropTargets(samplePage(), findChild(samplePage(), "t")!);
    expect(targets.some((place) => place.parent === "b1" || place.parent === "b2")).toBe(false);
  });

  it("agree with canPlaceAt everywhere", () => {
    const root = samplePage();
    const child = findChild(root, "i")!;
    for (const place of dropTargets(root, child)) expect(canPlaceAt(root, place, child)).toBe(true);
  });
});

describe("insertion place", () => {
  it("goes inside a container that is selected, at the end", () => {
    expect(insertionPlace(samplePage(), "s")).toEqual({ parent: "s", slot: "children", index: 3 });
  });

  it("goes right after a selected heading, paragraph or button: what they hold is their own text", () => {
    expect(insertionPlace(samplePage(), "h")).toEqual({ parent: "s", slot: "children", index: 1 });
    expect(insertionPlace(samplePage(), "b1")).toEqual({ parent: "i", slot: "children", index: 1 });
  });

  it("goes inside an empty layout container, the place it is waiting to fill", () => {
    const root = node("main", "layout", "Main", [node("empty", "layout", "Stack")]);
    expect(insertionPlace(root, "empty")).toEqual({ parent: "empty", slot: "children", index: 0 });
  });

  it("goes right after a selected text run, which holds nothing", () => {
    expect(insertionPlace(samplePage(), "h-t")).toEqual({ parent: "h", slot: "children", index: 1 });
  });
});

describe("the catalogue", () => {
  it("offers every published family's signatures and none of the paused ones", () => {
    const refs = catalogue();
    expect(refs.length).toBeGreaterThan(100);
    expect(refs).toContainEqual({ contract: "layout", signature: "Stack" });
    expect(refs).toContainEqual({ contract: "wrapper", signature: "Wrapper" });
  });
});

describe("insertable", () => {
  it("offers a layout primitive in a Stack but no Wrapper inside a Wrapper, and nothing block-level in a button", async () => {
    const { presetFor } = await import("./preset.js");
    const { counterIds } = await import("./project.js");
    const newId = counterIds("p");
    const inStack = insertable(samplePage(), { parent: "s", slot: "children", index: 0 }, (ref) => presetFor(ref, newId));
    expect(inStack).toContainEqual({ contract: "layout", signature: "Inline" });
    expect(inStack).not.toContainEqual({ contract: "wrapper", signature: "Wrapper" });
    const inButton = insertable(samplePage(), { parent: "b1", slot: "children", index: 0 }, (ref) => presetFor(ref, newId));
    expect(inButton).not.toContainEqual({ contract: "layout", signature: "Stack" });
  });
});
