import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { createMakerApi } from "@skryensya/maker-server/api";
import { memoryStore } from "@skryensya/maker-server/store";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * The Maker's tools through a real client, against the built binary, talking to the Maker's own
 * API (the server package, over an in-memory store) at MAKER_URL.
 */

const binary = join(import.meta.dirname, "..", "dist", "index.js");
let api: Server;
let base = "";
let client: Client;

type Out = { project?: string; revision: number; outline: string; refused?: string };
const call = async (name: string, args: Record<string, unknown> = {}) => {
  const result = await client.callTool({ name, arguments: args });
  return { ...(result.structuredContent as Out), isError: result.isError === true };
};

async function connect(makerUrl: string): Promise<Client> {
  const next = new Client({ name: "maker-tools-test", version: "1.0.0" });
  await next.connect(new StdioClientTransport({ command: "node", args: [binary], env: { ...process.env, MAKER_URL: makerUrl } as Record<string, string> }));
  return next;
}

beforeAll(async () => {
  api = createServer(createMakerApi(memoryStore(), "hash"));
  await new Promise<void>((resolve) => api.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(api.address() as AddressInfo).port}`;
  client = await connect(base);
}, 60_000);

afterAll(async () => {
  await client.close();
  await new Promise<void>((resolve) => api.close(() => resolve()));
});

let project = "";

describe("maker tools", () => {
  it("lists projects, and reads one as an outline with ids", async () => {
    const created = await (await fetch(`${base}/api/projects`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Landing" }) })).json();
    project = created.id;
    const list = await client.callTool({ name: "maker_projects", arguments: {} });
    expect((list.structuredContent as { projects: { id: string }[] }).projects.map((p) => p.id)).toContain(project);
    const read = await call("maker_read", { project });
    expect(read.revision).toBe(1);
    expect(read.outline).toMatch(/^page \S+ "Home" \/\n\s+\S+ layout\/Main$/);
  });

  it("applies structure and saves it one revision up", async () => {
    const read = await call("maker_read", { project });
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const main = /(\S+) layout\/Main/.exec(read.outline)![1]!;
    const applied = await call("maker_apply", {
      project,
      revision: read.revision,
      operations: [{ type: "page", page, operations: [{ type: "insert", at: { parent: main, slot: "children", index: 0 }, tree: { contract: "layout", signature: "Stack", children: [
        { contract: "button", signature: "Button.action", children: "One" },
        { contract: "button", signature: "Button.action", children: "Two" },
      ] } }] }],
    });
    expect(applied.isError).toBe(false);
    expect(applied.revision).toBe(2);
    expect((await (await fetch(`${base}/api/projects/${project}`)).json()).revision).toBe(2);
  });

  it('turns "put the two buttons side by side" into a wrap in an Inline', async () => {
    const read = await call("maker_read", { project });
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const buttons = [...read.outline.matchAll(/(\S+) button\/Button\.action/g)].map((match) => match[1]!);
    const applied = await call("maker_apply", {
      project,
      revision: read.revision,
      operations: [{ type: "page", page, operations: [{ type: "wrap", children: buttons, with: { contract: "layout", signature: "Inline", options: { gap: "sm" } } }] }],
    });
    expect(applied.isError).toBe(false);
    expect(applied.outline).toMatch(/layout\/Inline gap="sm"\n\s+\S+ button\/Button\.action/);
  });

  it("refuses, whole and with the reason, what the contract refuses", async () => {
    const read = await call("maker_read", { project });
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const stack = /(\S+) layout\/Stack/.exec(read.outline)![1]!;
    const refused = await call("maker_apply", {
      project,
      revision: read.revision,
      operations: [{ type: "page", page, operations: [
        { type: "setOption", node: stack, name: "gap", value: "lg" },
        { type: "setOption", node: stack, name: "padding", value: "md" },
      ] }],
    });
    expect(refused.isError).toBe(true);
    expect(refused.refused).toMatch(/no option "padding"/);
    expect((await call("maker_read", { project })).revision).toBe(read.revision);
  });

  it("offers no coordinate: an operation carrying one is not an operation", async () => {
    const read = await call("maker_read", { project });
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const result = await client.callTool({ name: "maker_apply", arguments: { project, operations: [{ type: "page", page, operations: [{ type: "setPosition", node: "x", x: 120, y: 80 }] }] } });
    expect(result.isError).toBe(true);
  });

  it("does not overwrite a change made since the agent read", async () => {
    const read = await call("maker_read", { project });
    const row = await (await fetch(`${base}/api/projects/${project}`)).json();
    await fetch(`${base}/api/projects/${project}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ baseRevision: row.revision, site: row.site }) });
    const page = /^page (\S+)/.exec(read.outline)![1]!;
    const stale = await call("maker_apply", { project, revision: read.revision, operations: [{ type: "renamePage", page, name: "Inicio" }] });
    expect(stale.isError).toBe(true);
    expect(stale.refused).toMatch(/changed since you read it/);
  });

  it("says how to start the Maker when it is not running", async () => {
    const offline = await connect("http://127.0.0.1:9");
    const result = await offline.callTool({ name: "maker_read", arguments: { project } });
    expect(result.isError).toBe(true);
    expect((result.structuredContent as Out).refused).toMatch(/not running.*pnpm --filter @skryensya\/maker dev/s);
    await offline.close();
  }, 30_000);
});
