import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { readComponentCss } from "./fixtures.js";

const css = readComponentCss("fade-edge", import.meta.url);
const demoSource = readFileSync(new URL("../../../apps/docs/src/demos/fade-edge.ts", import.meta.url), "utf8");
const modeScript = demoSource.match(/export const fadeModeScript = `([\s\S]*?)`;/)![1];

test("mode demo's color fade stays stationary during rapid inner scrolling", async ({ page }) => {
  await page.goto("/");
  await page.setContent(`<style>${css}</style><div id="fade-mode-frame" class="sk-fade-edge" data-fade="color" style="width:240px;overflow:hidden;--sk-fade-edge-color:white"><div id="fade-mode-scroll" style="height:200px;overflow:auto"><div style="height:1000px">Content</div></div></div>`);
  await page.evaluate(async (url) => {
    const { watchFadeEdge } = await import(/* @vite-ignore */ url);
    watchFadeEdge(document.getElementById("fade-mode-frame"));
  }, `/@fs${new URL("../../core/src/fade-edge-dom.ts", import.meta.url).pathname}`);
  await page.evaluate(modeScript);
  const frame = page.locator("#fade-mode-frame");
  const scroller = page.locator("#fade-mode-scroll");
  for (const top of [100, 450, 200, 650, 50]) {
    await scroller.evaluate((el, top) => { el.scrollTop = top; }, top);
    // No scroll event or rAF needed to position the overlay: its containing frame never scrolls.
    expect(await frame.evaluate((el) => ({ top: el.scrollTop, translate: getComputedStyle(el, "::after").translate }))).toEqual({ top: 0, translate: "0px" });
  }
  await scroller.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await expect(frame).toHaveAttribute("data-at-edge", "");
  await expect.poll(() => frame.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("0");
  await scroller.evaluate((el) => { el.scrollTop = 200; });
  await expect(frame).not.toHaveAttribute("data-at-edge", "");
});

for (const direction of ["to-bottom", "to-top", "to-right", "to-left", "horizontal", "vertical"]) {
  test(`color overlay stays at the viewport edge while scrolling ${direction}`, async ({ page }) => {
    await page.goto("/");
    await page.setContent(`<style>${css}</style><div id="fade" class="sk-fade-edge" data-fade="color" data-direction="${direction}" data-scroll-aware style="width:240px;height:200px;overflow:auto;--sk-fade-edge-color:white"><div style="width:700px;height:800px">Content</div></div>`);
    await page.evaluate(async (url) => {
      const { watchFadeEdge } = await import(/* @vite-ignore */ url);
      watchFadeEdge(document.getElementById("fade"));
    }, `/@fs${new URL("../../core/src/fade-edge-dom.ts", import.meta.url).pathname}`);
    const region = page.locator("#fade");
    await region.evaluate((el) => { el.scrollTop = 100; el.scrollLeft = 80; });
    await expect.poll(() => region.evaluate((el) => getComputedStyle(el, "::after").translate)).toBe("80px 100px");
    if (direction === "horizontal" || direction === "vertical") {
      expect(await region.evaluate((el) => getComputedStyle(el, "::before").translate)).toBe("80px 100px");
    }
    await region.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      el.scrollLeft = el.scrollWidth;
    });
    if (["to-bottom", "to-right", "horizontal", "vertical"].includes(direction)) {
      await expect.poll(() => region.evaluate((el) => getComputedStyle(el, "::after").opacity)).toBe("0");
    }
  });
}
