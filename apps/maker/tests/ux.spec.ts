import { expect, test, type Page } from "@playwright/test";
import { bar, buildSamplePage, layers, openMaker, pageTree, stage } from "./fixtures";

/*
 * Getting around a page: the gestures a person needs to keep building once the page has something
 * on it, and what an empty page looks like. Each test starts from a project of its own.
 */

const selectedTitle = (page: Page) => page.locator(".maker__right .maker-inspector__header h2");

test.beforeEach(async ({ page }) => {
  await openMaker(page);
});

test("an empty page is blank: no words on it, and the whole of it is the page", async ({ page }) => {
  await expect(page.locator(".maker-stage__empty")).toHaveCount(0);
  expect((await stage(page).locator("body").innerText()).trim()).toBe("");
  /* The page's Main fills the artboard, so there is somewhere to click and drop from the start. */
  const main = (await stage(page).locator("#stage > [data-maker-node]").boundingBox())!;
  const frame = (await page.locator(".maker-artboard[data-active] .maker-stage__frame").boundingBox())!;
  expect(main.height).toBeGreaterThan(frame.height * 0.9);
});

test("after a section, a click below it selects Main, and the next insert lands under the section", async ({ page }) => {
  await bar(page, ["Insert", "Wrapper"]);
  await expect.poll(() => pageTree(page)).toBe("Main\n  Wrapper");
  await expect(selectedTitle(page)).toHaveText("Wrapper");

  /* Below the Wrapper, where no node is: that is the page itself. */
  const wrapper = (await stage(page).locator("#stage > [data-maker-node] > *").first().boundingBox())!;
  await page.mouse.click(wrapper.x + wrapper.width / 2, wrapper.y + wrapper.height + 60);
  await expect(selectedTitle(page)).toHaveText("Main");

  await bar(page, ["Insert", "Wrapper"]);
  await expect.poll(() => pageTree(page)).toBe("Main\n  Wrapper\n  Wrapper");
});

test("Escape walks up the tree, from what is selected to Main, then to nothing", async ({ page }) => {
  await buildSamplePage(page);
  await stage(page).locator("h2").click({ force: true });
  await expect(selectedTitle(page)).toHaveText("Heading");
  for (const parent of ["Stack", "Wrapper", "Main"]) {
    await page.keyboard.press("Escape");
    await expect(selectedTitle(page)).toHaveText(parent);
  }
  await page.keyboard.press("Escape");
  await expect(page.locator(".maker__right")).toContainText("Page");
  await expect(selectedTitle(page)).toHaveCount(0);
});

test("the bar's Insert menu offers only what fits where the insert would land", async ({ page }) => {
  await buildSamplePage(page);
  await stage(page).locator("h2").click({ force: true });
  await page.locator(".maker-shell__bar").getByRole("menuitem", { name: "Insert", exact: true }).click();
  /* After a heading, inside a Stack inside a Wrapper: a second Wrapper may not go there, text may. */
  await expect(page.getByRole("menuitem", { name: "Wrapper", exact: true })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("menuitem", { name: "Text", exact: true })).not.toHaveAttribute("aria-disabled", "true");
  await page.getByRole("menuitem", { name: "Text", exact: true }).click();
  await expect.poll(() => pageTree(page)).toContain("      Heading\n        \"Heading\"\n      Text");
});

test("the middle button pans the canvas from inside a page, as it does from the empty canvas", async ({ page }) => {
  await buildSamplePage(page);
  const world = page.locator(".maker-canvas__world");
  const at = async () => {
    const [x, y] = (await world.evaluate((el) => getComputedStyle(el).transform)).match(/-?[\d.]+/g)!.slice(4, 6).map(Number);
    return { x: x!, y: y! };
  };
  const before = await at();
  const selectedBefore = await selectedTitle(page).textContent().catch(() => null);
  /* A point well inside the page: on its heading, where a left click would select it. */
  const heading = (await stage(page).locator("h2").boundingBox())!;
  const from = { x: heading.x + heading.width / 2, y: heading.y + heading.height / 2 };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(from.x + 60, from.y + 30, { steps: 8 });
  await page.mouse.move(from.x + 120, from.y + 80, { steps: 8 });
  await page.mouse.up({ button: "middle" });
  const after = await at();
  expect(Math.round(after.x - before.x)).toBe(120);
  expect(Math.round(after.y - before.y)).toBe(80);
  /* A pan is a way of looking: nothing got selected on the way. */
  expect(await selectedTitle(page).textContent().catch(() => null)).toBe(selectedBefore);
});

