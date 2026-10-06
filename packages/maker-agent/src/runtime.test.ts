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

/* The briefing call comes first and asks for submit_brief: it is answered with an edit brief (nothing to ask, nothing to
   review) so the scripted replies are the build's own. */
const editBrief: ProviderReply = { text: "", calls: [{ id: "b", name: "submit_brief", arguments: JSON.stringify({ kind: "edit", goal: "Do it", checklist: ["It is done"] }) }] };
function scripted(replies: ProviderReply[]): ProviderAdapter {
  return { complete: vi.fn(async (_c, _s, _m, tools) => ((tools as readonly { name: string }[]).some((tool) => tool.name === "submit_brief") ? editBrief : replies.shift() ?? { text: "Ready", calls: [] })) };
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
    /* The brief, then the build's two rounds. */
    expect(calls).toHaveLength(3);
    for (const args of calls) expect(JSON.stringify(args.slice(1))).not.toContain(connection.apiKey);
    expect(JSON.stringify(events)).not.toContain(connection.apiKey);
  });
  it("returns malformed calls as tool refusals so the agent can repair", async () => {
    const adapter = scripted([{ text: "", calls: [{ id: "1", name: "maker_try", arguments: "not json" }] }]);
    const events = await collect(adapter);
    expect(events.at(-1)).not.toHaveProperty("proposal", expect.anything());
    const messages = vi.mocked(adapter.complete).mock.calls[2]![2];
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

describe("layout guidance for the embedded agent", () => {
  it("teaches the design system's page structure, and wrapping things inside a container", async () => {
    const { MAKER_SYSTEM_PROMPT } = await import("./system-prompt.js");
    for (const word of ["Wrapper", "wrapperSize", "never put a Wrapper inside another Wrapper", "wrap operation", "Main > Box (band) > Wrapper > Stack"]) {
      expect(MAKER_SYSTEM_PROMPT.toLowerCase()).toContain(word.toLowerCase());
    }
  });

  it("refuses a Wrapper inside a Wrapper with the reason, so the agent can repair the batch", () => {
    const tools = createMakerTools(site, context, service);
    const stack = childrenOf(root, "children")[0]!;
    const wrapIn = (tools: ReturnType<typeof createMakerTools>, id: string) => tools.execute("maker_try", {
      operations: [{ type: "page", page: site.pages[0]!.id, operations: [{ type: "wrap", children: [id], with: { contract: "wrapper", signature: "Wrapper" } }] }],
    }) as { proposed?: boolean; refused?: string };
    expect(wrapIn(tools, stack.id).proposed).toBe(true);
    const wrapper = childrenOf(tools.proposal()!.site.pages[0]!.root, "children")[0]!;
    const again = wrapIn(createMakerTools(tools.proposal()!.site, context, service), wrapper.id);
    expect(again.refused).toBe("Wrapper cannot go inside Wrapper.");
  });
});

describe("reading a website to clone it", () => {
  it("teaches cloning: read first, rebuild with the kit, never copy markup", async () => {
    const { MAKER_SYSTEM_PROMPT } = await import("./system-prompt.js");
    for (const word of ["maker_read_site", "never reproduce the", "likelyScripted"]) expect(MAKER_SYSTEM_PROMPT).toContain(word);
  });

  it("hands the model the server's summary, and its failure as a refusal it can answer", async () => {
    const seen: string[] = [];
    const ok = createMakerTools(site, context, service, undefined, undefined, async (url) => { seen.push(url); return { title: "Acme", sections: [] }; });
    expect(await ok.execute("maker_read_site", { url: "https://acme.test/" })).toEqual({ title: "Acme", sections: [] });
    expect(seen).toEqual(["https://acme.test/"]);
    const down = createMakerTools(site, context, service, undefined, undefined, async () => { throw new Error("That address is not public."); });
    expect(await down.execute("maker_read_site", { url: "https://acme.test/" })).toEqual({ refused: "That address is not public." });
    expect(await createMakerTools(site, context, service).execute("maker_read_site", { url: "https://acme.test/" })).toEqual({ refused: "Reading websites is not available here." });
    expect((await down.execute("maker_read_site", { url: "not a url" }) as { refused: string }).refused).toBe("Malformed tool arguments.");
  });
});

describe("the agent asks, but not for everything", () => {
  it("can ask, is told to do it rarely, and still never invents content", async () => {
    const { MAKER_SYSTEM_PROMPT } = await import("./system-prompt.js");
    expect(MAKER_SYSTEM_PROMPT).toContain("ASK RARELY");
    expect(MAKER_SYSTEM_PROMPT).toContain("NEVER INVENT");
    expect(MAKER_SYSTEM_PROMPT).toContain("FINISH THE JOB");
    const tools = createMakerTools(site, context, service);
    const ask = tools.specs.find((spec: { name: string }) => spec.name === "ask_user") as { description: string } | undefined;
    expect(ask?.description.startsWith("RARELY.")).toBe(true);
    expect(await tools.execute("ask_user", { questions: [{ title: "Audience", recommended: "Developers" }] })).toMatchObject({ asked: true });
    const { BRIEF_SYSTEM_PROMPT } = await import("./brief.js");
    /* The briefing step asks only when a build would be a coin flip, never for copy that can be a placeholder. */
    expect(BRIEF_SYSTEM_PROMPT).toContain("ASK LITTLE");
    expect(BRIEF_SYSTEM_PROMPT).toContain("Never ask for copy, prices, names or numbers");
  });
});

describe("components the person names", () => {
  it("are found in the request, with the design system's guidance for deciding whether to use them", async () => {
    const { mentionedComponents } = await import("./mentions.js");
    const found = mentionedComponents("pon un wrapper y un Navbar arriba", service);
    expect(found.map(m => m.signature)).toEqual(expect.arrayContaining(["Wrapper", "Navbar"]));
    expect(mentionedComponents("nada que ver aquí", service)).toEqual([]);
    const { MAKER_SYSTEM_PROMPT } = await import("./system-prompt.js");
    expect(MAKER_SYSTEM_PROMPT).toContain("mentionedComponents");
  });
});

describe("centered layouts", () => {
  it("teaches the three levers: Wrapper for the column, Stack and Inline for the items, Hero for the text lines", async () => {
    const { MAKER_SYSTEM_PROMPT } = await import("./system-prompt.js");
    for (const word of ["CENTERED LAYOUTS", "Hero align center", "Inline (justify center)", "hero-centered-minimal", "does NOT centre a"]) expect(MAKER_SYSTEM_PROMPT).toContain(word);
  });
});

describe("cloning keeps the page's architecture", () => {
  it("plans from the section roles, copies the real content and heading levels, and never invents", async () => {
    const { MAKER_SYSTEM_PROMPT } = await import("./system-prompt.js");
    for (const word of ["INFORMATION ARCHITECTURE", "PLAN from structure", "ONE card per item", "Keep the heading levels of outline", "Never write copy the original does not have"]) expect(MAKER_SYSTEM_PROMPT).toContain(word);
  });
});
