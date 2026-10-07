import type { AgentService } from "@skryensya/ai-compiler/agent";
import { counterIds, layoutFor, type AgentSiteOperation, type MakerAgentContext, type MakerProposal, type MakerSite } from "@skryensya/maker-model";
import { createMakerTools, type Carry } from "./tools.js";
import { providers, type Message, type ProviderAdapter, type ProviderConnection, type ProviderReply } from "./providers.js";
import { OperationStream } from "./stream.js";
import { mentionedComponents } from "./mentions.js";
import { fallbackBrief, makeBrief } from "./brief.js";
import { addedNodes, describeSite, nodeIds, tryProposal } from "./draft.js";
import { layoutAdvice } from "@skryensya/maker-model";
import { MAKER_SYSTEM_PROMPT, PRIMER_FAMILIES } from "./system-prompt.js";

/** `outcome` is what the person did with the turn's proposal: applied, discarded, pending, merged or reverted. */
export interface ConversationTurn { content: string; context: MakerAgentContext; answer?: string; outcome?: string }
/**
 * What a turn reports while it runs.
 *  - `status`: what it is doing now.
 *  - `say`: the next piece of the assistant's written answer (streaming providers only).
 *  - `draft`: the site as it would be with the operations written SO FAR, and the nodes that just arrived.
 *    Each one replaces the previous. Drafts are previews of a proposal that is not final yet.
 *  - `done`: the finished turn, with the validated proposal when there is one.
 */
export type AgentEvent =
  | { type: "status"; text: string }
  /** A piece of the written answer. `reset` starts a new round: the answer so far is replaced, not extended. */
  | { type: "say"; delta: string; reset?: boolean }
  | { type: "draft"; site: MakerSite; added: readonly string[]; operations: number }
  /** What the request is for and how it will be checked: shown to the person before anything is built. */
  | { type: "brief"; goal: string; checklist: readonly string[]; assumptions: readonly string[]; plan?: readonly { section: string; role: string; content: string; components: readonly string[] }[] }
  /** `partial`: the turn stopped on a problem and this is what was valid when it did, kept rather than lost. Never applied unasked. */
  | { type: "done"; text: string; proposal?: MakerProposal; partial?: boolean }
  /**
   * A step of the turn as the person watches it: understanding the request, planning, writing changes, Maker checking them,
   * reviewing the result. A step that comes back (a refused batch written again, a repair) is a new step, so the back and
   * forth shows. `active` is replaced by the next event of the same step; `done` and `failed` are final.
   */
  | { type: "step"; step: StepId; state: "active" | "done" | "failed"; label: string; detail?: string }
  /** One maker_try and what Maker made of it: what tells, afterwards, why a turn that looked built proposed nothing. For the log. */
  | { type: "attempt"; ok: boolean; reason?: string; problems?: number; characters: number };
const activity: Record<string, string> = {
  maker_context: "Inspecting the attached selection…", maker_read: "Inspecting page structure…",
  discover_ui: "Finding suitable components…", get_contract: "Checking component options…",
  get_contracts: "Checking component contracts…", get_examples: "Inspecting an example…",
  validate_ui: "Validating the composition…", maker_try: "Preparing proposed changes…", submit_brief: "Reading your request…",
};

/** A queue the stream's callbacks push into and the generator drains, so callbacks can become yielded events. */
function channel<T>() {
  const items: T[] = [];
  let wake: (() => void) | undefined;
  let closed = false;
  let failure: unknown;
  return {
    push(item: T) { items.push(item); wake?.(); },
    close(error?: unknown) { closed = true; failure = error; wake?.(); },
    async *[Symbol.asyncIterator](): AsyncGenerator<T> {
      for (;;) {
        while (items.length) yield items.shift()!;
        if (closed) { if (failure) throw failure; return; }
        await new Promise<void>((resolve) => { wake = resolve; });
        wake = undefined;
      }
    },
  };
}

export type StepId = "plan" | "build" | "check" | "review";

/** A draft is worth repainting about this often: faster than the eye follows, slower than the model writes. */
const DRAFT_INTERVAL_MS = 70;

type AgentRequest = Parameters<typeof runAgent>[0];
/** The best valid result seen so far in a turn: Maker's last accepted batch, and the last draft that validated while it was written. */
interface Kept { accepted?: MakerProposal; draft?: MakerProposal }

