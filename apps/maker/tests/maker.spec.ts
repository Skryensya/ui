import { expect, test } from "@playwright/test";
import { applySiteAll, randomId, resolveAgentOperations, type MakerSite } from "@skryensya/maker-model";
import { addFromPalette, buildSamplePage, openMaker, pageTree, savedProject, selectInOutline, outlineRow, stage, layers, insert, setWidth, zoomTo, pageCommand, bar } from "./fixtures";

/*
 * The Maker in a real browser (decision 31): a page is built by composing, changed by operations,
 * and nothing the browser measures ever lands in it.
 */


let project = "";

test.beforeEach(async ({ page }) => {
  project = await openMaker(page);
  await buildSamplePage(page);
});

const savedJson = async (page: import("@playwright/test").Page) => JSON.stringify((await savedProject(page, project)).site);

test("the palette builds a real page, rendered by the React binding on the stage", async ({ page }) => {
  await expect.poll(() => pageTree(page)).toBe(
    [
      "Main",
      "  Wrapper",
      "    Stack",
      "      Heading",
      '        "Heading"',
      "      Text",
      '        "Text"',
      "      Inline",
      "        Button.action",
      '          "Button"',
      "        Button.action",
      '          "Button"',
    ].join("\n"),
  );
  await expect(stage(page).locator("h2", { hasText: "Heading" })).toBeVisible();
  await expect(stage(page).getByRole("button", { name: "Button" })).toHaveCount(2);
});

test("dragging on the stage near a block's top edge drops before it, as a move", async ({ page }) => {
  const second = stage(page).getByRole("button", { name: "Button" }).nth(1);
  const from = (await second.boundingBox())!;
  await page.mouse.click(from.x + from.width / 2, from.y + from.height / 2);
  const heading = (await stage(page).locator("h2").boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 20, from.y - 10, { steps: 5 });
  await page.mouse.move(heading.x + 40, heading.y + 4, { steps: 10 });
  await expect(page.locator(".maker-overlay--drop-line")).toBeVisible();
  await page.mouse.up();
  await expect.poll(() => pageTree(page)).toContain("    Stack\n      Button.action\n        \"Button\"\n      Heading");
});

test("the keyboard moves, wraps, unwraps, duplicates and removes, all as operations", async ({ page }) => {
  await selectInOutline(page, "Heading");
  const tree = (await layers(page)).locator(".maker-outline");
  await tree.locator("[role=tree]").focus();

  await page.keyboard.press("Alt+ArrowDown");
  await expect.poll(() => pageTree(page)).toContain("      Text\n        \"Text\"\n      Heading");

  await page.keyboard.press("ControlOrMeta+g");
  await expect.poll(() => pageTree(page)).toContain("      Stack\n        Heading");

  await page.keyboard.press("ControlOrMeta+Shift+g");
  await expect.poll(() => pageTree(page)).not.toContain("      Stack\n        Heading");

  await selectInOutline(page, "Heading");
  await tree.locator("[role=tree]").focus();
  await page.keyboard.press("ControlOrMeta+d");
  await expect.poll(async () => (await pageTree(page)).match(/^\s*Heading$/gm)?.length).toBe(2);

  await page.keyboard.press("Delete");
  await expect.poll(async () => (await pageTree(page)).match(/^\s*Heading$/gm)?.length).toBe(1);

  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(async () => (await pageTree(page)).match(/^\s*Heading$/gm)?.length).toBe(2);
});

test("a move the contract refuses is refused out loud, and the page is untouched", async ({ page }) => {
  await selectInOutline(page, "Wrapper");
  await (await layers(page)).locator(".maker-outline [role=tree]").focus();
  const before = await pageTree(page);
  /* Into the previous sibling: there is none, so no place exists. */
  await page.keyboard.press("Alt+ArrowRight");
  await expect(page.locator(".maker__notice")).not.toBeEmpty();
  await page.waitForTimeout(400);
  expect(await pageTree(page)).toBe(before);
});

