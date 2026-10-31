import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chromium, expect } from "@playwright/test";

const sheets = ["date-picker", "calendar"].map((name) =>
  readFileSync(new URL(`../../core/css/components/${name}.css`, import.meta.url), "utf8").replace(/@import[^;]+;/g, ""),
);
const browser = await chromium.launch();
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    for (const order of [sheets, [...sheets].reverse()]) {
      await page.setContent(`<style>${order.join("\n")}</style>
        <div class="sk-date-picker__positioner">
          <div id="closed" class="sk-date-picker__content sk-calendar" data-state="closed" hidden>Closed</div>
          <div id="unmounted" class="sk-date-picker__content sk-calendar">Before mount</div>
          <div id="open" class="sk-date-picker__content sk-calendar" data-state="open">Open</div>
        </div>
        <div id="inline" class="sk-calendar">Inline calendar</div>`);
      await expect(page.locator("#closed")).toHaveCSS("display", "none");
      await expect(page.locator("#unmounted")).toHaveCSS("display", "none");
      await expect(page.locator("#open")).toBeVisible();
      await expect(page.locator("#inline")).toBeVisible();
    }
    // Run against the real docs dev server as well, including the actual enhancer and dismissal.
    await page.goto("http://localhost:4173/components/date-picker", { waitUntil: "networkidle" });
    const popup = page.locator(".sk-date-picker__content").first();
    const control = page.locator(".sk-date-picker").filter({ has: page.locator(".sk-date-picker__content") }).first();
    const trigger = control.locator(".sk-date-picker__trigger");
    await expect(popup).toHaveAttribute("data-state", "closed");
    await expect(popup).toBeHidden();
    await trigger.click();
    await expect(popup).toBeVisible();
    for (const view of ["day", "month", "year"]) {
      await expect(popup.locator(`table[data-view="${view}"]`)).toBeVisible();
      const centerOffset = await popup.locator(".sk-calendar__view-trigger").evaluate((button) => {
        const face = button.getBoundingClientRect();
        const label = button.querySelector(".sk-button__label")!.getBoundingClientRect();
        return Math.abs((face.top + face.bottom - label.top - label.bottom) / 2);
      });
      assert(centerOffset < 1, `${view} label must be vertically centered in its button`);
      await popup.locator(".sk-calendar__view-trigger").click();
    }
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await popup.locator('.sk-calendar__cell-trigger:not([disabled]):not([aria-disabled="true"])').first().click();
    await expect(popup).toBeHidden();
    assert.notEqual(await control.locator("input").first().inputValue(), "");
    await trigger.click();
    await page.locator(".dimensions__brand").click();
    await expect(popup).toBeHidden();
    console.log(`${width}px: both stylesheet orders, initial state, open, Escape, selection and outside click OK`);
    await page.close();
  }
} finally {
  await browser.close();
}
