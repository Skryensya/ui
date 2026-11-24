// @vitest-environment jsdom
import "@skryensya/vanilla/test-setup";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { actingAgent, createAgent, registerTools } from "@skryensya/core/agent";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { initComponents } from "@skryensya/vanilla";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * THE AGENT BRIDGE, over the kit's real DOM: a settings page composed as usage trees, emitted by the
 * same emitter the MCP and the docs use, enhanced by Vanilla's real mount. An agent reads it with
 * `snapshot` and changes it with `act`; the assertions read the DOM, not the bridge's own report.
 */

const items = (...labels: [string, string][]) => labels.map(([value, label]) => ({ options: { value }, slots: { label } }));

const page: UsageTree = {
  contract: "layout",
  signature: "Stack",
  children: [
    { contract: "form-field", signature: "FormField", slots: { label: "Project name" }, children: { contract: "input", signature: "Input", options: { name: "name" } } },
    { contract: "select", signature: "Select.native", options: { name: "visibility" }, attrs: { "aria-label": "Visibility" }, slots: { items: items(["private", "Private"], ["internal", "Internal"], ["public", "Public"]) } },
    { contract: "switch", signature: "Switch", options: { name: "digest", defaultChecked: true }, children: "Weekly digest" },
    { contract: "checkbox", signature: "Checkbox", options: { name: "failures" }, children: "Deploy failures" },
    { contract: "radio-group", signature: "RadioGroup", options: { name: "plan", value: "monthly", label: "Billing" }, slots: { items: items(["monthly", "Monthly"], ["yearly", "Yearly"]) } },
    { contract: "select", signature: "Select", options: { name: "region", value: "us" }, slots: { label: "Region", items: items(["us", "United States"], ["eu", "Europe"]) } },
    { contract: "tabs", signature: "Tabs", options: { value: "email" }, attrs: { "aria-label": "Channels" }, slots: { items: [{ options: { value: "email" }, slots: { label: "Email", children: "Email settings" } }, { options: { value: "slack" }, slots: { label: "Slack", children: "Slack settings" } }] } },
    {
      contract: "button",
      signature: "Button.action",
      options: { tone: "danger" },
      attrs: { "data-agent-confirm": "Deletes the project and all its files" },
      children: "Delete project",
    },
    { contract: "form-field", signature: "FormField", slots: { label: "Recovery codes" }, attrs: { "data-agent-hidden": "" }, children: { contract: "input", signature: "Input", options: { name: "codes" } } },
  ],
};

let deleted = 0;
let sawAgent = false;

