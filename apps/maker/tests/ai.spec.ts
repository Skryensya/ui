import { expect, test, type Page, type Route } from "@playwright/test";
import { createSite, counterIds, fromUsageTree, type MakerAgentContext } from "@skryensya/maker-model";
import { openMaker, savedProject, selectInOutline, stage, syncState } from "./fixtures";

const KEY = "session-only-test-key";
async function setup(page: Page) {
  /* These tests are about reviewing a proposal; review is off by default, so they turn it on. */
  await page.addInitScript(() => localStorage.setItem("maker.ai.review", "1"));
  const id = await openMaker(page);
  const saved = await savedProject(page, id);
  const base = createSite("hash", counterIds("s"));
  const root = fromUsageTree({ contract: "layout", signature: "Main", children: [{ contract: "layout", signature: "Stack", children: [
    { contract: "typography", signature: "Heading", children: "Heading" },
    { contract: "button", signature: "Button.action", children: "One" },
    { contract: "button", signature: "Button.action", children: "Two" },
  ] }] }, counterIds("n"));
  await page.request.put(`/api/projects/${id}`, { data: { baseRevision: saved.revision, site: { ...base, pages: [{ ...base.pages[0]!, id: "home", root }] } } });
  await page.reload();
  await expect(stage(page).getByRole("heading", { name: "Heading" })).toBeVisible();
  return id;
}

async function connect(page: Page) {
  await page.getByRole("tab", { name: "AI", exact: true }).click();
  await page.getByLabel("API key", { exact: true }).fill(KEY);
  await page.getByLabel("Model", { exact: true }).fill("mock-model");
  await page.getByRole("button", { name: "Test & connect" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Connected." })).toBeVisible();
}
/* The briefing call (the model asked for submit_brief) is answered first, before the build's own calls. */
const isBrief = (body: { tools?: { name: string }[] }) => body.tools?.some(tool => tool.name === "submit_brief") === true;
const brief = (kind: "edit" | "build", extra: Record<string, unknown> = {}) => [{ type: "function_call", call_id: "brief", name: "submit_brief", arguments: JSON.stringify({ kind, goal: "Do what was asked", checklist: ["It is done"], ...extra }) }];
const respond = (route: Route, message: unknown) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ output: message }) });

async function fakeAgent(page: Page, operation: (context: MakerAgentContext) => unknown[], wait?: Promise<void>) {
  const requests: unknown[] = [];
  let captured: MakerAgentContext | undefined;
  /* OpenAI is spoken to on the Responses API: `instructions` + `input`, and an `output` of message and function_call items. */
  const said = (text: string) => [{ type: "message", content: [{ type: "output_text", text }] }];
  await page.route("https://api.openai.com/v1/responses", async route => {
    const body = route.request().postDataJSON();
    requests.push(body);
    expect(JSON.stringify(body)).not.toContain(KEY);
    if (body.instructions.includes("Reply briefly: connected")) return respond(route, said("Connected"));
    if (isBrief(body)) return respond(route, brief("edit"));
    const last = body.input.at(-1);
    if (last.type === "function_call_output") return respond(route, said("Prepared the requested Maker changes."));
    const frozen = JSON.parse(last.content).context as MakerAgentContext;
    captured = frozen;
    if (wait) await wait;
    return respond(route, [{ type: "function_call", call_id: "try", name: "maker_try", arguments: JSON.stringify({ operations: operation(frozen) }) }]);
  });
  return { requests, context: () => captured };
}

test("freezes selection, previews without mutation, applies once, and undoes", async ({ page }) => {
  const id = await setup(page);
  await selectInOutline(page, "Heading");
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  const agent = await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Build faster" }] }], wait);
  await connect(page);
  await expect(page.getByRole("button", { name: "Remove context Heading" })).toBeVisible();
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker", { exact: true }).fill('Change this to "Build faster"');
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect.poll(() => agent.context()?.selection.primary).toBeTruthy();
  const selected = agent.context()!.selection.primary;
  await selectInOutline(page, "Button.action");
  release();
  await expect(page.getByRole("region", { name: "Proposed changes" })).toBeVisible();
  expect(agent.context()!.selection.primary).toBe(selected);
  expect((await savedProject(page, id)).site).toEqual(before);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "AI proposal preview" })).toBeVisible();
  await expect(page.frameLocator(".maker-play__frame").getByRole("heading", { name: "Build faster" })).toBeVisible();
  await page.getByRole("button", { name: "Close play" }).click();
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  /* The canvas already SHOWS the proposal before it is applied (a draft), so seeing it is no sign that it was
     applied. The status says so once the project has actually taken it. */
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await expect(stage(page).getByRole("heading", { name: "Build faster" })).toBeVisible();
  await expect(syncState(page)).toHaveText("Saved");
  expect(JSON.stringify(await savedProject(page, id))).not.toContain(KEY);
  await page.locator(".maker-ai textarea").blur();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(stage(page).getByRole("heading", { name: "Heading", exact: true })).toBeVisible();
  await expect.poll(async () => (await savedProject(page, id)).site).toEqual(before);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(stage(page).getByRole("heading", { name: "Build faster" })).toBeVisible();
});

