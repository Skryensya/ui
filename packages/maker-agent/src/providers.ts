import { z } from "zod";
import { sseData } from "./stream.js";

export type ProviderId = "openai" | "anthropic" | "openrouter" | "compatible";
/** Session memory only. Never pass this object to a tool, transcript or project serializer. */
export interface ProviderConnection { provider: ProviderId; apiKey: string; model: string; endpoint?: string }
export interface ToolSpec { name: string; description: string; parameters: Record<string, unknown> }
export interface ToolCall { id: string; name: string; arguments: string }
export type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; calls: ToolCall[] }
  | { role: "tool"; content: string; call: ToolCall };
export interface ProviderReply { text: string; calls: ToolCall[] }
/** What a streamed reply reports as it arrives, before the reply is complete. All optional. */
export interface StreamHandlers {
  /** A piece of the assistant's visible text. */
  text?(delta: string): void;
  /** The model has begun a tool call. Arguments follow through `callArgs`. */
  callStart?(call: { id: string; name: string }): void;
  /** The next piece of a tool call's JSON arguments. */
  callArgs?(id: string, delta: string): void;
}
export interface ProviderAdapter {
  complete(connection: ProviderConnection, system: string, messages: readonly Message[], tools: readonly ToolSpec[], signal: AbortSignal): Promise<ProviderReply>;
  /** The same reply, reported piece by piece while it is written. Resolves with the complete reply. */
  stream?(connection: ProviderConnection, system: string, messages: readonly Message[], tools: readonly ToolSpec[], signal: AbortSignal, on: StreamHandlers): Promise<ProviderReply>;
}

async function post(url: string, headers: Record<string, string>, body: unknown, signal: AbortSignal, timeoutMs: number) {
  let response: Response;
  try {
    response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body),
      redirect: "error", signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) });
  } catch {
    if (signal.aborted) throw new Error("Cancelled.");
    throw new Error("Provider unavailable or timed out. Check your endpoint and browser CORS support.");
  }
  // Never relay provider bodies: they can echo credentials or request headers.
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("Provider rejected the credential or browser access.");
    if (response.status === 429) throw new Error("Provider rate limit reached. Try again later.");
    /* A model the provider does not know is the one failure a person can fix on the spot, so it is named. Nothing
       else of the body is relayed: it can echo credentials. */
    const model = typeof body === "object" && body !== null && "model" in body ? String((body as { model: unknown }).model) : "";
    if (response.status === 404 || response.status === 400) {
      const text = await response.text().catch(() => "");
      if (model && /model/i.test(text) && /(not found|does not exist|unknown|do not have access)/i.test(text)) throw new Error(`The provider has no model "${model}" for this key. Check the model name.`);
      /* A 400 is the provider saying what is wrong with the REQUEST, never with the key. Its message is relayed with
         every credential we sent removed, since without it the failure cannot be told apart from any other. */
      let detail = "";
      try { const parsed = JSON.parse(text) as { error?: { message?: unknown } | string }; detail = typeof parsed.error === "string" ? parsed.error : typeof parsed.error?.message === "string" ? parsed.error.message : ""; } catch { /* not JSON */ }
      for (const value of Object.values(headers)) for (const secret of value.split(/\s+/).filter(part => part.length >= 8)) detail = detail.split(secret).join("[credential]");
      if (detail) throw new Error(`Provider request failed (HTTP ${response.status}): ${detail.slice(0, 300)}`);
    }
    throw new Error(`Provider request failed (HTTP ${response.status}).`);
  }
  return response;
}

async function request(url: string, headers: Record<string, string>, body: unknown, signal: AbortSignal) {
  const response = await post(url, headers, body, signal, 60_000);
  try { return await response.json() as unknown; } catch { throw new Error("Malformed provider response."); }
}

/** A streamed reply may legitimately take minutes to write; the cap is on the whole stream, not on silence. */
const STREAM_TIMEOUT_MS = 240_000;

async function* events(response: Response, signal: AbortSignal): AsyncGenerator<unknown> {
  if (!response.body) throw new Error("Malformed provider response.");
  try {
    for await (const data of sseData(response.body, signal)) {
      if (data === "[DONE]") return;
      try { yield JSON.parse(data) as unknown; } catch { /* a keep-alive or a non-JSON line: not an event */ }
    }
  } catch (error) {
    if (signal.aborted) throw new Error("Cancelled.");
    throw error instanceof Error && error.message.startsWith("Provider") ? error : new Error("Provider stream was interrupted.");
  }
}

