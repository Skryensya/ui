/*
 * Writes the site's icon sets the way a consumer writes theirs: with the kit's own CLI, from the
 * `@iconify-json/*` dev dependencies, into src/icon-sets/. One set per entry of the Preferences list.
 *
 *   node scripts/generate-icon-sets.ts          writes them (builds the CLI first)
 *   node scripts/generate-icon-sets.ts --check  fails when one is stale
 */
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { siteIconSets } from "../src/lib/icon-set-options.ts";

const root = resolve(import.meta.dirname, "..");
const cli = resolve(root, "../../packages/cli/dist/cli.js");
const check = process.argv.includes("--check");

execFileSync("pnpm", ["--filter", "@skryensya/cli", "build"], { cwd: root, stdio: "ignore" });
for (const { id } of siteIconSets) {
  // `--components`: the sidebar, the catalogue and each component page draw the `component-*` marks.
  // `--brands`: the header's GitHub link draws `brand-github`, in the reader's set.
  execFileSync("node", [cli, "icons", id, "--out", `src/icon-sets/${id}`, "--components", "--brands", ...(check ? ["--check"] : [])], { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
}
console.log(`icon sets: ${siteIconSets.length} ${check ? "up to date" : "written"}`);
