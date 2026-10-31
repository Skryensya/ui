import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Run against the docs dev server. A hidden Toc must not hide or block BackToTop.
const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const path of ["/components/", "/foundations/", "/es/componentes/", "/es/fundamentos/"]) {
      await page.goto(`http://localhost:4173${path}`, { waitUntil: "networkidle" });
      const button = page.locator("body > [data-sk-back-to-top]");
      await expect(button).toHaveCount(1);
      await expect(button).toBeHidden();
      await page.evaluate(() => window.scrollTo(0, 900));
      await expect(button).toBeVisible();
      await expect(button).toHaveCSS("position-anchor", "normal");
      // A visibility assertion alone misses anchor-positioned elements the browser skips painting.
      await button.click({ timeout: 3000 });
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
      await expect(page.locator("#main-content")).toBeFocused();
      await expect(button).toBeHidden();
      assert.equal(await page.locator(".docs-document-pair > .sk-toc[data-empty]").count(), 1);
      console.log(`${path} at ${width}: BackToTop reveal, click, focus and hide OK`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