const openaiResponse = z.object({ choices: z.array(z.object({ message: z.object({
  content: z.string().nullable().optional(),
  tool_calls: z.array(z.object({ id: z.string(), function: z.object({ name: z.string(), arguments: z.string() }) })).max(16).optional(),
}) })).min(1) });
const anthropicResponse = z.object({ content: z.array(z.union([
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("tool_use"), id: z.string(), name: z.string(), input: z.unknown() }),
])) });

function openaiBase(connection: ProviderConnection): string {
  let base = connection.provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
  if (connection.provider === "compatible") {
    if (!connection.endpoint) throw new Error("Enter an OpenAI-compatible endpoint.");
    const url = new URL(connection.endpoint);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("Use HTTPS (or localhost) for credentials.");
    if (url.username || url.password || url.search || url.hash) throw new Error("Endpoint must not contain credentials, query or fragment.");
    base = connection.endpoint.replace(/\/$/, "");
  }
  return base;
}

function openaiBody(connection: ProviderConnection, system: string, messages: readonly Message[], tools: readonly ToolSpec[]) {
  return {
    model: connection.model,
    messages: [{ role: "system", content: system }, ...messages.map(m => m.role === "tool" ? { role: "tool", content: m.content, tool_call_id: m.call.id } :
      m.role === "assistant" ? { role: "assistant", content: m.content || null, ...(m.calls.length ? { tool_calls: m.calls.map(c => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.arguments } })) } : {}) } : m)],
    ...(tools.length ? { tools: tools.map(t => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } })) } : {}),
  };
}

function parseOpenaiReply(raw: unknown): ProviderReply {
  const parsed = openaiResponse.safeParse(raw);
  if (!parsed.success) throw new Error("Malformed provider response.");
  const message = parsed.data.choices[0]!.message;
  return { text: message.content ?? "", calls: (message.tool_calls ?? []).map(c => ({ id: c.id, name: c.function.name, arguments: c.function.arguments })) };
}

function parseAnthropicReply(raw: unknown): ProviderReply {
  const parsed = anthropicResponse.safeParse(raw);
  if (!parsed.success) throw new Error("Malformed provider response.");
  return { text: parsed.data.content.filter(c => c.type === "text").map(c => c.text).join("\n"),
    calls: parsed.data.content.filter(c => c.type === "tool_use").map(c => ({ id: c.id, name: c.name, arguments: JSON.stringify(c.input) })) };
}

const isEventStream = (response: Response) => (response.headers.get("content-type") ?? "").includes("text/event-stream");

/**
 * An endpoint that ignores `stream: true` answers with the whole reply as plain JSON. That is still a valid
 * answer: it is handed to the same handlers in one piece, so the caller does not care which it got.
 */
async function wholeReply(response: Response, parse: (raw: unknown) => ProviderReply, on: StreamHandlers): Promise<ProviderReply> {
  let raw: unknown;
  try { raw = await response.json(); } catch { throw new Error("Malformed provider response."); }
  const reply = parse(raw);
  if (reply.text) on.text?.(reply.text);
  for (const call of reply.calls) { on.callStart?.({ id: call.id, name: call.name }); on.callArgs?.(call.id, call.arguments); }
  return reply;
}

const openaiChunk = z.object({ choices: z.array(z.object({ delta: z.object({
  content: z.string().nullable().optional(),
  tool_calls: z.array(z.object({ index: z.number().int().min(0).max(63), id: z.string().optional(),
    function: z.object({ name: z.string().optional(), arguments: z.string().optional() }).optional() })).optional(),
}).optional() })).optional() });

