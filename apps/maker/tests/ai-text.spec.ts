import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test } from "@playwright/test";
import { openMaker } from "./fixtures";

/*
 * THE ANSWER IS WRITTEN IN THE CHAT AS IT ARRIVES. A local server speaks the OpenAI chat protocol and writes the reply in
 * pieces, holding the stream after the first: the chat must already show those words (with the caret) while the rest is
 * still on its way, and the whole sentence once it is over.
 */
const KEY = "session-only-test-key";
const FIRST = "Here is what I would do ";
const REST = "with your page: a clear headline, then one action.";

async function provider(): Promise<{ server: Server; url: string; release(): void }> {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const server = createServer(async (request, response) => {
    response.setHeader("access-control-allow-origin", "*");
    response.setHeader("access-control-allow-headers", "authorization, content-type");
    if (request.method === "OPTIONS") { response.statusCode = 204; return void response.end(); }
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(chunk as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { stream?: boolean; tools?: { function: { name: string } }[] };
    if (!body.stream) {
      response.setHeader("content-type", "application/json");
      /* The briefing call asks for submit_brief; the connection test asks for nothing. */
      if (body.tools?.some((tool) => tool.function.name === "submit_brief")) {
        const brief = { kind: "edit", goal: "Say something", checklist: ["It is said"] };
        return void response.end(JSON.stringify({ choices: [{ message: { content: null, tool_calls: [{ id: "b", type: "function", function: { name: "submit_brief", arguments: JSON.stringify(brief) } }] } }] }));
      }
      return void response.end(JSON.stringify({ choices: [{ message: { content: "Connected" } }] }));
    }
    response.setHeader("content-type", "text/event-stream");
    const send = (content: string) => response.write(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`);
    send(FIRST);
    await gate;
    send(REST);
    response.write("data: [DONE]\n\n");
    response.end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`, release };
}

test("the reply appears word by word with a caret while it is being written, and whole when it is over", async ({ page }) => {
  const mock = await provider();
  try {
    await openMaker(page);
    await page.getByRole("tab", { name: "AI", exact: true }).click();
    await page.getByLabel("Provider").selectOption("compatible");
    await page.getByLabel("API base endpoint", { exact: true }).fill(mock.url);
    await page.getByLabel("API key", { exact: true }).fill(KEY);
    await page.getByLabel("Model", { exact: true }).fill("mock-model");
    await page.getByRole("button", { name: "Test & connect" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Connected." })).toBeVisible();
    await page.getByLabel("Ask Maker", { exact: true }).fill("What would you do?");
    await page.getByRole("button", { name: "Send", exact: true }).click();

    const reply = page.locator(".maker-ai__bubble:not(.maker-ai__bubble--you)").last();
    /* While the stream is held open, the first words are already in the chat, and the caret says more is coming. */
    await expect(reply).toContainText("Here is what I would do", { timeout: 15_000 });
    await expect(reply.locator(".maker-ai__caret")).toBeVisible();
    await expect(reply).not.toContainText("one action");
    mock.release();
    /* Once it is over: the whole sentence, and no caret. */
    await expect(reply).toContainText("then one action.", { timeout: 15_000 });
    await expect(reply.locator(".maker-ai__caret")).toHaveCount(0);
  } finally {
    mock.release();
    mock.server.close();
  }
});
