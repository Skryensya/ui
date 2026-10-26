/*
 * Writes `install-manifest.json` (see `install-manifest.ts`). Reads the contracts from the compiled
 * `dist/registry.js`, so it runs after `tsc` in this package's `build`; `--check` fails instead of
 * writing when the committed file differs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildInstallManifest, summarizeContract, type ManifestContract } from "./install-manifest.ts";

const root = join(import.meta.dirname, "..");
const registry = (await import(pathToFileURL(join(root, "dist/registry.js")).href)) as {
  contractIds(): readonly string[];
  getContract(id: string): ManifestContract;
};
const contracts = registry.contractIds().map((id) => summarizeContract(id, registry.getContract(id)));

const text = `${JSON.stringify(buildInstallManifest({ packagesDir: join(root, ".."), contracts }), null, 2)}\n`;
const target = join(root, "install-manifest.json");

if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== text) {
    console.error("install-manifest.json is stale: run `pnpm --filter @skryensya/core build`.");
    process.exit(1);
  }
  console.log("install-manifest.json is current.");
} else {
  writeFileSync(target, text);
  console.log(`install-manifest.json: ${Object.keys(JSON.parse(text)).length} components`);
}
