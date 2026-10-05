import { describeSite, tryAgentOperations, walk, type AgentSiteOperation, type IdFactory, type MakerSite, type SiteOperation } from "@skryensya/maker-model";

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
  const result = tryAgentOperations(site, operations, newId);
  if (!result.ok) return { ok: false, reason: result.reason };
  const baseline = tryAgentOperations(site, [], newId);
  const key = (p: { page: string; rule: string; nodes: unknown; message: string }) => JSON.stringify([p.page, p.rule, p.nodes, p.message]);
  const known = new Set(baseline.ok ? baseline.pending.filter((p) => p.severity === "error").map(key) : []);
  const introduced = result.pending.filter((p) => p.severity === "error" && !known.has(key(p)));
  if (introduced.length) return { ok: false, reason: "Proposal introduces contract errors. Repair the complete batch.", problems: introduced };
  return { ok: true, site: result.site, operations: result.operations, pending: result.pending };
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
