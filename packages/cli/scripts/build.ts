/*
 * One file, `dist/cli.js`, with the install manifest inlined: the published CLI has no runtime
 * dependencies and does not need `@skryensya/core` installed to know the catalog.
 */
import { build } from "esbuild";
import { chmodSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
rmSync(join(root, "dist"), { recursive: true, force: true });

await build({
  entryPoints: [join(root, "src/cli.ts")],
  outfile: join(root, "dist/cli.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  legalComments: "none",
});
chmodSync(join(root, "dist/cli.js"), 0o755);
console.log("✓ dist/cli.js");
