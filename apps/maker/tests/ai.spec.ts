import { expect, test, type Page, type Route } from "@playwright/test";
import { createSite, counterIds, fromUsageTree, type MakerAgentContext } from "@skryensya/maker-model";
import { openMaker, savedProject, selectInOutline, stage, syncState } from "./fixtures";

const KEY = "session-only-test-key";
async function setup(page: Page) {
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
    /* A proposal that leaves advice standing is sent back once to fix it: the mock has nothing to add, and says so. */
    if (typeof last.content === "string" && last.content.includes('"review"')) return respond(route, said("Prepared the requested Maker changes."));
    const frozen = JSON.parse(last.content).context as MakerAgentContext;
    captured = frozen;
    if (wait) await wait;
    return respond(route, [{ type: "function_call", call_id: "try", name: "maker_try", arguments: JSON.stringify({ operations: operation(frozen) }) }]);
  });
  return { requests, context: () => captured };
}

test("freezes the selection, applies the finished proposal once, and undoes", async ({ page }) => {
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
  expect((await savedProject(page, id)).site).toEqual(before);
  release();
  /* The canvas SHOWS the draft before it is applied, so seeing it is no sign that it was applied. The status says
     so once the project has actually taken it. */
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  expect(agent.context()!.selection.primary).toBe(selected);
  await expect(stage(page).getByRole("heading", { name: "Build faster" })).toBeVisible();
  await expect(syncState(page)).toHaveText("Saved");
  expect(JSON.stringify(await savedProject(page, id))).not.toContain(KEY);
  await page.getByLabel("Ask Maker", { exact: true }).blur();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(stage(page).getByRole("heading", { name: "Heading", exact: true })).toBeVisible();
  await expect.poll(async () => (await savedProject(page, id)).site).toEqual(before);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(stage(page).getByRole("heading", { name: "Build faster" })).toBeVisible();
});

test("multi-selected sibling buttons wrap in Inline as one edit", async ({ page }) => {
  const id = await setup(page);
  const agent = await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "wrap", children: c.selection.siblingOrder, with: { contract: "layout", signature: "Inline" } }] }]);
  // The stage's pointer selection is the native multi-selection entry point.
  await stage(page).getByRole("button", { name: "One", exact: true }).click();
  await stage(page).getByRole("button", { name: "Two", exact: true }).click({ modifiers: ["Shift"] });
  await connect(page);
  await expect(page.getByRole("button", { name: "Remove context Button.action", exact: true })).toHaveCount(2);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker", { exact: true }).fill("Put these next to each other.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  expect(agent.context()!.selection.capabilities.canWrapTogether).toBe(true);
  await expect(stage(page).locator(".sk-inline").getByRole("button")).toHaveCount(2);
  await page.getByLabel("Ask Maker", { exact: true }).blur();
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(async () => (await savedProject(page, id)).site).toEqual(before);
});