test("the inspector offers the contract's options and nothing else, and they reach the stage", async ({ page }) => {
  await selectInOutline(page, "Stack");
  const inspector = page.locator(".maker__right");
  await expect(inspector.getByText("Layout role")).toBeVisible();
  await expect(inspector.getByLabel("Gap", { exact: true })).toBeVisible();
  /* Stack declares no padding and no justify; nothing in the inspector names a length or a position. */
  await expect(inspector.getByLabel("Padding", { exact: true })).toHaveCount(0);
  await expect(inspector.getByLabel("Justify", { exact: true })).toHaveCount(0);
  for (const word of ["Width", "Height", "Top", "Left", "X", "Y", "width", "height", "top", "left", "x", "y"]) {
    await expect(inspector.getByLabel(word, { exact: true })).toHaveCount(0);
  }
  await inspector.getByLabel("Gap", { exact: true }).selectOption("xl");
  await expect(stage(page).locator(".sk-stack").first()).toHaveAttribute("data-gap", "xl");
});

test("fill or fit is offered as the Inline's, and it is left behind when the child moves out", async ({ page }) => {
  await selectInOutline(page, "Button.action");
  const inspector = page.locator(".maker__right");
  await expect(inspector.getByRole("heading", { name: "In this Inline" })).toBeVisible();
  await inspector.getByLabel("Sizing", { exact: true }).selectOption("fill");
  await expect(stage(page).locator('[data-sizing="fill"]')).toHaveCount(1);
  await (await layers(page)).locator(".maker-outline [role=tree]").focus();
  await page.keyboard.press("Alt+ArrowLeft");
  await expect.poll(() => pageTree(page)).toContain("      Inline\n        Button.action\n          \"Button\"\n      Button.action");
  await expect(stage(page).locator('[data-sizing="fill"]')).toHaveCount(0);
});

test("changing the stage width changes the room the browser has, never the page", async ({ page }) => {
  const saved = () => savedJson(page);
  await page.waitForTimeout(400);
  const before = await saved();
  await setWidth(page, 36);
  await expect(page.locator(".maker-artboard[data-active] .maker-stage__frame")).toHaveCSS("inline-size", "576px");
  await expect(page.locator(".maker-stage__meta")).toContainText("compact");
  /* Wider than the column it sits in: it keeps its width and the column scrolls. */
  await setWidth(page, 90);
  await expect(page.locator(".maker-artboard[data-active] .maker-stage__frame")).toHaveCSS("inline-size", "1440px");
  await expect(page.locator(".maker-stage__meta")).toContainText("expanded");
  await page.waitForTimeout(400);
  expect(await saved()).toBe(before);
});

test("edit mode selects instead of activating; interact mode activates; navigation is always blocked", async ({ page }) => {
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Button.navigation");
  const link = stage(page).locator("a[href]").first();
  await link.click();
  await expect(page.locator(".maker__right h2").first()).toHaveText("Button");
  await expect(page.locator(".maker__right .maker-inspector__header")).toContainText("navigation");
  await bar(page, ["View", "Interact mode"]);
  await link.click();
  expect(await page.frames()[1]!.url()).toContain("/stage.html");
});

test("the stored page holds no coordinates, sizes or styles", async ({ page }) => {
  await expect.poll(() => savedJson(page)).toContain("Button.action");
  expect(await savedJson(page)).not.toMatch(/"(style|class|x|y|top|left|width|height|transform|position)"\s*:/);
});

test("export emits React, HTML and the usage tree from the same page, pending or not", async ({ page }) => {
  await bar(page, ["File", "Export…"]);
  const code = page.getByLabel("Exported code");
  await expect(code).toHaveValue(/export function HomePage/);
  await expect(code).toHaveValue(/<Stack/);
  await page.getByRole("radio", { name: "HTML" }).click();
  await expect(code).toHaveValue(/class="sk-stack"/);
  await page.getByRole("radio", { name: "Usage tree" }).click();
  await expect(code).toHaveValue(/"signature": "Wrapper"/);
  await expect(code).not.toHaveValue(/data-maker-node/);
});

