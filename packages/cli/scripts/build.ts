/*
 * One file, `dist/cli.js`, with the install manifest inlined: the published CLI has no runtime
 * dependencies and does not need `@skryensya/core` installed to know the catalog.
 */
import { build } from "esbuild";
import { chmodSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
rmSync(join(root, "dist"), { recursive: true, force: true });

/* The release this build belongs to: the packages share one version, and `add` installs that release's assets. */
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { version: string };

await build({
  entryPoints: [join(root, "src/cli.ts")],
  outfile: join(root, "dist/cli.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  legalComments: "none",
  define: { __SKRYENSYA_VERSION__: JSON.stringify(version) },
});
chmodSync(join(root, "dist/cli.js"), 0o755);
console.log("✓ dist/cli.js");