test("multi-selected sibling buttons wrap in Inline as one proposal", async ({ page }) => {
  const id = await setup(page);
  const agent = await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "wrap", children: c.selection.siblingOrder, with: { contract: "layout", signature: "Inline" } }] }]);
  // The stage's pointer selection is the native multi-selection entry point.
  await stage(page).getByRole("button", { name: "One", exact: true }).click();
  await stage(page).getByRole("button", { name: "Two", exact: true }).click({ modifiers: ["Shift"] });
  await connect(page);
  await expect(page.getByRole("button", { name: "Remove context Button.action", exact: true })).toHaveCount(2);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker").fill("Put these next to each other.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeVisible();
  expect(agent.context()!.selection.capabilities.canWrapTogether).toBe(true);
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await expect(stage(page).locator(".sk-inline").getByRole("button")).toHaveCount(2);
  await page.locator(".maker-ai textarea").blur();
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(async () => (await savedProject(page, id)).site).toEqual(before);
});

test("no selection uses page context and stale proposals cannot overwrite human edits", async ({ page }) => {
  await setup(page);
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "insert", at: c.insertion.here, tree: { contract: "typography", signature: "Text", children: "Final CTA copy" } }] }]);
  await connect(page);
  await expect(page.locator(".maker-ai__context")).toHaveText("Home page");
  await page.getByLabel("Ask Maker").fill("Add a final call to action.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeVisible();
  // A native edit made while the proposal exists invalidates it, even if selection is unchanged.
  await selectInOutline(page, "Heading");
  await page.locator(".maker-ai textarea").blur();
  await page.keyboard.press("ControlOrMeta+d");
  await expect(stage(page).getByRole("heading", { name: "Heading", exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(/changed|conflict/);
  await expect(stage(page).getByText("Final CTA copy")).toHaveCount(0);
});

test("cancellation leaves project unchanged and credentials are never persisted", async ({ page }) => {
  const id = await setup(page);
  await fakeAgent(page, () => [], new Promise(() => {}));
  await connect(page);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker").fill("Make this compact.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Cancelled");
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toHaveCount(0);
  await page.getByLabel("Ask Maker").fill("Try again.");
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeEnabled();
  expect((await savedProject(page, id)).site).toEqual(before);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain(KEY);
});

test("what the AI built is summarised in the chat, waits for approval, and can be rolled back", async ({ page }) => {
  const id = await setup(page);
  await selectInOutline(page, "Heading");
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Build faster" }] }]);
  await connect(page);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker", { exact: true }).fill('Change this to "Build faster"');
  await page.getByRole("button", { name: "Send", exact: true }).click();
  const summary = page.getByRole("region", { name: "Summary of changes" });
  /* Nothing is applied by itself: the summary waits, and the project is untouched. */
  await expect(summary).toContainText("Waiting for your approval");
  expect((await savedProject(page, id)).site).toEqual(before);
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(summary).toContainText("Applied to your project");
  await expect(summary).toContainText("change text to");
  await expect(stage(page).getByRole("heading", { name: "Build faster" })).toBeVisible();
  await summary.getByRole("button", { name: "Roll back" }).click();
  await expect(summary).toContainText("Rolled back");
  await expect(summary.getByRole("button", { name: "Roll back" })).toHaveCount(0);
  /* The pages are what was rolled back; the saved file is re-stamped with the catalogue's hash when it is written. */
  await expect.poll(async () => (await savedProject(page, id)).site.pages).toEqual(before.pages);
});

test("Discard rejects a proposal and says nothing was changed", async ({ page }) => {
  const id = await setup(page);
  await selectInOutline(page, "Heading");
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Nope" }] }]);
  await connect(page);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker", { exact: true }).fill("Change this");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByRole("button", { name: "Discard", exact: true }).click();
  await expect(page.getByRole("region", { name: "Summary of changes" })).toContainText("Discarded");
  expect((await savedProject(page, id)).site).toEqual(before);
});

test("a second request while one waits for approval builds on it, and one Apply commits both", async ({ page }) => {
  const id = await setup(page);
  const seen: string[] = [];
  let turn = 0;
  await page.route("https://api.openai.com/v1/responses", async route => {
    const body = route.request().postDataJSON();
    const said = (text: string) => [{ type: "message", content: [{ type: "output_text", text }] }];
    if (body.instructions.includes("Reply briefly: connected")) return respond(route, said("Connected"));
    if (isBrief(body)) return respond(route, brief("edit"));
    const last = body.input.at(-1);
    if (last.type === "function_call_output") return respond(route, said("Done."));
    const request = JSON.parse(last.content) as { context: MakerAgentContext; pageOutline: string };
    seen.push(request.pageOutline);
    turn++;
    /* The first request edits the heading; the second edits a button, found by its id in the outline it was given. */
    const node = turn === 1 ? request.context.selection.primary : /(\S+) button\/Button\.action[^\n]*\n\s+\S+ "?One/.exec(request.pageOutline)?.[1] ?? request.pageOutline.match(/(\S+) button\/Button\.action/)![1];
    const text = turn === 1 ? "Build faster" : "Get started";
    return respond(route, [{ type: "function_call", call_id: `try${turn}`, name: "maker_try", arguments: JSON.stringify({ operations: [{ type: "page", page: request.context.page.id, operations: [{ type: "setText", node, text }] }] }) }]);
  });
  await selectInOutline(page, "Heading");
  await connect(page);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker", { exact: true }).fill("Change the title");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeVisible();
  /* Not applied, and now a second request. */
  await page.getByLabel("Ask Maker", { exact: true }).fill("Change the first button");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeVisible();
  expect(seen[1]).toContain("Build faster");
  expect((await savedProject(page, id)).site).toEqual(before);
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await expect(stage(page).getByRole("heading", { name: "Build faster" })).toBeVisible();
  await expect(stage(page).getByRole("button", { name: "Get started" })).toBeVisible();
  const summaries = page.getByRole("region", { name: "Summary of changes" });
  await expect(summaries.first()).toContainText("Carried into your next request");
  await expect(summaries.last()).toContainText("Applied to your project");
});

/* THE CHAT'S OWN GESTURES. */
test("Enter sends, Shift+Enter breaks the line, ArrowUp brings back the last message, and New chat clears the conversation", async ({ page }) => {
  await setup(page);
  await selectInOutline(page, "Heading");
  const agent = await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Hola" }] }]);
  await connect(page);
  const field = page.getByLabel("Ask Maker", { exact: true });
  await field.fill("first line");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.type("second line");
  await expect(field).toHaveValue("first line\nsecond line");
  expect(agent.context()).toBeUndefined();

  await page.keyboard.press("Enter");
  await expect(page.getByRole("log", { name: "Conversation" })).toContainText("second line");
  await expect(field).toHaveValue("");

  await expect(page.getByRole("region", { name: "Proposed changes" })).toBeVisible();
  await field.focus();
  await page.keyboard.press("ArrowUp");
  await expect(field).toHaveValue("first line\nsecond line");

  if (process.env.SHOT) await page.locator(".maker__right").screenshot({ path: process.env.SHOT });
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.getByRole("log", { name: "Conversation" })).not.toContainText("second line");
  await expect(page.getByRole("region", { name: "Proposed changes" })).toHaveCount(0);
});

test("the AI asks once, only what blocks it, and after the answer it builds with placeholders and asks no more", async ({ page }) => {
  const id = await setup(page);
  const asked: boolean[] = [];
  let briefs = 0;
  await page.route("https://api.openai.com/v1/responses", async route => {
    const body = route.request().postDataJSON();
    const said = (text: string) => [{ type: "message", content: [{ type: "output_text", text }] }];
    if (body.instructions.includes("Reply briefly: connected")) return respond(route, said("Connected"));
    if (isBrief(body)) {
      asked.push(JSON.parse(body.input.at(-1).content).canAsk);
      /* First: a request with no subject, so a build would be a coin flip: one question. Then: nothing more may be asked. */
      return respond(route, ++briefs === 1
        ? brief("build", { missing: [{ title: "What is this page for?", recommended: "A bakery" }] })
        : brief("build", { assumptions: ["The headline is a placeholder"], missing: [{ title: "Anything else", recommended: "No" }] }));
    }
    const last = body.input.at(-1);
    if (last.type === "function_call_output") return respond(route, said("Built a hero with placeholder text."));
    const request = JSON.parse(last.content) as { context?: MakerAgentContext };
    /* The review that follows a proposal carries no context: nothing more to add. */
    if (!request.context) return respond(route, said("Built a hero with placeholder text."));
    return respond(route, [{ type: "function_call", call_id: "try", name: "maker_try", arguments: JSON.stringify({ operations: [{ type: "page", page: request.context.page.id, operations: [{ type: "setText", node: request.context.selection.primary, text: "Your headline here" }] }] }) }]);
  });
  await selectInOutline(page, "Heading");
  await connect(page);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Make me a page");
  await page.keyboard.press("Enter");
  const card = page.getByRole("form", { name: "Questions from Maker AI" });
  await expect(card).toBeVisible();
  await expect(card.getByRole("group")).toHaveCount(1);
  await card.getByRole("button", { name: "Use my recommendations" }).click();
  /* Answered: it builds, and no second round appears even though the second brief wanted one. */
  await expect(page.getByRole("region", { name: "Proposed changes" })).toBeVisible();
  await expect(page.getByRole("form", { name: "Questions from Maker AI" })).toHaveCount(0);
  await expect(page.getByRole("log", { name: "Conversation" })).toContainText("Built a hero with placeholder text.");
  expect(asked).toEqual([true, false]);
  expect(JSON.stringify((await savedProject(page, id)).site)).not.toContain("Your headline here");
});

test("asked to clone a site, the agent reads it through the Maker's server and builds its sections", async ({ page }) => {
  await setup(page);
  const asked: string[] = [];
  await page.route("**/api/snapshot?*", route => {
    asked.push(new URL(route.request().url()).searchParams.get("url")!);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ url: "https://acme.test/", title: "Acme", sections: [{ tag: "section", blocks: [{ kind: "heading", level: 1, text: "Fly higher" }] }], likelyScripted: false, truncated: false }) });
  });
  const said = (text: string) => [{ type: "message", content: [{ type: "output_text", text }] }];
  const seen: string[] = [];
  await page.route("https://api.openai.com/v1/responses", async route => {
    const body = route.request().postDataJSON();
    if (body.instructions.includes("Reply briefly: connected")) return respond(route, said("Connected"));
    if (isBrief(body)) return respond(route, brief("edit"));
    const last = body.input.at(-1);
    if (last.type === "function_call_output") {
      seen.push(last.output);
      if (seen.length === 1) {
        const context = JSON.parse(body.input.find((item: { content?: string }) => item.content?.includes('"context"')).content).context as MakerAgentContext;
        return respond(route, [{ type: "function_call", call_id: "try", name: "maker_try", arguments: JSON.stringify({ operations: [{ type: "page", page: context.page.id, operations: [{ type: "setText", node: context.selection.primary, text: "Fly higher" }] }] }) }]);
      }
      return respond(route, said("Rebuilt the Fly higher section."));
    }
    return respond(route, [{ type: "function_call", call_id: "read", name: "maker_read_site", arguments: JSON.stringify({ url: "https://acme.test/" }) }]);
  });
  await selectInOutline(page, "Heading");
  await connect(page);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Clone https://acme.test/");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("log", { name: "Conversation" })).toContainText("Rebuilt the Fly higher section.");
  expect(asked).toEqual(["https://acme.test/"]);
  /* What the model was handed is the summary, not markup. */
  expect(seen[0]).toContain("Fly higher");
  expect(seen[0]).not.toContain("<");
});

