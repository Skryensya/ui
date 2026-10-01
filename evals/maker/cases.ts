import type { UsageTree } from "@skryensya/core/usage-tree";
import { ancestors, childrenOf, counterIds, createSite, emptyPage, findChild, findNode, fromUsageTree, isNode, pending, walk, type MakerAgentView, type MakerSite } from "@skryensya/maker-model";

export interface SelectionEval {
  id: string;
  prompt: string;
  tree: UsageTree;
  select: (site: MakerSite) => string[];
  check: (before: MakerSite, after: MakerSite, selected: readonly string[]) => boolean;
}
const button = (copy: string): UsageTree => ({ contract: "button", signature: "Button.action", children: copy });
const heading: UsageTree = { contract: "typography", signature: "Heading", children: "Original heading" };
const main = (children: UsageTree[]): UsageTree => ({ contract: "layout", signature: "Main", children });
const nodes = (site: MakerSite) => [...walk(site.pages[0]!.root)];
const signature = (name: string) => (site: MakerSite) => nodes(site).filter(n => n.signature === name).map(n => n.id);
const preserved = (before: MakerSite, after: MakerSite) => nodes(before).every(n => findNode(after.pages[0]!.root, n.id)?.signature === n.signature);
const copy = (site: MakerSite, id: string) => {
  const node = findNode(site.pages[0]!.root, id);
  return node ? childrenOf(node, "children").filter(c => !isNode(c)).map(c => "text" in c ? c.text : "").join("") : "";
};

/** Product invariants, not exact trees: a model can choose any valid minimal composition. */
export const selectionEvals: readonly SelectionEval[] = [
  { id: "selected-buttons-inline", prompt: "Put these next to each other.", tree: main([{ contract: "layout", signature: "Stack", children: [button("One"), button("Two")] }]), select: signature("Button.action"),
    check: (before, after, selected) => preserved(before, after) && selected.every(id => copy(before, id) === copy(after, id)) &&
      ancestors(after.pages[0]!.root, selected[0]!).some(a => a.signature === "Inline" && selected.every(id => ancestors(after.pages[0]!.root, id).some(n => n.id === a.id))) },
  { id: "selected-grid-responsive", prompt: "Make this grid more responsive on smaller screens.", tree: main([{ contract: "layout", signature: "Grid", options: { columns: "3", gap: "md" }, children: [button("One"), button("Two"), button("Three")] }]), select: signature("Grid"),
    check: (before, after, selected) => preserved(before, after) && typeof findNode(after.pages[0]!.root, selected[0]!)?.options?.minColumn === "string" },
  { id: "selected-heading-copy", prompt: 'Change this to "Build faster".', tree: main([{ contract: "layout", signature: "Stack", children: [heading, button("Unrelated action")] }]), select: signature("Heading"),
    check: (before, after, selected) => preserved(before, after) && copy(after, selected[0]!) === "Build faster" && signature("Button.action")(before).every(id => copy(before, id) === copy(after, id)) },
  { id: "no-selection-page", prompt: "Add a final call to action linking to /pricing on this page. Preserve all existing content.", tree: main([heading]), select: () => [],
    check: (before, after) => preserved(before, after) && nodes(before).every(n => copy(before, n.id) === copy(after, n.id)) && nodes(after).some(n => n.signature === "Button.navigation" && n.options?.href === "/pricing") },
];

export function evalFixture(evalCase: SelectionEval) {
  const base = createSite("eval", counterIds("page"));
  const site: MakerSite = { ...base, pages: [{ ...base.pages[0]!, root: fromUsageTree(evalCase.tree, counterIds("node")) }, emptyPage("pricing", "Pricing", "/pricing", counterIds("pricing-node"))] };
  const selectedIds = evalCase.select(site);
  const view: MakerAgentView = { page: site.pages[0]!.id, selected: selectedIds[0], selectedIds, width: 36, scheme: "light", contrast: false, density: "default", mode: "edit" };
  return { site, view };
}

export function scoreSelection(evalCase: SelectionEval, before: MakerSite, after: MakerSite, selected: readonly string[]) {
  const valid = after.pages.every(p => pending(p.root).valid);
  // The closed operation contract also refuses styles; pin it here as an independent invariant.
  const noStyles = after.pages.every(p => [...walk(p.root)].every(n => !n.attrs?.style && !n.attrs?.class && !n.options?.style));
  const identitiesRemain = selected.every(id => findChild(after.pages[0]!.root, id));
  return valid && noStyles && identitiesRemain && evalCase.check(before, after, selected);
}
