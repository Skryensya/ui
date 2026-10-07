import { expect, test, type Page } from "@playwright/test";
import { createSite, counterIds, fromUsageTree } from "@skryensya/maker-model";
import { openMaker, savedProject, selectInOutline, stage } from "./fixtures";

const KEY = "session-only-test-key";

async function connected(page: Page) {
  const id = await openMaker(page);
  const saved = await savedProject(page, id);
  const base = createSite("hash", counterIds("s"));
  const root = fromUsageTree({ contract: "layout", signature: "Main", children: [{ contract: "layout", signature: "Stack", children: [{ contract: "typography", signature: "Heading", children: "Heading" }] }] }, counterIds("n"));
  await page.request.put(`/api/projects/${id}`, { data: { baseRevision: saved.revision, site: { ...base, pages: [{ ...base.pages[0]!, id: "home", root }] } } });
  await page.reload();
  await expect(stage(page).getByRole("heading", { name: "Heading" })).toBeVisible();
  await page.route("https://api.openai.com/v1/responses", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ output: [{ type: "message", content: [{ type: "output_text", text: "Connected" }] }] }) }));
  await page.getByRole("tab", { name: "AI", exact: true }).click();
  await page.getByLabel("API key", { exact: true }).fill(KEY);
  await page.getByLabel("Model", { exact: true }).fill("mock-model");
  await page.getByRole("button", { name: "Test & connect" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Connected." })).toBeVisible();
}

/* The composer is the same element, with the same text, however long it is typed in and whatever else happens around it. */
test("what is typed in the composer is kept, in the same field, while the Maker saves and changes around it", async ({ page }) => {
  await connected(page);
  const composer = page.getByLabel("Ask Maker", { exact: true });
  await composer.focus();
  await composer.evaluate((el) => { (el as HTMLTextAreaElement & { __same?: boolean }).__same = true; });
  const typed = "Make the hero friendlier and add a pricing section";
  await composer.pressSequentially(typed.slice(0, 20), { delay: 40 });
  /* Something happens to the page in the middle of typing: a pick in the outline, an edit saved to the server. */
  await selectInOutline(page, "Heading");
  await composer.focus();
  await composer.pressSequentially(typed.slice(20), { delay: 40 });
  await page.waitForTimeout(3500);
  await expect(composer).toHaveValue(typed);
  expect(await composer.evaluate((el) => (el as HTMLTextAreaElement & { __same?: boolean }).__same === true)).toBe(true);
});
