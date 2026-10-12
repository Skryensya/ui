/*
 * ONE OUTPUT PER COMPONENT, from one command: `node ../../scripts/build-library.ts` inside a package.
 *
 * Every subpath in the package's `exports` is an entry, and the build keeps the module graph as it is
 * (`preserveModules`): `dist/components/button.js` is the Button and what only the Button needs, so a
 * page that imports `@skryensya/react/button` never loads Dialog. Nothing is bundled across packages:
 * `@skryensya/core`, Zag, React and Svelte stay `import`s, which is what lets a consumer's own bundler
 * (or no bundler: an import map) decide how they are shared.
 *
 * Rolldown, not Rollup: it is the engine Vite 8 already runs on in this repo, so the build and the dev
 * server resolve the same way. `.svelte` and `.svelte.ts` are compiled by the small plugin below, the
 * piece Vite's svelte plugin would have supplied.
 */
import { rolldown, type Plugin } from "rolldown";
import { transform } from "rolldown/utils";
import { mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { builtinModules, createRequire } from "node:module";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type Condition = string | { [key: string]: Condition };

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  name: string;
  exports: Record<string, Condition>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

/** The source file a subpath resolves to, whatever shape its conditions have. */
function sourceOf(condition: Condition): string | undefined {
  if (typeof condition === "string") return condition;
  return sourceOf(condition.default ?? condition.import ?? Object.values(condition)[0]!);
}

const entries: Record<string, string> = {};
for (const condition of Object.values(pkg.exports)) {
  const file = sourceOf(condition);
  if (!file || !/\.(ts|tsx)$/.test(file) || file.includes("*")) continue;
  const name = file.replace(/^\.\/src\//, "").replace(/\.(svelte\.)?(ts|tsx)$/, "");
  entries[name] = resolve(root, file);
}

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
  "svelte",
  "react",
  "react-dom",
  "react/jsx-runtime",
].map((name) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(/.*)?$`));
external.push(new RegExp(`^(node:)?(${builtinModules.join("|")})(/.*)?$`));

/** `.svelte` and `.svelte.ts` through the Svelte compiler; types are erased first for the module form. */
const svelte = async (): Promise<Plugin[]> => {
  if (!pkg.dependencies?.svelte) return [];
  /* The compiler is the package's own dependency, not the workspace root's. */
  const path = createRequire(join(root, "package.json")).resolve("svelte/compiler");
  /* Typed by what is used, not by `svelte/compiler`: the compiler is not resolvable from here. */
  type Compiled = { js: { code: string; map: unknown } };
  const loaded = (await import(pathToFileURL(path).href)) as {
    compile?: (code: string, options: object) => Compiled;
    compileModule?: (code: string, options: object) => Compiled;
    default?: { compile: (code: string, options: object) => Compiled; compileModule: (code: string, options: object) => Compiled };
  };
  /* Resolved with `require` conditions, so it may arrive as a CommonJS namespace. */
  const { compile, compileModule } = (loaded.compile ? loaded : loaded.default!) as NonNullable<typeof loaded.default>;
  return [{
  name: "svelte",
  async transform(code, id) {
    if (id.endsWith(".svelte")) {
      const result = compile(code, { filename: id, generate: "client", css: "injected" });
      return { code: result.js.code, map: result.js.map as never };
    }
    if (/\.svelte\.(ts|js)$/.test(id)) {
      const stripped = id.endsWith(".ts") ? (await transform(id, code, { lang: "ts" })).code : code;
      const result = compileModule(stripped, { filename: id, generate: "client" });
      return { code: result.js.code, map: result.js.map as never };
    }
    return null;
  },
  }];
};

const out = join(root, "dist");
rmSync(out, { recursive: true, force: true });

const bundle = await rolldown({
  input: entries,
  external,
  platform: "neutral",
  plugins: await svelte(),
  resolve: {
    extensions: [".ts", ".tsx", ".svelte.ts", ".svelte", ".js"],
    extensionAlias: { ".js": [".ts", ".tsx", ".js"] },
    conditionNames: ["import", "default"],
  },
  // Type-only imports and unused exports are what tree-shaking is for; module side effects are the
  // package's own (`sideEffects` in its package.json), so none are assumed here.
  treeshake: { moduleSideEffects: false },
});

await bundle.write({
  dir: out,
  format: "esm",
  preserveModules: true,
  preserveModulesRoot: "src",
  entryFileNames: "[name].js",
  sourcemap: false,
});
await bundle.close();

/** Every built file, relative to `dist`, for the manifest and for a human reading the log. */
const built: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".js")) built.push(relative(out, path));
  }
};
walk(out);

mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, "entries.json"),
  `${JSON.stringify(
    Object.fromEntries(Object.keys(entries).sort().map((name) => [name, `./${name}.js`])),
    null,
    2,
  )}\n`,
);
console.log(`${pkg.name}: ${Object.keys(entries).length} entries, ${built.length} files in ${relative(process.cwd(), out) || "dist"}`);
