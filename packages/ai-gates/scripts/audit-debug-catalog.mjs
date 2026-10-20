import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { catalogBreaks } from "../../../apps/docs/src/lib/debug-catalog.ts";

const output = fileURLToPath(new URL("../test-results/debug-catalog/", import.meta.url));
mkdirSync(output, { recursive: true });
const modes = [
  { width: 1280, dir: "ltr", scheme: "light", zoom: 1 },
  { width: 320, dir: "ltr", scheme: "light", zoom: 1 },
  { width: 2560, dir: "ltr", scheme: "light", zoom: 1 },
  { width: 320, dir: "rtl", scheme: "dark", zoom: 1 },
  { width: 320, dir: "ltr", scheme: "light", zoom: 2 },
];
const browser = await chromium.launch();
const results = [];
try {
  for (const mode of modes) {
    const context = await browser.newContext({ viewport: { width: mode.width, height: 900 }, colorScheme: mode.scheme });
    for (const entry of catalogBreaks) {
      const page = await context.newPage();
      page.setDefaultTimeout(15_000);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const result = { id: entry.id, mode, errors };
      try {
        const response = await page.goto(`http://localhost:4173${entry.href}`, { waitUntil: "domcontentloaded" });
        assert.equal(response.status(), 200);
        await page.waitForSelector("[data-break-case]");
        await page.waitForTimeout(350);
        await page.evaluate((m) => { document.documentElement.dir = m.dir; document.body.style.zoom = String(m.zoom); }, mode);
        await page.waitForTimeout(80);
        result.cases = await page.locator("[data-break-case]").evaluateAll((cases) => cases.map((section) => {
          const stage = section.querySelector(".break-case__stage");
          const nodes = [...stage.querySelectorAll('[class^="sk-"]')].filter((el) => el.clientWidth > 1);
          return {
            name: section.dataset.breakCase,
            container: stage.clientWidth,
            overflowMode: getComputedStyle(stage).overflowX,
            roots: nodes.slice(0, 3).map((el) => ({ cls: el.className, width: el.clientWidth, scroll: el.scrollWidth, height: el.clientHeight })),
            overflowing: nodes.filter((el) => el.scrollWidth > el.clientWidth + 3).slice(0, 6).map((el) => ({ cls: el.className, width: el.clientWidth, scroll: el.scrollWidth })),
            renderErrors: [...section.querySelectorAll("[data-break-render-error]")].map((el) => el.textContent),
          };
        }));
        assert.ok(result.cases.length >= 4, "all four inline cases must render");
        assert.ok(result.cases.every((c) => c.overflowMode === "visible"), "the harness must not hide overflow");
        if (mode.width === 320 && mode.zoom === 1) {
          const worst = page.locator('[data-break-case="Worst case"]');
          await worst.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/${entry.id}-${mode.dir}.png` });
        }
        const demo = page.locator('[data-break-case="Demo"]');
        if (mode.width === 1280 && ["drawer", "vaul", "dialog-stack", "window", "presence", "hotkey", "tile-button", "card", "tile-checkbox", "tile-switch", "expandable-tile", "resizable", "compare-slider", "editor", "table-pager"].includes(entry.id)) {
          try {
            if (["drawer", "vaul", "dialog-stack", "window"].includes(entry.id)) {
              await demo.getByRole("button", { name: /^Open / }).first().click();
              await page.waitForTimeout(200);
              result.floating = await page.locator('dialog[open], [role="dialog"]').evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().width).map((e) => e.getBoundingClientRect().toJSON()));
              assert.ok(result.floating.length > 0, "opening must expose a dialog");
              await page.keyboard.press("Escape");
            } else if (entry.id === "presence") {
              await demo.getByRole("button", { name: "Toggle notice" }).click();
              await page.waitForTimeout(500);
              assert.ok((await demo.textContent()).includes("Exit complete"));
            } else if (entry.id === "hotkey") {
              await demo.getByRole("group").focus();
              await page.keyboard.press("Control+Shift+u");
              assert.ok((await demo.locator("output").innerText()).startsWith("1 "));
            } else if (["tile-button", "card"].includes(entry.id)) {
              await demo.getByRole("button").first().click();
              assert.ok((await demo.locator("output").innerText()).startsWith("1 "));
            } else if (["tile-checkbox", "tile-switch"].includes(entry.id)) {
              await demo.locator("label").first().click();
              assert.equal(await demo.locator("input").first().isChecked(), true);
            } else if (entry.id === "expandable-tile") {
              const button = demo.getByRole("button").first();
              await button.click();
              assert.equal(await button.getAttribute("aria-expanded"), "false");
            } else if (["resizable", "compare-slider"].includes(entry.id)) {
              const handle = demo.getByRole(entry.id === "resizable" ? "separator" : "slider").first();
              const before = await handle.getAttribute("aria-valuenow");
              await handle.focus(); await page.keyboard.press("ArrowRight");
              assert.notEqual(await handle.getAttribute("aria-valuenow"), before);
            } else if (entry.id === "editor") {
              await demo.locator('[contenteditable="true"]').fill("Local editor review");
              assert.ok((await demo.textContent()).includes("characters (local only)"));
            } else if (entry.id === "table-pager") {
              const worst = page.locator('[data-break-case="Worst case"]');
              await worst.getByRole("button", { name: "Next page", exact: true }).click();
              result.pagerStatus = await worst.locator("[data-sk-table-pager-status]").innerText();
              assert.ok(result.pagerStatus.includes("6"));
            }
            result.interaction = "checked";
          } catch (error) { result.interactionError = String(error); }
        }
      } catch (error) { result.failure = String(error); }
      results.push(result);
      console.log(entry.id, mode.width, mode.dir, mode.zoom, result.failure ?? result.interactionError ?? `rendered ${result.cases?.length} cases, ${errors.length} JS errors`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
  writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(`Report: ${output}/results.json`);
}
if (results.some((result) => result.failure)) process.exitCode = 1;
