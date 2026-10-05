import { describe, expect, it, vi } from "vitest";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { createSite, counterIds, fromUsageTree, makerContext, findNode, childrenOf, commitSite, startHistory, undo } from "@skryensya/maker-model";
import index from "../../../artifacts/ai-index.json" with { type: "json" };
import manifest from "../../../artifacts/ai-manifest.json" with { type: "json" };
import { runAgent, type AgentEvent } from "./runtime.js";
import { createMakerTools } from "./tools.js";
import type { ProviderAdapter, ProviderReply } from "./providers.js";

const service = createAgentService(asCompiledPair(index, manifest), []);
const base = createSite("hash", counterIds("site"));
const root = fromUsageTree({ contract: "layout", signature: "Main", children: [{ contract: "layout", signature: "Stack", children: [
  { contract: "button", signature: "Button.action", children: "One" },
  { contract: "button", signature: "Button.action", children: "Two" },
] }] }, counterIds("node"));
const site = { ...base, pages: [{ ...base.pages[0]!, root }] };
const buttons = [...childrenOf(childrenOf(root, "children")[0] as typeof root, "children")].map(c => c.id);
const context = makerContext(site, { id: "project", revision: 3 }, { page: site.pages[0]!.id, selected: buttons[0], selectedIds: buttons,
  width: "fit", scheme: "light", contrast: false, density: "default", mode: "edit" });
const operations = [{ type: "page", page: site.pages[0]!.id, operations: [{ type: "wrap", children: buttons, with: { contract: "layout", signature: "Inline" } }] }];
const connection = { provider: "openai" as const, apiKey: "secret-test-credential", model: "test" };

function scripted(replies: ProviderReply[]): ProviderAdapter {
  return { complete: vi.fn(async () => replies.shift() ?? { text: "Ready", calls: [] }) };
}
async function collect(adapter: ProviderAdapter, signal = new AbortController().signal) {
  const events: AgentEvent[] = [];
  for await (const e of runAgent({ connection, site, context, content: "Put these next to each other.", service, adapter, signal })) events.push(e);
  return events;
}

describe("presets for the embedded agent", () => {
  const tools = createMakerTools(site, context, service);

  it("lists a signature's presets with the wrapper each arrives in", () => {
    const listed = tools.execute("maker_presets", { contract: "button", signature: "Button.action" }) as { presets: { id: string; arrivesIn: string }[] };
    expect(listed.presets.map((preset) => preset.id)).toContain("icon-only");
    expect(listed.presets.find((preset) => preset.id === "confirm-pair")?.arrivesIn).toBe("inline");
  });

  it("proposes an insert of a preset, and the proposal holds its wrapper", () => {
    const stack = childrenOf(root, "children")[0]!;
    const result = tools.execute("maker_try", {
      operations: [{ type: "page", page: site.pages[0]!.id, operations: [{ type: "insert", at: { parent: stack.id, slot: "children", index: 0 }, signature: { contract: "button", signature: "Button.action" }, preset: "confirm-pair" }] }],
    });
    expect(result).toMatchObject({ proposed: true });
  });

  it("refuses a preset that does not exist", () => {
    const stack = childrenOf(root, "children")[0]!;
    const result = tools.execute("maker_try", {
      operations: [{ type: "page", page: site.pages[0]!.id, operations: [{ type: "insert", at: { parent: stack.id, slot: "children", index: 0 }, signature: { contract: "button", signature: "Button.action" }, preset: "nope" }] }],
    });
    expect(result).toHaveProperty("refused");
  });
});

