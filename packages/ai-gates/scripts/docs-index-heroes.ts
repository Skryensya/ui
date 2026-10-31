import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

// Run against the docs dev server: both indexes must share the internal pages' compact sticky hero.
const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const path of ["/components/", "/foundations/", "/es/componentes/", "/es/fundamentos/"]) {
      await page.goto(`http://localhost:4173${path}`, { waitUntil: "networkidle" });
      const hero = page.locator(".docs-index-hero");
      assert.equal(await hero.count(), 1);
      assert.equal(await page.locator(".docs-component-hero__eyebrow, .docs-component-hero-tabs").count(), 0);
      const expandedFont = await hero.locator("h1").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      await page.evaluate(() => window.scrollTo(0, 500));
      // Scroll timelines settle on the next rendering frames.
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
      const pinned = await hero.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { top: rect.top, height: rect.height, inset: parseFloat(getComputedStyle(el).top), font: parseFloat(getComputedStyle(el.querySelector("h1")!).fontSize) };
      });
      assert(Math.abs(pinned.top - pinned.inset) < 2, `${path} at ${width}: hero must pin below navbar`);
      assert(pinned.height <= 80, `${path} at ${width}: sticky hero must be compact`);
      assert(pinned.font < expandedFont, `${path} at ${width}: title must shrink`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      console.log(`${path} at ${width}: compact sticky hero OK (${Math.round(pinned.height)}px)`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
