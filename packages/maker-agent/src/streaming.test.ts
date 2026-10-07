import { afterEach, describe, expect, it, vi } from "vitest";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { createSite, counterIds, fromUsageTree, makerContext, walk } from "@skryensya/maker-model";
import index from "../../../artifacts/ai-index.json" with { type: "json" };
import manifest from "../../../artifacts/ai-manifest.json" with { type: "json" };
import { runAgent, type AgentEvent } from "./runtime.js";
import { anthropicAdapter, openaiAdapter, responsesAdapter, type ProviderAdapter, type ProviderConnection, type StreamHandlers } from "./providers.js";

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

  it("hands the model the open page with every node's id, and an edit touches only what it names", async () => {
    const text = [...walk(root)].find((n) => n.signature === "Text")!;
    const seen: string[] = [];
    const edit = JSON.stringify({ operations: [{ type: "page", page: pageId, operations: [
      { type: "setText", node: text.id, text: "Changed" },
      { type: "insert", at: { parent: root.id, slot: "children", index: 1 }, tree: { contract: "typography", signature: "Text", children: "Appended" } },
    ] }] });
    let round = 0;
    const adapter: ProviderAdapter = {
      complete: vi.fn(async () => ({ text: "", calls: [] })),
      stream: vi.fn(async (_c, system, messages, _t, _s, on: StreamHandlers) => {
        if (round++ === 0) {
          seen.push(messages.at(-1)!.content, system);
          on.callStart?.({ id: "c1", name: "maker_try" });
          on.callArgs?.("c1", edit);
          return { text: "", calls: [{ id: "c1", name: "maker_try", arguments: edit }] };
        }
        return { text: "Done.", calls: [] };
      }),
    };
    const events = await run(adapter);
    const first = JSON.parse(seen[0]!) as { pageOutline: string };
    expect(first.pageOutline).toContain(text.id);
    expect(first.pageOutline).toContain("typography/Text");
    expect(seen[1]).toContain("WORK ON WHAT IS THERE");
    expect(seen[1]).toContain("CONTRACTS YOU CAN USE NOW");
    const done = events.find((e): e is Extract<AgentEvent, { type: "done" }> => e.type === "done")!;
    const texts = [...walk(done.proposal!.site.pages[0]!.root)].flatMap((n) => JSON.stringify(n.slots)).join(" ");
    expect(texts).toContain("Changed");
    expect(texts).toContain("Appended");
    expect(texts).not.toContain("Existing");
  });

  it("a follow-up builds on a proposal still waiting, and the result is both changes against the original project", async () => {
    const text = [...walk(root)].find((n) => n.signature === "Text")!;
    const batch = (operations: unknown[]) => JSON.stringify({ operations: [{ type: "page", page: pageId, operations }] });
    const scripted = (arguments_: string, seen: string[]): ProviderAdapter => {
      let round = 0;
      return {
        complete: vi.fn(async () => ({ text: "", calls: [] })),
        stream: vi.fn(async (_c, _s, messages, _t, _sig, on: StreamHandlers) => {
          if (round++ === 0) {
            seen.push(messages.at(-1)!.content);
            on.callStart?.({ id: "c1", name: "maker_try" });
            on.callArgs?.("c1", arguments_);
            return { text: "", calls: [{ id: "c1", name: "maker_try", arguments: arguments_ }] };
          }
          return { text: "Done.", calls: [] };
        }),
      };
    };
    const firstEvents = await run(scripted(batch([{ type: "setText", node: text.id, text: "First" }]), []));
    const first = firstEvents.find((e): e is Extract<AgentEvent, { type: "done" }> => e.type === "done")!.proposal!;

    const seen: string[] = [];
    const events: AgentEvent[] = [];
    const carry = { site: first.site, operations: first.operations };
    for await (const e of runAgent({ connection, site, context, content: "And add a line", service, adapter: scripted(batch([{ type: "insert", at: { parent: root.id, slot: "children", index: 1 }, tree: { contract: "typography", signature: "Text", children: "Second" } }]), seen), carry, signal: new AbortController().signal })) events.push(e);
    const proposal = events.find((e): e is Extract<AgentEvent, { type: "done" }> => e.type === "done")!.proposal!;
    /* The model is shown the draft, not the untouched project. */
    expect(JSON.parse(seen[0]!).pageOutline).toContain("First");
    /* Both changes are in the result, and it still commits from the ORIGINAL project as one edit. */
    const result = JSON.stringify([...walk(proposal.site.pages[0]!.root)].map((n) => n.slots));
    expect(result).toContain("First");
    expect(result).toContain("Second");
    expect(proposal.base).toBe(site);
    expect(proposal.operations.length).toBe(first.operations.length + 1);
  });

  it("a follow-up can change what the earlier, still unapplied proposal added, and Apply stays one edit", async () => {
    const batch = (operations: unknown[]) => JSON.stringify({ operations: [{ type: "page", page: pageId, operations }] });
    const scripted = (arguments_: string, seen: string[] = []): ProviderAdapter => {
      let round = 0;
      return {
        complete: vi.fn(async () => ({ text: "", calls: [] })),
        stream: vi.fn(async (_c, _s, messages, _t, _sig, on: StreamHandlers) => {
          if (round++ === 0) { seen.push(messages.at(-1)!.content); on.callStart?.({ id: "c1", name: "maker_try" }); on.callArgs?.("c1", arguments_); return { text: "", calls: [{ id: "c1", name: "maker_try", arguments: arguments_ }] }; }
          return { text: "Done.", calls: [] };
        }),
      };
    };
    const done = (events: AgentEvent[]) => events.find((e): e is Extract<AgentEvent, { type: "done" }> => e.type === "done")!.proposal!;
    const first = done(await run(scripted(batch([{ type: "insert", at: { parent: root.id, slot: "children", index: 1 }, tree: { contract: "typography", signature: "Text", children: "Draft line" } }]))));
    /* The node the first proposal added: it exists only in the draft. */
    const added = [...walk(first.site.pages[0]!.root)].find((n) => n.signature === "Text" && JSON.stringify(n.slots).includes("Draft line"))!;
    expect([...walk(root)].some((n) => n.id === added.id)).toBe(false);

    const seen: string[] = [];
    const events: AgentEvent[] = [];
    for await (const e of runAgent({ connection, site, context, content: "Make that line say Final", service, carry: { site: first.site, operations: first.operations },
      adapter: scripted(batch([{ type: "setText", node: added.id, text: "Final line" }]), seen), signal: new AbortController().signal })) events.push(e);
    expect(JSON.parse(seen[0]!).pageOutline).toContain(added.id);
    const proposal = done(events);
    const text = JSON.stringify([...walk(proposal.site.pages[0]!.root)].map((n) => n.slots));
    expect(text).toContain("Final line");
    expect(text).not.toContain("Draft line");
    /* Still one proposal against the untouched project: the insert, then the edit of what it inserted. */
    expect(proposal.base).toBe(site);
    expect(proposal.operations.length).toBe(first.operations.length + 1);
  });

  it("never asks: the brief records its assumptions and the build goes on", async () => {
    const adapter: ProviderAdapter = {
      complete: vi.fn(async () => ({ text: "", calls: [{ id: "b", name: "submit_brief", arguments: JSON.stringify({ kind: "build", goal: "A hero", checklist: ["A hero"], assumptions: ["Headline is a placeholder"] }) }] })),
      stream: vi.fn(async () => ({ text: "Built.", calls: [] })),
    };
    const events = await run(adapter);
    expect(events.find((e) => e.type === "brief")).toMatchObject({ goal: "A hero", assumptions: ["Headline is a placeholder"] });
    expect(adapter.stream).toHaveBeenCalled();
  });

  it("keeps going until the goal is met: after proposing it reviews the result and adds only what is missing", async () => {
    const text = [...walk(root)].find((n) => n.signature === "Text")!;
    const batch = (operations: unknown[]) => JSON.stringify({ operations: [{ type: "page", page: pageId, operations }] });
    const first = batch([{ type: "setText", node: text.id, text: "Headline" }]);
    const more = batch([{ type: "insert", at: { parent: root.id, slot: "children", index: 1 }, tree: { contract: "typography", signature: "Text", children: "Supporting line" } }]);
    const brief = JSON.stringify({ kind: "build", goal: "A hero with a headline and a supporting line", checklist: ["A headline", "A supporting line"] });
    const reviews: string[] = [];
    const roundsSeen: number[] = [];
    let round = 0;
    const adapter: ProviderAdapter = {
      complete: vi.fn(async () => ({ text: "", calls: [{ id: "b", name: "submit_brief", arguments: brief }] })),
      stream: vi.fn(async (_c, _s, messages, _t, _sig, on: StreamHandlers) => {
        roundsSeen.push(++round);
        const last = messages.at(-1)!;
        if (round === 1) { on.callStart?.({ id: "c1", name: "maker_try" }); on.callArgs?.("c1", first); return { text: "", calls: [{ id: "c1", name: "maker_try", arguments: first }] }; }
        /* Round 2 is the tool result of round 1: the agent says it is done after only the first part. */
        if (round === 2) return { text: "Done.", calls: [] };
        /* Round 3 is the REVIEW: it is shown the page as proposed and the checklist, and adds the missing line. */
        if (round === 3) {
          reviews.push(last.content);
          on.callStart?.({ id: "c2", name: "maker_try" }); on.callArgs?.("c2", more);
          return { text: "", calls: [{ id: "c2", name: "maker_try", arguments: more }] };
        }
        return { text: "Built the headline and the supporting line; both are your content to adjust.", calls: [] };
      }),
    };
    const events = await run(adapter);
    const review = JSON.parse(reviews[0]!).review as { goal: string; checklist: string[]; now: string };
    expect(review.checklist).toEqual(["A headline", "A supporting line"]);
    expect(review.now).toContain("Headline");
    const proposal = events.find((e): e is Extract<AgentEvent, { type: "done" }> => e.type === "done")!.proposal!;
    const result = JSON.stringify([...walk(proposal.site.pages[0]!.root)].map((n) => n.slots));
    /* Both parts are in one proposal: the review ADDED the line, it did not start over. */
    expect(result).toContain("Headline");
    expect(result).toContain("Supporting line");
    expect(proposal.base).toBe(site);
    expect(proposal.operations.length).toBe(2);
  });

  it("sends ANY proposal back once when advice stands, even a plain edit with no checklist, and the plan reaches the build", async () => {
    const h1 = (text: string, index: number) => ({ type: "insert", at: { parent: root.id, slot: "children", index }, tree: { contract: "typography", signature: "Heading", options: { headingElement: "h1" }, children: text } });
    const args = JSON.stringify({ operations: [{ type: "page", page: pageId, operations: [h1("One", 1), h1("Two", 2)] }] });
    const brief = JSON.stringify({ kind: "edit", goal: "Add two titles", checklist: ["Two titles"], plan: [{ section: "Titles", role: "content", content: "Two titles", components: ["Heading"] }] });
    const seen: string[] = [];
    let round = 0;
    const adapter: ProviderAdapter = {
      complete: vi.fn(async () => ({ text: "", calls: [{ id: "b", name: "submit_brief", arguments: brief }] })),
      stream: vi.fn(async (_c, _s, messages, _t, _sig, on: StreamHandlers) => {
        round++;
        seen.push(messages.at(-1)!.content);
        if (round === 1) { on.callStart?.({ id: "c1", name: "maker_try" }); on.callArgs?.("c1", args); return { text: "", calls: [{ id: "c1", name: "maker_try", arguments: args }] }; }
        return { text: "Added the titles.", calls: [] };
      }),
    };
    await run(adapter);
    expect(JSON.parse(seen[0]!).brief.plan[0]).toMatchObject({ section: "Titles", role: "content" });
    const review = seen.map((content) => { try { return (JSON.parse(content) as { review?: { advice?: string[] } }).review; } catch { return undefined; } }).find(Boolean);
    expect(review?.advice?.join(" ")).toContain("2 top-level headings");
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
    /* Each round starts the chat's text over (`reset`): what the person reads is what follows the last reset. The plain sections here
       have no Wrapper, so the advice sends them back once and there are two rounds. */
    const says = events.filter((e): e is Extract<AgentEvent, { type: "say" }> => e.type === "say");
    const lastReset = says.map((e) => e.reset === true).lastIndexOf(true);
    expect(says.slice(lastReset + 1).map((e) => e.delta).join("")).toBe("Added three sections.");
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

  it("speaks the Responses API for OpenAI: instructions and input, flat tools, reasoning only where it is accepted", async () => {
    const fetch = vi.fn(async () => sse([
      { type: "response.output_text.delta", delta: "Hel" },
      { type: "response.output_text.delta", delta: "lo" },
      { type: "response.output_item.added", output_index: 1, item: { type: "function_call", id: "fc_1", call_id: "call_1", name: "maker_try", arguments: "" } },
      { type: "response.function_call_arguments.delta", output_index: 1, delta: '{"operations":' },
      { type: "response.function_call_arguments.delta", output_index: 1, delta: "[]}" },
      { type: "response.output_item.done", output_index: 1, item: { type: "function_call", id: "fc_1", call_id: "call_1", name: "maker_try", arguments: '{"operations":[]}' } },
      { type: "response.completed", response: {} },
    ]));
    vi.stubGlobal("fetch", fetch);
    const text: string[] = [];
    const args: string[] = [];
    const history = [
      { role: "user" as const, content: "hi" },
      { role: "assistant" as const, content: "Looking.", calls: [{ id: "call_0", name: "maker_read", arguments: "{}" }] },
      { role: "tool" as const, content: "{}", call: { id: "call_0", name: "maker_read", arguments: "{}" } },
    ];
    const tools = [{ name: "maker_try", description: "Try.", parameters: { type: "object", properties: {} } }];
    const reply = await responsesAdapter.stream!({ ...connection, model: "gpt-6-sol" }, "Maker", history, tools, signal(), { text: (d) => text.push(d), callArgs: (_id, d) => args.push(d) });
    expect(text.join("")).toBe("Hello");
    expect(args.join("")).toBe('{"operations":[]}');
    expect(reply).toEqual({ text: "Hello", calls: [{ id: "call_1", name: "maker_try", arguments: '{"operations":[]}' }] });
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ model: "gpt-6-sol", instructions: "Maker", stream: true, reasoning: { effort: "low" } });
    expect(body.tools).toEqual([{ type: "function", name: "maker_try", description: "Try.", parameters: { type: "object", properties: {} } }]);
    expect(body.messages).toBeUndefined();
    /* A call goes back by call_id with no item id, and its result as function_call_output. */
    expect(body.input).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "Looking." },
      { type: "function_call", call_id: "call_0", name: "maker_read", arguments: "{}" },
      { type: "function_call_output", call_id: "call_0", output: "{}" },
    ]);
    expect(init.body).not.toContain(connection.apiKey);
    /* gpt-4.1 takes no `reasoning`. */
    await responsesAdapter.stream!({ ...connection, model: "gpt-4.1" }, "Maker", [], [], signal(), {}).catch(() => undefined);
    expect(JSON.parse((fetch.mock.calls[1] as unknown as [string, RequestInit])[1].body as string).reasoning).toBeUndefined();
  });

  it("reads a whole Responses reply: output_text and function_call items", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ output: [
      { type: "reasoning", id: "rs_1", summary: [] },
      { type: "message", content: [{ type: "output_text", text: "Done." }] },
      { type: "function_call", call_id: "call_9", name: "maker_try", arguments: "{}" },
    ] }), { status: 200, headers: { "content-type": "application/json" } })));
    expect(await responsesAdapter.complete({ ...connection, model: "gpt-6-sol" }, "Maker", [{ role: "user", content: "hi" }], [], signal()))
      .toEqual({ text: "Done.", calls: [{ id: "call_9", name: "maker_try", arguments: "{}" }] });
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
