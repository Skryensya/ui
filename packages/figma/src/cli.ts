import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { canonical } from "@skryensya/ai-compiler/manifest";
import { buildFigmaManifest } from "./build.js";
import { badgeDotRealization } from "./realizations/badge-dot.js";
import { badgeRealization } from "./realizations/badge.js";
import { buttonRealization } from "./realizations/button.js";

/*
 * `figma:build` writes artifacts/figma-manifest.json; `figma:check` rebuilds it in memory and fails
 * when the committed one is stale. Neither touches Figma.
 */

const [command = "build", rootArg = "."] = process.argv.slice(2);
const root = resolve(rootArg);
const out = join(root, "artifacts", "figma-manifest.json");

/* Every contract Figma draws, in the order its frames stack on the page. */
const manifest = await buildFigmaManifest([buttonRealization, badgeRealization, badgeDotRealization]);
const text = canonical(manifest);

if (command === "check") {
  let current = "";
  try {
    current = readFileSync(out, "utf8");
  } catch {}
  if (current !== text) {
    console.error(`\n  FIGMA_MANIFEST_STALE: run \`pnpm figma:build\` (sourceHash ${manifest.sourceHash})\n`);
    process.exit(1);
  }
  console.log(`figma manifest current (${manifest.sourceHash})`);
} else {
  writeFileSync(out, text);
  const r = manifest.report as { variants: Record<string, unknown>; tokens: Record<string, unknown> };
  console.log(`figma manifest ${manifest.sourceHash} → ${out}`);
  console.log(JSON.stringify({ variants: r.variants, tokens: { ...r.tokens, reachedButNotVariables: undefined } }, null, 2));
  const warnings = manifest.diagnostics.filter((d) => d.severity === "warning");
  console.log(`${manifest.diagnostics.length} diagnostics, ${warnings.length} warnings`);
  for (const d of warnings) console.log(`  ${d.code} ${d.subject}: ${d.message}`);
}