export const openaiAdapter: ProviderAdapter = {
  async complete(connection, system, messages, tools, signal) {
    const base = openaiBase(connection);
    const raw = await request(`${base}/chat/completions`, { authorization: `Bearer ${connection.apiKey}` }, openaiBody(connection, system, messages, tools), signal);
    return parseOpenaiReply(raw);
  },
  async stream(connection, system, messages, tools, signal, on) {
    const base = openaiBase(connection);
    const response = await post(`${base}/chat/completions`, { authorization: `Bearer ${connection.apiKey}` },
      { ...openaiBody(connection, system, messages, tools), stream: true }, signal, STREAM_TIMEOUT_MS);
    if (!isEventStream(response)) return wholeReply(response, parseOpenaiReply, on);
    let text = "";
    let seen = false;
    const calls = new Map<number, { id: string; name: string; arguments: string; started: boolean }>();
    for await (const raw of events(response, signal)) {
      const chunk = openaiChunk.safeParse(raw);
      if (!chunk.success) continue;
      seen = true;
      const delta = chunk.data.choices?.[0]?.delta;
      if (!delta) continue;
      if (delta.content) { text += delta.content; on.text?.(delta.content); }
      for (const piece of delta.tool_calls ?? []) {
        const call = calls.get(piece.index) ?? { id: "", name: "", arguments: "", started: false };
        calls.set(piece.index, call);
        if (piece.id) call.id = piece.id;
        if (piece.function?.name) call.name += piece.function.name;
        if (!call.started && call.id && call.name) { call.started = true; on.callStart?.({ id: call.id, name: call.name }); }
        const args = piece.function?.arguments;
        if (args) { call.arguments += args; if (call.started) on.callArgs?.(call.id, args); }
      }
    }
    if (!seen) throw new Error("Malformed provider response.");
    const finished = [...calls.entries()].sort((a, b) => a[0] - b[0]).map(([, c]) => c).filter(c => c.id && c.name);
    if (finished.length > 16) throw new Error("Provider response exceeds the agent limit.");
    return { text, calls: finished.map(c => ({ id: c.id, name: c.name, arguments: c.arguments || "{}" })) };
  },
};

/*
 * OPENAI'S RESPONSES API (POST /v1/responses), the one OpenAI recommends for new work and the one that takes
 * reasoning and function calling together. Used for the `openai` provider only: OpenRouter and OpenAI-compatible
 * endpoints speak chat/completions, which `openaiAdapter` above keeps serving.
 *
 * The conversation is resent whole each turn, so nothing depends on the server keeping state. A function call is
 * sent back WITHOUT its item `id` (only `call_id`, name and arguments): with the id, the API demands the reasoning
 * item that preceded it, which a stateless resend does not have.
 */
const REASONING_MODEL = /^(o\d|gpt-(?:[5-9]|\d{2,}))/i;

function responsesBody(connection: ProviderConnection, system: string, messages: readonly Message[], tools: readonly ToolSpec[]) {
  const input: unknown[] = [];
  for (const m of messages) {
    if (m.role === "user") input.push({ role: "user", content: m.content });
    else if (m.role === "tool") input.push({ type: "function_call_output", call_id: m.call.id, output: m.content });
    else {
      if (m.content) input.push({ role: "assistant", content: m.content });
      for (const c of m.calls) input.push({ type: "function_call", call_id: c.id, name: c.name, arguments: c.arguments });
    }
  }
  return {
    model: connection.model,
    instructions: system,
    input,
    /* Only a reasoning model takes `reasoning`; sending it to gpt-4.1 and the like is a 400. Low effort: the person is
       watching the canvas wait, and the contracts are in the prompt, so the model has little to work out. */
    ...(REASONING_MODEL.test(connection.model) ? { reasoning: { effort: "low" } } : {}),
    ...(tools.length ? { tools: tools.map(t => ({ type: "function", name: t.name, description: t.description, parameters: t.parameters })) } : {}),
  };
}

const responsesOutput = z.object({ output: z.array(z.object({ type: z.string() }).passthrough()).max(64) });
const functionCall = z.object({ type: z.literal("function_call"), call_id: z.string(), name: z.string(), arguments: z.string() });
const outputMessage = z.object({ type: z.literal("message"), content: z.array(z.object({ type: z.string(), text: z.string().optional() }).passthrough()) });

