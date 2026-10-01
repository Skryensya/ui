import { expect, it } from "vitest";
import { counterIds, findNode, tryAgentOperations, type AgentSiteOperation } from "@skryensya/maker-model";
import { evalFixture, scoreSelection, selectionEvals } from "./cases.js";

it.each(selectionEvals)("$id rejects unchanged output and accepts a minimal valid edit", evalCase => {
  const { site, view } = evalFixture(evalCase);
  expect(scoreSelection(evalCase, site, site, view.selectedIds)).toBe(false);
  let operations: AgentSiteOperation[];
  const page = site.pages[0]!.id;
  switch (evalCase.id) {
    case "selected-buttons-inline": operations = [{ type: "page", page, operations: [{ type: "wrap", children: view.selectedIds, with: { contract: "layout", signature: "Inline" } }] }]; break;
    case "selected-grid-responsive": operations = [{ type: "page", page, operations: [{ type: "setOption", node: view.selected!, name: "columns" }, { type: "setOption", node: view.selected!, name: "minColumn", value: "sm" }] }]; break;
    case "selected-heading-copy": operations = [{ type: "page", page, operations: [{ type: "setText", node: view.selected!, text: "Build faster" }] }]; break;
    default: operations = [{ type: "page", page, operations: [{ type: "insert", at: { parent: site.pages[0]!.root.id, slot: "children", index: 1 }, tree: { contract: "button", signature: "Button.navigation", options: { href: "/pricing" }, children: "See pricing" } }] }];
  }
  const result = tryAgentOperations(site, operations, counterIds("proposal"));
  expect(result.ok).toBe(true);
  if (result.ok) expect(scoreSelection(evalCase, site, result.site, view.selectedIds)).toBe(true);
  expect(view.selectedIds.every(id => findNode(site.pages[0]!.root, id))).toBe(true);
});
