/*
 * WHAT "ISOLATED" MEANS, CHECKED: `node ../../scripts/verify-library.ts` inside a built package.
 *
 * For every entry in `dist/entries.json` it walks the relative imports (the module graph that entry
 * really loads) and fails when:
 *
 *   - an import points at a file that is not in `dist` (a build that dropped something),
 *   - the closure reaches the package barrel (`index.js`) or, for anything but `auto`, the auto-loader's
 *     registry: either would pull in every other component through one import,
 *   - the entry imports a package the `package.json` does not declare (it would only work by accident
 *     in this workspace).
 *
 * It prints the largest closures so growth is visible in a diff of the log.
 */
import { existsSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, join, relative, resolve } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  name: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const entries = JSON.parse(readFileSync(join(dist, "entries.json"), "utf8")) as Record<string, string>;
const declared = new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]);

const importsOf = (file: string): string[] => [
  ...readFileSync(file, "utf8").matchAll(/(?:^|\n)\s*(?:import|export)\s[^"']*?from\s*["']([^"']+)["']|(?:^|\n)\s*import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g),
].map((match) => (match[1] ?? match[2] ?? match[3])!);

const problems: string[] = [];
const sizes: [string, number][] = [];

for (const [name, path] of Object.entries(entries)) {
  const closure = new Set<string>();
  const visit = (file: string) => {
    if (closure.has(file)) return;
    closure.add(file);
    for (const specifier of importsOf(file)) {
      if (specifier.startsWith(".")) {
        const target = resolve(dirname(file), specifier);
        if (!existsSync(target)) problems.push(`${name}: ${relative(dist, file)} imports ${specifier}, which is not in dist`);
        else visit(target);
      } else {
        const bare = specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0]!;
        if (!declared.has(bare) && !builtinModules.includes(bare.replace(/^node:/, ""))) {
          problems.push(`${name}: ${relative(dist, file)} imports ${specifier}, and ${bare} is not a declared dependency`);
        }
      }
    }
  };
  visit(resolve(dist, path));

  const reached = [...closure].map((file) => relative(dist, file));
  if (name !== "index" && reached.includes("index.js")) problems.push(`${name}: its imports reach the barrel (index.js)`);
  if (!["index", "auto", "runtime"].includes(name) && reached.includes("runtime/registry.js")) {
    problems.push(`${name}: its imports reach the auto-loader registry`);
  }
  sizes.push([name, closure.size]);
}

sizes.sort((a, b) => b[1] - a[1]);
console.log(`${pkg.name}: ${sizes.length} entries checked. Largest closures: ${sizes.slice(0, 5).map(([n, s]) => `${n} (${s})`).join(", ")}`);
if (problems.length) {
  console.error(problems.map((problem) => `  ✗ ${problem}`).join("\n"));
  process.exit(1);
}
