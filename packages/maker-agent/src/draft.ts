import { describeSite, entryOf, layoutsOf, tryAgentOperations, walk, walkChildren, type AgentSiteOperation, type IdFactory, type MakerSite, type SiteOperation } from "@skryensya/maker-model";

/** Why a batch was refused, and for a contract failure the problems it would introduce. */
export type Trial =
  | { ok: false; reason: string; problems?: unknown[] }
  | { ok: true; site: MakerSite; operations: readonly SiteOperation[]; pending: unknown[] };

/**
 * One attempt at a batch of operations against the frozen site: the single rule `maker_try` and the live
 * draft share, so what the canvas shows while the model writes is exactly what would be proposed.
 *
 * Maker allows pending authoring, but an agent's proposal must not introduce NEW contract errors, only
 * leave the ones the site already had.
 */
export function tryProposal(site: MakerSite, operations: readonly AgentSiteOperation[], newId: IdFactory): Trial {
  const result = tryAgentOperations(site, addressed(site, operations), newId);
  if (!result.ok) return { ok: false, reason: result.reason };
  const baseline = tryAgentOperations(site, [], newId);
  const key = (p: { page: string; rule: string; nodes: unknown; message: string }) => JSON.stringify([p.page, p.rule, p.nodes, p.message]);
  const known = new Set(baseline.ok ? baseline.pending.filter((p) => p.severity === "error").map(key) : []);
  const introduced = result.pending.filter((p) => p.severity === "error" && !known.has(key(p)));
  if (introduced.length) return { ok: false, reason: "Proposal introduces contract errors. Repair the complete batch.", problems: introduced };
  return { ok: true, site: result.site, operations: result.operations, pending: result.pending };
}

/*
 * A BATCH ADDRESSED TO A NODE IS ADDRESSED TO WHERE THAT NODE LIVES. The outline lists a page's line and then its Main's,
 * and a model reaching for "the page" often takes the Main's id, or a section's: a round lost to "No page or layout". When
 * `page` names no page or layout but the batch's own ids (that one, the parents and nodes its operations point at) all
 * live in ONE page or layout, that is the one meant. Anything less certain is left as it was, to be refused and named.
 */
function addressed(site: MakerSite, operations: readonly AgentSiteOperation[]): AgentSiteOperation[] {
  let home: Map<string, string> | undefined;
  const where = (id: string) => {
    if (!home) {
      home = new Map();
      for (const entry of [...site.pages, ...layoutsOf(site)]) {
        home.set(entry.root.id, entry.id);
        for (const child of walkChildren(entry.root)) home.set(child.id, entry.id);
      }
    }
    return home.get(id);
  };
  const named = (value: string) => entryOf(site, value) !== undefined || [...site.pages, ...layoutsOf(site)].some((entry) => entry.name.toLowerCase() === value.trim().toLowerCase() || ("path" in entry && entry.path === value));
  return operations.map((operation) => {
    if (operation.type !== "page" || named(operation.page)) return operation;
    const refs = [operation.page, ...operation.operations.flatMap((op) => [
      ..."at" in op ? [op.at.parent] : [], ..."to" in op ? [op.to.parent] : [], ..."child" in op ? [op.child] : [], ..."node" in op ? [op.node] : [], ..."children" in op ? op.children : [],
    ])];
    const homes = new Set(refs.map(where).filter((id): id is string => id !== undefined));
    return homes.size === 1 ? { ...operation, page: [...homes][0]! } : operation;
  });
}

/** Identities of every node in the site, to tell what a draft added. */
export function nodeIds(site: MakerSite): Set<string> {
  const ids = new Set<string>();
  for (const page of site.pages) for (const node of walk(page.root)) ids.add(node.id);
  return ids;
}

/** The nodes `draft` has that `base` did not: what to show as just arrived. */
export function addedNodes(base: ReadonlySet<string>, draft: MakerSite): string[] {
  const added: string[] = [];
  for (const page of draft.pages) for (const node of walk(page.root)) if (!base.has(node.id)) added.push(node.id);
  return added;
}

export { describeSite };
