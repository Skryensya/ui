import type { AgentService } from "@skryensya/ai-compiler/agent";
import { counterIds, type AgentSiteOperation, type MakerAgentContext, type MakerProposal, type MakerSite } from "@skryensya/maker-model";
import { createMakerTools, type Carry, type SiteReader } from "./tools.js";
import { providers, type Message, type ProviderAdapter, type ProviderConnection, type ProviderReply } from "./providers.js";
import { OperationStream } from "./stream.js";
import { askInput, questionsText, type AskedQuestion } from "./questions.js";
import { mentionedComponents } from "./mentions.js";
import { ASKING_ENABLED, canAskAgain, fallbackBrief, makeBrief } from "./brief.js";
import { addedNodes, describeSite, nodeIds, tryProposal } from "./draft.js";
import { layoutAdvice } from "@skryensya/maker-model";
import { MAKER_SYSTEM_PROMPT, PRIMER_FAMILIES } from "./system-prompt.js";

/** `outcome` is what the person did with the turn's proposal: applied, discarded, pending, merged or reverted. */
export interface ConversationTurn { content: string; context: MakerAgentContext; answer?: string; outcome?: string; questions?: readonly AskedQuestion[] }
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
  | { type: "brief"; goal: string; checklist: readonly string[]; assumptions: readonly string[] }
  | { type: "done"; text: string; proposal?: MakerProposal; questions?: readonly AskedQuestion[] };