/**
 * NOTHING BUILT IS LOST TO AN ERROR. The turn runs inside this: whatever stops it (the provider failing mid-stream, a limit,
 * a batch Maker keeps refusing), what had already validated is still handed over, as a proposal waiting for review, instead
 * of the canvas emptying. Only the person pressing Stop discards it. What is handed over was checked against the contracts
 * when it arrived, so it is a valid proposal, only an unfinished one.
 */
export async function* runAgent(request: {
  connection: ProviderConnection; site: MakerSite; context: MakerAgentContext; content: string;
  history?: readonly ConversationTurn[]; service: AgentService; signal: AbortSignal; adapter?: ProviderAdapter;
  /** A proposal still waiting for the person: this request builds on it instead of starting from the project. */
  carry?: Carry;
}): AsyncGenerator<AgentEvent> {
  const kept: Kept = {};
  try {
    yield* runTurn(request, kept);
  } catch (error) {
    const salvage = keptProposal(kept);
    if (request.signal.aborted || !salvage) throw error;
    /* "No changes applied" is what an error says when nothing survives it; here something does, so it is left out. */
    const reason = (error instanceof Error ? error.message : "The request failed.").replace(/\s*No changes applied\.?\s*$/, "");
    yield { type: "step", step: "check", state: "failed", label: "Stopped", detail: reason };
    yield { type: "done", partial: true, proposal: salvage, text: `${reason} What was built before that is kept: review it, then Apply or Discard.` };
  }
}

/** The fuller of the two: a draft of a batch Maker then refused can still hold more than the batch it accepted before. */
function keptProposal(kept: Kept): MakerProposal | undefined {
  if (!kept.draft) return kept.accepted;
  if (!kept.accepted) return kept.draft;
  return kept.draft.operations.length > kept.accepted.operations.length ? kept.draft : kept.accepted;
}

