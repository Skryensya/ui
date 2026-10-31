import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Run against the docs dev server: exercise the actual range picker, not a static calendar mock.
const browser = await chromium.launch();
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width === 320 ? 667 : 1000 } });
    for (const path of ["/components/date-picker", "/es/componentes/date-picker"]) {
      await page.goto(`http://localhost:4173${path}`, { waitUntil: "networkidle" });
      const nativeField = page.locator('.sk-date-picker:not([data-sk-date-picker]) .sk-date-picker__control').filter({ has: page.locator('input[type="date"]') }).first();
      const nativeLayout = await nativeField.evaluate((control) => ({
        columns: getComputedStyle(control).gridTemplateColumns.trim().split(/\s+/).length,
        inputWidth: control.querySelector("input")!.getBoundingClientRect().width,
        controlWidth: control.clientWidth,
      }));
      assert.equal(nativeLayout.columns, 1, "Native date field must not reserve enhanced action columns");
      assert(nativeLayout.inputWidth >= nativeLayout.controlWidth - 1, "Native input must fill its field");
      await page.locator(".sk-preview-card").first().scrollIntoViewIfNeeded();
      if (width > 480) {
        await page.locator('.sk-property-playground__control [data-value="range"]').first().click();
      } else {
        await page.locator("select").filter({ has: page.locator('option[value="range"]') }).first().selectOption("range");
      }
      const root = page.locator('.sk-date-picker[data-selection-mode="range"]:visible').first();
      await expect(root.locator("input")).toHaveCount(2);
      const triggerPosition = await root.locator(".sk-date-picker__trigger").evaluate((trigger) => {
        const clear = trigger.parentElement!.querySelector<HTMLButtonElement>(".sk-date-picker__clear")!;
        const read = () => trigger.getBoundingClientRect().x;
        const wasHidden = clear.hidden;
        clear.hidden = true;
        const withoutClear = read();
        clear.hidden = false;
        const withClear = read();
        const clearIcon = clear.querySelector(".sk-icon")!.getBoundingClientRect();
        const triggerIcon = trigger.querySelector(".sk-icon")!.getBoundingClientRect();
        const control = trigger.parentElement!.getBoundingClientRect();
        const iconGap = triggerIcon.left - clearIcon.right;
        const verticalGap = clearIcon.top - control.top;
        clear.hidden = wasHidden;
        return { withoutClear, withClear, iconGap, verticalGap };
      });
      assert.equal(triggerPosition.withoutClear, triggerPosition.withClear, "Calendar icon must keep its reserved slot when Clear is hidden");
      assert(Math.abs(triggerPosition.iconGap - triggerPosition.verticalGap) < 2, "Horizontal icon gap should match the field's vertical icon inset");
      await root.locator(".sk-date-picker__trigger").click();
      const popup = page.locator('.sk-date-picker__content[data-state="open"]').first();
      const layers = await popup.evaluate((content) => {
        const tools = [...document.querySelectorAll<HTMLElement>(".sk-preview-card__code-link, .sk-preview-card__code-menu, .docs-card-appearance")];
        return {
          popup: Number(getComputedStyle(content.parentElement!).zIndex),
          tools: tools.map((tool) => Number(getComputedStyle(tool).zIndex)),
        };
      });
      assert(layers.tools.length > 0 && layers.tools.every((z) => layers.popup > z), "Calendar overlay must paint above view-code and appearance tools");
      const months = popup.locator('table[data-view="day"]');
      await expect(months).toHaveCount(2);
      await expect(popup.locator(".sk-calendar__view-trigger")).toHaveCount(0);
      await expect(popup.locator(".sk-calendar__month-title")).toHaveCount(2);
      const geometry = await months.evaluateAll((tables) => tables.map((table) => {
        const { x, y, width, height } = table.getBoundingClientRect();
        return { x, y, width, height };
      }));
      const popupBox = (await popup.boundingBox())!;
      assert(popupBox.width <= width, "Popup must fit the viewport");
      await expect(popup.locator("[data-outside-range]").first()).toHaveCSS("visibility", "hidden");
      assert(await popup.locator("[data-outside-range]").evaluateAll((days) => days.every((day) => getComputedStyle(day).visibility === "hidden")), "Days from adjacent months must not be repeated across the two grids");
      if (width > 480) {
        const fieldBox = (await root.locator(".sk-date-picker__control").boundingBox())!;
        assert(Math.abs(popupBox.x + popupBox.width / 2 - fieldBox.x - fieldBox.width / 2) < 2, "Range popup must be centered below its field");
      }
      assert(await popup.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), "Months must not overflow the sheet horizontally");
      if (width > 480) assert(Math.abs(geometry[0].y - geometry[1].y) < 1, "Desktop months must sit side by side");
      else {
        assert(geometry[1].x > geometry[0].x, "Mobile range should show one month at a time in a horizontal carousel");
        assert(await popup.locator(".sk-calendar__months").evaluate((el) => getComputedStyle(el).scrollSnapType.includes("x")), "Mobile month navigation must snap to one month");
      }
      const ids = await popup.locator("[id]").evaluateAll((elements) => elements.map((el) => el.id));
      assert.equal(new Set(ids).size, ids.length, "Adjacent grids must not duplicate day ids");
      const start = months.nth(0).locator(".sk-calendar__cell-trigger:not([data-outside-range])").last();
      const end = months.nth(1).locator(".sk-calendar__cell-trigger:not([data-outside-range])").first();
      const endId = await end.getAttribute("id");
      await start.click();
      await expect(popup).toBeVisible();
      assert(await popup.locator("[data-outside-range]").evaluateAll((days) => {
        days.forEach((day) => day.setAttribute("data-in-hover-range", ""));
        const clear = days.every((day) => getComputedStyle(day.closest("td")!).backgroundColor === "rgba(0, 0, 0, 0)");
        days.forEach((day) => day.removeAttribute("data-in-hover-range"));
        return clear;
      }), "Hidden duplicate cells must not leave a range highlight behind");
      await start.focus();
      await page.keyboard.press("ArrowRight");
      await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe(endId);
      await page.keyboard.press("Enter");
      await expect(popup).toBeHidden();
      for (const input of await root.locator("input").all()) await expect(input).not.toHaveValue("");
      await root.locator(".sk-date-picker__clear").click();
      for (const input of await root.locator("input").all()) await expect(input).toHaveValue("");
      if (width <= 480) {
        await root.locator(".sk-date-picker__trigger").click();
        await popup.locator(".sk-date-picker__close").click();
        await expect(popup).toBeHidden();
      }
      console.log(`${path} at ${width}: range layout, unique ids, cross-month keyboard selection, clearing and dismissal OK`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
