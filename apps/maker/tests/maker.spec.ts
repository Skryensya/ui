import { expect, test } from "@playwright/test";
import { addFromPalette, buildSamplePage, openMaker, pageTree, selectInOutline } from "./fixtures";

/*
 * The Maker in a real browser (decision 31): a page is built by composing, changed by operations,
 * and nothing the browser measures ever lands in it.
 */

const stage = (page: import("@playwright/test").Page) => page.frameLocator("iframe.maker-stage__iframe");

test.beforeEach(async ({ page }) => {
  await openMaker(page);
  await buildSamplePage(page);
});

test("the palette builds a real page, rendered by the React binding on the stage", async ({ page }) => {
  expect(await pageTree(page)).toBe(
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
  const tree = page.locator(".maker-outline");
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
  await page.locator(".maker-outline [role=tree]").focus();
  const before = await pageTree(page);
  /* Into the previous sibling: there is none, so no place exists. */
  await page.keyboard.press("Alt+ArrowRight");
  await expect(page.locator(".maker__notice")).not.toBeEmpty();
  expect(await pageTree(page)).toBe(before);
});

test("the inspector offers the contract's options and nothing else, and they reach the stage", async ({ page }) => {
  await selectInOutline(page, "Stack");
  const inspector = page.locator(".maker__right");
  await expect(inspector.getByText("Layout role")).toBeVisible();
  await expect(inspector.getByLabel("gap", { exact: true })).toBeVisible();
  /* Stack declares no padding and no justify; nothing in the inspector names a length or a position. */
  await expect(inspector.getByLabel("padding", { exact: true })).toHaveCount(0);
  await expect(inspector.getByLabel("justify", { exact: true })).toHaveCount(0);
  for (const word of ["width", "height", "top", "left", "x", "y"]) {
    await expect(inspector.getByLabel(word, { exact: true })).toHaveCount(0);
  }
  await inspector.getByLabel("gap", { exact: true }).selectOption("xl");
  await expect(stage(page).locator(".sk-stack").first()).toHaveAttribute("data-gap", "xl");
});

test("fill or fit is offered as the Inline's, and it is left behind when the child moves out", async ({ page }) => {
  await selectInOutline(page, "Button.action");
  const inspector = page.locator(".maker__right");
  await expect(inspector.getByRole("heading", { name: "In this Inline" })).toBeVisible();
  await inspector.getByLabel("sizing", { exact: true }).selectOption("fill");
  await expect(stage(page).locator('[data-sizing="fill"]')).toHaveCount(1);
  await page.locator(".maker-outline [role=tree]").focus();
  await page.keyboard.press("Alt+ArrowLeft");
  await expect.poll(() => pageTree(page)).toContain("      Inline\n        Button.action\n          \"Button\"\n      Button.action");
  await expect(stage(page).locator('[data-sizing="fill"]')).toHaveCount(0);
});

test("changing the stage width changes the room the browser has, never the page", async ({ page }) => {
  const saved = () => page.evaluate(() => localStorage.getItem("skryensya-maker:page"));
  const before = await saved();
  await page.getByRole("radio", { name: "36rem" }).click();
  await expect(page.locator(".maker-stage__frame")).toHaveCSS("inline-size", "576px");
  await expect(page.locator(".maker-stage__meta")).toContainText("compact");
  await page.getByRole("radio", { name: "72rem" }).click();
  await expect(page.locator(".maker-stage__meta")).toContainText("expanded");
  expect(await saved()).toBe(before);
});

test("edit mode selects instead of activating; interact mode activates; navigation is always blocked", async ({ page }) => {
  await selectInOutline(page, "Stack");
  await addFromPalette(page, "Button.navigation");
  const link = stage(page).locator("a[href]").first();
  await link.click();
  await expect(page.locator(".maker__right h2").first()).toHaveText("Button.navigation");
  await page.getByRole("radio", { name: "Interact" }).click();
  await link.click();
  expect(await page.frames()[1]!.url()).toContain("/stage.html");
});

test("the stored page holds no coordinates, sizes or styles", async ({ page }) => {
  const saved = (await page.evaluate(() => localStorage.getItem("skryensya-maker:page")))!;
  expect(saved).not.toMatch(/"(style|class|x|y|top|left|width|height|transform|position)"\s*:/);
});

test("export emits React, HTML and the usage tree from the same page, pending or not", async ({ page }) => {
  await page.getByRole("button", { name: "Export" }).click();
  const code = page.getByLabel("Exported code");
  await expect(code).toHaveValue(/export function Page/);
  await expect(code).toHaveValue(/<Stack/);
  await page.getByRole("radio", { name: "HTML" }).click();
  await expect(code).toHaveValue(/class="sk-stack"/);
  await page.getByRole("radio", { name: "Usage tree" }).click();
  await expect(code).toHaveValue(/"signature": "Wrapper"/);
  await expect(code).not.toHaveValue(/data-maker-node/);
});

test("dragging a row in the outline moves the node, and only where the contract allows", async ({ page }) => {
  const row = (label: string) =>
    page.locator(".maker-outline :is(.sk-tree-view__branch-text, .sk-tree-view__item-text)", { hasText: new RegExp(`^${label}$`) }).last();
  const text = (await row("Text").boundingBox())!;
  const heading = (await row("Heading").boundingBox())!;
  await page.mouse.move(text.x + 10, text.y + text.height / 2);
  await page.mouse.down();
  await page.mouse.move(text.x + 10, text.y - 10, { steps: 4 });
  /* The upper edge of the Heading row: before it. */
  await page.mouse.move(heading.x + 10, heading.y + 2, { steps: 6 });
  await expect(page.locator(".maker-outline .maker-overlay--drop-line")).toBeVisible();
  await page.mouse.up();
  await expect.poll(() => pageTree(page)).toContain("    Stack\n      Text\n        \"Text\"\n      Heading");
});

test("dragging from the palette onto the stage inserts exactly there", async ({ page }) => {
  await page.getByRole("radio", { name: "Components" }).click();
  await selectInOutline(page, "Inline");
  const item = page.locator(".maker-palette").getByRole("button", { name: "Badge", exact: true });
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
  await page.getByRole("radio", { name: "Sections" }).click();
  await page.locator(".maker-palette").getByRole("button", { name: /hero with actions/i }).click();
  await expect.poll(() => pageTree(page)).toMatch(/^  Hero$/m);
  const ids = await page.evaluate(() => {
    const saved = localStorage.getItem("skryensya-maker:page")!;
    return [...saved.matchAll(/"id": "([^"]+)"/g)].map((m) => m[1]);
  });
  expect(new Set(ids).size).toBe(ids.length);
});

test("an emptied container stays, pending, with a place to drop into", async ({ page }) => {
  await selectInOutline(page, "Inline");
  await page.locator(".maker-outline [role=tree]").focus();
  for (let i = 0; i < 2; i++) {
    await selectInOutline(page, "Button.action");
    await page.locator(".maker-outline [role=tree]").focus();
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
  expect(await pageTree(page)).toContain("      Dialog");
  const saved = (await page.evaluate(() => localStorage.getItem("skryensya-maker:page")))!;
  expect(saved).not.toMatch(/"open": true/);
  await selectInOutline(page, "Heading");
  await expect.poll(() => dialog.evaluate((d) => (d as HTMLDialogElement).open)).toBe(false);
});