const activity: Record<string, string> = {
  maker_context: "Inspecting the attached selection…", maker_read: "Inspecting page structure…",
  discover_ui: "Finding suitable components…", get_contract: "Checking component options…",
  get_contracts: "Checking component contracts…", get_examples: "Inspecting an example…",
  validate_ui: "Validating the composition…", maker_read_site: "Reading the website…", maker_try: "Preparing proposed changes…", ask_user: "Preparing questions for you…", submit_brief: "Reading your request…",
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

/** A draft is worth repainting about this often: faster than the eye follows, slower than the model writes. */
const DRAFT_INTERVAL_MS = 70;

/** Actual bounded tool-calling loop. Only dry-run capability; no credential reaches tools. */
export async function* runAgent(request: {
  connection: ProviderConnection; site: MakerSite; context: MakerAgentContext; content: string;
  history?: readonly ConversationTurn[]; service: AgentService; signal: AbortSignal; adapter?: ProviderAdapter;
  /** A proposal still waiting for the person: this request builds on it instead of starting from the project. */
  carry?: Carry;
  /** Fetches a public web page as a summary, for cloning. Absent: the agent is told reading sites is unavailable. */
  readSite?: SiteReader;
}): AsyncGenerator<AgentEvent> {
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
  const tools = createMakerTools(request.site, request.context, request.service, ids, request.carry, request.readSite, request.signal);
  const messages: Message[] = [];
  for (const turn of (request.history ?? []).slice(-4)) {
    messages.push({ role: "user", content: JSON.stringify({ intent: turn.content.slice(0, 8000), context: { project: turn.context.project, page: turn.context.page, primary: turn.context.selection.primary, selectedIds: turn.context.selection.selectedIds }, ...(turn.outcome ? { outcome: turn.outcome } : {}) }) });
    if (turn.answer) messages.push({ role: "assistant", content: turn.answer.slice(0, 2000), calls: [] });
  }
  /* The page being edited, with the id of every node: what lets the model point at what is already there (change this
     text, remove that block, add after this one) instead of writing the page again. Capped, so a long page is cut
     rather than refused; maker_read has the rest. */
  const openPage = working.pages.find((page) => page.id === request.context.page.id);
  const outline = openPage ? describeSite({ ...working, pages: [openPage] }) : "";
  const pageOutline = outline.length > OUTLINE_LIMIT ? `${outline.slice(0, OUTLINE_LIMIT)}\n… (cut: use maker_read for the rest)` : outline;
  const adapter = request.adapter ?? providers[request.connection.provider];
  const system = withPrimer(request.service);

  /* THE BRIEF comes first: the request is read for what it is for, how it will be checked, and what only the person can
     supply. What is missing is asked, not invented; a round of questions ends the turn and the answers come back. */
  yield { type: "status", text: "Reading your request…" };
  const asked = (request.history ?? []).slice(-6).filter((turn) => turn.questions?.length).length;
  const canAsk = canAskAgain(request.content, asked);
  let brief = fallbackBrief(request.content);
  try {
    brief = await makeBrief({ adapter, connection: request.connection, signal: request.signal, intent: request.content, context: request.context, pageOutline, history: request.history ?? [], canAsk });
  } catch (error) {
    /* Only the person stopping it ends the turn: a briefing that failed must never block the build. */
    if (request.signal.aborted) throw error;
  }
  if (ASKING_ENABLED && brief.missing.length > 0) {
    yield { type: "done", text: questionsText(brief.missing), questions: brief.missing };
    return;
  }
  yield { type: "brief", goal: brief.goal, checklist: brief.checklist, assumptions: brief.assumptions };

  const mentioned = mentionedComponents(request.content, request.service);
  const initial = JSON.stringify({ intent: request.content, context: request.context, pageOutline, ...(mentioned.length ? { mentionedComponents: mentioned } : {}), brief: { goal: brief.goal, checklist: brief.checklist, assumptions: brief.assumptions, known: brief.known } });
  if (initial.length > 120_000) throw new Error("Selection context is too large. Select fewer layers and try again.");
  messages.push({ role: "user", content: initial });
  /* After it proposes, the result is held to the brief: up to this many reviews, each adding what is still missing. */
  let reviews = 0;
  let inReview = false;
  let count = 0;
  for (let round = 0; round < 16; round++) {
    request.signal.throwIfAborted();
    yield { type: "status", text: "Preparing a Maker proposal…" };
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
        if (trial.ok) queue.push({ type: "draft", site: trial.site, added: addedNodes(baseIds, trial.site), operations: count });
      };
      const streaming = adapter.stream(request.connection, system, messages, tools.specs, request.signal, {
        text: (delta) => queue.push({ type: "say", delta }),
        callStart: (call) => {
          queue.push({ type: "status", text: activity[call.name] ?? "Checking Maker capabilities…" });
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
      if (proposal && !inReview && brief.kind === "build" && brief.checklist.length > 0 && reviews < MAX_REVIEWS) {
        reviews++;
        inReview = true;
        tools.review();
        idRound++;
        yield { type: "status", text: reviews === 1 ? "Checking the result against your goal…" : "Checking what is still missing…" };
        const page = proposal.site.pages.find((entry) => entry.id === request.context.page.id) ?? proposal.site.pages[0]!;
        const now = describeSite({ ...proposal.site, pages: [page] });
        const advice = proposal.site.pages.flatMap((entry) => layoutAdvice(entry.root));
        messages.push({ role: "user", content: JSON.stringify({ review: {
          goal: brief.goal, checklist: brief.checklist, assumptions: brief.assumptions,
          now: now.length > OUTLINE_LIMIT ? `${now.slice(0, OUTLINE_LIMIT)}\n… (cut)` : now,
          ...(advice.length ? { advice } : {}),
          instruction: REVIEW_INSTRUCTION,
        } }) });
        continue;
      }
      yield { type: "done", text: reply.text, proposal };
      return;
    }
    /* A round of questions ends the turn: nothing else this reply asked for runs, and the answers are the next message. */
    const asked = ASKING_ENABLED ? reply.calls.find((call) => call.name === "ask_user") : undefined;
    if (asked) {
      let parsed: ReturnType<typeof askInput.safeParse> | undefined;
      try { parsed = askInput.safeParse(JSON.parse(asked.arguments)); } catch { parsed = undefined; }
      if (parsed?.success) {
        yield { type: "done", text: questionsText(parsed.data.questions), questions: parsed.data.questions };
        return;
      }
    }
    for (const call of reply.calls) {
      request.signal.throwIfAborted();
      if (++count > 64) throw new Error("Agent tool limit reached. Try a smaller edit.");
      yield { type: "status", text: activity[call.name] ?? "Checking Maker capabilities…" };
      if (call.name === "maker_try") tools.clearProposal();
      let result: unknown;
      try {
        if (call.arguments.length > 64_000) throw new Error();
        result = await tools.execute(call.name, JSON.parse(call.arguments));
      } catch { result = { refused: "Malformed tool call. Send valid JSON arguments." }; }
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
