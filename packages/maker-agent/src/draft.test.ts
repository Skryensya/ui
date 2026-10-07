import { describe, expect, it } from "vitest";
import { childrenOf, counterIds, isNode, siteFromTemplate, type MakerNode } from "@skryensya/maker-model";
import { tryProposal } from "./draft.js";
import templates from "../../../artifacts/templates.json" with { type: "json" };

const shell = (templates as unknown as { templates: { id: string; locales: Record<string, { title: string; tree: never }> }[] }).templates.find((t) => t.id === "app-shell")!.locales.es!;
const site = siteFromTemplate(shell.tree, { pageName: shell.title, sourceHash: "hash", newId: counterIds("t") });
const page = site.pages[0]!;
const layout = site.layouts![0]!;
const main = page.root;
const sidebar = childrenOf(layout.root, "children").filter(isNode).find((node) => node.signature === "Sidebar") as MakerNode;
const text = { contract: "typography", signature: "Text", children: "Sample data" };

describe("a batch addressed to a node", () => {
  it("goes to the page that node lives in: the Main's id is taken for the page's", () => {
    const trial = tryProposal(site, [{ type: "page", page: main.id, operations: [{ type: "insert", at: { parent: main.id, slot: "children", index: 0 }, tree: text as never }] }], counterIds("x"));
    expect(trial.ok).toBe(true);
    expect(trial.ok && trial.operations[0]).toMatchObject({ type: "edit", page: page.id });
  });

  it("goes to the layout when its nodes are in the layout", () => {
    const trial = tryProposal(site, [{ type: "page", page: sidebar.id, operations: [{ type: "setOption", node: sidebar.id, name: "minInlineSize", value: "200px" }] }], counterIds("x"));
    expect(trial.ok ? trial.operations[0] : trial).toMatchObject({ page: layout.id });
  });

  it("is still refused, and named, when its nodes live in more than one place", () => {
    const trial = tryProposal(site, [{ type: "page", page: "nowhere", operations: [{ type: "insert", at: { parent: main.id, slot: "children", index: 0 }, tree: text as never }, { type: "remove", child: sidebar.id }] }], counterIds("x"));
    expect(trial).toMatchObject({ ok: false, reason: expect.stringContaining('No page or layout "nowhere"') });
  });

  it("names a template's layout apart from its page", () => {
    expect(layout.name).not.toBe(page.name);
  });
});
