/*
 * Measures every component of the /canvas page in a real browser and writes `src/lib/canvas-sizes.json`.
 *
 * A canvas part is a fixed box (size containment), so it must be its final size before its content loads: that is
 * what keeps the page free of layout shift. The size can only come from a browser, so it is measured here, once,
 * per appearance (the largest wins) and committed. Rerun it when a component or its specimens change:
 *
 *   pnpm dev            (in another terminal)
 *   pnpm canvas:measure [url]
 */
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173/canvas/";
const out = new URL("../src/lib/canvas-sizes.json", import.meta.url);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${url}?measure`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => "__canvasMeasure" in window, undefined, { timeout: 30_000 });
  const sizes = await page.evaluate(() => (window as unknown as { __canvasMeasure: () => Promise<Record<string, [number, number]>> }).__canvasMeasure());
  const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(out, JSON.stringify(sorted, null, 1) + "\n");
  console.log(`canvas sizes: ${Object.keys(sorted).length} components written`);
} finally {
  await browser.close();
}
