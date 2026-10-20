import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";
import { readComponentCss } from "./fixtures.js";

const anchoredCss = readFileSync(
  fileURLToPath(new URL("../../core/css/patterns/anchored.css", import.meta.url)),
  "utf8",
);
const tooltipCss = readComponentCss("tooltip", import.meta.url);
const copy = "Invoices are generated on the first business day of each month. Changes to the billing contact take effect on the next invoice and are also sent to the account security administrators.";

test("long tooltip copy wraps within its inline-size limit", async ({ page }) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.setContent(`
      <style>
        :root { --space-inset-md: 16px; --sk-tooltip-max-inline-size: 18rem; }
        ${tooltipCss}
        ${anchoredCss}
      </style>
      <div class="sk-tooltip">
        <div class="sk-tooltip__positioner sk-anchored" style="min-width: max-content; --x: 8px; --y: 8px">
          <div class="sk-tooltip__content" data-state="open" role="tooltip">${copy}</div>
        </div>
      </div>
    `);

    const widthPx = await page.locator(".sk-tooltip__positioner").evaluate((node) => node.getBoundingClientRect().width);
    expect(widthPx).toBeLessThanOrEqual(Math.min(288, width - 32));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});
