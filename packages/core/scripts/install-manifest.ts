/*
 * THE INSTALL MANIFEST: for every contract, exactly what a page needs to use it on its own.
 *
 * Three facts per component, each read from the place that owns it and none typed by hand:
 *
 *   css      the stylesheet the contract names, plus every sheet that one `@import`s (calendar pulls
 *            button), in the order they must load. Read from `css/`, so a new `@import` is a new line here.
 *   react    `@skryensya/react/<id>`, when the React package has that subpath.
 *   vanilla  `@skryensya/vanilla/<id>` and the `mount…` function it exports, with the selectors the
 *            auto-loader (`@skryensya/vanilla/auto`) mounts it for. A component with no enhancer has no
 *            `vanilla`: its Vanilla story is the stylesheet and nothing else.
 *
 * The docs' Installation section and the isolation test read this file; `generate-install-manifest.ts`
 * writes it and `install-manifest.test.ts` fails when the committed copy has drifted from its sources.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

export interface InstallEntry {
  category: string;
  css: { entry: string; files: string[] };
  react: { entry: string; names: string[] } | null;
  vanilla: { entry: string; mount: string | null; selectors: string[]; auto: boolean } | null;
}

export interface ContractSummary {
  id: string;
  category: string;
  css: string;
  /** The names the contract's signatures export from the React package, in signature order. */
  reactNames: string[];
}

const PREFIX = "@skryensya/core/";

/** A `@skryensya/core/components/x.css` specifier → the file under `css/`. */
const sheetPath = (cssDir: string, specifier: string): string => join(cssDir, specifier.slice(PREFIX.length));

/** The sheets a stylesheet pulls in with a relative `@import url(...)`, dependencies before dependents. */
function sheetsWithImports(cssDir: string, specifier: string, seen = new Set<string>()): string[] {
  if (seen.has(specifier)) return [];
  seen.add(specifier);
  const file = sheetPath(cssDir, specifier);
  if (!existsSync(file)) throw new Error(`${specifier} does not exist (${file})`);
  const ordered: string[] = [];
  for (const [, target] of readFileSync(file, "utf8").matchAll(/@import\s+url\(\s*["']?(\.[^"')]+\.css)["']?\s*\)/g)) {
    const resolved = resolve(dirname(file), target!);
    const dep = `${PREFIX}${relative(cssDir, resolved).split("\\").join("/")}`;
    ordered.push(...sheetsWithImports(cssDir, dep, seen));
  }
  return [...ordered, specifier];
}

type Exports = Record<string, string | { default?: string }>;

const fileOf = (condition: string | { default?: string } | undefined): string | undefined =>
  typeof condition === "string" ? condition : condition?.default;

/** The auto-loader's table: module file name → the selectors it is mounted for. */
function autoSelectors(registrySource: string): Map<string, string[]> {
  const bySelector = new Map<string, string[]>();
  for (const [, selector, module] of registrySource.matchAll(/selector:\s*"([^"]+)",\s*load:\s*async\s*\(\)\s*=>\s*\(await import\("\.\.\/components\/([\w-]+)\.js"\)\)/g)) {
    bySelector.set(module!, [...(bySelector.get(module!) ?? []), selector!]);
  }
  return bySelector;
}

export function buildInstallManifest(options: {
  packagesDir: string;
  contracts: readonly ContractSummary[];
}): Record<string, InstallEntry> {
  const { packagesDir, contracts } = options;
  const cssDir = join(packagesDir, "core/css");
  const readJson = (path: string) => JSON.parse(readFileSync(join(packagesDir, path), "utf8")) as { exports: Exports };
  const react = readJson("react/package.json").exports;
  const vanilla = readJson("vanilla/package.json").exports;
  const auto = autoSelectors(readFileSync(join(packagesDir, "vanilla/src/runtime/registry.ts"), "utf8"));

  const manifest: Record<string, InstallEntry> = {};
  for (const contract of [...contracts].sort((a, b) => a.id.localeCompare(b.id))) {
    const files = sheetsWithImports(cssDir, contract.css);

    let vanillaEntry: InstallEntry["vanilla"] = null;
    const source = fileOf(vanilla[`./${contract.id}`]);
    if (source) {
      const text = readFileSync(join(packagesDir, "vanilla", source), "utf8");
      const mount = /export (?:const|function) (mount\w+)/.exec(text)?.[1] ?? null;
      const module = /([\w-]+)\.ts$/.exec(source)?.[1] ?? contract.id;
      const selectors = auto.get(module) ?? [];
      /* Only a module that mounts something is an enhancer; a helper subpath of the same name is not. */
      if (mount) vanillaEntry = { entry: `@skryensya/vanilla/${contract.id}`, mount, selectors, auto: selectors.length > 0 };
    }

    manifest[contract.id] = {
      category: contract.category,
      css: { entry: contract.css, files },
      react: react[`./${contract.id}`] ? { entry: `@skryensya/react/${contract.id}`, names: contract.reactNames } : null,
      vanilla: vanillaEntry,
    };
  }
  return manifest;
}
