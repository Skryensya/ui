import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "./create-server.js";
import { createHttpApp, type HttpApp, type HttpConfig } from "./http-app.js";
import { toolNames } from "./tools.js";

/*
 * THE HTTP ACCEPTANCE SUITE: what a client of the MCP over HTTP is promised, asserted through the real
 * wire (an MCP client, `fetch`), never through the server's own functions.
 *
 * ONE SUITE, TWO TARGETS. With no `MCP_URL` it starts the server in-process, so the suite itself is
 * tested on every `pnpm check` (a suite that has only ever run against production is a suite nobody knows
 * is right). With `MCP_URL=https://… pnpm --filter @skryensya/mcp test:web` the same assertions run against
 * the deployed server, and then they are the deploy's acceptance test: after a push, wait for the rollout
 * and run it. A failure names what differs from this commit.
 *
 *   MCP_URL         base URL of the server (no trailing /mcp)
 *   MCP_HTTP_TOKEN  the bearer token, when the deployment sets one
 *
 * What it does NOT repeat: `http.test.ts` owns the gates that need a controlled config (the body-size limit,
 * the Host allowlist, the token challenge). Here only what is observable from outside a deployment.
 */

const remote = process.env.MCP_URL?.replace(/\/+$/, "");
const token = process.env.MCP_HTTP_TOKEN;
const repo = join(import.meta.dirname, "..", "..", "..");
const localHash = (JSON.parse(readFileSync(join(repo, "artifacts", "ai-index.json"), "utf8")) as { sourceHash: string }).sourceHash;

const local: HttpConfig = {
  host: "127.0.0.1",
  port: 0,
  allowedHosts: ["localhost", "127.0.0.1", "[::1]"],
  allowedOrigins: ["localhost", "127.0.0.1", "[::1]"],
  maxBodyBytes: 1_000_000,
};

let app: HttpApp | undefined;
let base = remote ?? "";

beforeAll(async () => {
  if (remote) return;
  app = createHttpApp(local, createServer, () => {});
  await new Promise<void>((resolve) => app!.server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(app.server.address() as AddressInfo).port}`;
});
afterAll(() => app?.shutdown(100));

const authorization: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
const rpc = (body: unknown, headers: Record<string, string> = {}) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...authorization, ...headers },
  body: JSON.stringify(body),
});

async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ name: "web-acceptance", version: "1.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`), { requestInit: { headers: authorization } }));
  try {
    return await run(client);
  } finally {
    await client.close();
  }
}

type Payload = Record<string, any>;
const call = (client: Client, name: string, args: Record<string, unknown> = {}) =>
  client.callTool({ name, arguments: args }).then((result) => result.structuredContent as Payload);

const target = remote ? `the deployed MCP (${remote})` : "the MCP in-process";

