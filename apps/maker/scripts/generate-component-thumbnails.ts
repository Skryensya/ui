import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { buildVariant, counterIds, presetFor, toUsageTree, variantsFor, type SignatureRef } from "@skryensya/maker-model";
import index from "../../../artifacts/ai-index.json" with { type: "json" };

const appRoot = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(appRoot, "public", "component-thumbnails");

const refs: SignatureRef[] = (index.contracts ?? []).flatMap((contract) =>
  (contract.signatures ?? []).map((signature) => ({ contract: contract.id, signature: signature.id })),
);

const fileName = (ref: SignatureRef, scheme: "light" | "dark", variant?: string) => `${ref.contract}-${ref.signature.replace(/[^a-z0-9]+/gi, "-")}${variant ? `--${variant}` : ""}-${scheme}.png`;
/* `THUMBNAILS=variants` redraws only the presets' pictures: the components' own are 400 files and rarely change. */
const onlyVariants = process.env.THUMBNAILS === "variants";

await mkdir(outDir, { recursive: true });

const server = await createServer({ configFile: join(appRoot, "vite.config.ts"), server: { middlewareMode: false } });
await server.listen();
const origin = server.resolvedUrls?.local[0]?.replace(/\/$/, "");
if (!origin) throw new Error("Could not start Maker dev server.");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 320, height: 240 }, deviceScaleFactor: 2 });
await page.goto(`${origin}/stage.html`);
await page.waitForFunction(() => Boolean(window.makerStage));
await page.addStyleTag({
  content: `
    html, body { inline-size: 320px; block-size: 240px; overflow: hidden; background: var(--color-bg-canvas); }
    #stage {
      display: grid;
      place-items: center;
      box-sizing: border-box;
      inline-size: 320px;
      min-block-size: 240px;
      padding: 24px;
      background:
        radial-gradient(circle, color-mix(in oklab, var(--color-text-tertiary) 18%, transparent) 1px, transparent 1px),
        var(--color-bg-canvas);
      background-size: 16px 16px;
    }
    #stage > * { max-inline-size: 100%; max-block-size: 100%; }
  `,
});

let written = 0;
for (const ref of onlyVariants ? [] : refs) {
  const node = presetFor(ref, counterIds("t"));
  if (!node) continue;
  const tree = toUsageTree(node);
  for (const scheme of ["light", "dark"] as const) {
    try {
      await page.evaluate(
        async ({ usageTree, scheme }) => {
          document.documentElement.setAttribute("data-scheme", scheme);
          document.documentElement.style.colorScheme = scheme;
          await window.makerStage!.render(usageTree);
        },
        { usageTree: tree, scheme },
      );
      await page.locator("#stage").screenshot({ path: join(outDir, fileName(ref, scheme)) });
      written++;
    } catch (error) {
      console.warn(`thumbnail skipped ${ref.contract}/${ref.signature} (${scheme}):`, error instanceof Error ? error.message : String(error));
    }
  }
}

/*
 * THE PRESETS' PICTURES, curated ones only. A generated preset is one option away from the component's own
 * picture (a tone, a variant), so it is drawn as the component's icon; a curated one is a different
 * arrangement (a pair, a titled callout, a field with its hint) and is worth seeing before it is inserted.
 * Drawn the way the palette inserts it: in its own wrapper.
 */
for (const ref of refs) {
  for (const variant of variantsFor(ref).filter((entry) => entry.source === "curated")) {
    const tree = toUsageTree(buildVariant(variant, "auto", counterIds("t")));
    for (const scheme of ["light", "dark"] as const) {
      try {
        await page.evaluate(
          async ({ usageTree, scheme }) => {
            document.documentElement.setAttribute("data-scheme", scheme);
            document.documentElement.style.colorScheme = scheme;
            await window.makerStage!.render(usageTree);
          },
          { usageTree: tree, scheme },
        );
        await page.locator("#stage").screenshot({ path: join(outDir, fileName(ref, scheme, variant.id)) });
        written++;
      } catch (error) {
        console.warn(`thumbnail skipped ${ref.contract}/${ref.signature} ${variant.id} (${scheme}):`, error instanceof Error ? error.message : String(error));
      }
    }
  }
}

await browser.close();
await server.close();
console.log(`Wrote ${written} thumbnails to ${outDir}`);