test("dragging a row in the outline moves the node, and only where the contract allows", async ({ page }) => {
  const panel = await layers(page);
  const row = (label: string) =>
    panel.locator(".maker-outline :is(.sk-tree-view__branch-text, .sk-tree-view__item-text)", { hasText: outlineRow(label) }).last();
  const text = (await row("Text").boundingBox())!;
  const heading = (await row("Heading").boundingBox())!;
  await page.mouse.move(text.x + 10, text.y + text.height / 2);
  await page.mouse.down();
  await page.mouse.move(text.x + 10, text.y - 10, { steps: 4 });
  /* The upper edge of the Heading row: before it. */
  await page.mouse.move(heading.x + 10, heading.y + 2, { steps: 6 });
  await expect((await layers(page)).locator(".maker-outline .maker-overlay--drop-line")).toBeVisible();
  await page.mouse.up();
  await expect.poll(() => pageTree(page)).toContain("    Stack\n      Text\n        \"Text\"\n      Heading");
});

test("dragging from the palette onto the stage inserts exactly there", async ({ page }) => {
  await (await insert(page)).getByRole("radio", { name: "Components" }).click();
  await selectInOutline(page, "Inline");
  const item = (await insert(page)).locator(".maker-palette").getByRole("button", { name: "Badge", exact: true });
  await item.scrollIntoViewIfNeeded();
  const from = (await item.boundingBox())!;
  const first = (await stage(page).getByRole("button", { name: "Button" }).first().boundingBox())!;
  await page.mouse.move(from.x + 10, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + 30, from.y, { steps: 4 });
  /* The left edge of the first button in the row: before it, inside the Inline. */
  await page.mouse.move(first.x + 3, first.y + first.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect.poll(() => pageTree(page)).toContain("      Inline\n        Badge");
});

test("a section is inserted as a whole subtree with fresh identities", async ({ page }) => {
  /* At the page's top level: this hero brings its own Wrapper, and a Wrapper never sits in one. */
  await selectInOutline(page, "Main");
  await (await insert(page)).getByRole("radio", { name: "Sections" }).click();
  await (await insert(page)).locator(".maker-palette").getByRole("button", { name: /hero with actions/i }).click();
  await expect.poll(() => pageTree(page)).toMatch(/^  Hero$/m);
  const ids = [...(await savedJson(page)).matchAll(/"id":"([^"]+)"/g)].map((m) => m[1]);
  expect(new Set(ids).size).toBe(ids.length);
});

test("an emptied container stays, pending, with a place to drop into", async ({ page }) => {
  await selectInOutline(page, "Inline");
  await (await layers(page)).locator(".maker-outline [role=tree]").focus();
  for (let i = 0; i < 2; i++) {
    await selectInOutline(page, "Button.action");
    await (await layers(page)).locator(".maker-outline [role=tree]").focus();
    await page.keyboard.press("Delete");
  }
  await expect.poll(() => pageTree(page)).toMatch(/Inline$/);
  await expect(stage(page).locator(".sk-inline:empty")).toHaveCount(1);
  /* Removing the last child selects the container it leaves behind. */
  await expect(page.locator(".maker__right").getByRole("heading", { name: "Pending" })).toBeVisible();
});

test("the Maker's own chrome has no accessibility violations", async ({ page }) => {
  const { readFileSync } = await import("node:fs");
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  await page.addScriptTag({ content: readFileSync(require.resolve("axe-core/axe.min.js"), "utf8") });
  await selectInOutline(page, "Stack");
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (context: unknown, options: unknown) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe;
    const result = await axe.run({ exclude: [["iframe"]] }, { resultTypes: ["violations"] });
    return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
  });
  expect(violations).toEqual([]);
});

test("a dialog is held open on the stage while it or something in it is selected, never in the page", async ({ page }) => {
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Dialog");
  const dialog = stage(page).locator("dialog");
  await expect.poll(() => dialog.evaluate((d) => (d as HTMLDialogElement).open)).toBe(true);
  await expect.poll(() => pageTree(page)).toContain("      Dialog");
  expect(await savedJson(page)).not.toMatch(/"open":true/);
  await selectInOutline(page, "Heading");
  await expect.poll(() => dialog.evaluate((d) => (d as HTMLDialogElement).open)).toBe(false);
});

