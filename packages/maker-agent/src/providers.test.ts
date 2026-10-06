import { afterEach, describe, expect, it, vi } from "vitest";
import { anthropicAdapter, openaiAdapter, testConnection, type ProviderConnection, type Message } from "./providers.js";
const connection: ProviderConnection = { provider: "openai", apiKey: "private-key", model: "chosen-model" };
const signal = () => new AbortController().signal;
afterEach(() => vi.unstubAllGlobals());

describe("BYOK provider adapters", () => {
  it("puts the OpenAI key only in headers and preserves tool-call identity", async () => {
    const fetch = vi.fn(async () => Response.json({ choices: [{ message: { content: null, tool_calls: [{ id: "call", function: { name: "maker_read", arguments: "{}" } }] } }] }));
    vi.stubGlobal("fetch", fetch);
    const reply = await openaiAdapter.complete(connection, "Maker", [{ role: "user", content: "Inspect this" }], [], signal());
    expect(reply.calls[0]?.id).toBe("call");
    const request = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(request[1].headers).toMatchObject({ authorization: "Bearer private-key" });
    expect(request[1].body).not.toContain(connection.apiKey);
  });
  it("maps Anthropic tool blocks and results without exposing credentials to messages", async () => {
    const fetch = vi.fn(async () => Response.json({ content: [{ type: "text", text: "Ready" }, { type: "tool_use", id: "a", name: "maker_context", input: {} }] }));
    vi.stubGlobal("fetch", fetch);
    const call = { id: "previous", name: "maker_read", arguments: "{}" };
    const messages: Message[] = [{ role: "user", content: "Edit" }, { role: "assistant", content: "", calls: [call] }, { role: "tool", call, content: "outline" }];
    const reply = await anthropicAdapter.complete({ ...connection, provider: "anthropic" }, "Maker", messages, [], signal());
    expect(reply).toEqual({ text: "Ready", calls: [{ id: "a", name: "maker_context", arguments: "{}" }] });
    const request = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(request[1].body).toContain("tool_result");
    expect(request[1].body).not.toContain(connection.apiKey);
  });
  it.each([401, 429, 503])("sanitizes provider error bodies (%s)", async status => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(`echo private-key`, { status })));
    const run = openaiAdapter.complete(connection, "Maker", [], [], signal());
    await expect(run).rejects.not.toThrow(connection.apiKey);
  });
  it("rejects malformed responses and insecure custom endpoints", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ bad: "private-key" })));
    await expect(openaiAdapter.complete(connection, "Maker", [], [], signal())).rejects.toThrow("Malformed provider response");
    await expect(openaiAdapter.complete({ ...connection, provider: "compatible", endpoint: "http://unsafe.example/v1" }, "Maker", [], [], signal())).rejects.toThrow("HTTPS");
  });
  it("propagates cancellation without provider request details", async () => {
    const controller = new AbortController();
    controller.abort();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("private-key"); }));
    await expect(openaiAdapter.complete(connection, "Maker", [], [], controller.signal)).rejects.toThrow("Cancelled");
  });
  it("tests connections without sending credentials in the prompt", async () => {
    const fetch = vi.fn(async (url: string) => Response.json(url.endsWith("/responses")
      ? { output: [{ type: "message", content: [{ type: "output_text", text: "Connected" }] }] }
      : { choices: [{ message: { content: "Connected" } }] }));
    vi.stubGlobal("fetch", fetch);
    await expect(testConnection(connection, signal())).resolves.toBeUndefined();
    await expect(testConnection({ ...connection, apiKey: "" }, signal())).rejects.toThrow("API key");
    /* OpenAI is asked on the Responses API; OpenRouter and compatible endpoints stay on chat/completions. */
    await testConnection({ ...connection, provider: "openrouter" }, signal());
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(["https://api.openai.com/v1/responses", "https://openrouter.ai/api/v1/chat/completions"]);
  });
});
