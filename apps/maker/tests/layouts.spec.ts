import { expect, test } from "@playwright/test";
import { choose, layers, openMaker, savedProject, stage } from "./fixtures";

/*
 * A LAYOUT IS A FRAME EVERY PAGE SITS IN, edited once: a header and a footer (and more) that a page, new ones too, has
 * without anyone placing them. These walk it as a person does, through the Pages panel and the canvas.
 */
test.beforeEach(async ({ page }) => {
  await openMaker(page);
  /* The pages and layouts live on the Layers tab; an empty project may open on Insert. */
  await layers(page);
});

const pagesTools = (page: import("@playwright/test").Page) => page.getByRole("toolbar", { name: "Pages" });
const layoutsTools = (page: import("@playwright/test").Page) => page.getByRole("toolbar", { name: "Layouts" });

test("adding a layout puts its header and footer around every page, new pages included, without making the layout's nodes selectable there", async ({ page }) => {
  await layoutsTools(page).getByRole("button", { name: "Add a layout" }).click();
  const list = (await layers(page)).getByRole("list", { name: "Layouts of the site" });
  await expect(list).toContainText("Layout 1");
  /* The first layout is the site's default. */
  await expect(list).toContainText("default for new pages");
  /* It is a board of its own, with the header and the footer on it. */
  await expect(page.locator(".maker-artboard[data-layout]")).toHaveCount(1);
  await expect(stage(page).getByText("Your site")).toBeVisible({ timeout: 15_000 });
  await expect(stage(page).getByText("Made with Skryensya.")).toBeVisible({ timeout: 15_000 });

  /* Open the first page: the same header and footer are on it. */
  await (await layers(page)).getByRole("list", { name: "Pages of the site" }).getByRole("button").first().click();
  await expect(stage(page).getByText("Your site")).toBeVisible({ timeout: 15_000 });
  await expect(stage(page).getByText("Made with Skryensya.")).toBeVisible({ timeout: 15_000 });
  /* Its layout nodes are drawn, not selectable: they are changed in the layout. */
  await expect(stage(page).locator("[data-maker-layout]").first()).toBeVisible({ timeout: 15_000 });
  expect(await stage(page).locator("[data-maker-layout][data-maker-node]").count()).toBe(0);

  /* A page made afterwards has them with no setup. */
  await pagesTools(page).getByRole("button", { name: "Add a page" }).click();
  await expect(stage(page).getByText("Your site")).toBeVisible({ timeout: 15_000 });
  await expect(stage(page).getByText("Made with Skryensya.")).toBeVisible({ timeout: 15_000 });
  /* Added from the layout's own board, it goes after the pages, not before them. */
  const names = await (await layers(page)).getByRole("list", { name: "Pages of the site" }).getByRole("button").allInnerTexts();
  expect(names[0]).toContain("Home");
});

test("a page can choose no layout, and one undo gives it back", async ({ page }) => {
  await layoutsTools(page).getByRole("button", { name: "Add a layout" }).click();
  await pagesTools(page).getByRole("button", { name: "Add a page" }).click();
  await expect(stage(page).getByText("Your site")).toBeVisible({ timeout: 15_000 });
  const inspector = page.locator(".maker__right");
  await choose(page, inspector, "Layout", "None");
  await expect(stage(page).getByText("Your site")).toHaveCount(0, { timeout: 15_000 });
  await expect.poll(async () => JSON.stringify((await savedProject(page)).site.pages.map((entry) => (entry as { layout?: string }).layout))).toContain("none");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(stage(page).getByText("Your site")).toBeVisible({ timeout: 15_000 });
});

test("removing the layout takes the frame off every page and leaves the pages", async ({ page }) => {
  await layoutsTools(page).getByRole("button", { name: "Add a layout" }).click();
  await page.locator(".maker__right").getByRole("button", { name: "Remove this layout" }).click();
  await expect(page.locator(".maker-artboard[data-layout]")).toHaveCount(0);
  await (await layers(page)).getByRole("list", { name: "Pages of the site" }).getByRole("button").first().click();
  await expect(stage(page).getByText("Your site")).toHaveCount(0, { timeout: 15_000 });
  const saved = (await savedProject(page)).site as { layouts?: unknown[]; defaultLayout?: string; pages: unknown[] };
  expect(saved.layouts ?? []).toHaveLength(0);
  expect(saved.defaultLayout).toBeUndefined();
  expect(saved.pages.length).toBeGreaterThan(0);
});

test("a layout's own board says what its Main is and what it is, so the first time is not a guess", async ({ page }) => {
  await layoutsTools(page).getByRole("button", { name: "Add a layout" }).click();
  /* The Main in a layout is the outlet, not a section: the layers say where the page goes. */
  await expect((await layers(page)).locator(".maker-outline")).toContainText("Main · where the page goes");
  /* With nothing selected the Inspector names what is open: a layout, not a page. */
  await expect(page.locator(".maker__right").getByRole("heading", { name: "Layout", exact: true })).toBeVisible();
  await (await layers(page)).getByRole("list", { name: "Pages of the site" }).getByRole("button").first().click();
  await expect(page.locator(".maker__right").getByRole("heading", { name: "Page", exact: true })).toBeVisible();
  await expect((await layers(page)).locator(".maker-outline")).not.toContainText("where the page goes");
});

test("a page inside a layout is not offered a second header or footer, but the layout itself is", async ({ page }) => {
  const sections = async () => {
    await page.locator(".maker__left").getByRole("radio", { name: "Insert", exact: true }).click();
    await page.locator(".maker__left").getByRole("radio", { name: "Sections", exact: true }).click();
    return page.locator(".maker-palette");
  };
  /* No layout yet: a page is offered a navigation bar. */
  await expect(await sections()).toContainText("Navigation bar");
  await layers(page);
  await layoutsTools(page).getByRole("button", { name: "Add a layout" }).click();
  await (await layers(page)).getByRole("list", { name: "Pages of the site" }).getByRole("button").first().click();
  const onPage = await sections();
  await expect(onPage).not.toContainText("Navigation bar");
  await expect(onPage).toContainText("already has the header and the footer");
  /* Editing the layout itself, they are offered again: that is where a header is made. */
  await (await layers(page)).getByRole("list", { name: "Layouts of the site" }).getByRole("button").first().click();
  const onLayout = await sections();
  await expect(onLayout).toContainText("Navigation bar");
  await expect(onLayout).not.toContainText("already has");
});

test("playing the site shows each page inside its layout, as it will be published", async ({ page }) => {
  await layoutsTools(page).getByRole("button", { name: "Add a layout" }).click();
  await (await layers(page)).getByRole("list", { name: "Pages of the site" }).getByRole("button").first().click();
  await page.getByRole("button", { name: "Play site" }).click();
  const played = page.frameLocator(".maker-play__frame");
  await expect(played.getByText("Your site")).toBeVisible({ timeout: 15_000 });
  await expect(played.getByText("Made with Skryensya.")).toBeVisible();
});