test("in development every message to Maker AI is logged with its answer, and never the key", async ({ page }) => {
  await setup(page);
  const posts: Record<string, unknown>[] = [];
  await page.route("**/__maker-ai-log", route => { posts.push(route.request().postDataJSON()); return route.fulfill({ status: 204 }); });
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Hola" }] }]);
  await selectInOutline(page, "Heading");
  await connect(page);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Say hola");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Proposed changes" })).toBeVisible();
  await page.getByRole("button", { name: "Discard", exact: true }).click();
  await expect.poll(() => posts.map(p => p.type === "turn" ? "turn" : p.outcome)).toEqual(["pending", "turn", "discarded"]);
  expect(posts[1]).toMatchObject({ type: "turn", intent: "Say hola", provider: "openai", model: "mock-model", answer: "Prepared the requested Maker changes." });
  expect(posts[1]!.operations).toHaveLength(1);
  expect(posts[2]).toMatchObject({ type: "outcome", outcome: "discarded" });
  expect(JSON.stringify(posts)).not.toContain(KEY);
});

test("by default there is no Apply or Discard: a proposal goes straight in as one undo step, and the switch brings review back", async ({ page }) => {
  const id = await setup(page);
  await page.addInitScript(() => localStorage.removeItem("maker.ai.review"));
  await page.reload();
  await expect(stage(page).getByRole("heading", { name: "Heading" })).toBeVisible();
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Hola" }] }]);
  await selectInOutline(page, "Heading");
  await connect(page);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Say hola");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toHaveCount(0);
  await expect(stage(page).getByRole("heading", { name: "Hola" })).toBeVisible();
  await expect.poll(async () => JSON.stringify((await savedProject(page, id)).site)).toContain("Hola");
  await page.locator(".maker-ai textarea").blur();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(stage(page).getByRole("heading", { name: "Heading", exact: true })).toBeVisible();

  /* Turned on, it waits again. */
  await page.getByRole("button", { name: "AI settings" }).click();
  await page.getByText("Review changes before applying").click();
  await page.getByRole("button", { name: "Close AI settings" }).click();
  await page.getByLabel("Ask Maker", { exact: true }).fill("Say hola again");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Proposed changes" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeVisible();
});