test("the selection toolbar runs the keyboard's gestures, disabled exactly where the contract refuses", async ({ page }) => {
  /* One row of these, over the canvas: the Inspector no longer repeats it. */
  const tools = page.getByRole("toolbar", { name: "Edit actions" });
  await selectInOutline(page, "Wrapper");
  /* The Wrapper is Main's only child: nothing to move past, nothing to indent into. */
  await expect(tools.getByRole("button", { name: "Move after the next sibling" })).toBeDisabled();
  await expect(tools.getByRole("button", { name: "Move into the previous container" })).toBeDisabled();
  await selectInOutline(page, "Heading");
  await tools.getByRole("button", { name: "Move after the next sibling" }).click();
  await expect.poll(() => pageTree(page)).toContain("      Text\n        \"Text\"\n      Heading");
  await page.getByRole("toolbar", { name: "Structure" }).getByRole("button", { name: "Wrap in Inline" }).click();
  await expect.poll(() => pageTree(page)).toContain("      Inline\n        Heading");
});

test("every icon-only control in the chrome has a name", async ({ page }) => {
  const unnamed = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .filter((button) => !button.closest("iframe") && !(button.getAttribute("aria-label") || button.textContent?.trim()))
      .map((button) => button.outerHTML.slice(0, 80)),
  );
  expect(unnamed).toEqual([]);
  /* The bar's commands are words: every title in it names itself with its own text. */
  const titles = page.locator(".maker-shell__bar [role=menubar] [role=menuitem]");
  await expect(titles).toHaveText(["Maker", "File", "Edit", "View", "Page", "Insert", "Help"]);
});

/** Select what is under `from` on the stage, then drag it to a point. */
async function dragOnStage(page: import("@playwright/test").Page, from: { x: number; y: number }, to: { x: number; y: number }) {
  await page.mouse.click(from.x, from.y);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 12, from.y + 12, { steps: 4 });
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

const centre = (box: { x: number; y: number; width: number; height: number }) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

test("a Grid is decided one way or the other, never both: columns, or minColumn", async ({ page }) => {
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Grid");
  const inspector = page.locator(".maker__right");
  await expect(inspector.getByLabel("Columns", { exact: true })).toBeVisible();
  await expect(inspector.getByLabel("Min column", { exact: true })).toHaveCount(0);
  await inspector.getByLabel("Columns", { exact: true }).selectOption("3");
  await inspector.getByRole("radio", { name: "Min column" }).click();
  await expect(inspector.getByLabel("Min column", { exact: true })).toBeVisible();
  await expect(inspector.getByLabel("Columns", { exact: true })).toHaveCount(0);
  const grid = stage(page).locator(".sk-grid").first();
  await expect(grid).toHaveAttribute("data-min-column", "sm");
  /* Pending only because the grid is still empty: never because two options decide the same thing. */
  await expect(inspector).not.toContainText("already decides");
  await inspector.getByRole("radio", { name: /^Columns/ }).click();
  await expect(grid).not.toHaveAttribute("data-min-column", /.*/);
});

test("dragging in a Grid follows the columns the browser laid out", async ({ page }) => {
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Grid");
  await page.locator(".maker__right").getByRole("radio", { name: "Min column" }).click();
  for (let i = 0; i < 3; i++) {
    await selectInOutline(page, "Grid");
    await addFromPalette(page, "Badge");
  }
  await setWidth(page, 72);
  const cells = stage(page).locator(".sk-grid > *");
  await expect(cells).toHaveCount(3);
  const [a, , c] = await Promise.all([0, 1, 2].map(async (i) => (await cells.nth(i).boundingBox())!));
  /* Laid out across: the three cells share a row. */
  expect(Math.abs(a!.y - c!.y)).toBeLessThan(2);
  const ids = () => cells.evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.makerNode));
  const before = await ids();
  await dragOnStage(page, centre(c!), { x: a!.x + 3, y: a!.y + a!.height / 2 });
  await expect.poll(ids).toEqual([before[2], before[0], before[1]]);
});

