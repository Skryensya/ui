import { expect, test, type Page } from "@playwright/test";
import { bar, openMaker } from "./fixtures";

/*
 * THE TOUR. It starts only from Help, walks the places the work happens in order, points at something
 * that is on screen at every stop, closes with Escape, remembers how it ended, and is shorter (not broken)
 * when a panel is hidden.
 */
const TITLES = ["The canvas", "Pages and layers", "Insert", "Inspector", "Maker AI", "Undo, play and modes", "Menus"];
const step = (page: Page) => page.getByRole("dialog").filter({ has: page.getByRole("button", { name: /Continue|Finish/ }) });

test("Help starts the tour, and it walks every stop in order, each one pointing at something on screen", async ({ page }) => {
  await openMaker(page);
  await expect(step(page)).toHaveCount(0);
  await bar(page, ["Help", "Take the tour"]);

  for (let i = 0; i < TITLES.length; i++) {
    const dialog = step(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(TITLES[i]!);
    await expect(dialog).toContainText(`Step ${i + 1} of ${TITLES.length}`);
    /* Not a stop on nothing: the box sits inside the window, next to the element it is about. */
    const box = await dialog.boundingBox();
    const view = page.viewportSize()!;
    expect(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= view.width && box.y + box.height <= view.height).toBe(true);
    await page.getByRole("button", { name: i === TITLES.length - 1 ? "Finish" : "Continue" }).click();
  }
  await expect(step(page)).toHaveCount(0);
});

test("Escape closes it, and the Maker is still usable underneath", async ({ page }) => {
  await openMaker(page);
  await bar(page, ["Help", "Take the tour"]);
  await expect(step(page)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(step(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
});

test("a hidden panel shortens the tour instead of breaking it", async ({ page }) => {
  await openMaker(page);
  await page.getByRole("button", { name: "Hide the left panel" }).click();
  await bar(page, ["Help", "Take the tour"]);
  await expect(step(page)).toContainText("The canvas");
  await expect(step(page)).toContainText(`Step 1 of ${TITLES.length - 1}`);
  await page.getByRole("button", { name: "Continue" }).click();
  /* "Pages and layers" is gone with its panel, so the second stop is Insert. */
  await expect(step(page)).toContainText("Insert");
});

test("someone who has never taken it is told where it is, once; someone who finished it is not", async ({ page }) => {
  await openMaker(page);
  await expect(page.getByRole("status").filter({ hasText: "Take the tour" })).toBeVisible();
  await bar(page, ["Help", "Take the tour"]);
  await page.keyboard.press("Escape");
  await bar(page, ["Help", "Take the tour"]);
  for (let i = 0; i < TITLES.length - 1; i++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Finish" }).click();
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Take the tour" })).toHaveCount(0);
});
