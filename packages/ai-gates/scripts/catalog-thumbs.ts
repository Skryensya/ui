/*
 * THE CATALOG'S THUMBNAILS: one screenshot of every example, in light and in dark, written to
 * `apps/docs/public/catalog/thumbs/<id>.<mode>.jpg`. The catalog page shows these on its result cards and renders an
 * example for real only when it is opened, so this opens each one in the page's own modal (the viewer a reader
 * sees) and shoots that viewer.
 *
 *   pnpm --filter @skryensya/ai-gates catalog:thumbs [url] [--only=id,id]
 *
 * `url` is a running docs site (dev or preview) at its catalog page; default http://localhost:4173/catalog/.
 * The images are generated, not committed (the folder is git-ignored): build them before a deploy.
 */
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const out = join(dirname(fileURLToPath(import.meta.url)), "../../../apps/docs/public/catalog/thumbs");
const args = process.argv.slice(2);
const url = args.find((arg) => !arg.startsWith("--")) ?? "http://localhost:4173/catalog/";
const only = args.find((arg) => arg.startsWith("--only="))?.slice("--only=".length).split(",");

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
let shot = 0;
let failed = 0;

for (const mode of ["light", "dark"] as const) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: mode, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const ids = only ?? (await page.$$eval(".catalog__example", (nodes) => nodes.map((node) => node.id)));

  for (const id of ids) {
    try {
      await page.evaluate((hash) => (location.hash = hash), id);
      const viewer = page.locator(`#catalog-modal .catalog__example[id="${id}"] .catalog__canvas`);
      await viewer.waitFor({ state: "visible", timeout: 10_000 });
      /* The example is built and enhanced when it opens: wait for its icons and a settled frame. */
      await page.waitForFunction((exampleId) => !document.querySelector(`[id="${exampleId}"] [data-sk-icon]`), id, { timeout: 5_000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      /* Shoot the example, not the empty viewer around it: its box with some air, grown to the card's 4:3 and kept inside the viewer. */
      const clip = await page.evaluate((exampleId) => {
        const canvas = document.querySelector(`#catalog-modal [id="${exampleId}"] .catalog__canvas`)!.getBoundingClientRect();
        const host = document.querySelector(`#catalog-modal [id="${exampleId}"] .catalog__specimen`)!;
        const whole = host.getBoundingClientRect();
        /* Where the example's content is: the union of what is narrower than the specimen's own box (blocks that span it say nothing about where the content sits), else the box. */
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        for (const node of host.querySelectorAll("*")) {
          const box = node.getBoundingClientRect();
          if (box.width === 0 || box.height === 0 || box.width >= whole.width * 0.99) continue;
          left = Math.min(left, box.left); top = Math.min(top, box.top); right = Math.max(right, box.right); bottom = Math.max(bottom, box.bottom);
        }
        /* Text that sits in a block spanning the specimen: the text's own box, not the block's. */
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          const box = range.getBoundingClientRect();
          if (box.width === 0 || box.height === 0) continue;
          left = Math.min(left, box.left); top = Math.min(top, box.top); right = Math.max(right, box.right); bottom = Math.max(bottom, box.bottom);
        }
        const specimen = right > left && bottom > top ? new DOMRect(left, top, right - left, bottom - top) : whole;
        const air = 40;
        /* Never smaller than a card's worth, so a small example is not blown up to fill the window. */
        let width = Math.min(Math.max(specimen.width + 2 * air, 520), canvas.width);
        let height = Math.min(Math.max(specimen.height + 2 * air, 390), canvas.height);
        if (width / height < 4 / 3) width = Math.min(height * (4 / 3), canvas.width);
        else height = Math.min(width * (3 / 4), canvas.height);
        const x = Math.min(Math.max(specimen.x + specimen.width / 2 - width / 2, canvas.x), canvas.right - width);
        const y = Math.min(Math.max(specimen.y + specimen.height / 2 - height / 2, canvas.y), canvas.bottom - height);
        return { x, y, width, height };
      }, id);
      await page.screenshot({ path: join(out, `${id}.${mode}.jpg`), type: "jpeg", quality: 82, animations: "disabled", clip });
      shot++;
    } catch (error) {
      failed++;
      console.error(`${id} (${mode}): ${(error as Error).message.split("\n")[0]}`);
    }
  }
  await context.close();
}

await browser.close();
console.log(`catalog-thumbs: ${shot} screenshots written to ${out}${failed ? `, ${failed} failed` : ""}.`);
process.exitCode = failed ? 1 : 0;