test("Ask Maker on the stage reveals the AI composer with the selection attached, and the request is about it", async ({ page }) => {
  await setup(page);
  const agent = await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Changed" }] }]);
  await connect(page);
  await page.getByRole("tab", { name: "Inspector", exact: true }).click();
  await stage(page).getByRole("button", { name: "One", exact: true }).click();
  await page.getByRole("button", { name: "Ask Maker about this selection" }).click();
  await expect(page.getByLabel("Ask Maker", { exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Remove context Button.action", exact: true })).toHaveCount(1);
  /* An attached node can still be left out. */
  await page.getByRole("button", { name: "Remove context Button.action", exact: true }).click();
  await expect(page.locator(".maker-ai__context")).not.toContainText("Remove context");
  await page.getByRole("button", { name: "Restore selection" }).click();
  await page.getByLabel("Ask Maker", { exact: true }).fill("Make this friendlier");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  expect(agent.context()!.selection.selectedIds).toHaveLength(1);
  expect(agent.context()!.selection.primary).toBe(agent.context()!.selection.selectedIds[0]);
});

test("Ask Maker with several nodes selected attaches all of them", async ({ page }) => {
  await setup(page);
  const agent = await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Changed" }] }]);
  await connect(page);
  await page.getByRole("tab", { name: "Inspector", exact: true }).click();
  await stage(page).getByRole("button", { name: "One", exact: true }).click();
  await stage(page).getByRole("button", { name: "Two", exact: true }).click({ modifiers: ["Shift"] });
  await page.getByRole("button", { name: "Ask Maker about this selection" }).click();
  await expect(page.getByRole("button", { name: "Remove context Button.action", exact: true })).toHaveCount(2);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Rename these");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  expect(agent.context()!.selection.selectedIds).toHaveLength(2);
});

test("Ask Maker with nothing selected asks about the page", async ({ page }) => {
  await setup(page);
  await fakeAgent(page, () => []);
  await connect(page);
  await page.getByRole("tab", { name: "Inspector", exact: true }).click();
  await page.getByRole("button", { name: "Ask Maker about this page" }).click();
  await expect(page.getByLabel("Ask Maker", { exact: true })).toBeFocused();
  await expect(page.locator(".maker-ai__context")).toHaveText("Home page");
});

test("the composer keeps what is typed in it, in the same field, while a request builds and is applied", async ({ page }) => {
  await setup(page);
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Changed" }] }], wait);
  await selectInOutline(page, "Heading");
  await connect(page);
  const composer = page.getByLabel("Ask Maker", { exact: true });
  const same = () => composer.evaluate(el => (el as HTMLTextAreaElement & { __same?: boolean }).__same === true);
  await composer.evaluate(el => { (el as HTMLTextAreaElement & { __same?: boolean }).__same = true; });
  await composer.fill("First request");
  await page.keyboard.press("Enter");
  await expect(composer).toHaveValue("");
  /* Typing the next request while the first is still being built. */
  await composer.focus();
  await composer.pressSequentially("Then also change the button", { delay: 30 });
  await expect(composer).toHaveValue("Then also change the button");
  release();
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await expect(composer).toHaveValue("Then also change the button");
  expect(await same()).toBe(true);
  await composer.pressSequentially("!", { delay: 30 });
  await expect(composer).toHaveValue("Then also change the button!");
});

test("a request that fails gives the prompt back, so it is edited and sent again, not retyped", async ({ page }) => {
  await setup(page);
  let failing = false;
  const said = (text: string) => [{ type: "message", content: [{ type: "output_text", text }] }];
  await page.route("https://api.openai.com/v1/responses", route => {
    const body = route.request().postDataJSON();
    if (body.instructions.includes("Reply briefly: connected")) return respond(route, said("Connected"));
    failing = true;
    return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: { message: "The provider is down" } }) });
  });
  await selectInOutline(page, "Heading");
  await connect(page);
  const composer = page.getByLabel("Ask Maker", { exact: true });
  await composer.fill("Make the heading shorter");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toBeVisible();
  expect(failing).toBe(true);
  await expect(composer).toHaveValue("Make the heading shorter");
  /* Something typed since is not overwritten. */
  await composer.fill("");
  await composer.fill("A different request");
  await expect(composer).toHaveValue("A different request");
});

test("no selection uses page context, and a proposal made stale by a human edit is never applied over it", async ({ page }) => {
  await setup(page);
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "insert", at: c.insertion.here, tree: { contract: "typography", signature: "Text", children: "Final CTA copy" } }] }], wait);
  await connect(page);
  await expect(page.locator(".maker-ai__context")).toHaveText("Home page");
  await page.getByLabel("Ask Maker", { exact: true }).fill("Add a final call to action.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  // A native edit made while the request builds makes its proposal stale, even if selection is unchanged.
  await selectInOutline(page, "Heading");
  await page.getByLabel("Ask Maker", { exact: true }).blur();
  await page.keyboard.press("ControlOrMeta+d");
  await expect(stage(page).getByRole("heading", { name: "Heading", exact: true })).toHaveCount(2);
  release();
  await expect(page.getByRole("alert")).toContainText(/changed|conflict/);
  await expect(stage(page).getByText("Final CTA copy")).toHaveCount(0);
});

test("cancellation leaves project unchanged and credentials are never persisted", async ({ page }) => {
  const id = await setup(page);
  await fakeAgent(page, () => [], new Promise(() => {}));
  await connect(page);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker", { exact: true }).fill("Make this compact.");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Cancelled");
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toHaveCount(0);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Try again.");
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeEnabled();
  expect((await savedProject(page, id)).site).toEqual(before);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }))).not.toContain(KEY);
});

