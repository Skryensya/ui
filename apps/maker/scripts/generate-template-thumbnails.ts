import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import templates from "../../../artifacts/templates.json" with { type: "json" };

/*
 * A PICTURE OF EACH TEMPLATE, so the list of starting points shows what each one is. The docs' gallery draws every template with
 * the real site styles (the app shells, the sticky bars), so the pictures are taken from it: each template's example, at a desktop
 * width, in each language and colour scheme, saved to `public/template-thumbnails/<id>.<locale>.<scheme>.png`.
 * `DOCS_URL=http://localhost:4173` uses a docs server that is already running; otherwise one is started for the run.
 * Run `pnpm --filter @skryensya/maker thumbnails:templates` after the templates change.
 */
const appRoot = fileURLToPath(new URL("..", import.meta.url));
const docsRoot = fileURLToPath(new URL("../../docs", import.meta.url));
const outDir = join(appRoot, "public", "template-thumbnails");
await mkdir(outDir, { recursive: true });

let origin = process.env.DOCS_URL;
let server: ReturnType<typeof spawn> | undefined;
if (!origin) {
  const port = 4399;
  origin = `http://localhost:${port}`;
  server = spawn("pnpm", ["exec", "astro", "dev", "--port", String(port)], { cwd: docsRoot, stdio: "ignore" });
  for (let i = 0; i < 120; i++) {
    if (await fetch(origin).then((r) => r.ok || r.status < 500, () => false)) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5 });
let written = 0;
try {
  for (const locale of ["en", "es"] as const) {
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(`${origin}${locale === "es" ? "/es" : ""}/templates`, { waitUntil: "load", timeout: 120000 });
      await page.waitForSelector(".templates__example", { timeout: 120000 });
      await page.evaluate((scheme) => { document.documentElement.setAttribute("data-scheme", scheme); document.documentElement.style.colorScheme = scheme; }, scheme);
      for (const template of templates.templates) {
        const example = page.locator(`#${template.id} .templates__example`).first();
        await example.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        const box = await example.boundingBox();
        if (!box) continue;
        await example.screenshot({ path: join(outDir, `${template.id}.${locale}.${scheme}.png`), clip: undefined });
        written++;
      }
    }
  }
} finally {
  console.log(`wrote ${written} template thumbnails to ${outDir}`);
  await browser.close();
  server?.kill();
}
