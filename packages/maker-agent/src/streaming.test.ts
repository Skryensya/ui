import { afterEach, describe, expect, it, vi } from "vitest";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { createSite, counterIds, fromUsageTree, makerContext, walk } from "@skryensya/maker-model";
import index from "../../../artifacts/ai-index.json" with { type: "json" };
import manifest from "../../../artifacts/ai-manifest.json" with { type: "json" };
import { runAgent, type AgentEvent } from "./runtime.js";
import { anthropicAdapter, openaiAdapter, type ProviderAdapter, type ProviderConnection, type StreamHandlers } from "./providers.js";

const service = createAgentService(asCompiledPair(index, manifest), []);
const base = createSite("hash", counterIds("site"));
const root = fromUsageTree({ contract: "layout", signature: "Main", children: [{ contract: "typography", signature: "Text", children: "Existing" }] }, counterIds("node"));
const site = { ...base, pages: [{ ...base.pages[0]!, root }] };
const pageId = site.pages[0]!.id;
const context = makerContext(site, { id: "project", revision: 1 }, { page: pageId, selected: undefined, selectedIds: [], width: "fit", scheme: "light", contrast: false, density: "default", mode: "edit" });
const connection: ProviderConnection = { provider: "openai", apiKey: "secret-test-credential", model: "test" };

const section = (n: number) => ({ type: "insert", at: { parent: root.id, slot: "children", index: n }, tree: { contract: "typography", signature: "Text", children: `Section ${n}` } });
const call = JSON.stringify({ operations: [{ type: "page", page: pageId, operations: [section(1), section(2), section(3)] }] });

/** A provider that writes the maker_try call a few characters at a time, then says one sentence. */
function streamingAdapter(chunk = 40): ProviderAdapter {
  let round = 0;
  return {
    complete: vi.fn(async () => ({ text: "", calls: [] })),
    stream: vi.fn(async (_c, _s, _m, _t, _signal, on: StreamHandlers) => {
      if (round++ === 0) {
        on.callStart?.({ id: "c1", name: "maker_try" });
        for (let i = 0; i < call.length; i += chunk) {
          on.callArgs?.("c1", call.slice(i, i + chunk));
          await new Promise((resolve) => setTimeout(resolve, 12));
        }
        return { text: "", calls: [{ id: "c1", name: "maker_try", arguments: call }] };
      }
      on.text?.("Added three sections.");
      return { text: "Added three sections.", calls: [] };
    }),
  };
}

async function run(adapter: ProviderAdapter) {
  const events: AgentEvent[] = [];
  for await (const e of runAgent({ connection, site, context, content: "Add three sections", service, adapter, signal: new AbortController().signal })) events.push(e);
  return events;
}

describe("streaming runtime", () => {
  it("shows the site growing, one operation at a time, before the answer is final", async () => {
    const events = await run(streamingAdapter());
    const drafts = events.filter((e): e is Extract<AgentEvent, { type: "draft" }> => e.type === "draft");
    expect(drafts.length).toBeGreaterThanOrEqual(2);
    const counts = drafts.map((d) => d.operations);
    expect([...counts].sort((a, b) => a - b)).toEqual(counts);
    expect(counts.at(-1)).toBe(3);
    expect(events.findIndex((e) => e.type === "draft")).toBeLessThan(events.findIndex((e) => e.type === "done"));
    const sizes = drafts.map((d) => [...walk(d.site.pages[0]!.root)].length);
    expect(sizes[0]).toBeLessThan(sizes.at(-1)!);
  });

  it("keeps the same identities from the first draft to the final proposal", async () => {
    const events = await run(streamingAdapter());
    const drafts = events.filter((e): e is Extract<AgentEvent, { type: "draft" }> => e.type === "draft");
    const done = events.at(-1) as Extract<AgentEvent, { type: "done" }>;
    const finalIds = [...walk(done.proposal!.site.pages[0]!.root)].map((n) => n.id);
    for (const draft of drafts) {
      const ids = [...walk(draft.site.pages[0]!.root)].map((n) => n.id);
      expect(finalIds).toEqual(expect.arrayContaining(ids));
      expect(draft.added.every((id) => finalIds.includes(id))).toBe(true);
    }
    expect(drafts.at(-1)!.added).toHaveLength(3);
    expect(new Set(finalIds).size).toBe(finalIds.length);
  });

  it("streams the written answer and still ends with the validated proposal", async () => {
    const events = await run(streamingAdapter());
    expect(events.filter((e) => e.type === "say").map((e) => (e as { delta: string }).delta).join("")).toBe("Added three sections.");
    expect(events.at(-1)).toMatchObject({ type: "done", text: "Added three sections.", proposal: { revision: 1 } });
  });

  it("is the same result whatever the chunk size", async () => {
    const outline = async (chunk: number) => {
      const done = (await run(streamingAdapter(chunk))).at(-1) as Extract<AgentEvent, { type: "done" }>;
      return [...walk(done.proposal!.site.pages[0]!.root)].map((n) => n.signature);
    };
    expect(await outline(3)).toEqual(await outline(500));
  });

  it("never lets a half-valid draft through: an operation that fails is simply not drawn", async () => {
    const bad = JSON.stringify({ operations: [{ type: "page", page: pageId, operations: [section(1), { type: "remove", child: "nope" }] }] });
    const adapter: ProviderAdapter = {
      complete: vi.fn(),
      stream: vi.fn(async (_c, _s, _m, _t, _signal, on: StreamHandlers) => {
        on.callStart?.({ id: "c1", name: "maker_try" });
        on.callArgs?.("c1", bad);
        return { text: "Done.", calls: [] };
      }),
    };
    const events = await run(adapter);
    const drafts = events.filter((e) => e.type === "draft");
    expect(drafts).toHaveLength(0);
  });
});