test("a right click on the page selects what is under it and opens a menu of what can be done to it", async ({ page }) => {
  await buildSamplePage(page);
  await stage(page).locator("h2").click({ button: "right", force: true });
  await expect(selectedTitle(page)).toHaveText("Heading");
  /* The menu is Menu's own popup, portalled to the body like every menu's. */
  const menu = page.getByRole("menu").filter({ has: page.getByRole("menuitem", { name: "Select parent" }) });
  await expect(menu).toBeVisible();
  /* Only what the model would accept is offered: the Heading is its Stack's first child, so there
     is no sibling before it to move past. */
  await expect(menu.getByRole("menuitem", { name: "Copy" })).not.toHaveAttribute("aria-disabled", "true");
  await menu.getByRole("menuitem", { name: "Move", exact: true }).hover();
  await expect(page.getByRole("menuitem", { name: "Move before the previous sibling" })).toHaveAttribute("aria-disabled", "true");
  await menu.getByRole("menuitem", { name: "Delete" }).click();
  await expect.poll(() => pageTree(page)).not.toContain("Heading");
});

test("Delete removes the selection from inside the page, and undo brings it back", async ({ page }) => {
  await buildSamplePage(page);
  await stage(page).locator("h2").click({ force: true });
  await expect(selectedTitle(page)).toHaveText("Heading");
  await page.keyboard.press("Delete");
  await expect.poll(() => pageTree(page)).not.toContain("Heading");
  await bar(page, ["Edit", "Undo"]);
  await expect.poll(() => pageTree(page)).toContain("Heading");
});

test("copy and paste inside the canvas: a copy with fresh identities, where an insert would land", async ({ page }) => {
  await buildSamplePage(page);
  await stage(page).locator("h2").click({ force: true });
  await page.keyboard.press("ControlOrMeta+c");
  /* After the paragraph: the paste lands after the selection, as an insert would. */
  await stage(page).locator("p").first().click({ force: true });
  await page.keyboard.press("ControlOrMeta+v");
  await expect.poll(() => pageTree(page)).toContain("      Text\n        \"Text\"\n      Heading\n        \"Heading\"");
  await expect(selectedTitle(page)).toHaveText("Heading");
  /* Pasted again, from the menu this time: the same copy, any number of times. */
  await stage(page).locator("h2").first().click({ button: "right", force: true });
  await page.getByRole("menu").getByRole("menuitem", { name: "Paste", exact: true }).click();
  await expect.poll(async () => (await pageTree(page)).match(/Heading$/gm)?.length).toBe(3);
});

test("the layers tree folds and unfolds a branch from its chevron, and a click on the name only selects", async ({ page }) => {
  await buildSamplePage(page);
  const tree = (await layers(page)).locator(".maker-outline");
  const row = tree.locator("[data-value]").filter({ hasText: /^Wrapper/ }).first();
  const chevron = row.locator(".sk-tree-view__branch-control .sk-tree-view__branch-indicator").first();
  const stack = tree.getByText("Stack", { exact: true });
  await expect(stack).toBeVisible();
  await chevron.click();
  await expect(stack).toBeHidden();
  await chevron.click();
  await expect(stack).toBeVisible();
  /* The name is for selecting: the branch stays open. */
  await row.locator(".sk-tree-view__branch-text").first().click({ force: true });
  await expect(page.locator(".maker__right .maker-inspector__header h2")).toHaveText("Wrapper");
  await expect(stack).toBeVisible();
});