test("dragging in an Inline that wraps lands between the buttons of the line under the pointer", async ({ page }) => {
  await selectInOutline(page, "Inline");
  for (let i = 0; i < 6; i++) {
    await selectInOutline(page, "Inline");
    await addFromPalette(page, "Button.action");
  }
  await setWidth(page, 36);
  const buttons = stage(page).locator(".sk-inline > *");
  await expect(buttons).toHaveCount(8);
  const boxes = await Promise.all(Array.from({ length: 8 }, async (_, i) => (await buttons.nth(i).boundingBox())!));
  const firstOfSecondLine = boxes.findIndex((box) => box.y > boxes[0]!.y + 4);
  /* It wraps, and the browser chose where. */
  expect(firstOfSecondLine).toBeGreaterThan(0);
  const ids = () => buttons.evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.makerNode));
  const before = await ids();
  const target = boxes[firstOfSecondLine]!;
  await dragOnStage(page, centre(boxes[0]!), { x: target.x + 3, y: target.y + target.height / 2 });
  const expected = [...before.slice(1, firstOfSecondLine), before[0], ...before.slice(firstOfSecondLine)];
  await expect.poll(ids).toEqual(expected);
});

test("pages: add, rename, re-path, link between them, and follow the link in interact mode", async ({ page }) => {
  const pages = (await layers(page)).locator(".maker-pages");
  await page.getByRole("toolbar", { name: "Pages" }).getByRole("button", { name: "Add a page" }).click();
  await expect(pages.getByRole("button", { name: /Page 2/ })).toHaveAttribute("aria-current", "page");
  /* Nothing selected on the new page: the inspector shows the page itself. */
  const settings = page.locator(".maker__right");
  await settings.getByLabel("Page name").fill("About");
  await settings.getByLabel("Page name").press("Enter");
  await settings.getByLabel("Path").fill("/about");
  await settings.getByLabel("Path").press("Enter");
  await expect(pages.getByRole("button", { name: /About/ })).toContainText("/about");
  /* A new page is its own tree: empty, with its own Main. */
  await expect.poll(() => pageTree(page)).toBe("Main");

  /* A bad path is refused out loud and changes nothing. */
  await settings.getByLabel("Path").fill("/About Us");
  await settings.getByLabel("Path").press("Enter");
  await expect(page.locator(".maker__notice")).toContainText("not a page path");
  await expect(pages.getByRole("button", { name: /About/ })).toContainText("/about");

  /* Back home: a link to /about is whole; to a path no page has, it is pending. */
  await pages.getByRole("button", { name: /Home/ }).click();
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Button.navigation");
  const href = page.locator(".maker__right").getByLabel("Link (href)", { exact: true });
  await href.fill("/nowhere");
  await href.press("Enter");
  await expect(page.locator(".maker__right")).toContainText('Links to "/nowhere"');
  await href.fill("/about");
  await href.press("Enter");
  await expect(page.locator(".maker__right")).not.toContainText("Links to");

  await bar(page, ["View", "Interact mode"]);
  await stage(page).locator('a[href="/about"]').click();
  await expect((await layers(page)).locator(".maker-pages").getByRole("button", { name: /About/ })).toHaveAttribute("aria-current", "page");
});

test("page operations are undone like any other gesture", async ({ page }) => {
  await pageCommand(page, "Duplicate this page");
  await expect((await layers(page)).locator(".maker-pages__item")).toHaveCount(2);
  /* The copy is a real page: same tree, new identities. */
  await expect.poll(() => pageTree(page)).toContain("      Heading");
  await pageCommand(page, "Remove this page");
  await expect((await layers(page)).locator(".maker-pages__item")).toHaveCount(1);
  await bar(page, ["Edit", "Undo"]);
  await expect((await layers(page)).locator(".maker-pages__item")).toHaveCount(2);
});

test("export offers the whole site: every page as its own component, and the site file", async ({ page }) => {
  await page.getByRole("toolbar", { name: "Pages" }).getByRole("button", { name: "Add a page" }).click();
  await bar(page, ["File", "Export…"]);
  const code = page.getByLabel("Exported code");
  await page.getByRole("radio", { name: "All pages" }).click();
  await expect(code).toHaveValue(/pages\/index\.tsx[\s\S]*export function HomePage[\s\S]*pages\/page\.tsx[\s\S]*export function PagePage/);
  await page.getByRole("radio", { name: "Site" }).click();
  await expect(code).toHaveValue(/"format": "skryensya-maker-site"/);
});

