import { expect, test, type Page } from "@playwright/test";
import { addFromPalette, openMaker, savedProject, selectInOutline, stage, layers, bar, syncState } from "./fixtures";

/*
 * Projects: several open at once as tabs, each with its own history, kept by the server and
 * reopened on the next visit.
 */

const tabs = (page: Page) => page.getByRole("navigation", { name: "Open projects" });

async function newProject(page: Page, name: string) {
  await page.getByRole("button", { name: "All projects" }).click();
  const panel = page.locator(".maker__right");
  await panel.getByLabel("New project").fill(name);
  await panel.getByRole("button", { name: "Create" }).click();
  await expect(tabs(page).getByRole("button", { name, exact: true })).toHaveAttribute("aria-current", "page");
}

test("several projects open as tabs, each keeping its own page and history", async ({ page }) => {
  const first = await openMaker(page, `Alpha ${Date.now()}`);
  await addFromPalette(page, "Wrapper");
  await expect.poll(async () => JSON.stringify((await savedProject(page, first)).site)).toContain("Wrapper");

  const second = `Beta ${Date.now()}`;
  await newProject(page, second);
  await expect((await layers(page)).locator(".maker-outline")).not.toContainText("Wrapper");
  await addFromPalette(page, "Stack");
  await expect((await layers(page)).locator(".maker-outline")).toContainText("Stack");

  /* Back to the first: its tree, and its history (undo removes its Wrapper, not the Beta Stack). */
  await tabs(page).getByRole("button", { name: /^Alpha/ }).click();
  await expect((await layers(page)).locator(".maker-outline")).toContainText("Wrapper");
  await bar(page, ["Edit", "Undo"]);
  await expect((await layers(page)).locator(".maker-outline")).not.toContainText("Wrapper");
  await tabs(page).getByRole("button", { name: second, exact: true }).click();
  await expect((await layers(page)).locator(".maker-outline")).toContainText("Stack");
});

test("open tabs and the showing one come back on the next visit", async ({ page }) => {
  await openMaker(page, `Kept ${Date.now()}`);
  const other = `Also kept ${Date.now()}`;
  await newProject(page, other);
  await page.reload();
  await expect(tabs(page).getByRole("button", { name: /^Kept/ })).toBeVisible();
  await expect(tabs(page).getByRole("button", { name: other, exact: true })).toHaveAttribute("aria-current", "page");
});

test("closing a tab keeps the project; deleting asks twice and removes it", async ({ page }) => {
  const name = `Doomed ${Date.now()}`;
  const id = await openMaker(page, name);
  await tabs(page).getByRole("button", { name: `Close ${name}` }).click();
  await expect(tabs(page).getByRole("button", { name, exact: true })).toHaveCount(0);
  /* With nothing open, the list of projects is the screen. */
  const list = page.getByRole("list", { name: "All projects" });
  const row = list.locator(".maker-projects__open", { hasText: name });
  await expect(row).toBeVisible();

  await list.getByRole("button", { name: `Delete ${name}` }).click();
  await list.getByRole("button", { name: `Delete ${name}` }).click();
  await expect(row).toHaveCount(0);
  expect((await page.request.get(`/api/projects/${id}`)).status()).toBe(404);
});

test("renaming a project renames its tab", async ({ page }) => {
  const name = `Named ${Date.now()}`;
  await openMaker(page, name);
  await page.getByRole("button", { name: "All projects" }).click();
  await page.getByRole("button", { name: `Rename ${name}` }).click();
  const field = page.locator(".maker__right").getByLabel("Project name");
  await field.fill("Renamed site");
  await field.press("Enter");
  await expect(tabs(page).getByRole("button", { name: "Renamed site", exact: true })).toBeVisible();
});

test("a change saved in one window reaches the same project open in another", async ({ page, context }) => {
  const id = await openMaker(page, `Shared ${Date.now()}`);
  const other = await context.newPage();
  await other.goto(`/?project=${id}`);
  await expect(syncState(other)).toHaveText("Saved");
  await selectInOutline(page, "Main");
  await addFromPalette(page, "Wrapper");
  await expect((await layers(other)).locator(".maker-outline")).toContainText("Wrapper");
  await expect(stage(other).locator(".sk-wrapper")).toHaveCount(1);
});
