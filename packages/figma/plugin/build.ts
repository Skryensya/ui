/*
 * Bundles the plugin: the manifest is inlined into code.js at build time, so the plugin always
 * carries exactly the manifest `figma:build` just wrote. Run after the compiler, never alone.
 */

import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "esbuild";

const here = import.meta.dirname;
mkdirSync(join(here, "dist"), { recursive: true });

await build({
  entryPoints: [join(here, "src/code.ts")],
  outfile: join(here, "dist/code.js"),
  bundle: true,
  format: "iife",
  // Figma's plugin sandbox runs an older JavaScript engine than Node.
  target: "es2017",
  logLevel: "warning",
});
copyFileSync(join(here, "src/ui.html"), join(here, "dist/ui.html"));
console.log(`plugin → ${join(here, "dist")}`);
