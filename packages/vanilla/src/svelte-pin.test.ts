import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

/*
 * The release compiles the components with this Svelte, and compiled Svelte calls `svelte/internal/client`,
 * which is not stable across minor versions: a consumer who got 5.59 under a `^5.56.7` range saw the
 * Carousel throw at mount. So the dependency is exact, and it is the compiler the build ran.
 */
it("depends on exactly the Svelte it compiles with", () => {
  const manifest = join(process.cwd(), "package.json"); // vitest runs in the package
  const range = JSON.parse(readFileSync(manifest, "utf8")).dependencies.svelte;
  const compiler = createRequire(manifest)("svelte/package.json").version;
  expect(range).toBe(compiler);
});
