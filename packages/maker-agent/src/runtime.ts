import type { AgentService } from "@skryensya/ai-compiler/agent";
import { counterIds, type AgentSiteOperation, type MakerAgentContext, type MakerProposal, type MakerSite } from "@skryensya/maker-model";
import { createMakerTools } from "./tools.js";
import { providers, type Message, type ProviderAdapter, type ProviderConnection, type ProviderReply } from "./providers.js";
import { OperationStream } from "./stream.js";
import { addedNodes, nodeIds, tryProposal } from "./draft.js";
import { MAKER_SYSTEM_PROMPT } from "./system-prompt.js";

export interface ConversationTurn { content: string; context: MakerAgentContext; answer?: string }
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
  | { type: "say"; delta: string }
  | { type: "draft"; site: MakerSite; added: readonly string[]; operations: number }
  | { type: "done"; text: string; proposal?: MakerProposal };
const activity: Record<string, string> = {
  maker_context: "Inspecting the attached selection…", maker_read: "Inspecting page structure…",
  discover_ui: "Finding suitable components…", get_contract: "Checking component options…",
  get_contracts: "Checking component contracts…", get_examples: "Inspecting an example…",
  validate_ui: "Validating the composition…", maker_try: "Preparing proposed changes…",
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
}): AsyncGenerator<AgentEvent> {
  if (!request.connection.apiKey.trim() || !request.connection.model.trim()) throw new Error("Connect a provider with an API key and model first.");
  if (request.content.length > 8000) throw new Error("Message too long (maximum 8,000 characters).");
  /* Same operations, same identities: the draft and the final proposal mint the same nodes, so the canvas
     keeps what it drew. The prefix is new each turn so it cannot collide with a node the site already has. */
  const prefix = `ai${Math.random().toString(36).slice(2, 8)}-`;
  const ids = () => counterIds(prefix);
  const baseIds = nodeIds(request.site);
  const tools = createMakerTools(request.site, request.context, request.service, ids);
  const messages: Message[] = [];
  for (const turn of (request.history ?? []).slice(-4)) {
    messages.push({ role: "user", content: JSON.stringify({ intent: turn.content.slice(0, 8000), context: { project: turn.context.project, page: turn.context.page, primary: turn.context.selection.primary, selectedIds: turn.context.selection.selectedIds } }) });
    if (turn.answer) messages.push({ role: "assistant", content: turn.answer.slice(0, 2000), calls: [] });
  }
  const initial = JSON.stringify({ intent: request.content, context: request.context });
  if (initial.length > 120_000) throw new Error("Selection context is too large. Select fewer layers and try again.");
  messages.push({ role: "user", content: initial });
  const adapter = request.adapter ?? providers[request.connection.provider];
  let count = 0;
  for (let round = 0; round < 16; round++) {
    request.signal.throwIfAborted();
    yield { type: "status", text: "Preparing a Maker proposal…" };
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
        const trial = tryProposal(request.site, operations as AgentSiteOperation[], ids());
        if (trial.ok) queue.push({ type: "draft", site: trial.site, added: addedNodes(baseIds, trial.site), operations: count });
      };
      const streaming = adapter.stream(request.connection, MAKER_SYSTEM_PROMPT, messages, tools.specs, request.signal, {
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
      reply = await adapter.complete(request.connection, MAKER_SYSTEM_PROMPT, messages, tools.specs, request.signal);
    }
    request.signal.throwIfAborted();
    if (reply.calls.length > 16 || reply.text.length > 32_000) throw new Error("Provider response exceeds the agent limit.");
    messages.push({ role: "assistant", content: reply.text, calls: reply.calls });
    if (!reply.calls.length) {
      yield { type: "done", text: reply.text, proposal: tools.proposal() };
      return;
    }
    for (const call of reply.calls) {
      request.signal.throwIfAborted();
      if (++count > 64) throw new Error("Agent tool limit reached. Try a smaller edit.");
      yield { type: "status", text: activity[call.name] ?? "Checking Maker capabilities…" };
      if (call.name === "maker_try") tools.clearProposal();
      let result: unknown;
      try {
        if (call.arguments.length > 64_000) throw new Error();
        result = tools.execute(call.name, JSON.parse(call.arguments));
      } catch { result = { refused: "Malformed tool call. Send valid JSON arguments." }; }
      let content = JSON.stringify(result);
      if (content.length > 48_000) content = JSON.stringify({ truncated: true, totalCharacters: content.length, hint: "Result too large. Read one page or contract at a time.", preview: content.slice(0, 12_000) });
      messages.push({ role: "tool", call, content });
    }
    if (JSON.stringify(messages).length > 240_000) throw new Error("Agent context limit reached. Try a smaller edit.");
  }
  throw new Error("Agent turn limit reached. No changes applied.");
}
