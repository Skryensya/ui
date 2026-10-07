import type { OptionInput, UsageTree } from "@skryensya/core/usage-tree";
import { isNode, type MakerChild, type MakerNode, type Place } from "./node.js";
import type { Operation } from "./operations.js";
import { pending } from "./problems.js";
import { presetFor } from "./preset.js";
import { buildVariant, variantsFor, type WrapperId } from "./variants.js";
import { fromUsageTree, type IdFactory } from "./project.js";
import { brokenLinks, emptyPage, entryOf, layoutFor, layoutsOf, starterLayout, type MakerSite, type SiteOperation } from "./site.js";

/*
 * THE MAKER, AS AN AGENT SEES IT (decision 31's "a prompt speaks only in operations").
 *
 * An agent reads a site as a compact outline with identities and writes back operations, the same
 * closed set the pointer and the keyboard use. What differs is only what is convenient to write:
 * an agent inserts a USAGE TREE (the currency it already composes in, ADR-0014) or names a
 * signature, and the identities are minted here. Nothing in this vocabulary takes a position, so a
 * prompt like "put these two buttons next to each other" can only become a wrap in an Inline.
 */

/** A page operation as an agent writes it. */
export type AgentOperation =
  | {
      readonly type: "insert";
      readonly at: Place;
      readonly tree?: UsageTree;
      readonly signature?: { readonly contract: string; readonly signature: string };
      /** With `signature`: one of that signature's presets (`maker_presets` lists them) instead of the default. */
      readonly preset?: string;
      /** With `signature`: the wrapper it arrives in. `auto` is the preset's own; absent, the preset is inserted as it is. */
      readonly wrap?: "auto" | WrapperId;
    }
  | { readonly type: "move"; readonly child: string; readonly to: Place }
  | { readonly type: "remove"; readonly child: string }
  | { readonly type: "wrap"; readonly children: readonly string[]; readonly with: { readonly contract: string; readonly signature: string; readonly options?: Readonly<Record<string, OptionInput>> } }
  | { readonly type: "unwrap"; readonly node: string }
  | { readonly type: "setOption"; readonly node: string; readonly name: string; readonly value?: OptionInput }
  | { readonly type: "setAttr"; readonly node: string; readonly name: string; readonly value?: string }
  | { readonly type: "setText"; readonly node: string; readonly slot?: string; readonly text: string };

/** A site operation as an agent writes it: a page's operations, or a change to the pages. */
export type AgentSiteOperation =
  | { readonly type: "page"; readonly page: string; readonly operations: readonly AgentOperation[] }
  | { readonly type: "addPage"; readonly name: string; readonly path: string; readonly index?: number }
  | { readonly type: "removePage"; readonly page: string }
  | { readonly type: "renamePage"; readonly page: string; readonly name: string }
  | { readonly type: "setPagePath"; readonly page: string; readonly path: string }
  | { readonly type: "movePage"; readonly page: string; readonly index: number }
  /** A layout to start from (a header bar and a footer around the outlet); its content is then edited with `page` operations addressed to its id. */
  | { readonly type: "addLayout"; readonly name: string; readonly makeDefault?: boolean }
  | { readonly type: "removeLayout"; readonly layout: string }
  | { readonly type: "renameLayout"; readonly layout: string; readonly name: string }
  | { readonly type: "setDefaultLayout"; readonly layout?: string }
  | { readonly type: "setPageLayout"; readonly page: string; readonly layout?: string };

export type AgentResolved<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly reason: string };