beforeEach(async () => {
  document.body.innerHTML = `${emitMarkup(page)}<button id="bare">Not the kit's</button>`;
  initComponents(document);
  // The machine-backed enhancers (Select, Tabs) mount on a later task.
  await vi.waitFor(() => expect(document.querySelector("[data-sk-select-trigger][role=combobox]")).not.toBeNull());
  deleted = 0;
  sawAgent = false;
  document.querySelector(".sk-button")!.addEventListener("click", () => deleted++);
  document.querySelector<HTMLInputElement>("input[name=name]")!.addEventListener("input", () => (sawAgent = actingAgent()));
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("the agent bridge over emitted, mounted markup", () => {
  it("lists every kit control by the name a person reads, and nothing else", () => {
    const agent = createAgent();
    const entries = agent.snapshot();
    for (const entry of entries) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    expect(entries.map((entry) => entry.label)).toEqual(expect.arrayContaining(["Project name", "Visibility", "Weekly digest", "Deploy failures", "Billing", "Delete project"]));
    expect(entries.some((entry) => entry.label.includes("Not the kit"))).toBe(false);
    expect(entries.some((entry) => entry.label === "Recovery codes")).toBe(false);
    expect(entries.find((entry) => entry.label === "Visibility")?.items?.map((item) => item.label)).toEqual(["Private", "Internal", "Public"]);
  });

  it("changes every setting through the platform, so the page hears each change", async () => {
    const agent = createAgent();
    const result = await agent.act({
      steps: [
        { ref: "Project name", action: "setValue", args: ["Atlas"] },
        { ref: "Visibility", action: "setValue", args: ["Internal"] },
        { ref: "Weekly digest", action: "setChecked", args: [false] },
        { ref: "Deploy failures", action: "toggle" },
        { ref: "Billing", action: "setValue", args: ["Yearly"] },
      ],
    });
    expect(result.ok, result.ok ? "" : result.error.message).toBe(true);
    const field = (name: string) => document.querySelector<HTMLInputElement & HTMLSelectElement>(`[name=${name}]`)!;
    expect(field("name").value).toBe("Atlas");
    expect(field("visibility").value).toBe("internal");
    expect(field("digest").checked).toBe(false);
    expect(field("failures").checked).toBe(true);
    expect(document.querySelector<HTMLInputElement>("input[name=plan][value=yearly]")!.checked).toBe(true);
    expect(sawAgent).toBe(true);
    expect(actingAgent()).toBe(false);
  });

  it("drives the kit's own popup list and its tabs", async () => {
    const agent = createAgent();
    const region = agent.snapshot().find((entry) => entry.label === "Region");
    expect(region?.kind, JSON.stringify(agent.snapshot().filter((entry) => entry.component === "select"))).toBe("combobox");
    const result = await agent.act({
      steps: [
        { ref: "Region", action: "setValue", args: ["Europe"] },
        { ref: "Slack", action: "select" },
      ],
    });
    expect(result.ok, result.ok ? "" : result.error.message).toBe(true);
    expect(document.querySelector<HTMLSelectElement>("select[name=region]")?.value ?? document.querySelector(".sk-select[data-sk-select]")?.getAttribute("data-value")).toBe("eu");
    expect(agent.snapshot().find((entry) => entry.label === "Slack")?.selected).toBe(true);
  });

  it("refuses a confirm step without a person, and runs it once one agrees", async () => {
    let approve = false;
    const agent = createAgent({ allow: (step) => !step.confirm || approve });
    const remove = { steps: [{ ref: "Delete project", action: "press" }] };
    const refused = await agent.act(remove);
    expect(refused.ok).toBe(false);
    expect(deleted).toBe(0);
    approve = true;
    expect((await agent.act(remove)).ok).toBe(true);
    expect(deleted).toBe(1);
    expect(agent.snapshot().find((entry) => entry.label === "Delete project")?.confirm).toBe("Deletes the project and all its files");
  });

  it("without an allow, a confirm step fails and says it needs a person", async () => {
    const result = await createAgent().act({ steps: [{ ref: "Delete project", action: "press" }] });
    expect(result.ok ? "" : result.error.message).toMatch(/Needs a person/);
  });

  it("says what went wrong in words an agent can act on", async () => {
    const agent = createAgent();
    const unknown = await agent.act({ steps: [{ ref: "Colour", action: "setValue", args: ["red"] }] });
    expect(unknown.ok ? "" : unknown.error.message).toMatch(/Nothing is named "Colour"/);
    const option = await agent.act({ steps: [{ ref: "Visibility", action: "setValue", args: ["Secret"] }] });
    expect(option.ok ? "" : option.error.message).toMatch(/Its options: Private, Internal, Public/);
    const action = await agent.act({ steps: [{ ref: "Weekly digest", action: "setValue", args: ["x"] }] });
    expect(action.ok ? "" : action.error.message).toMatch(/has no action "setValue"/);
  });

  it("never reads a secret field's value", () => {
    document.querySelector<HTMLInputElement>("input[name=name]")!.setAttribute("data-agent-secret", "");
    const entry = createAgent().snapshot().find((each) => each.label === "Project name")!;
    expect(entry.secret).toBe(true);
    expect("value" in entry).toBe(false);
  });
});

/*
 * WebMCP as the W3C draft declares it (19 November 2026): `document.modelContext.registerTool(tool,
 * { signal })` returns a promise, rejects a name already registered with InvalidStateError, and a tool
 * leaves when its signal aborts. The browser serializes what `execute` resolves to as JSON.
 */
type FakeTool = { name: string; title?: string; description: string; inputSchema?: object; annotations?: object; execute: (input: object, options: { signal: AbortSignal }) => Promise<unknown> };

function fakeModelContext() {
  const tools = new Map<string, FakeTool>();
  const context = {
    tools,
    registerTool: async (tool: FakeTool, options: { signal?: AbortSignal } = {}) => {
      if (!/^[A-Za-z0-9_.-]{1,128}$/.test(tool.name)) throw new TypeError(`bad name ${tool.name}`);
      if (!tool.description) throw new DOMException("empty description", "InvalidStateError");
      if (tools.has(tool.name)) throw new DOMException(`${tool.name} is registered`, "InvalidStateError");
      tools.set(tool.name, tool);
      options.signal?.addEventListener("abort", () => tools.delete(tool.name));
    },
    call: async (name: string, input: object = {}) => JSON.parse(JSON.stringify(await tools.get(name)!.execute(input, { signal: new AbortController().signal }))),
  };
  Object.defineProperty(document, "modelContext", { value: context, configurable: true });
  return context;
}

describe("the bridge offered through WebMCP", () => {
  afterEach(() => {
    delete (document as { modelContext?: unknown }).modelContext;
  });

  it("does nothing where the browser has no WebMCP", async () => {
    const unregister = await registerTools(createAgent(), { allow: () => true });
    expect(typeof unregister).toBe("function");
  });

  it("registers three tools the browser accepts, read-only ones marked, and takes them back", async () => {
    const context = fakeModelContext();
    const unregister = await registerTools(createAgent(), { allow: () => true });
    expect([...context.tools.keys()].sort()).toEqual(["skryensya_act", "skryensya_query", "skryensya_snapshot"]);
    expect(context.tools.get("skryensya_snapshot")?.annotations).toEqual({ readOnlyHint: true });
    expect(context.tools.get("skryensya_act")?.annotations).toEqual({ consequentialHint: true });
    for (const tool of context.tools.values()) expect(typeof tool.inputSchema).toBe("object");
    unregister();
    expect(context.tools.size).toBe(0);
  });

  it("answers in JSON, and asks the person before a confirm step", async () => {
    const context = fakeModelContext();
    const asked: string[] = [];
    await registerTools(createAgent(), { allow: (step) => (asked.push(step.confirm ?? ""), false) });
    const snapshot = (await context.call("skryensya_snapshot")) as { label: string }[];
    expect(snapshot.map((entry) => entry.label)).toContain("Project name");
    const named = await context.call("skryensya_act", { steps: [{ ref: "Project name", action: "setValue", args: ["Atlas"] }] });
    expect(named.ok).toBe(true);
    expect(document.querySelector<HTMLInputElement>("input[name=name]")!.value).toBe("Atlas");
    const removal = await context.call("skryensya_act", { steps: [{ ref: "Delete project", action: "press" }] });
    expect(removal.ok).toBe(false);
    expect(asked).toEqual(["Deletes the project and all its files"]);
    expect(deleted).toBe(0);
  });

  it("rejects, and leaves nothing behind, when the browser refuses a tool", async () => {
    const context = fakeModelContext();
    await context.registerTool({ name: "skryensya_query", description: "someone else's", execute: async () => null });
    await expect(registerTools(createAgent(), { allow: () => true })).rejects.toThrow(/is registered/);
    expect([...context.tools.keys()]).toEqual(["skryensya_query"]);
  });
});
