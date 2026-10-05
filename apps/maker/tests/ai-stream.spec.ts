import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test, type Page } from "@playwright/test";
import { createSite, counterIds, fromUsageTree } from "@skryensya/maker-model";
import { openMaker, savedProject, stage } from "./fixtures";

/*
 * LIVE DRAFTS: while the model is still writing, the canvas fills in section by section.
 *
 * A real HTTP server speaks the OpenAI streaming protocol on localhost (the provider "OpenAI-compatible",
 * which the app allows over http for localhost). It writes a three-section page one section at a time and
 * HOLDS the stream after the first, so the test can look at the canvas while the answer is unfinished.
 */
const KEY = "session-only-test-key";

type Mock = { server: Server; url: string; release(): void; sectionsSent(): number };

async function mockProvider(root: string): Promise<Mock> {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  let sent = 0;
  const insert = (index: number, text: string) => ({ type: "insert", at: { parent: root, slot: "children", index }, tree: { contract: "typography", signature: "Heading", children: text } });
  const args = JSON.stringify({ operations: [{ type: "page", page: "home", operations: [insert(1, "Hero"), insert(2, "Features"), insert(3, "Pricing")] }] });
  /* Cut right after each inner operation closes, so each piece completes exactly one section. */
  const cuts = ["Hero", "Features", "Pricing"].map((t) => args.indexOf(`"children":"${t}"}}`) + `"children":"${t}"}}`.length);
  const pieces = [args.slice(0, cuts[0]), args.slice(cuts[0], cuts[1]), args.slice(cuts[1])];

  const server = createServer(async (request, response) => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-allow-headers", "authorization, content-type");
    if (request.method === "OPTIONS") { response.statusCode = 204; return void response.end(); }
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(chunk as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { stream?: boolean; messages: { role: string; content: string }[] };
    const last = body.messages.at(-1)!;
    if (!body.stream) {
      response.setHeader("content-type", "application/json");
      return void response.end(JSON.stringify({ choices: [{ message: { content: "Connected" } }] }));
    }
    response.setHeader("content-type", "text/event-stream");
    const send = (delta: unknown) => response.write(`data: ${JSON.stringify({ choices: [{ delta }] })}\n\n`);
    if (last.role === "tool") {
      send({ content: "Added a hero, features and pricing." });
      response.write("data: [DONE]\n\n");
      return void response.end();
    }
    send({ tool_calls: [{ index: 0, id: "try", function: { name: "maker_try", arguments: "" } }] });
    for (let i = 0; i < pieces.length; i++) {
      send({ tool_calls: [{ index: 0, function: { arguments: pieces[i] } }] });
      sent = i + 1;
      if (i === 0) await gate;
      else await new Promise((resolve) => setTimeout(resolve, 250));
    }
    response.write("data: [DONE]\n\n");
    response.end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`, release, sectionsSent: () => sent };
}

async function setup(page: Page) {
  const id = await openMaker(page);
  const saved = await savedProject(page, id);
  const base = createSite("hash", counterIds("s"));
  const root = fromUsageTree({ contract: "layout", signature: "Main", children: [{ contract: "typography", signature: "Heading", children: "Existing" }] }, counterIds("n"));
  await page.request.put(`/api/projects/${id}`, { data: { baseRevision: saved.revision, site: { ...base, pages: [{ ...base.pages[0]!, id: "home", root }] } } });
  await page.reload();
  await expect(stage(page).getByRole("heading", { name: "Existing" })).toBeVisible();
  return { id, root: root.id };
}

test("the canvas shows each section as it is written, before the answer is finished", async ({ page }) => {
  const { id, root } = await setup(page);
  const mock = await mockProvider(root);
  try {
    await page.getByRole("radio", { name: "AI", exact: true }).click();
    await page.getByLabel("Provider").selectOption("compatible");
    await page.getByLabel("API base endpoint", { exact: true }).fill(mock.url);
    await page.getByLabel("API key", { exact: true }).fill(KEY);
    await page.getByLabel("Model", { exact: true }).fill("mock-model");
    await page.getByRole("button", { name: "Test & connect" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Connected." })).toBeVisible();

    const before = (await savedProject(page, id)).site;
    await page.getByLabel("Ask Maker", { exact: true }).fill("Add a landing page: hero, features, pricing");
    await page.getByRole("button", { name: "Send", exact: true }).click();

    /* The first section is on the canvas while the stream is still held open: the answer is not finished. */
    await expect(stage(page).getByRole("heading", { name: "Hero" })).toBeVisible({ timeout: 15_000 });
    expect(mock.sectionsSent()).toBe(1);
    await expect(stage(page).getByRole("heading", { name: "Features" })).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Maker AI draft" }).getByRole("button", { name: "Stop" })).toBeVisible();
    await expect(stage(page).locator("[data-maker-fresh]")).toHaveCount(1);
    expect((await savedProject(page, id)).site).toEqual(before);

    /* Let the rest through: the other two sections arrive, the bar turns into Apply and Discard. */
    mock.release();
    await expect(stage(page).getByRole("heading", { name: "Features" })).toBeVisible();
    await expect(stage(page).getByRole("heading", { name: "Pricing" })).toBeVisible();
    const bar = page.getByRole("group", { name: "Maker AI draft" });
    await expect(bar.getByRole("button", { name: "Apply" })).toBeVisible();
    await expect(bar).toContainText("3 changes");
    expect((await savedProject(page, id)).site).toEqual(before);

    /* Applying commits the SAME nodes: they are not rebuilt, and nothing is left marked as new. */
    await bar.getByRole("button", { name: "Apply" }).click();
    await expect(stage(page).locator("[data-maker-fresh]")).toHaveCount(0);
    await expect(stage(page).getByRole("heading", { name: "Pricing" })).toBeVisible();
    await expect.poll(async () => JSON.stringify((await savedProject(page, id)).site).includes("Pricing")).toBe(true);
  } finally {
    mock.server.close();
  }
});

test("Stop discards the draft and leaves the project untouched", async ({ page }) => {
  const { id, root } = await setup(page);
  const mock = await mockProvider(root);
  try {
    await page.getByRole("radio", { name: "AI", exact: true }).click();
    await page.getByLabel("Provider").selectOption("compatible");
    await page.getByLabel("API base endpoint", { exact: true }).fill(mock.url);
    await page.getByLabel("API key", { exact: true }).fill(KEY);
    await page.getByLabel("Model", { exact: true }).fill("mock-model");
    await page.getByRole("button", { name: "Test & connect" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Connected." })).toBeVisible();
    const before = (await savedProject(page, id)).site;
    await page.getByLabel("Ask Maker", { exact: true }).fill("Add a landing page");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(stage(page).getByRole("heading", { name: "Hero" })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("group", { name: "Maker AI draft" }).getByRole("button", { name: "Stop" }).click();
    await expect(stage(page).getByRole("heading", { name: "Hero" })).toHaveCount(0);
    await expect(page.getByRole("alert")).toContainText("Cancelled");
    expect((await savedProject(page, id)).site).toEqual(before);
  } finally {
    mock.release();
    mock.server.close();
  }
});
