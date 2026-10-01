import { describe, expect, it } from "vitest";
import { makerContext, type MakerAgentView } from "./context.js";
import { createSite, type MakerSite } from "./site.js";
import { counterIds } from "./project.js";
import { node, text } from "./test-page.js";

const root = node("main", "layout", "Main", [node("stack", "layout", "Stack", [
  node("a", "button", "Button.action", [text("a-text", "First")]),
  node("b", "button", "Button.action", [text("b-text", "Second")]),
  node("grid", "layout", "Grid", Array.from({ length: 60 }, (_, i) => node(`card-${i}`, "box", "Box", [text(`text-${i}`, `Item ${i}`)]))),
])]);
const base = createSite("hash", counterIds());
const site: MakerSite = { ...base, pages: [{ ...base.pages[0]!, id: "home", root }] };
const view: MakerAgentView = { page: "home", selectedIds: [], width: 52, scheme: "dark", contrast: false, density: "compact", mode: "edit" };
const context = (change: Partial<MakerAgentView> = {}) => makerContext(site, { id: "project", revision: 42 }, { ...view, ...change });

describe("Maker's canonical selection evidence", () => {
  it("falls back to the current page when selection is absent or removed", () => {
    for (const c of [context(), context({ selected: "removed", selectedIds: ["removed"] })]) {
      expect(c.selection.nodes).toEqual([]);
      expect(c.page.id).toBe("home");
      expect(c.insertion.inside).toEqual({ parent: "main", slot: "children", index: 1 });
    }
  });
  it("includes role, ancestors, text, parent, named slots and neighbors", () => {
    const c = context({ selected: "b", selectedIds: ["b"] });
    expect(c.selection.primary).toBe("b");
    expect(c.selection.nodes[0]?.role?.position).toBe(2);
    expect(c.selection.nodes[0]?.role?.summary).toContain("vertical stack");
    expect(c.selection.nodes[0]?.ancestors.map(n => n.id)).toEqual(["main", "stack"]);
    expect(c.neighborhood.parent?.id).toBe("stack");
    expect(c.neighborhood.before.map(n => n.id)).toEqual(["a"]);
    expect(c.neighborhood.after.map(n => n.id)).toEqual(["grid"]);
    expect(c.insertion.before).toEqual({ parent: "stack", slot: "children", index: 1 });
    expect(c.insertion.after?.index).toBe(2);
    expect(c.insertion.inside).toBeUndefined();
    expect(c.section).toBe("stack");
  });
  it("includes text layer identity and its deterministic relative gaps", () => {
    const c = context({ selected: "a-text" });
    expect(c.selection.nodes[0]).toMatchObject({ id: "a-text", text: "First" });
    expect(c.neighborhood.parent?.id).toBe("a");
    expect(c.insertion.after?.parent).toBe("a");
  });
  it("orders multi-selection by sibling order while preserving primary selection", () => {
    const c = context({ selected: "b", selectedIds: ["b", "a"] });
    expect(c.selection.primary).toBe("b");
    expect(c.selection.siblingOrder).toEqual(["a", "b"]);
    expect(c.selection.sharedParent).toEqual({ id: "stack", slot: "children" });
    expect(c.selection.contiguousSiblings).toBe(true);
    expect(c.selection.capabilities.wrapTargets).toContainEqual({ contract: "layout", signature: "Inline" });
  });
  it("does not advertise wrapping across parents or non-contiguous siblings", () => {
    expect(context({ selectedIds: ["a", "card-0"] }).selection.capabilities.canWrapTogether).toBe(false);
    expect(context({ selectedIds: ["a", "grid"] }).selection.contiguousSiblings).toBe(false);
  });
  it("bounds descendants and sibling neighborhoods and includes pending evidence", () => {
    const c = context({ selected: "grid" });
    expect(c.selection.nodes[0]?.descendants).toMatchObject({ depth: 2, total: 120, truncated: true });
    expect(c.selection.nodes[0]?.descendants?.nodes.length).toBe(24);
    expect(context({ selected: "card-30" }).neighborhood.before).toHaveLength(2);
    expect(context({ selected: "card-30" }).neighborhood.after).toHaveLength(2);
    expect(c.view).toMatchObject({ stageWidth: 52, scheme: "dark" });
    const empty = { ...site, pages: [{ ...site.pages[0]!, root: node("main", "layout", "Main", [node("empty", "layout", "Stack", [])]) }] };
    expect(makerContext(empty, { id: "x", revision: 0 }, view).pending.length).toBeGreaterThan(0);
  });
  it("identifies named text slots without dumping unrelated pages", () => {
    const dialog = { id: "dialog", contract: "dialog", signature: "Dialog", slots: { title: { kind: "text" as const, text: "Confirm removal" }, children: { kind: "nodes" as const, children: [text("body", "Keep this content")] } } };
    const named = { ...site, pages: [{ ...site.pages[0]!, root: node("main", "layout", "Main", [dialog]) }] };
    const c = makerContext(named, { id: "project", revision: 2 }, { ...view, selected: "dialog" });
    expect(c.selection.nodes[0]).toMatchObject({ slots: { title: { kind: "text", text: "Confirm removal" } } });
    expect(c.neighborhood.parent?.id).toBe("main");
  });
  it("returns detached snapshots; later selection changes cannot change a turn", () => {
    const mutable = { ...view, selected: "a", selectedIds: ["a"] };
    const frozen = makerContext(site, { id: "x", revision: 3 }, mutable);
    mutable.selected = "b";
    mutable.selectedIds.push("b");
    expect(frozen.selection.primary).toBe("a");
    expect(frozen.selection.selectedIds).toEqual(["a"]);
  });
});
