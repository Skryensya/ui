import { expect, test } from "@playwright/test";
import { addFromPalette, openMaker, savedProject } from "./fixtures";

/* The options an edit most often touches sit over the selection: no trip to the Inspector for them. */
test("a button's tone and variant are changed from the bar over it, and nothing else moves", async ({ page }) => {
  await openMaker(page);
  await addFromPalette(page, "Button.action");
  const bar = page.getByRole("toolbar", { name: "Button.action options" });
  await expect(bar).toBeVisible();
  const variant = bar.getByRole("combobox", { name: "Variant" });
  await variant.selectOption("ghost");
  await expect.poll(async () => JSON.stringify((await savedProject(page)).site)).toContain('"variant":"ghost"');
  await bar.getByRole("combobox", { name: "Tone" }).selectOption("danger");
  await expect.poll(async () => JSON.stringify((await savedProject(page)).site)).toContain('"tone":"danger"');
  /* Back to the default removes the option instead of storing it. */
  const defaultValue = await variant.evaluate((select) => (select as HTMLSelectElement).options[0]!.value);
  await variant.selectOption(defaultValue);
  await expect.poll(async () => JSON.stringify((await savedProject(page)).site)).not.toContain('"variant"');
});

test("the bar goes away with the selection, and is not offered for several at once", async ({ page }) => {
  await openMaker(page);
  await addFromPalette(page, "Button.action");
  await expect(page.getByRole("toolbar", { name: "Button.action options" })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("toolbar", { name: "Button.action options" })).toHaveCount(0);
});
