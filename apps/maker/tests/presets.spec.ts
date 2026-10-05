import { expect, test, type Page } from "@playwright/test";
import { insert, openMaker, pageTree, savedProject } from "./fixtures";

/*
 * PRESETS OF ONE COMPONENT, in the palette: a component opens to the ways it is usually set up, each one
 * arriving in the wrapper it usually sits in, and "Wrap in" overrides that for everything inserted.
 */
const palette = async (page: Page) => (await insert(page)).locator(".maker-palette");
const expand = async (page: Page, signature: string) => (await palette(page)).getByRole("button", { name: new RegExp(`^${signature.replace(".", "\\.")}: \\d+ presets$`) }).click();

test.beforeEach(async ({ page }) => {
  await openMaker(page);
});

test("a component opens to its presets, and a pair arrives in its own Inline", async ({ page }) => {
  await expand(page, "Button.action");
  const presets = (await palette(page)).getByRole("list", { name: "Button.action presets" });
  await expect(presets.getByRole("button")).toHaveCount(6);
  await presets.getByRole("button", { name: /Primary and secondary/ }).click();
  await expect.poll(() => pageTree(page)).toBe('Main\n  Inline\n    Button.action\n      "Save changes"\n    Button.action\n      "Cancel"');
});

test("a preset on its own arrives bare, with the options that make it what it is", async ({ page }) => {
  await expand(page, "Button.action");
  await (await palette(page)).getByRole("list", { name: "Button.action presets" }).getByRole("button", { name: /^Destructive/ }).click();
  await expect.poll(() => pageTree(page)).toBe('Main\n  Button.action\n    "Delete"');
  const { site } = await savedProject(page);
  const main = site.pages[0]!.root;
  const button = (main.slots!.children!.children! as { signature?: string; options?: Record<string, unknown> }[])[0]!;
  expect(button.options).toMatchObject({ variant: "solid", tone: "danger" });
});

test('"Wrap in" puts whatever is inserted inside the chosen wrapper', async ({ page }) => {
  await (await palette(page)).getByText("Wrapping", { exact: true }).click();
  await (await palette(page)).getByLabel("Wrap in").selectOption("box");
  await expand(page, "Button.action");
  await (await palette(page)).getByRole("list", { name: "Button.action presets" }).getByRole("button", { name: /^Primary The one action/ }).click();
  await expect.poll(() => pageTree(page)).toBe('Main\n  Box\n    Button.action\n      "Save changes"');
});

test("the default insert follows the same wrapper choice", async ({ page }) => {
  await (await palette(page)).getByText("Wrapping", { exact: true }).click();
  await (await palette(page)).getByLabel("Wrap in").selectOption("stack");
  await (await palette(page)).getByRole("button", { name: "Badge", exact: true }).click();
  await expect.poll(() => pageTree(page)).toMatch(/^Main\n  Stack\n    Badge/);
});

test("searching a preset's name finds its component and opens it", async ({ page }) => {
  await (await palette(page)).getByRole("searchbox", { name: "Search the catalogue" }).fill("icon only");
  const presets = (await palette(page)).getByRole("list", { name: "Button.action presets" });
  await expect(presets.getByRole("button", { name: /Icon only/ })).toBeVisible();
});