test("an agent's change to the project arrives live, as one step the person can undo", async ({ page }) => {
  await expect.poll(() => savedJson(page)).toContain("Button.action");

  /* What the MCP's maker_apply does: resolve an agent's operations, apply, save on top of the revision. */
  const { revision, site } = (await savedProject(page, project)) as unknown as { revision: number; site: MakerSite };
  const home = site.pages[0]!;
  const stack = JSON.stringify(home.root).match(/"id":"([^"]+)","contract":"layout","signature":"Stack"/)![1]!;
  const resolved = resolveAgentOperations(site, [{ type: "page", page: home.id, operations: [{ type: "setOption", node: stack, name: "gap", value: "xl" }] }], randomId);
  if (!resolved.ok) throw new Error(resolved.reason);
  const applied = applySiteAll(site, resolved.value);
  if (!applied.ok) throw new Error(applied.reason);
  const put = await page.request.put(`/api/projects/${project}`, { data: { baseRevision: revision, site: applied.site } });
  expect(put.status()).toBe(200);

  await expect(stage(page).locator(".sk-stack").first()).toHaveAttribute("data-gap", "xl");
  await expect(page.locator(".maker__notice")).toContainText("Someone else changed this project");
  await bar(page, ["Edit", "Undo"]);
  await expect(stage(page).locator(".sk-stack").first()).not.toHaveAttribute("data-gap", "xl");
});

test("the person's changes are saved to the project for an agent to read", async ({ page }) => {
  await selectInOutline(page, "Stack");
  await page.locator(".maker__right").getByLabel("Gap", { exact: true }).selectOption("lg");
  await expect.poll(() => savedJson(page)).toMatch(/"gap":"lg"/);
});

test("inserting after a heading, a paragraph or a button lands below it, so a sequence needs no reselecting", async ({ page }) => {
  await selectInOutline(page, "Heading");
  await expect((await insert(page)).locator(".maker-palette")).toContainText("after Heading, in Stack");
  await addFromPalette(page, "Text");
  await addFromPalette(page, "Text");
  await expect.poll(() => pageTree(page)).toMatch(/Heading\n\s+"Heading"\n\s+Text\n\s+"Text"\n\s+Text\n\s+"Text"\n\s+Text/);
});

test("double-clicking text on the stage selects it and puts the caret in its text", async ({ page }) => {
  await stage(page).locator("h2").dblclick();
  await expect(page.locator(".maker__right h2").first()).toHaveText("Heading");
  const field = page.locator(".maker__right").getByLabel("Text", { exact: true });
  await expect(field).toBeFocused();
  await page.keyboard.type("Café Aurora");
  await page.keyboard.press("Enter");
  await expect(stage(page).locator("h2")).toHaveText("Café Aurora");
});

test("the canvas shows every page as an artboard at its exact CSS width, and zooming never touches the site", async ({ page }) => {
  const saved = () => savedJson(page);
  await (await layers(page)).getByRole("button", { name: /add a page/i }).click();
  await expect(page.locator(".maker-artboard")).toHaveCount(2);
  await page.waitForTimeout(400);
  const before = await saved();
  await setWidth(page, 90);
  await expect(page.locator(".maker-artboard[data-active] .maker-stage__frame")).toHaveCSS("inline-size", "1440px");
  /* The iframe lays the page out at 1440 CSS px, whatever the zoom shows it at. */
  expect(await stage(page).locator("html").evaluate((html) => html.clientWidth)).toBe(1440);
  const zoom = page.locator(".maker-shell__bar .sk-app-bar__status .sk-app-bar__trigger").last();
  const at = await zoom.textContent();
  await zoomTo(page, "Zoom in");
  await expect(zoom).not.toHaveText(at!);
  await zoomTo(page, "Fit every page");
  const canvas = (await page.locator(".maker-canvas").boundingBox())!;
  for (const board of await page.locator(".maker-artboard .maker-stage__frame").all()) {
    const box = (await board.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(canvas.x);
    expect(box.x + box.width).toBeLessThanOrEqual(canvas.x + canvas.width + 1);
  }
  await page.waitForTimeout(400);
  expect(await saved()).toBe(before);
});
