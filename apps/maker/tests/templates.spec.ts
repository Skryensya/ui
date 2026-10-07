import { expect, test } from "@playwright/test";
import { openMaker, savedProject, stage, layers } from "./fixtures";

/*
 * The docs gallery's templates as starting points: from the projects panel, and from the gallery's
 * own "Open in Maker" link (`?template=<id>&lang=<locale>`).
 */


test("a new project can start as one of the docs templates", async ({ page }) => {
  await openMaker(page);
  await page.getByRole("button", { name: "All projects" }).click();
  const panel = page.locator(".maker__right");
  await panel.getByRole("button", { name: "Browse" }).click();
  await panel.getByRole("list", { name: "Templates" }).getByRole("button", { name: /^Landing de producto/ }).click();
  await panel.getByRole("button", { name: "Create project" }).click();
  const tabs = page.getByRole("navigation", { name: "Open projects" });
  await expect(tabs.getByRole("button", { name: /^Landing de producto/ })).toHaveAttribute("aria-current", "page");
  await expect(stage(page).locator("main h1, main h2").first()).toBeVisible();
  await expect((await layers(page)).locator(".maker-outline")).toContainText("Navbar");
});

test("the gallery's Open in Maker link makes the project once, and the address forgets it", async ({ page }) => {
  await page.goto("/?template=pricing&lang=en");
  const tabs = page.getByRole("navigation", { name: "Open projects" });
  await expect(tabs.getByRole("button", { name: "Pricing page", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page).not.toHaveURL(/template=/);
  const id = new URL(page.url()).searchParams.get("project")!;
  const saved = JSON.stringify((await savedProject(page, id)).site);
  expect(saved).not.toContain('"class"');

  const count = async () => (await (await page.request.get("/api/projects")).json()).filter((p: { name: string }) => p.name === "Pricing page").length;
  const before = await count();
  await page.reload();
  await expect(tabs.getByRole("button", { name: "Pricing page", exact: true })).toBeVisible();
  expect(await count()).toBe(before);
});

test("the operations app shell opens as a layout and a page, with its project prompt edited before it is made", async ({ page }) => {
  await openMaker(page);
  await page.getByRole("button", { name: "All projects" }).click();
  const panel = page.locator(".maker__right");
  await panel.getByRole("button", { name: "Browse" }).click();
  await panel.getByRole("list", { name: "Templates" }).getByRole("button", { name: /^App shell de operaciones/ }).click();
  const prompt = panel.getByLabel("Prompt for Maker AI", { exact: true });
  await expect(prompt).toHaveValue(/Northstar/);
  await prompt.fill("Northstar, edited: a console for the support team.");
  await panel.getByRole("button", { name: "Create project" }).click();
  const tabs = page.getByRole("navigation", { name: "Open projects" });
  await expect(tabs.getByRole("button", { name: /^App shell de operaciones/ })).toHaveAttribute("aria-current", "page");

  /* One frame, one main: the rail beside the work area, and the work area holding the overview. */
  await expect(stage(page).locator(".sk-app-shell > .sk-sidebar")).toBeVisible();
  await expect(stage(page).locator("main")).toHaveCount(1);
  await expect(stage(page).getByRole("heading", { level: 1 })).toBeVisible();
  const id = new URL(page.url()).searchParams.get("project")!;
  const site = (await savedProject(page, id)).site as { prompt?: string; layouts?: { root: { signature: string } }[] };
  expect(site.layouts?.[0]?.root.signature).toBe("AppShell");
  expect(site.prompt).toBe("Northstar, edited: a console for the support team.");

  /* The prompt has its own place in Maker AI, apart from the conversation. */
  await page.getByRole("tab", { name: "AI", exact: true }).click();
  /* No provider yet: the AI settings open by themselves first. */
  await expect(page.getByRole("dialog", { name: "AI settings" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "AI settings" })).toBeHidden();
  await page.getByRole("button", { name: "Project prompt" }).click();
  const dialog = page.getByRole("dialog", { name: "Project prompt" });
  await expect(dialog.getByRole("textbox")).toHaveValue("Northstar, edited: a console for the support team.");
});

test("a project that cannot be saved says why and leaves Create free, instead of hanging on Creating…", async ({ page }) => {
  await openMaker(page);
  await page.route("**/api/projects", (route) => route.request().method() === "POST"
    ? route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "connect ECONNREFUSED 127.0.0.1:5433" }) })
    : route.fallback());
  await page.getByRole("button", { name: "All projects" }).click();
  const panel = page.locator(".maker__right");
  await panel.getByRole("button", { name: "Browse" }).click();
  await panel.getByRole("list", { name: "Templates" }).getByRole("button", { name: /^App shell de operaciones/ }).click();
  await panel.getByRole("button", { name: "Create project" }).click();
  await expect(panel.getByRole("alert")).toContainText("The projects database is not reachable");
  await expect(panel.getByRole("button", { name: "Create project" })).toBeEnabled();
  await expect(panel.getByLabel("Prompt for Maker AI", { exact: true })).toHaveValue(/Northstar/);
});
