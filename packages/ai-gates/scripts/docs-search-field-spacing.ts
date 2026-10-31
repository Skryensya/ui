import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Run against the docs dev server: SearchField's glyphs must be centered with equal edge spacing.
const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const path of ["/components/", "/es/componentes/"]) {
      await page.goto(`http://localhost:4173${path}?q=button`, { waitUntil: "networkidle" });
      const search = page.locator("[data-component-search]");
      const geometry = await search.evaluate((root) => {
        const input = root.querySelector("input")!;
        const field = input.getBoundingClientRect();
        const leading = root.querySelector(".sk-search-field__icon svg")!.getBoundingClientRect();
        const trailing = root.querySelector("[data-sk-search-field-clear] svg")!.getBoundingClientRect();
        const style = getComputedStyle(input);
        return {
          left: leading.left - field.left,
          right: field.right - trailing.right,
          leadingSize: leading.width,
          trailingSize: trailing.width,
          textGap: field.right - parseFloat(style.paddingInlineEnd) - trailing.left,
          center: Math.abs((trailing.top + trailing.bottom - field.top - field.bottom) / 2),
        };
      });
      assert.equal(geometry.leadingSize, 20);
      assert.equal(geometry.trailingSize, 20);
      assert(Math.abs(geometry.left - geometry.right) < 1, `Unequal edge spacing: ${JSON.stringify(geometry)}`);
      assert(geometry.textGap <= -8, "Text must leave at least 8px before the clear glyph");
      assert(geometry.center < 1, "Clear glyph must be vertically centered");
      await search.locator("[data-sk-search-field-clear]").click();
      await expect(search.locator("input")).toHaveValue("");
      await expect(search.locator("input")).toBeFocused();
      console.log(`${path} at ${width}: equal icon sizing, spacing, clearing and focus OK`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
