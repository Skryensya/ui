import { z } from "zod";
import type { AgentService } from "@skryensya/ai-compiler/agent";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { describeSite, findNode, layoutAdvice, randomId, resolve, variantsFor, type AgentSiteOperation, type IdFactory, type MakerAgentContext, type MakerProposal, type MakerSite, type SiteOperation } from "@skryensya/maker-model";
import { proposalInput } from "./schema.js";
import { tryProposal } from "./draft.js";
import type { ToolSpec } from "./providers.js";

/**
 * `ids` makes a FRESH id factory for every attempt. The default is random, so two attempts mint different
 * identities. The streaming runtime passes a counter that restarts each time: the same operations then mint
 * the same ids, so the draft shown while the model writes and the proposal prepared at the end are the same
 * nodes, and the canvas keeps what it already drew instead of rebuilding it.
 */
/** Providers take the schema itself; the `$schema` dialect marker is noise some of them reject. */
const withoutDialect = (schema: Record<string, unknown>): Record<string, unknown> => { const { $schema: _dialect, ...rest } = schema; return rest; };

/**
 * `carry` is a proposal the person has not decided yet. A follow-up request builds ON it: the model reads and edits
 * the draft as it stands, and the new proposal is the carried operations followed by the new ones, still against the
 * original `site`, so Apply commits both as one edit and nothing the person was looking at is thrown away.
 */
export interface Carry { readonly site: MakerSite; readonly operations: readonly SiteOperation[] }

export function createMakerTools(site: MakerSite, context: MakerAgentContext, service: AgentService, ids: () => IdFactory = () => randomId, carry?: Carry) {
  /*
   * THE CHECKPOINT: the proposal as an earlier round of THIS turn left it. After the agent has proposed, it reviews the
   * result against its goal and may add what is missing: that next maker_try is added on top of the checkpoint rather than
   * replacing it, so finishing the job never means writing it again. A refused attempt leaves the checkpoint standing.
   */
  let checkpoint: MakerProposal | undefined;
  const base = (): Carry | undefined => (checkpoint ? { site: checkpoint.site, operations: checkpoint.operations } : carry);
  const working = () => base()?.site ?? site;
  let proposal: MakerProposal | undefined;
  const empty = z.object({}).strict();
  const detail = z.enum(["contract", "full"]).default("contract");
  const definitions = [
    { name: "maker_context", description: "Frozen selection, local neighborhood, insertion candidates and view evidence for this turn.", schema: empty, run: () => context },
    { name: "maker_read", description: "Read the site outline as it stands (including any draft not yet applied) with page/node identities. Filter by page or node for progressive disclosure.", schema: z.object({ page: z.string().optional(), node: z.string().optional() }).strict(), run: (a: { page?: string; node?: string }) => {
      const pages = a.page ? working().pages.filter(p => p.id === a.page) : working().pages;
      const filtered = a.node ? pages.flatMap(page => {
        const root = findNode(page.root, a.node!);
        return root ? [{ ...page, root }] : [];
      }) : pages;
      return filtered.length ? { revision: context.project.revision, outline: describeSite({ ...working(), pages: filtered }) } : { refused: "No such page or node." };
    } },
    { name: "discover_ui", description: "Find published signatures by English product intent. Contracts, not invented APIs.", schema: z.object({ query: z.string().max(500).optional(), parent: z.string().optional(), limit: z.number().int().min(1).max(12).optional() }).strict(), run: (a: { query?: string; parent?: string; limit?: number }) => service.discover(a).value },
    { name: "get_contract", description: "Authoritative options, slots and constraints for one family.", schema: z.object({ id: z.string(), detail }).strict(), run: (a: { id: string; detail: "contract" | "full" }) => service.contract(a.id, a.detail).value },
    { name: "get_contracts", description: "Get up to eight authoritative family contracts.", schema: z.object({ ids: z.array(z.string()).min(1).max(8), detail }).strict(), run: (a: { ids: string[]; detail: "contract" | "full" }) => service.contracts(a.ids, a.detail).value },
    { name: "get_examples", description: "Established usage trees; no id lists examples.", schema: z.object({ id: z.string().optional() }).strict(), run: (a: { id?: string }) => (a.id ? service.example(a.id) : service.examples()).value },
    { name: "validate_ui", description: "Validate an insertion's usage tree against the real contracts.", schema: z.object({ tree: z.record(z.string(), z.unknown()) }).strict(), run: (a: { tree: unknown }) => service.validate(a.tree as UsageTree).value },
    { name: "maker_presets", description: "The presets of one signature (Button.action: primary, destructive, icon-only, a pair...) and the wrapper each arrives in. Insert one with `signature` plus `preset` (and `wrap` to choose another wrapper).", schema: z.object({ contract: z.string(), signature: z.string() }).strict(), run: (a: { contract: string; signature: string }) => {
      /* variantsFor answers "default" for any name at all, so the signature is checked against the catalogue first. */
      const variants = resolve(a) ? variantsFor(a) : [];
      return variants.length ? { presets: variants.map(v => ({ id: v.id, name: v.name, ...(v.description ? { description: v.description } : {}), arrivesIn: v.wrapper })) } : { refused: "No such signature." };
    } },
    { name: "maker_try", description: "Prepare a complete operation batch against the site as it stands (including any draft not yet applied). All or none; no save. Replaces a previous batch of THIS turn, never earlier work; but when you are REVIEWING a proposal you already made, the batch is ADDED to it, so send only what is missing. User must apply.", schema: proposalInput, run: (a: z.infer<typeof proposalInput>) => {
      proposal = undefined;
      const from = base();
      const trial = tryProposal(from?.site ?? site, a.operations as AgentSiteOperation[], ids());
      if (!trial.ok) return { refused: trial.reason, ...(trial.problems ? { problems: trial.problems } : {}) };
      proposal = { base: site, revision: context.project.revision, site: trial.site, operations: [...(from?.operations ?? []), ...trial.operations] };
      const advice = trial.site.pages.flatMap(page => layoutAdvice(page.root));
      return { proposed: true, operations: (from?.operations.length ?? 0) + a.operations.length, outline: describeSite(trial.site), pending: trial.pending, ...(advice.length ? { advice } : {}) };
    } },
  ];
  const specs: ToolSpec[] = definitions.map(d => ({ name: d.name, description: d.description, parameters: withoutDialect(z.toJSONSchema(d.schema)) }));
  return {
    specs,
    /** The proposal so far: the latest attempt, or the checkpoint when the latest was refused. */
    proposal: () => proposal ?? checkpoint,
    /** The site the model is working on right now: the checkpoint, the carried draft, or the project. */
    working,
    /** The operations `working` already stands for: what a new batch is added to. */
    baseOperations: () => base()?.operations ?? [],
    /** Starts a review: what has been proposed becomes the base the next maker_try adds to. */
    review: () => { checkpoint = proposal ?? checkpoint; proposal = undefined; },
    clearProposal: () => { proposal = undefined; },
    execute(name: string, args: unknown): unknown {
      if (name === "maker_try") proposal = undefined;
      const tool = definitions.find(d => d.name === name);
      if (!tool) return { refused: "Unknown tool. Only Maker-specific tools are available." };
      const parsed = tool.schema.safeParse(args);
      if (!parsed.success) return { refused: "Malformed tool arguments.", issues: parsed.error.issues.map(i => ({ path: i.path, message: i.message })) };
      const refused = { refused: "Tool refused malformed data. Inspect contracts and repair the request." };
      try {
        // Each heterogeneous definition's schema guards its own handler.
        return (tool.run as (args: unknown) => unknown)(parsed.data);
      } catch { return refused; }
    },
  };
}