/** The operations an agent's request stands for, identities minted, or why it cannot stand for any. */
export function resolveAgentOperations(site: MakerSite, input: readonly AgentSiteOperation[], newId: IdFactory): AgentResolved<readonly SiteOperation[]> {
  const out: SiteOperation[] = [];
  /* What this batch itself creates, by name and path: a page added here is edited here, and the model cannot know the identity minted for it. */
  const created = new Map<string, string>();
  const known = (id: string) => entryOf(site, id) !== undefined || [...created.values()].includes(id);
  const refer = (value: string | undefined, kind: "page" | "layout"): AgentResolved<string> => {
    if (value === undefined) return { ok: false, reason: `Name the ${kind}.` };
    if (known(value)) return { ok: true, value };
    const key = value.trim().toLowerCase();
    const made = created.get(key);
    if (made) return { ok: true, value: made };
    const matches = [...site.pages.map((entry) => ({ id: entry.id, name: entry.name, path: entry.path })), ...(site.layouts ?? []).map((entry) => ({ id: entry.id, name: entry.name, path: "" }))].filter(
      (entry) => entry.name.toLowerCase() === key || (entry.path !== "" && entry.path.toLowerCase() === key),
    );
    if (matches.length === 1) return { ok: true, value: matches[0]!.id };
    const have = [...site.pages.map((entry) => `${entry.id} "${entry.name}" ${entry.path}`), ...(site.layouts ?? []).map((entry) => `${entry.id} "${entry.name}" (layout)`), ...[...created].filter(([key]) => !key.startsWith("/")).map(([name, id]) => `${id} "${name}" (added in this batch)`)];
    return { ok: false, reason: `No page or layout "${value}". Use an id, a name or a path. Available: ${have.join("; ") || "none"}.` };
  };
  for (const operation of input) {
    switch (operation.type) {
      case "page": {
        const target = refer(operation.page, "page");
        if (!target.ok) return target;
        for (const each of operation.operations) {
          const resolved = resolvePageOperation(each, newId);
          if (!resolved.ok) return resolved;
          out.push({ type: "edit", page: target.value, operation: resolved.value });
        }
        break;
      }
      case "addPage": {
        const page = emptyPage(newId(), operation.name, operation.path, newId);
        created.set(operation.name.trim().toLowerCase(), page.id);
        created.set(operation.path.trim().toLowerCase(), page.id);
        out.push({ type: "addPage", page, index: operation.index });
        break;
      }
      case "addLayout": {
        const id = newId();
        created.set(operation.name.trim().toLowerCase(), id);
        out.push({ type: "addLayout", layout: starterLayout(id, operation.name, newId), ...(operation.makeDefault ? { makeDefault: true } : {}) });
        break;
      }
      case "removePage":
      case "renamePage":
      case "setPagePath":
      case "movePage": {
        const target = refer(operation.page, "page");
        if (!target.ok) return target;
        out.push({ ...operation, page: target.value });
        break;
      }
      case "removeLayout":
      case "renameLayout": {
        const target = refer(operation.layout, "layout");
        if (!target.ok) return target;
        out.push({ ...operation, layout: target.value });
        break;
      }
      case "setPageLayout": {
        const target = refer(operation.page, "page");
        if (!target.ok) return target;
        const layout = operation.layout === undefined || operation.layout === "none" ? { ok: true as const, value: operation.layout } : refer(operation.layout, "layout");
        if (!layout.ok) return layout;
        out.push({ ...operation, page: target.value, ...(layout.value !== undefined ? { layout: layout.value } : {}) });
        break;
      }
      default:
        out.push(operation);
    }
  }
  return { ok: true, value: out };
}

