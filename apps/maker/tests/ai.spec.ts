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
  await page.getByRole("radio", { name: "AI", exact: true }).click();
  await page.getByLabel("API key", { exact: true }).fill(KEY);
  await page.getByLabel("Model", { exact: true }).fill("mock-model");
  await page.getByRole("button", { name: "Test & connect" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Connected." })).toBeVisible();
}
const respond = (route: Route, message: unknown) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ choices: [{ message }] }) });

async function fakeAgent(page: Page, operation: (context: MakerAgentContext) => unknown[], wait?: Promise<void>) {
  const requests: unknown[] = [];
  let captured: MakerAgentContext | undefined;
  await page.route("https://api.openai.com/v1/chat/completions", async route => {
    const body = route.request().postDataJSON();
    requests.push(body);
    expect(JSON.stringify(body)).not.toContain(KEY);
    if (body.messages[0].content.includes("Reply briefly: connected")) return respond(route, { content: "Connected" });
    if (body.messages.at(-1).role === "tool") return respond(route, { content: "Prepared the requested Maker changes." });
    const frozen = JSON.parse(body.messages.at(-1).content).context as MakerAgentContext;
    captured = frozen;
    if (wait) await wait;
    return respond(route, { content: null, tool_calls: [{ id: "try", type: "function", function: { name: "maker_try", arguments: JSON.stringify({ operations: operation(frozen) }) } }] });
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
