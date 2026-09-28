import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSite, randomId } from "@skryensya/maker-model";
import { createMakerApi } from "./api.js";
import { memoryStore } from "./store.js";

let server: Server;
let base = "";

beforeAll(async () => {
  server = createServer(createMakerApi(memoryStore(), "hash"));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});
afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const json = (method: string, body: unknown) => ({ method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

describe("projects API", () => {
  it("creates, lists, opens, saves, renames and deletes", async () => {
    const created = await (await fetch(`${base}/projects`, json("POST", { name: "Landing" }))).json();
    expect(created.revision).toBe(1);
    expect((await (await fetch(`${base}/projects`)).json()).map((p: { id: string }) => p.id)).toContain(created.id);

    const saved = await fetch(`${base}/projects/${created.id}`, json("PUT", { baseRevision: 1, site: created.site }));
    expect(await saved.json()).toEqual({ revision: 2 });

    const conflict = await fetch(`${base}/projects/${created.id}`, json("PUT", { baseRevision: 1, site: created.site }));
    expect(conflict.status).toBe(409);
    expect((await conflict.json()).revision).toBe(2);

    const renamed = await fetch(`${base}/projects/${created.id}`, json("PATCH", { name: "Home site" }));
    expect((await renamed.json()).name).toBe("Home site");

    expect((await fetch(`${base}/projects/${created.id}`, { method: "DELETE" })).status).toBe(204);
    expect((await fetch(`${base}/projects/${created.id}`)).status).toBe(404);
  });

  it("stores only what reads as a Maker site", async () => {
    const created = await (await fetch(`${base}/projects`, json("POST", { name: "Strict" }))).json();
    const bad = await fetch(`${base}/projects/${created.id}`, json("PUT", { baseRevision: 1, site: { pages: [] } }));
    expect(bad.status).toBe(400);
    const good = createSite("hash", randomId);
    expect((await fetch(`${base}/projects`, json("POST", { name: "Seeded", site: good }))).status).toBe(201);
    expect((await fetch(`${base}/projects`, json("POST", { name: "   " }))).status).toBe(400);
  });

  it("streams a project's changes", async () => {
    const created = await (await fetch(`${base}/projects`, json("POST", { name: "Streamed" }))).json();
    const controller = new AbortController();
    const stream = await fetch(`${base}/projects/${created.id}/events`, { signal: controller.signal });
    const reader = stream.body!.getReader();
    await reader.read();
    await fetch(`${base}/projects/${created.id}`, json("PUT", { baseRevision: 1, site: created.site }));
    let text = "";
    while (!text.includes("data:")) text += new TextDecoder().decode((await reader.read()).value);
    expect(text).toContain('"revision":2');
    controller.abort();
  });
});
