import { describe, expect, it, vi } from "vitest";
import { createAgentService } from "@skryensya/ai-compiler/agent";
import { asCompiledPair } from "@skryensya/ai-compiler/artifact";
import { createSite, counterIds, fromUsageTree, siteFromTemplate, makerContext, findNode, childrenOf, commitSite, startHistory, undo } from "@skryensya/maker-model";
import index from "../../../artifacts/ai-index.json" with { type: "json" };
import manifest from "../../../artifacts/ai-manifest.json" with { type: "json" };
import templates from "../../../artifacts/templates.json" with { type: "json" };
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

describe("the agent never asks", () => {
  it("has no tool to ask with, decides instead, and still never invents content", async () => {
    const { MAKER_SYSTEM_PROMPT } = await import("./system-prompt.js");
    expect(MAKER_SYSTEM_PROMPT).toContain("DO NOT ASK, DECIDE");
    expect(MAKER_SYSTEM_PROMPT).toContain("NEVER INVENT");
    expect(MAKER_SYSTEM_PROMPT).toContain("FINISH THE JOB");
    expect(createMakerTools(site, context, service).specs.map((spec) => spec.name)).not.toContain("ask_user");
    const { BRIEF_SYSTEM_PROMPT } = await import("./brief.js");
    expect(BRIEF_SYSTEM_PROMPT).toContain("NEVER INVENT, NEVER ASK");
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

describe("a refused proposal", () => {
  const refused = { text: "", calls: [{ id: "1", name: "maker_try", arguments: JSON.stringify({ operations: [{ type: "page", page: site.pages[0]!.id, operations: buttons.map(child => ({ type: "remove", child })) }] }) }] };
  const claim = { text: "I proposed a landing page.", calls: [] };

  it("is never taken for done: the model is told nothing was proposed, and tries again", async () => {
    const adapter = scripted([refused, claim, { text: "", calls: [{ id: "2", name: "maker_try", arguments: JSON.stringify({ operations }) }] }, { text: "Wrapped.", calls: [] }]);
    const events = await collect(adapter);
    expect(events).toContainEqual(expect.objectContaining({ type: "attempt", ok: false }));
    const retry = vi.mocked(adapter.complete).mock.calls[3]![2].find((m) => m.role === "user" && m.content.includes("notProposed"));
    expect(retry).toBeDefined();
    expect(events.at(-1)).toMatchObject({ type: "done", text: "Wrapped.", proposal: { revision: 3 } });
  });

  it("ends saying what was refused, never with the model's claim, when retrying does not help", async () => {
    const adapter = scripted([refused, claim, refused, claim, refused, claim]);
    const done = (await collect(adapter)).at(-1);
    expect(done).toMatchObject({ type: "done" });
    expect(done).not.toHaveProperty("proposal");
    expect((done as { text: string }).text).toMatch(/^No changes were proposed: Maker refused the last attempt \(/);
  });
});

describe("nothing built is lost to an error", () => {
  const accepted = { text: "", calls: [{ id: "1", name: "maker_try", arguments: JSON.stringify({ operations }) }] };
  const refused = { text: "", calls: [{ id: "2", name: "maker_try", arguments: JSON.stringify({ operations: [{ type: "page", page: site.pages[0]!.id, operations: buttons.map(child => ({ type: "remove", child })) }] }) }] };
  function failingAfter(replies: ProviderReply[], error = new Error("Provider unavailable or timed out.")): ProviderAdapter {
    const adapter = scripted(replies);
    const complete = adapter.complete;
    let calls = 0;
    adapter.complete = vi.fn(async (...args: Parameters<ProviderAdapter["complete"]>) => { if (++calls > replies.length + 1) throw error; return complete(...args); });
    return adapter;
  }

  it("hands over the accepted batch when the provider fails afterwards, waiting for review", async () => {
    const events = await collect(failingAfter([accepted]));
    expect(events.at(-1)).toMatchObject({ type: "done", partial: true, proposal: { revision: 3, operations: [expect.anything()] } });
    expect((events.at(-1) as { text: string }).text).toContain("Provider unavailable or timed out.");
  });

  it("keeps an accepted batch when a later one is refused and never fixed", async () => {
    const claim = { text: "I proposed it.", calls: [] };
    const events = await collect(scripted([accepted, refused, claim, refused, claim, refused, claim]));
    expect(events.at(-1)).toMatchObject({ type: "done", partial: true, proposal: { operations: [expect.anything()] } });
  });

  it("keeps the last draft that validated while it streamed, when the stream breaks", async () => {
    const args = JSON.stringify({ operations });
    const adapter: ProviderAdapter = {
      complete: async () => editBrief,
      stream: async (_c, _s, _m, _t, _signal, on) => {
        on.callStart?.({ id: "s", name: "maker_try" });
        on.callArgs?.("s", args);
        throw new Error("Provider stream was interrupted.");
      },
    };
    const events = await collect(adapter);
    expect(events.some((event) => event.type === "draft")).toBe(true);
    expect(events.at(-1)).toMatchObject({ type: "done", partial: true, proposal: { revision: 3 } });
  });

  it("discards it when the person presses Stop", async () => {
    const controller = new AbortController();
    const adapter = scripted([accepted]);
    const complete = adapter.complete;
    let calls = 0;
    adapter.complete = vi.fn(async (...args: Parameters<ProviderAdapter["complete"]>) => { if (++calls === 3) { controller.abort(); throw new Error("Cancelled."); } return complete(...args); });
    await expect(collect(adapter, controller.signal)).rejects.toThrow();
  });
});

describe("the steps of a turn", () => {
  it("show planning, writing, Maker's check, and the back and forth of a refused batch", async () => {
    const refused = { text: "", calls: [{ id: "2", name: "maker_try", arguments: JSON.stringify({ operations: [{ type: "page", page: site.pages[0]!.id, operations: buttons.map(child => ({ type: "remove", child })) }] }) }] };
    const adapter = scripted([refused, { text: "", calls: [{ id: "1", name: "maker_try", arguments: JSON.stringify({ operations }) }] }, { text: "Wrapped.", calls: [] }]);
    const steps = (await collect(adapter)).flatMap((event) => (event.type === "step" && event.state !== "active" ? [`${event.step}:${event.state}`] : []));
    expect(steps).toEqual(["plan:done", "check:failed", "check:done"]);
  });
});

describe("the project prompt", () => {
  it("is context for every request: in the system prompt and the brief's input, never a message of the conversation", async () => {
    const adapter = scripted([{ text: "Done.", calls: [] }]);
    const prompted = { ...site, prompt: "Northstar is an operations console for on-call engineers." };
    for await (const _ of runAgent({ connection, site: prompted, context, content: "Put these next to each other.", service, adapter, signal: new AbortController().signal })) { /* consume */ }
    const calls = vi.mocked(adapter.complete).mock.calls;
    const [briefCall, buildCall] = [calls[0]!, calls.at(-1)!];
    expect(buildCall[1]).toContain("THE PROJECT.");
    expect(buildCall[1]).toContain("Northstar is an operations console");
    expect(JSON.parse(briefCall[2][0]!.content).project).toContain("Northstar");
    expect(buildCall[2].some((m) => m.content.includes("Northstar"))).toBe(false);
  });
});

describe("a page inside a layout", () => {
  it("shows the model the layout and its id however long the page is, so the rail and the header can be addressed", async () => {
    const shell = (templates as unknown as { templates: { id: string; locales: Record<string, { title: string; tree: never }> }[] }).templates.find((t) => t.id === "app-shell")!.locales.es!;
    const made = siteFromTemplate(shell.tree, { pageName: shell.title, sourceHash: "hash", newId: counterIds("t") });
    const long = { ...made, pages: [{ ...made.pages[0]!, root: { ...made.pages[0]!.root, attrs: { "data-filler": "x".repeat(20_000) } } }] };
    const on = makerContext(long, { id: "p", revision: 1 }, { page: long.pages[0]!.id, selectedIds: [], width: "fit", scheme: "light", contrast: false, density: "default", mode: "edit" });
    const adapter = scripted([{ text: "Done.", calls: [] }]);
    for await (const _ of runAgent({ connection, site: long, context: on, content: "add a user menu to the sidebar", service, adapter, signal: new AbortController().signal })) { /* consume */ }
    const request = vi.mocked(adapter.complete).mock.calls.at(-1)![2].find((m) => m.role === "user" && m.content.includes('"pageOutline"'))!;
    const outline = JSON.parse(request.content).pageOutline as string;
    expect(outline).toContain(`layout ${made.layouts![0]!.id}`);
    expect(outline).toContain("sidebar/Sidebar");
  });
});