/** Actual bounded tool-calling loop. Only dry-run capability; no credential reaches tools. */
async function* runTurn(request: AgentRequest, kept: Kept): AsyncGenerator<AgentEvent> {
  if (!request.connection.apiKey.trim() || !request.connection.model.trim()) throw new Error("Connect a provider with an API key and model first.");
  if (request.content.length > 8000) throw new Error("Message too long (maximum 8,000 characters).");
  /* Same operations, same identities: the draft and the final proposal mint the same nodes, so the canvas
     keeps what it drew. The prefix is new each turn so it cannot collide with a node the site already has. */
  const prefix = `ai${Math.random().toString(36).slice(2, 8)}-`;
  /* A review adds to the proposal, so its new nodes need ids the first round did not use: the round is part of the prefix. */
  let idRound = 0;
  const ids = () => counterIds(idRound === 0 ? prefix : `${prefix}r${idRound}-`);
  /* What the model works on, and what a draft is measured against: the carried draft when there is one. */
  const working = request.carry?.site ?? request.site;
  const baseIds = nodeIds(working);
  const tools = createMakerTools(request.site, request.context, request.service, ids, request.carry);
  const messages: Message[] = [];
  for (const turn of (request.history ?? []).slice(-4)) {
    messages.push({ role: "user", content: JSON.stringify({ intent: turn.content.slice(0, 8000), context: { project: turn.context.project, page: turn.context.page, primary: turn.context.selection.primary, selectedIds: turn.context.selection.selectedIds }, ...(turn.outcome ? { outcome: turn.outcome } : {}) }) });
    if (turn.answer) messages.push({ role: "assistant", content: turn.answer.slice(0, 2000), calls: [] });
  }
  /* The page being edited, with the id of every node: what lets the model point at what is already there (change this
     text, remove that block, add after this one) instead of writing the page again. Capped, so a long page is cut
     rather than refused; maker_read has the rest. */
  const openPage = working.pages.find((page) => page.id === request.context.page.id);
  /* The page and the layout it sits in, each cut on its own: one long cut put the layout after the page, so a long page
     hid the layout (its id, its rail, its header) and a request about the rail could not even address it. */
  const frame = openPage ? layoutFor(working, openPage) : undefined;
  const capped = (text: string, limit: number) => (text.length > limit ? `${text.slice(0, limit)}\n… (cut: use maker_read for the rest)` : text);
  const entryOutline = openPage ? capped(describeSite({ ...working, pages: [openPage], layouts: [] }).replace(/^(page [^\n]*)/, (line) => (frame ? `${line} layout=${frame.id}` : line)), OUTLINE_LIMIT) : "";
  const frameOutline = frame ? capped(describeSite({ ...working, pages: [], layouts: [frame] }), LAYOUT_OUTLINE_LIMIT) : "";
  const pageOutline = [entryOutline, frameOutline].filter(Boolean).join("\n");
  const adapter = request.adapter ?? providers[request.connection.provider];
  /* THE PROJECT PROMPT: what this project is, in its author's words. Context for every request, so it lives in the system
     prompt, in its own section, and never in the conversation: it is not something anyone said, and no request changes it. */
  const projectPrompt = (request.carry?.site ?? request.site).prompt;
  const system = withPrimer(request.service) + (projectPrompt ? `\n\n${PROJECT_PROMPT_HEADING}\n${projectPrompt}` : "");

  yield { type: "status", text: "Reading your request…" };

  /* THE BRIEF: the request is read for what it is for and how it will be checked, before anything is built. */
  yield { type: "step", step: "plan", state: "active", label: "Planning" };
  let brief = fallbackBrief(request.content);
  let planned = false;
  try {
    brief = await makeBrief({ adapter, connection: request.connection, signal: request.signal, intent: request.content, context: request.context, pageOutline, ...(projectPrompt ? { projectPrompt } : {}), history: request.history ?? [] });
    planned = true;
  } catch (error) {
    /* Only the person stopping it ends the turn: a briefing that failed must never block the build. */
    if (request.signal.aborted) throw error;
  }
  yield { type: "step", step: "plan", state: "done", label: "Planning", detail: planned ? brief.goal : "No plan: going ahead with the request as written" };
  yield { type: "brief", goal: brief.goal, checklist: brief.checklist, assumptions: brief.assumptions, plan: brief.plan };

  const mentioned = mentionedComponents(request.content, request.service);
  const initial = JSON.stringify({ intent: request.content, context: request.context, pageOutline, ...(mentioned.length ? { mentionedComponents: mentioned } : {}),
    brief: { goal: brief.goal, checklist: brief.checklist, ...(brief.plan.length ? { plan: brief.plan } : {}), assumptions: brief.assumptions, known: brief.known } });
  if (initial.length > 120_000) throw new Error("Selection context is too large. Select fewer layers and try again.");
  messages.push({ role: "user", content: initial });
  /* After it proposes, the result is held to the brief: up to this many reviews, each adding what is still missing. */
  let reviews = 0;
  let inReview = false;
  /* The last maker_try's refusal, while it stands: a later attempt that is accepted clears it. */
  let refusal: { reason: string; problems?: unknown[] } | undefined;
  let retries = 0;
  let count = 0;
  for (let round = 0; round < 16; round++) {
    request.signal.throwIfAborted();
    yield { type: "status", text: "Preparing a Maker proposal…" };
    yield { type: "step", step: "build", state: "active", label: "Writing changes" };
    /* Each round writes its own words: the chat starts over, so a review's summary does not follow the last round's text. */
    yield { type: "say", delta: "", reset: true };
    let reply: ProviderReply;
    if (adapter.stream) {
      const queue = channel<AgentEvent>();
      const parsers = new Map<string, OperationStream>();
      let operations: unknown[] = [];
      let count = 0;
      let pending = false;
      let last = 0;
      const publish = (force: boolean) => {
        if (!pending || (!force && Date.now() - last < DRAFT_INTERVAL_MS)) return;
        pending = false;
        last = Date.now();
        const trial = tryProposal(tools.working(), operations as AgentSiteOperation[], ids());
        if (!trial.ok) return;
        kept.draft = { base: request.site, revision: request.context.project.revision, site: trial.site, operations: [...tools.baseOperations(), ...trial.operations] };
        queue.push({ type: "draft", site: trial.site, added: addedNodes(baseIds, trial.site), operations: count });
      };
      const streaming = adapter.stream(request.connection, system, messages, tools.specs, request.signal, {
        text: (delta) => queue.push({ type: "say", delta }),
        callStart: (call) => {
          queue.push({ type: "status", text: activity[call.name] ?? "Checking Maker capabilities…" });
          queue.push({ type: "step", step: "build", state: "active", label: "Writing changes", detail: activity[call.name] ?? "Checking Maker capabilities…" });
          if (call.name === "maker_try") { parsers.set(call.id, new OperationStream()); operations = []; count = 0; }
        },
        callArgs: (id, delta) => {
          const parser = parsers.get(id);
          if (!parser) return;
          if (!parser.push(delta)) return;
          operations = parser.operations();
          count = parser.count();
          pending = true;
          publish(false);
        },
      }).then(
        (done) => { publish(true); queue.close(); return done; },
        (error: unknown) => { queue.close(error); throw error; },
      );
      streaming.catch(() => undefined);
      for await (const event of queue) yield event;
      reply = await streaming;
    } else {
      reply = await adapter.complete(request.connection, system, messages, tools.specs, request.signal);
    }
    request.signal.throwIfAborted();
    if (reply.calls.length > 16 || reply.text.length > 32_000) throw new Error("Provider response exceeds the agent limit.");
    messages.push({ role: "assistant", content: reply.text, calls: reply.calls });
    if (!reply.calls.length) {
      const proposal = tools.proposal();
      /* NOTHING PROPOSED IS NOT DONE. A model whose last maker_try was refused may still write "I proposed…": the draft it
         streamed looked whole, and it never read the refusal as final. It is told plainly, and tries again; if it still
         cannot, the turn says what was refused instead of repeating a claim the canvas would contradict. */
      if (!proposal && refusal) {
        if (retries < MAX_RETRIES) {
          retries++;
          yield { type: "status", text: "Maker refused the changes. Fixing them…" };
          messages.push({ role: "user", content: JSON.stringify({ notProposed: { refused: refusal.reason, ...(refusal.problems ? { problems: refusal.problems } : {}), instruction: RETRY_INSTRUCTION } }) });
          continue;
        }
        const salvage = keptProposal(kept);
        if (salvage) {
          yield { type: "done", partial: true, proposal: salvage, text: `Maker refused the last attempt (${refusal.reason}). What was valid before that is kept: review it, then Apply or Discard.` };
          return;
        }
        yield { type: "done", text: `No changes were proposed: Maker refused the last attempt (${refusal.reason}). Ask again, or ask for a smaller part first.` };
        return;
      }
      /* Only what THIS proposal introduced: advice about a page as the person left it is not the agent's to fix unasked. */
      const before = new Set((request.carry?.site ?? request.site).pages.flatMap((entry) => [...layoutAdvice(entry.root)]));
      const standing = proposal ? proposal.site.pages.flatMap((entry) => [...layoutAdvice(entry.root)]).filter((line) => !before.has(line)) : [];
      /* ANY proposal with advice standing (a second h1, loose content, no ceiling) is sent back to fix it. */
      const send = (brief.kind === "build" && brief.checklist.length > 0) || standing.length > 0;
      if (proposal && !inReview && send && reviews < MAX_REVIEWS) {
        reviews++;
        inReview = true;
        tools.review();
        idRound++;
        yield { type: "status", text: reviews === 1 ? "Checking the result against your goal…" : "Checking what is still missing…" };
        yield { type: "step", step: "review", state: "done", label: "Reviewing the result", detail: standing.length ? `To fix: ${standing.length === 1 ? "one layout issue" : `${standing.length} layout issues`}` : "Checking it against the goal" };
        const page = proposal.site.pages.find((entry) => entry.id === request.context.page.id) ?? proposal.site.pages[0]!;
        const now = describeSite({ ...proposal.site, pages: [page] });
        messages.push({ role: "user", content: JSON.stringify({ review: {
          goal: brief.goal, checklist: brief.checklist, ...(brief.plan.length ? { plan: brief.plan } : {}), assumptions: brief.assumptions,
          now: now.length > OUTLINE_LIMIT ? `${now.slice(0, OUTLINE_LIMIT)}\n… (cut)` : now,
          ...(standing.length ? { advice: standing } : {}),
          instruction: REVIEW_INSTRUCTION,
        } }) });
        continue;
      }
      yield { type: "done", text: reply.text, proposal };
      return;
    }
    for (const call of reply.calls) {
      request.signal.throwIfAborted();
      if (++count > 64) throw new Error("Agent tool limit reached. Try a smaller edit.");
      yield { type: "status", text: activity[call.name] ?? "Checking Maker capabilities…" };
      if (call.name === "maker_try") { tools.clearProposal(); yield { type: "step", step: "check", state: "active", label: "Checking with Maker" }; }
      else yield { type: "step", step: "build", state: "active", label: "Writing changes", detail: activity[call.name] ?? "Checking Maker capabilities…" };
      let result: unknown;
      if (call.arguments.length > MAX_ARGUMENTS) result = { refused: `Tool call too large (${call.arguments.length} characters, the limit is ${MAX_ARGUMENTS}). Send compact JSON, and fewer operations.` };
      else {
        try { result = await tools.execute(call.name, JSON.parse(call.arguments)); }
        catch { result = { refused: "Malformed tool call. Send valid JSON arguments." }; }
      }
      if (call.name === "maker_try") {
        const refused = typeof result === "object" && result !== null && "refused" in result ? result as { refused: unknown; problems?: unknown[]; issues?: unknown[] } : undefined;
        const problems = refused?.problems ?? refused?.issues;
        refusal = refused ? { reason: String(refused.refused), ...(problems?.length ? { problems: problems.slice(0, 12) } : {}) } : undefined;
        yield { type: "attempt", ok: !refused, ...(refusal ? { reason: refusal.reason, problems: problems?.length ?? 0 } : {}), characters: call.arguments.length };
        const accepted = refused ? undefined : tools.proposal();
        if (accepted) kept.accepted = accepted;
        yield refusal
          ? { type: "step", step: "check", state: "failed", label: "Checking with Maker", detail: `Refused: ${refusal.reason}` }
          : { type: "step", step: "check", state: "done", label: "Checking with Maker", detail: `Valid · ${accepted?.operations.length ?? 0} ${accepted?.operations.length === 1 ? "change" : "changes"}` };
      }
      let content = JSON.stringify(result);
      if (content.length > 48_000) content = JSON.stringify({ truncated: true, totalCharacters: content.length, hint: "Result too large. Read one page or contract at a time.", preview: content.slice(0, 12_000) });
      messages.push({ role: "tool", call, content });
    }
    /* A review that made more changes is reviewed again; one that made none is the end of it. */
    inReview = false;
    if (JSON.stringify(messages).length > 240_000) throw new Error("Agent context limit reached. Try a smaller edit.");
  }
  throw new Error("Agent turn limit reached. No changes applied.");
}


