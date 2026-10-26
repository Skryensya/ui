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
  /**
   * Present on an APPEARANCE entry (`button.brutalist`): the component it dresses and the value. Its `css`
   * is that value's sheets with whatever they import, in load order; it has no bindings of its own.
   */
  appearance?: { of: string; value: string };
}

export interface ContractSummary {
  id: string;
  category: string;
  css: string;
  /** The names the contract's signatures export from the React package, in signature order. */
  reactNames: string[];
  /** The sheets each non-default appearance value brings in (the option's `sheets` plus `memberAppearanceSheets`). */
  appearanceSheets: Record<string, string[]>;
}

/** The slice of a contract the manifest reads, so the generator and its drift test summarise one the same way. */
export interface ManifestContract {
  category?: string;
  css: string;
  signatures: Record<string, { react?: { name: string } }>;
  options: Record<string, { sheets?: Record<string, readonly string[]> }>;
  memberAppearanceSheets?: Record<string, readonly string[]>;
}

export function summarizeContract(id: string, contract: ManifestContract): ContractSummary {
  const reactNames = [...new Set(Object.values(contract.signatures).flatMap((signature) => (signature.react ? [signature.react.name] : [])))];
  // value -> the sheets that appearance needs, from the option that owns the value and from a group that welds its members by it
  const appearanceSheets: Record<string, string[]> = {};
  const note = (value: string, sheets: readonly string[]) => {
    appearanceSheets[value] = [...new Set([...(appearanceSheets[value] ?? []), ...sheets])];
  };
  for (const option of Object.values(contract.options)) for (const [value, sheets] of Object.entries(option.sheets ?? {})) note(value, sheets);
  for (const [value, sheets] of Object.entries(contract.memberAppearanceSheets ?? {})) note(value, sheets);
  return { id, category: contract.category ?? "", css: contract.css, reactNames, appearanceSheets };
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

    /* One entry per appearance value, named like its sheet (`button.brutalist`), so `add button.brutalist` is
       the whole instruction for a page that wants that look. */
    for (const [value, sheets] of Object.entries(contract.appearanceSheets).sort(([a], [b]) => a.localeCompare(b))) {
      // The component's own sheets first (a sibling does not import its base: a base that loads after the
      // appearance wins every tie), then the appearance's, which already name what they build on first.
      const seen = new Set<string>(files);
      // Only the sheets whose base this entry already loads: a contract that lists a hook sheet of another
      // family (Tile lists Checkbox's) is not asking for that family's appearance without its base.
      const ownSheets = sheets.filter((sheet) => files.includes(sheet.replace(/\.[a-z]+\.css$/, ".css")));
      const appearanceFiles = [...files, ...ownSheets.flatMap((sheet) => sheetsWithImports(cssDir, sheet, seen))];
      manifest[`${contract.id}.${value}`] = {
        category: contract.category,
        css: { entry: sheets[0]!, files: appearanceFiles },
        react: null,
        vanilla: null,
        appearance: { of: contract.id, value },
      };
    }
  }
  return manifest;
}