describe("embedded Maker capability boundary", () => {
  it("shares context/read and prepares a dry-run without mutating the site", () => {
    const tools = createMakerTools(site, context, service);
    expect(tools.execute("maker_context", {})).toEqual(context);
    expect(tools.execute("maker_read", {})).toMatchObject({ revision: 3 });
    expect(tools.execute("maker_try", { operations })).toMatchObject({ proposed: true });
    const proposal = tools.proposal()!;
    expect(proposal.base).toBe(site);
    expect(findNode(site.pages[0]!.root, buttons[0]!)?.signature).toBe("Button.action");
    expect(proposal.operations).toHaveLength(1);
    const committed = commitSite(startHistory(site), proposal.operations);
    expect(committed.ok).toBe(true);
    if (committed.ok) {
      expect(committed.history.past).toHaveLength(1);
      expect(undo(committed.history).present).toBe(site);
    }
  });
  it("refuses unknown options, CSS, arbitrary patches and structural invalidity", () => {
    const tools = createMakerTools(site, context, service);
    const attempt = (operation: unknown) => tools.execute("maker_try", { operations: [{ type: "page", page: site.pages[0]!.id, operations: [operation] }] });
    expect(attempt({ type: "setAttr", node: buttons[0], name: "style", value: "position:absolute" })).toHaveProperty("refused");
    expect(attempt({ type: "setOption", node: buttons[0], name: "width", value: 200 })).toHaveProperty("refused");
    expect(attempt({ type: "patch", path: "/pages", value: [] })).toHaveProperty("refused");
    expect(attempt({ type: "move", child: buttons[0], to: { parent: buttons[0], slot: "children", index: 0 } })).toHaveProperty("refused");
    expect(attempt({ type: "remove", child: buttons[0], x: 10 })).toHaveProperty("refused");
    const at = { parent: root.id, slot: "children", index: 0 };
    expect(attempt({ type: "insert", at, tree: { contract: "typography", signature: "Text", attrs: { style: "position:absolute" }, children: "No CSS" } })).toHaveProperty("refused");
    expect(attempt({ type: "insert", at, tree: { contract: "layout", signature: "Stack", children: [{ contract: "typography", signature: "Text", attrs: { CLASS: "custom" }, children: "Nested" }] } })).toHaveProperty("refused");
    expect(attempt({ type: "insert", at, tree: { contract: "typography", signature: "Text", options: { width: "200px" }, children: "No props" } })).toHaveProperty("refused");
    expect(attempt({ type: "wrap", children: buttons, with: { contract: "layout", signature: "Inline", options: { padding: "200px" } } })).toHaveProperty("refused");
    expect(tools.execute("shell", {})).toHaveProperty("refused");
    expect(tools.proposal()).toBeUndefined();
  });
  it("rejects new pending errors but allows existing authoring problems", () => {
    const tools = createMakerTools(site, context, service);
    expect(tools.execute("maker_try", { operations: [{ type: "page", page: site.pages[0]!.id, operations: buttons.map(child => ({ type: "remove", child })) }] })).toHaveProperty("refused");
  });
});

describe("bounded tool-using runtime", () => {
  it("round-trips calls, produces a proposal, and never puts a key in model messages/tools", async () => {
    const adapter = scripted([{ text: "", calls: [{ id: "1", name: "maker_try", arguments: JSON.stringify({ operations }) }] }, { text: "Wrapped both buttons in Inline.", calls: [] }]);
    const events = await collect(adapter);
    expect(events.at(-1)).toMatchObject({ type: "done", proposal: { revision: 3 } });
    const calls = vi.mocked(adapter.complete).mock.calls;
    expect(calls).toHaveLength(2);
    for (const args of calls) expect(JSON.stringify(args.slice(1))).not.toContain(connection.apiKey);
    expect(JSON.stringify(events)).not.toContain(connection.apiKey);
  });
  it("returns malformed calls as tool refusals so the agent can repair", async () => {
    const adapter = scripted([{ text: "", calls: [{ id: "1", name: "maker_try", arguments: "not json" }] }]);
    const events = await collect(adapter);
    expect(events.at(-1)).not.toHaveProperty("proposal", expect.anything());
    const messages = vi.mocked(adapter.complete).mock.calls[1]![2];
    expect(messages.some(m => m.role === "tool" && m.content.includes("Malformed tool call"))).toBe(true);
  });
  it("checks aborts before executing tools", async () => {
    const controller = new AbortController();
    const adapter: ProviderAdapter = { complete: async () => { controller.abort(); return { text: "", calls: [{ id: "1", name: "maker_try", arguments: JSON.stringify({ operations }) }] }; } };
    await expect(collect(adapter, controller.signal)).rejects.toThrow();
    expect(site).toEqual({ ...base, pages: [{ ...base.pages[0]!, root }] });
  });
  it("rejects missing credentials before any request", async () => {
    const adapter = scripted([]);
    const run = async () => { for await (const _ of runAgent({ connection: { ...connection, apiKey: "" }, site, context, content: "edit", service, adapter, signal: new AbortController().signal })) { /* consume */ } };
    await expect(run()).rejects.toThrow("Connect a provider");
    expect(adapter.complete).not.toHaveBeenCalled();
  });
});