describe(`${target}: the route`, () => {
  it("answers /healthz without credentials and without touching the catalogue", async () => {
    const response = await fetch(`${base}/healthz`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("refuses a session GET, an unknown path and malformed JSON, without leaking a stack trace", async () => {
    expect((await fetch(`${base}/mcp`, { method: "GET", headers: { Accept: "text/event-stream", ...authorization } })).status).toBe(405);
    expect((await fetch(`${base}/whatever`, { method: "POST" })).status).toBe(404);
    const bad = await fetch(`${base}/mcp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...authorization }, body: "{not json" });
    expect(bad.status).toBe(400);
    const text = await bad.text();
    expect(text).toContain("-32700");
    expect(text).not.toMatch(/at \w+ \(|node:internal|\.ts:\d+/);
  });

  it("refuses a browser Origin it does not know", async () => {
    const response = await fetch(`${base}/mcp`, rpc({ jsonrpc: "2.0", id: 1, method: "ping" }, { Origin: "https://evil.example" }));
    expect(response.status).toBe(403);
  });
});

describe(`${target}: it is this commit's server`, () => {
  it("serves exactly the tools this commit declares", async () => {
    const tools = await withClient((client) => client.listTools());
    expect(tools.tools.map((tool) => tool.name)).toEqual([...toolNames]);
  });

  it("serves this commit's catalogue (same sourceHash), or says the deploy is stale", async () => {
    const payload = await withClient((client) => call(client, "discover_ui", { query: "switch" }));
    expect(payload.sourceHash, "the deployed catalogue is not this commit's: the rollout may not have finished").toBe(localHash);
  });
});

describe(`${target}: the workflow an agent runs`, () => {
  it("finds a component by what it is for", async () => {
    const payload = await withClient((client) => call(client, "discover_ui", { query: "kpi metric dashboard figure" }));
    expect(payload.candidates.map((candidate: { signature: string }) => candidate.signature)).toContain("Stat");
  });

  it("publishes whole pages as examples, and each one composes and passes the design review", async () => {
    await withClient(async (client) => {
      const index = await call(client, "get_examples");
      const pages = (index.examples as { id: string; scale: string }[]).filter((example) => example.scale === "page");
      expect(pages.length).toBeGreaterThanOrEqual(22);
      for (const id of ["page-chat", "page-inbox", "page-repo-overview"]) {
        const example = await call(client, "get_examples", { id });
        const validated = await call(client, "validate_ui", { tree: example.tree });
        expect(validated.valid, `${id} composes`).toBe(true);
        const reviewed = await call(client, "review_ui", { tree: example.tree });
        expect(reviewed.review.findings, `${id} review`).toEqual([]);
      }
    });
  });

  it("emits an application shell for a page that uses one", async () => {
    await withClient(async (client) => {
      const example = await call(client, "get_examples", { id: "page-chat" });
      const validated = await call(client, "validate_ui", { tree: example.tree });
      expect(validated.emitted.vanilla).toContain("sk-app-shell");
      expect(validated.emitted.react).toContain("AppShell");
      expect(validated.css).toContain("@skryensya/core/patterns/layout.css");
    });
  });

  it("does not emit from a tree that does not compose", async () => {
    const payload = await withClient((client) => call(client, "validate_ui", { tree: { contract: "button", signature: "Button.action" } }));
    expect(payload.valid).toBe(false);
    expect(payload.emitted).toBeNull();
    expect(payload.problems.length).toBeGreaterThan(0);
  });

  it("separates valid from good: a page that composes but has two h1s and no skip link fails the review, naming guideline and fix", async () => {
    const h1 = { contract: "typography", signature: "Heading", options: { headingElement: "h1" }, children: "Title" };
    const tree = {
      contract: "layout",
      signature: "Stack",
      children: [
        { contract: "navbar", signature: "Navbar", children: { contract: "navbar", signature: "NavbarBrand", children: "Brand" } },
        { contract: "layout", signature: "Main", attrs: { id: "main", tabindex: "-1" }, children: [h1, h1] },
      ],
    };
    const payload = await withClient((client) => call(client, "review_ui", { tree }));
    expect(payload.valid).toBe(true);
    expect(payload.review.passes).toBe(false);
    expect(payload.review.findings.map((finding: { rule: string }) => finding.rule)).toEqual(expect.arrayContaining(["one-h1", "skip-link"]));
    for (const finding of payload.review.findings) {
      expect(finding.reference).not.toBe("");
      expect(finding.fix).not.toBe("");
    }
  });

  it("publishes AppShell and Box.radius in the layout contracts", async () => {
    await withClient(async (client) => {
      const layout = await call(client, "get_contract", { id: "layout" });
      expect(Object.keys(layout.signatures)).toContain("AppShell");
      const box = await call(client, "get_contract", { id: "box" });
      expect(Object.keys(box.options)).toContain("radius");
    });
  });
});

describe(`${target}: it is stateless and steady`, () => {
  it("answers parallel clients independently", async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, index) => withClient((client) => call(client, "get_contract", { id: index % 2 ? "button" : "stat" }))),
    );
    expect(results.map((result) => result.id)).toEqual(["stat", "button", "stat", "button", "stat", "button", "stat", "button"]);
  });

  it("lists its tools quickly", async () => {
    const started = performance.now();
    await withClient((client) => client.listTools());
    expect(performance.now() - started, "tools/list took longer than five seconds").toBeLessThan(5_000);
  });
});