function resolvePageOperation(operation: AgentOperation, newId: IdFactory): AgentResolved<Operation> {
  switch (operation.type) {
    case "insert": {
      let child: MakerChild | undefined;
      if (operation.tree) child = fromUsageTree(operation.tree, newId);
      else if (operation.signature && (operation.preset || operation.wrap)) {
        const variants = variantsFor(operation.signature);
        const variant = operation.preset ? variants.find((entry) => entry.id === operation.preset) : variants[0];
        if (!variant) {
          return { ok: false, reason: `${operation.signature.contract}/${operation.signature.signature} has no preset "${operation.preset}". It has: ${variants.map((entry) => entry.id).join(", ")}.` };
        }
        child = buildVariant(variant, operation.wrap ?? "auto", newId);
      } else if (operation.signature) child = presetFor(operation.signature, newId);
      if (!child) return { ok: false, reason: "An insert needs a `tree` (a usage tree) or a `signature` from the catalogue." };
      return { ok: true, value: { type: "insert", at: operation.at, child } };
    }
    case "wrap": {
      const container = presetFor(operation.with, newId);
      if (!container) return { ok: false, reason: `No signature ${operation.with.contract}/${operation.with.signature}.` };
      const options = { ...container.options, ...operation.with.options };
      return {
        ok: true,
        value: {
          type: "wrap",
          children: operation.children,
          container: { ...container, ...(Object.keys(options).length ? { options } : {}), slots: { ...container.slots, children: { kind: "nodes", children: [] } } },
        },
      };
    }
    case "setText":
      return { ok: true, value: { type: "setText", node: operation.node, slot: operation.slot ?? "children", text: operation.text } };
    default:
      return { ok: true, value: operation };
  }
}

/*
 * THE OUTLINE AN AGENT READS. One line per node: its id, its signature, the options and attributes
 * the author set; text runs quoted with their own id. Slots other than `children` are labelled. What
 * is pending is listed under the page with the ids it concerns. Compact on purpose: a page of a few
 * hundred nodes has to fit an answer.
 */
export function describeSite(site: MakerSite): string {
  const broken = brokenLinks(site);
  const lines: string[] = [];
  for (const page of site.pages) {
    const layout = layoutFor(site, page);
    lines.push(`page ${page.id} "${page.name}" ${page.path}${layout ? ` layout=${layout.id}` : page.layout === "none" ? " layout=none" : ""}`);
    describeNode(page.root, 1, lines);
    const problems = pending(page.root).problems.filter((problem) => problem.severity === "error");
    const links = broken.filter((link) => link.page === page.id);
    if (problems.length > 0 || links.length > 0) {
      lines.push("  pending:");
      for (const problem of problems) lines.push(`    [${problem.nodes.join(", ")}] ${problem.rule}: ${problem.message}`);
      for (const link of links) lines.push(`    [${link.node}] broken-link: "${link.href}" is not a page of this site.`);
    }
  }
  /* Layouts are listed after the pages, and edited with `page` operations addressed to their id. The Main in each is the
     outlet: where a page's own content goes. */
  for (const layout of layoutsOf(site)) {
    lines.push(`layout ${layout.id} "${layout.name}"${layout.id === site.defaultLayout ? " (default for pages that do not choose)" : ""}`);
    describeNode(layout.root, 1, lines);
  }
  return lines.join("\n");
}

function describeNode(node: MakerNode, depth: number, lines: string[]): void {
  const pad = "  ".repeat(depth);
  const options = Object.entries(node.options ?? {}).map(([name, value]) => `${name}=${JSON.stringify(value)}`);
  const attrs = Object.entries(node.attrs ?? {}).map(([name, value]) => `${name}=${JSON.stringify(value)}`);
  lines.push(`${pad}${node.id} ${node.contract}/${node.signature}${[...options, ...attrs].map((part) => ` ${part}`).join("")}`);
  for (const [slot, held] of Object.entries(node.slots)) {
    const inner = slot === "children" ? depth + 1 : depth + 2;
    if (slot !== "children" && !(held.kind === "nodes" && held.children.length === 0)) lines.push(`${pad}  › ${slot}`);
    if (held.kind === "text") lines.push(`${"  ".repeat(inner)}"${held.text}"`);
    else if (held.kind === "items") lines.push(`${"  ".repeat(inner)}(${held.items.length} entries)`);
    else for (const child of held.children) {
      if (isNode(child)) describeNode(child, inner, lines);
      else lines.push(`${"  ".repeat(inner)}${child.id} "${child.text}"`);
    }
  }
}
