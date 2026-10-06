import { expect, test } from "@playwright/test";
import { insert, openMaker, pageTree } from "./fixtures";

/* The Sections tab: whole parts of a page, grouped by what they are for, previewed live, searchable. */
test("sections are grouped, searchable, previewed, and a click puts the whole block on the page", async ({ page }) => {
  await openMaker(page);
  const panel = await insert(page);
  await panel.getByRole("radio", { name: "Sections" }).click();
  for (const group of ["Navigation", "Heroes", "Content", "Pricing", "Questions", "Footer"]) await expect(panel.getByRole("region", { name: group })).toBeVisible();
  await panel.getByLabel("Search sections").fill("pricing");
  await expect(panel.getByRole("region", { name: "Pricing" })).toBeVisible();
  await expect(panel.getByRole("region", { name: "Footer" })).toHaveCount(0);
  /* A live preview appears for what is on screen. */
  await expect(panel.locator(".maker-section-preview[data-shown]").first()).toBeVisible({ timeout: 15_000 });
  await panel.getByRole("button", { name: /Pricing plans/ }).click();
  await expect.poll(() => pageTree(page)).toContain("Wrapper");
  expect(await pageTree(page)).toMatch(/Box\n\s+Wrapper\n\s+Stack/);
  expect(await pageTree(page)).toContain("Grid");
});