test("what the AI built is summarised in the chat, and can be rolled back", async ({ page }) => {
  const id = await setup(page);
  await selectInOutline(page, "Heading");
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Build faster" }] }]);
  await connect(page);
  const before = (await savedProject(page, id)).site;
  await page.getByLabel("Ask Maker", { exact: true }).fill('Change this to "Build faster"');
  await page.getByRole("button", { name: "Send", exact: true }).click();
  const summary = page.getByRole("region", { name: "Summary of changes" });
  await expect(summary).toContainText("Applied to your project");
  await expect(summary).toContainText("change text to");
  await expect(stage(page).getByRole("heading", { name: "Build faster" })).toBeVisible();
  await summary.getByRole("button", { name: "Roll back" }).click();
  await expect(summary).toContainText("Rolled back");
  await expect(summary.getByRole("button", { name: "Roll back" })).toHaveCount(0);
  /* The pages are what was rolled back; the saved file is re-stamped with the catalogue's hash when it is written. */
  await expect.poll(async () => (await savedProject(page, id)).site.pages).toEqual(before.pages);
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

  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await field.focus();
  await page.keyboard.press("ArrowUp");
  await expect(field).toHaveValue("first line\nsecond line");

  if (process.env.SHOT) await page.locator(".maker__right").screenshot({ path: process.env.SHOT });
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.getByRole("log", { name: "Conversation" })).not.toContainText("second line");
});

test("a build brief shows its planned sections with their roles, and an edit brief shows none", async ({ page }) => {
  await setup(page);
  let kind: "build" | "edit" = "build";
  const said = (text: string) => [{ type: "message", content: [{ type: "output_text", text }] }];
  await page.route("https://api.openai.com/v1/responses", route => {
    const body = route.request().postDataJSON();
    if (body.instructions.includes("Reply briefly: connected")) return respond(route, said("Connected"));
    if (isBrief(body)) return respond(route, kind === "build"
      ? brief("build", { plan: [{ section: "Hero", role: "hero" }, { section: "Pricing", role: "pricing" }, { section: "Footer", role: "footer" }] })
      : brief("edit"));
    return respond(route, said("Nothing to change."));
  });
  await selectInOutline(page, "Heading");
  await connect(page);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Make me a page");
  await page.keyboard.press("Enter");
  const sections = page.getByRole("list", { name: "Sections" });
  await expect(sections.getByRole("listitem")).toHaveText([/Hero\s*hero/, /Pricing\s*pricing/, /Footer\s*footer/]);
  await expect(page.getByRole("region", { name: "Plan" })).toContainText("Do what was asked");
  kind = "edit";
  await page.getByLabel("Ask Maker", { exact: true }).fill("Tweak it");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("log", { name: "Conversation" })).toContainText("Nothing to change.");
  await expect(sections).toHaveCount(1);
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
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await expect.poll(() => posts.map(p => p.type === "turn" ? "turn" : p.outcome)).toEqual(["applied", "turn"]);
  expect(posts[1]).toMatchObject({ type: "turn", intent: "Say hola", provider: "openai", model: "mock-model", answer: "Prepared the requested Maker changes." });
  expect(posts[1]!.operations).toHaveLength(1);
  expect(JSON.stringify(posts)).not.toContain(KEY);
});

test("there is no Apply or Discard for a finished proposal: it goes straight in as one undo step", async ({ page }) => {
  const id = await setup(page);
  await fakeAgent(page, c => [{ type: "page", page: c.page.id, operations: [{ type: "setText", node: c.selection.primary, text: "Hola" }] }]);
  await selectInOutline(page, "Heading");
  await connect(page);
  await page.getByLabel("Ask Maker", { exact: true }).fill("Say hola");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Applied as one undoable edit." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toHaveCount(0);
  await expect(stage(page).getByRole("heading", { name: "Hola" })).toBeVisible();
  await expect.poll(async () => JSON.stringify((await savedProject(page, id)).site)).toContain("Hola");
  await page.getByLabel("Ask Maker", { exact: true }).blur();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(stage(page).getByRole("heading", { name: "Heading", exact: true })).toBeVisible();
});
