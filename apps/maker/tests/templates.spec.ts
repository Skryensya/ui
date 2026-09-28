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
  await panel.getByText("Start from a template").click();
  await panel.getByRole("list", { name: "Templates" }).getByRole("button", { name: /^Landing de producto/ }).click();
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
