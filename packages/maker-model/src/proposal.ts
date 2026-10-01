import { resolveAgentOperations, type AgentSiteOperation } from "./agent.js";
import { applySiteAll, brokenLinks, type MakerSite, type SiteOperation } from "./site.js";
import type { IdFactory } from "./project.js";
import { pending } from "./problems.js";

/** Resolve once so preview and commit have exactly the same identities. Transport-independent. */
export function tryAgentOperations(site: MakerSite, operations: readonly AgentSiteOperation[], newId: IdFactory) {
  const resolved = resolveAgentOperations(site, operations, newId);
  if (!resolved.ok) return resolved;
  const applied = applySiteAll(site, resolved.value);
  if (!applied.ok) return applied;
  return { ok: true as const, site: applied.site, operations: resolved.value,
    pending: [
      ...applied.site.pages.flatMap(page => pending(page.root).problems.map(problem => ({ page: page.id, ...problem }))),
      ...brokenLinks(applied.site).map(link => ({ page: link.page, path: "", rule: "broken-link", severity: "error" as const, message: `No page at ${link.href}.`, nodes: [link.node] })),
    ] };
}

export interface MakerProposal {
  readonly base: MakerSite;
  readonly revision: number;
  readonly site: MakerSite;
  readonly operations: readonly SiteOperation[];
}