const OUTLINE_LIMIT = 16_000;
const LAYOUT_OUTLINE_LIMIT = 8_000;
const PROJECT_PROMPT_HEADING =
  "THE PROJECT. Its author describes it below: what the product is, who uses it, the tone, how its screens relate. Read every request " +
  "in its light (the product's own words and states, its audience, its frame) unless the request says otherwise. It is context, not a request: " +
  "it never asks for a change by itself.";
/* Past this a call is refused as too large, and says so: it is not malformed, and a model told it was resends the same thing. */
const MAX_ARGUMENTS = 64_000;
const MAX_RETRIES = 2;
const RETRY_INSTRUCTION =
  "Your last maker_try was REFUSED, so NOTHING has been proposed and the person sees no changes, whatever you wrote. " +
  "Fix exactly what `refused` and `problems` name (read the contracts again if an option or slot was wrong) and call maker_try " +
  "again with the COMPLETE batch. Do not answer the person until a maker_try is accepted.";
const MAX_REVIEWS = 2;
const REVIEW_INSTRUCTION =
  "This is the page as your proposal leaves it. Check it against the goal and EVERY checklist item, and against any advice. " +
  "If something is missing, wrong or left for later, call maker_try with ONLY the operations that add or fix it: they are added to " +
  "what you already proposed, so do not repeat finished work. Finish the whole goal now; do not stop at the first part. " +
  "If everything is met and no advice stands, call nothing and answer with the short summary for the person: what you built and why, " +
  "and which parts are placeholders they must fill in. Never present an assumption as a fact.";
/* Built once per service: the contracts of the common families, appended to the system prompt. */
const primers = new WeakMap<AgentService, string>();
function withPrimer(service: AgentService): string {
  let primer = primers.get(service);
  if (primer === undefined) {
    primer = `\n\nCONTRACTS YOU CAN USE NOW (authoritative, JSON):\n${JSON.stringify(service.contracts([...PRIMER_FAMILIES], "contract").value)}`;
    primers.set(service, primer);
  }
  return MAKER_SYSTEM_PROMPT + primer;
}