function parseResponsesReply(raw: unknown): ProviderReply {
  const parsed = responsesOutput.safeParse(raw);
  if (!parsed.success) throw new Error("Malformed provider response.");
  let text = "";
  const calls: ToolCall[] = [];
  for (const item of parsed.data.output) {
    const call = functionCall.safeParse(item);
    if (call.success) { calls.push({ id: call.data.call_id, name: call.data.name, arguments: call.data.arguments }); continue; }
    const message = outputMessage.safeParse(item);
    if (message.success) text += message.data.content.filter(c => c.type === "output_text").map(c => c.text ?? "").join("");
  }
  if (calls.length > 16) throw new Error("Provider response exceeds the agent limit.");
  return { text, calls };
}

const responsesEvent = z.object({ type: z.string() }).passthrough();

export const responsesAdapter: ProviderAdapter = {
  async complete(connection, system, messages, tools, signal) {
    const raw = await request(`${openaiBase(connection)}/responses`, { authorization: `Bearer ${connection.apiKey}` }, responsesBody(connection, system, messages, tools), signal);
    return parseResponsesReply(raw);
  },
  async stream(connection, system, messages, tools, signal, on) {
    const response = await post(`${openaiBase(connection)}/responses`, { authorization: `Bearer ${connection.apiKey}` },
      { ...responsesBody(connection, system, messages, tools), stream: true }, signal, STREAM_TIMEOUT_MS);
    if (!isEventStream(response)) return wholeReply(response, parseResponsesReply, on);
    let text = "";
    let seen = false;
    const calls = new Map<number, { id: string; name: string; arguments: string }>();
    for await (const raw of events(response, signal)) {
      const parsed = responsesEvent.safeParse(raw);
      if (!parsed.success) continue;
      seen = true;
      const event = parsed.data as { type: string; delta?: unknown; output_index?: unknown; item?: unknown; error?: { message?: unknown }; response?: { error?: { message?: unknown } } };
      const index = typeof event.output_index === "number" ? event.output_index : -1;
      if (event.type === "response.output_text.delta" && typeof event.delta === "string") { text += event.delta; on.text?.(event.delta); }
      else if (event.type === "response.output_item.added") {
        const item = functionCall.partial().safeParse(event.item);
        if (item.success && item.data.type === "function_call" && item.data.call_id && item.data.name) {
          calls.set(index, { id: item.data.call_id, name: item.data.name, arguments: "" });
          on.callStart?.({ id: item.data.call_id, name: item.data.name });
        }
      } else if (event.type === "response.function_call_arguments.delta" && typeof event.delta === "string") {
        const call = calls.get(index);
        if (call) { call.arguments += event.delta; on.callArgs?.(call.id, event.delta); }
      } else if (event.type === "response.output_item.done") {
        /* The finished item carries the arguments whole: they win over what the deltas added up to. */
        const done = functionCall.safeParse(event.item);
        if (done.success) {
          if (!calls.has(index)) on.callStart?.({ id: done.data.call_id, name: done.data.name });
          calls.set(index, { id: done.data.call_id, name: done.data.name, arguments: done.data.arguments });
        }
      } else if (event.type === "response.failed" || event.type === "error") {
        throw new Error("Provider request failed.");
      }
    }
    if (!seen) throw new Error("Malformed provider response.");
    const finished = [...calls.entries()].sort((a, b) => a[0] - b[0]).map(([, c]) => c).filter(c => c.id && c.name);
    if (finished.length > 16) throw new Error("Provider response exceeds the agent limit.");
    return { text, calls: finished.map(c => ({ id: c.id, name: c.name, arguments: c.arguments || "{}" })) };
  },
};

function anthropicWire(messages: readonly Message[]) {
  const wire: { role: "user" | "assistant"; content: unknown[] }[] = [];
  for (const message of messages) {
    const role = message.role === "assistant" ? "assistant" : "user";
    const content = message.role === "tool" ? [{ type: "tool_result", tool_use_id: message.call.id, content: message.content }] :
      message.role === "assistant" ? [...(message.content ? [{ type: "text", text: message.content }] : []), ...message.calls.map(c => ({ type: "tool_use", id: c.id, name: c.name, input: JSON.parse(c.arguments) as unknown }))] : [{ type: "text", text: message.content }];
    if (wire.at(-1)?.role === role) wire.at(-1)!.content.push(...content);
    else wire.push({ role, content });
  }
  return wire;
}

const anthropicHeaders = (connection: ProviderConnection) => ({
  "x-api-key": connection.apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true",
});

