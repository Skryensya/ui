import { z } from "zod";

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
export interface ProviderAdapter {
  complete(connection: ProviderConnection, system: string, messages: readonly Message[], tools: readonly ToolSpec[], signal: AbortSignal): Promise<ProviderReply>;
}

async function request(url: string, headers: Record<string, string>, body: unknown, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body),
      redirect: "error", signal: AbortSignal.any([signal, AbortSignal.timeout(60_000)]) });
  } catch {
    if (signal.aborted) throw new Error("Cancelled.");
    throw new Error("Provider unavailable or timed out. Check your endpoint and browser CORS support.");
  }
  // Never relay provider bodies: they can echo credentials or request headers.
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Provider rejected the credential or browser access." :
    response.status === 429 ? "Provider rate limit reached. Try again later." : `Provider request failed (HTTP ${response.status}).`);
  try { return await response.json() as unknown; } catch { throw new Error("Malformed provider response."); }
}

const openaiResponse = z.object({ choices: z.array(z.object({ message: z.object({
  content: z.string().nullable().optional(),
  tool_calls: z.array(z.object({ id: z.string(), function: z.object({ name: z.string(), arguments: z.string() }) })).max(16).optional(),
}) })).min(1) });
const anthropicResponse = z.object({ content: z.array(z.union([
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("tool_use"), id: z.string(), name: z.string(), input: z.unknown() }),
])) });

export const openaiAdapter: ProviderAdapter = {
  async complete(connection, system, messages, tools, signal) {
    let base = connection.provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
    if (connection.provider === "compatible") {
      if (!connection.endpoint) throw new Error("Enter an OpenAI-compatible endpoint.");
      const url = new URL(connection.endpoint);
      if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("Use HTTPS (or localhost) for credentials.");
      if (url.username || url.password || url.search || url.hash) throw new Error("Endpoint must not contain credentials, query or fragment.");
      base = connection.endpoint.replace(/\/$/, "");
    }
    const raw = await request(`${base}/chat/completions`, { authorization: `Bearer ${connection.apiKey}` }, {
      model: connection.model,
      messages: [{ role: "system", content: system }, ...messages.map(m => m.role === "tool" ? { role: "tool", content: m.content, tool_call_id: m.call.id } :
        m.role === "assistant" ? { role: "assistant", content: m.content || null, ...(m.calls.length ? { tool_calls: m.calls.map(c => ({ id: c.id, type: "function", function: { name: c.name, arguments: c.arguments } })) } : {}) } : m)],
      ...(tools.length ? { tools: tools.map(t => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } })) } : {}),
    }, signal);
    const parsed = openaiResponse.safeParse(raw);
    if (!parsed.success) throw new Error("Malformed provider response.");
    const message = parsed.data.choices[0]!.message;
    return { text: message.content ?? "", calls: (message.tool_calls ?? []).map(c => ({ id: c.id, name: c.function.name, arguments: c.function.arguments })) };
  },
};

export const anthropicAdapter: ProviderAdapter = {
  async complete(connection, system, messages, tools, signal) {
    const wire: { role: "user" | "assistant"; content: unknown[] }[] = [];
    for (const message of messages) {
      const role = message.role === "assistant" ? "assistant" : "user";
      const content = message.role === "tool" ? [{ type: "tool_result", tool_use_id: message.call.id, content: message.content }] :
        message.role === "assistant" ? [...(message.content ? [{ type: "text", text: message.content }] : []), ...message.calls.map(c => ({ type: "tool_use", id: c.id, name: c.name, input: JSON.parse(c.arguments) as unknown }))] : [{ type: "text", text: message.content }];
      if (wire.at(-1)?.role === role) wire.at(-1)!.content.push(...content);
      else wire.push({ role, content });
    }
    const raw = await request("https://api.anthropic.com/v1/messages", {
      "x-api-key": connection.apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true",
    }, { model: connection.model, max_tokens: 4096, system, messages: wire,
      ...(tools.length ? { tools: tools.map(t => ({ name: t.name, description: t.description, input_schema: t.parameters })) } : {}) }, signal);
    const parsed = anthropicResponse.safeParse(raw);
    if (!parsed.success) throw new Error("Malformed provider response.");
    return { text: parsed.data.content.filter(c => c.type === "text").map(c => c.text).join("\n"),
      calls: parsed.data.content.filter(c => c.type === "tool_use").map(c => ({ id: c.id, name: c.name, arguments: JSON.stringify(c.input) })) };
  },
};

export const providers: Record<ProviderId, ProviderAdapter> = { openai: openaiAdapter, anthropic: anthropicAdapter, openrouter: openaiAdapter, compatible: openaiAdapter };

export async function testConnection(connection: ProviderConnection, signal: AbortSignal) {
  if (!connection.apiKey.trim() || !connection.model.trim()) throw new Error("Enter an API key and model.");
  await providers[connection.provider].complete(connection, "Reply briefly: connected. Do not use tools.", [{ role: "user", content: "Test connection." }], [], signal);
}