/* ── the provider adapters, against canned server-sent events ───────────────────────────────────── */

const sse = (events: unknown[], done = false) =>
  new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      for (const e of events) controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      if (done) controller.enqueue(enc.encode("data: [DONE]\n\n"));
      controller.close();
    },
  }), { headers: { "content-type": "text/event-stream" } });
const signal = () => new AbortController().signal;
afterEach(() => vi.unstubAllGlobals());

describe("streaming provider adapters", () => {
  it("reads OpenAI deltas: text, a tool call split across chunks, and reassembles the reply", async () => {
    const fetch = vi.fn(async () => sse([
      { choices: [{ delta: { content: "Hel" } }] },
      { choices: [{ delta: { content: "lo" } }] },
      { choices: [{ delta: { tool_calls: [{ index: 0, id: "call_1", function: { name: "maker_try", arguments: '{"operations":' } }] } }] },
      { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: "[]}" } }] } }] },
    ], true));
    vi.stubGlobal("fetch", fetch);
    const text: string[] = [];
    const args: string[] = [];
    const started: string[] = [];
    const reply = await openaiAdapter.stream!(connection, "Maker", [{ role: "user", content: "hi" }], [], signal(), {
      text: (d) => text.push(d), callStart: (c) => started.push(`${c.id}:${c.name}`), callArgs: (_id, d) => args.push(d),
    });
    expect(text.join("")).toBe("Hello");
    expect(started).toEqual(["call_1:maker_try"]);
    expect(args.join("")).toBe('{"operations":[]}');
    expect(reply).toEqual({ text: "Hello", calls: [{ id: "call_1", name: "maker_try", arguments: '{"operations":[]}' }] });
    const request = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(request[1].body as string)).toMatchObject({ stream: true });
    expect(request[1].body).not.toContain(connection.apiKey);
  });

  it("reads Anthropic blocks: text deltas and input_json_delta for a tool_use", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sse([
      { type: "message_start" },
      { type: "content_block_start", index: 0, content_block: { type: "text" } },
      { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Ok" } },
      { type: "content_block_start", index: 1, content_block: { type: "tool_use", id: "tu_1", name: "maker_try" } },
      { type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: '{"operations"' } },
      { type: "content_block_delta", index: 1, delta: { type: "input_json_delta", partial_json: ":[]}" } },
      { type: "message_stop" },
    ])));
    const args: string[] = [];
    const reply = await anthropicAdapter.stream!({ ...connection, provider: "anthropic" }, "Maker", [{ role: "user", content: "hi" }], [], signal(), { callArgs: (_id, d) => args.push(d) });
    expect(args.join("")).toBe('{"operations":[]}');
    expect(reply).toEqual({ text: "Ok", calls: [{ id: "tu_1", name: "maker_try", arguments: '{"operations":[]}' }] });
  });

  it("refuses a stream that carries no events, without echoing the provider", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => sse([])));
    await expect(openaiAdapter.stream!(connection, "Maker", [], [], signal(), {})).rejects.toThrow("Malformed provider response");
  });

  it("maps provider HTTP errors without relaying their body", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("echo secret-test-credential", { status: 401 })));
    const run = openaiAdapter.stream!(connection, "Maker", [], [], signal(), {});
    await expect(run).rejects.toThrow("rejected");
    await expect(run).rejects.not.toThrow("secret-test-credential");
  });
});

describe("an endpoint that ignores stream: true", () => {
  it("is read as a whole reply and still reaches the same handlers (OpenAI shape)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ choices: [{ message: { content: "All set", tool_calls: [{ id: "t1", function: { name: "maker_try", arguments: '{"operations":[]}' } }] } }] })));
    const seen: string[] = [];
    const reply = await openaiAdapter.stream!(connection, "Maker", [], [], signal(), { text: (d) => seen.push(`text:${d}`), callStart: (c) => seen.push(`start:${c.name}`), callArgs: (_i, d) => seen.push(`args:${d}`) });
    expect(seen).toEqual(["text:All set", "start:maker_try", 'args:{"operations":[]}']);
    expect(reply.calls).toHaveLength(1);
  });
  it("and the Anthropic shape", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ content: [{ type: "tool_use", id: "a", name: "maker_context", input: {} }] })));
    const reply = await anthropicAdapter.stream!({ ...connection, provider: "anthropic" }, "Maker", [], [], signal(), {});
    expect(reply.calls).toEqual([{ id: "a", name: "maker_context", arguments: "{}" }]);
  });
});