/** Room for a whole page of operations: a short cap cut long proposals off mid-JSON. */
const ANTHROPIC_MAX_TOKENS = 8192;

const anthropicBody = (connection: ProviderConnection, system: string, messages: readonly Message[], tools: readonly ToolSpec[]) => ({
  model: connection.model, max_tokens: ANTHROPIC_MAX_TOKENS, system, messages: anthropicWire(messages),
  ...(tools.length ? { tools: tools.map(t => ({ name: t.name, description: t.description, input_schema: t.parameters })) } : {}),
});

const anthropicEvent = z.discriminatedUnion("type", [
  z.object({ type: z.literal("content_block_start"), index: z.number().int(), content_block: z.object({ type: z.string(), id: z.string().optional(), name: z.string().optional() }) }),
  z.object({ type: z.literal("content_block_delta"), index: z.number().int(), delta: z.object({ type: z.string(), text: z.string().optional(), partial_json: z.string().optional() }) }),
  z.object({ type: z.literal("error") }),
]).or(z.object({ type: z.string() }));

export const anthropicAdapter: ProviderAdapter = {
  async complete(connection, system, messages, tools, signal) {
    const raw = await request("https://api.anthropic.com/v1/messages", anthropicHeaders(connection), anthropicBody(connection, system, messages, tools), signal);
    return parseAnthropicReply(raw);
  },
  async stream(connection, system, messages, tools, signal, on) {
    const response = await post("https://api.anthropic.com/v1/messages", anthropicHeaders(connection),
      { ...anthropicBody(connection, system, messages, tools), stream: true }, signal, STREAM_TIMEOUT_MS);
    if (!isEventStream(response)) return wholeReply(response, parseAnthropicReply, on);
    const blocks = new Map<number, { kind: "text" | "tool"; id: string; name: string; text: string }>();
    let seen = false;
    for await (const raw of events(response, signal)) {
      const event = anthropicEvent.safeParse(raw);
      if (!event.success) continue;
      seen = true;
      const e = event.data as { type: string; index?: number; content_block?: { type: string; id?: string; name?: string }; delta?: { type: string; text?: string; partial_json?: string } };
      if (e.type === "error") throw new Error("Provider request failed.");
      if (e.type === "content_block_start" && e.index !== undefined && e.content_block) {
        const tool = e.content_block.type === "tool_use";
        blocks.set(e.index, { kind: tool ? "tool" : "text", id: e.content_block.id ?? "", name: e.content_block.name ?? "", text: "" });
        if (tool && e.content_block.id && e.content_block.name) on.callStart?.({ id: e.content_block.id, name: e.content_block.name });
      } else if (e.type === "content_block_delta" && e.index !== undefined && e.delta) {
        const block = blocks.get(e.index);
        if (!block) continue;
        if (e.delta.type === "text_delta" && e.delta.text) { block.text += e.delta.text; on.text?.(e.delta.text); }
        else if (e.delta.type === "input_json_delta" && e.delta.partial_json !== undefined) { block.text += e.delta.partial_json; if (block.id) on.callArgs?.(block.id, e.delta.partial_json); }
      }
    }
    if (!seen) throw new Error("Malformed provider response.");
    const ordered = [...blocks.entries()].sort((a, b) => a[0] - b[0]).map(([, block]) => block);
    const calls = ordered.filter(b => b.kind === "tool" && b.id && b.name);
    if (calls.length > 16) throw new Error("Provider response exceeds the agent limit.");
    return { text: ordered.filter(b => b.kind === "text").map(b => b.text).join("\n"),
      calls: calls.map(b => ({ id: b.id, name: b.name, arguments: b.text || "{}" })) };
  },
};

export const providers: Record<ProviderId, ProviderAdapter> = { openai: responsesAdapter, anthropic: anthropicAdapter, openrouter: openaiAdapter, compatible: openaiAdapter };

export async function testConnection(connection: ProviderConnection, signal: AbortSignal) {
  if (!connection.apiKey.trim() || !connection.model.trim()) throw new Error("Enter an API key and model.");
  await providers[connection.provider].complete(connection, "Reply briefly: connected. Do not use tools.", [{ role: "user", content: "Test connection." }], [], signal);
}
