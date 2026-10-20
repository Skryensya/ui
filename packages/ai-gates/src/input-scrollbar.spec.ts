import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { readComponentCss } from "./fixtures.js";

const inputCss = readComponentCss("input", import.meta.url);
const scrollbarCss = readFileSync(fileURLToPath(new URL("../../core/css/patterns/scrollbar.css", import.meta.url)), "utf8");

test("a scrolling textarea keeps the global scrollbar track inside its own surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 300 });
  await page.setContent(`
    <html class="sk-scrollbar">
      <head>
        <style>
          :root {
            --space-inset-xs: 4px;
            --space-inset-md: 12px;
            --size-control-md: 44px;
            --size-touch-target: 44px;
            --color-bg-surface-sunken: #f2f2f2;
            --color-border-default: #888;
            --color-border-strong: #555;
            --color-text-primary: #111;
            --color-text-tertiary: #777;
            --color-text-disabled: #888;
            --color-action-disabled: #ddd;
            --color-border-subtle: #ddd;
            --color-border-danger: #c00;
            --radius-control: 8px;
            --font-size-body: 16px;
            --font-line-height-body: 1.5;
          }
          ${inputCss}
          ${scrollbarCss}
        </style>
      </head>
      <body>
        <textarea class="sk-input" data-auto-size>${"A realistic support note with enough content to scroll inside the field.\n".repeat(24)}</textarea>
      </body>
    </html>
  `);

  const state = await page.locator("textarea.sk-input").evaluate((textarea) => {
    const style = getComputedStyle(textarea);
    return {
      hasOverflow: textarea.scrollHeight > textarea.clientHeight,
      scrollbarColor: style.scrollbarColor,
      trackBackground: getComputedStyle(textarea, "::-webkit-scrollbar-track").backgroundColor,
    };
  });

  expect(state.hasOverflow).toBe(true);
  expect(state.scrollbarColor).toContain("rgba(0, 0, 0, 0)");
  expect(state.trackBackground).toBe("rgba(0, 0, 0, 0)");
});
