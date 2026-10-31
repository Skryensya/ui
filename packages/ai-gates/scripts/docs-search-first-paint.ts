import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

/* Run against the docs dev server. No JS: waiting for mountIcons would hide this regression. */
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ javaScriptEnabled: false });
  for (const path of ["/components/", "/es/componentes/"]) {
    const page = await context.newPage();
    await page.goto(`http://localhost:4173${path}`, { waitUntil: "load" });
    const search = page.locator("[data-component-search]");
    assert.equal(await search.locator(".sk-search-field__icon svg[data-icon='search']").count(), 1, `${path}: magnifier must exist before JavaScript`);
    assert.equal(await search.locator("[data-sk-search-field-clear] svg[data-icon='close']").count(), 1, `${path}: clear icon must also be server-rendered`);
    assert.equal(await search.locator("[data-sk-icon]").count(), 0, `${path}: no empty client-side icon placeholders`);
    assert.ok(await search.locator(".sk-search-field__icon svg").isVisible(), `${path}: magnifier must be visible`);
    await page.close();
  }
  console.log("Docs search icons are rendered and visible without JavaScript in both locales.");
} finally {
  await browser.close();
}
