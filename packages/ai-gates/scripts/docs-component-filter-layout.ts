import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Run against the docs dev server: clearing filters must not move the results or the action itself.
const browser = await chromium.launch();
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const path of ["/components/", "/es/componentes/"]) {
      await page.goto(`http://localhost:4173${path}`, { waitUntil: "networkidle" });
      const clear = page.locator("[data-component-clear]");
      const results = page.locator("#component-results");
      const input = page.locator("[data-component-search] input");
      const measure = () => page.evaluate(() => {
        const action = document.querySelector("[data-component-clear]")!.getBoundingClientRect();
        return [action.x, action.y, action.width, action.height, document.querySelector("#component-results")!.getBoundingClientRect().top];
      });
      const initial = await measure();
      await expect(clear).toBeHidden();
      await page.locator("[data-component-category] button").nth(1).click();
      await expect(clear).toBeVisible();
      await expect(clear.locator('svg[data-icon="close"]')).toHaveCount(1);
      assert.deepEqual(await measure(), initial, `${path} at ${width}: selecting a category must not move layout`);
      await clear.click();
      await expect(clear).toBeHidden();
      await expect(input).toBeFocused();
      assert.deepEqual(await measure(), initial, `${path} at ${width}: clearing must not move layout`);
      await input.fill("button");
      await expect(clear).toBeVisible();
      assert.deepEqual(await measure(), initial, `${path} at ${width}: typing must not move layout`);
      await clear.click();
      await expect(results.locator("[data-component-entry]:visible")).toHaveCount(120);
      await input.fill("zzzzzznotacomponent");
      await expect(page.locator("[data-component-empty]")).toBeVisible();
      await expect(results).toBeHidden();
      const emptyHeight = await page.locator("[data-component-empty]").evaluate((el) => el.getBoundingClientRect().height);
      assert(emptyHeight >= 320, `${path} at ${width}: empty container must have breathing room`);
      await expect(page.locator("[data-component-empty]")).toHaveCSS("border-top-width", "1px");
      await expect(page.locator("[data-component-empty] button")).toHaveCount(0);
      await expect(page.locator("[data-component-clear]")).toHaveCount(1);
      await clear.click();
      await expect(page.locator("[data-component-empty]")).toBeHidden();
      await expect(results.locator("[data-component-entry]:visible")).toHaveCount(120);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`${path} at ${width}: clear icon, stable layout, reset and focus OK`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
