/*
 * WRITES ONE STORIES FILE PER DOCS DEMO MODULE, from the trees that module already exports.
 *
 * Storybook indexes stories STATICALLY (named exports it can read without running the file), so a
 * story cannot be discovered at runtime from `apps/docs/src/demos`. This script is what bridges the
 * two: it loads every demo module through Vite (which resolves the `?raw` imports and the docs'
 * aliases, as `demos/trees.test.ts` explains a bare `node` run cannot), keeps every export that
 * yields a usage tree the contracts accept, and writes `src/stories/<module>.stories.tsx`.
 *
 * Everything a story needs beyond the tree is READ from the docs, never restated:
 *
 *   title    the component's catalog group and label (`lib/navigation.ts`).
 *   order    the order the component's page shows its previews in, anatomy first.
 *   css      the `css={...}` a page hands a preview (an anatomy's annotation type, a demo's sizing).
 *   sheets   `sheetsForTree` over the module's trees: the stylesheets the file imports.
 *
 *   node scripts/generate-stories.ts          write the files
 *   node scripts/generate-stories.ts --check  fail if any file on disk is out of date
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { createServer } from "vite";

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, "..");
const repo = join(app, "../..");
const docs = join(repo, "apps/docs");
const demosDir = join(docs, "src/demos");
const outDir = join(app, "src/stories");
const check = process.argv.includes("--check");

/* Modules in `demos/` that hold helpers for other demos, not demos. */
const helperModules = new Set(["anatomy-subject", "annotation-parts"]);

/*
 * HOW A FACTORY IS CALLED is read off its declaration, not guessed: a demo takes the translator, the
 * page's locale, the card copy for that locale, or a locale-owned href, and a story has to hand it
 * the same thing the page does. Each parameter type maps to the expression the story writes and the
 * value this script validates with. A trailing optional parameter is left out, which is what the
 * playground does too (`lib/placeholder-hrefs.ts` is its default).
 *
 * A required parameter of any other type is an href in some shape: the same shapes
 * `demos/trees.test.ts` tries, first one that validates wins.
 */
const hrefShapes = [
  { source: `"#"`, value: () => "#" },
  { source: "placeholderHrefs()", value: (ctx: Ctx) => ctx.placeholderHrefs() },
  { source: "1.2", value: () => 1.2 },
] as const;

type Ctx = { t: unknown; cardCopy: Record<string, unknown>; placeholderHrefs: () => unknown };
type Param = { type: string; optional: boolean };

/** Each exported factory's parameters, or `null` for an exported value that is not a function. */
function declaredParams(file: string): Map<string, Param[] | null> {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const params = (fn: ts.SignatureDeclaration): Param[] =>
    fn.parameters.map((p) => ({
      type: p.type?.getText(source) ?? (p.name.getText(source).replace(/^_/, "") === "t" ? "Translate" : "unknown"),
      optional: Boolean(p.questionToken || p.initializer),
    }));
  const found = new Map<string, Param[] | null>();
  for (const statement of source.statements) {
    const exported = ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) continue;
    if (ts.isFunctionDeclaration(statement) && statement.name) found.set(statement.name.text, params(statement));
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue;
        const init = decl.initializer;
        found.set(decl.name.text, init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) ? params(init) : null);
      }
    }
  }
  return found;
}

/** The call a story writes for one factory, as candidate (source, value) argument lists. */
function callCandidates(params: Param[], ctx: Ctx): { source: string[]; value: unknown[] }[] {
  let candidates: { source: string[]; value: unknown[] }[] = [{ source: [], value: [] }];
  for (const param of params) {
    const fixed =
      /\bTranslate\b/.test(param.type) ? { source: "t", value: ctx.t }
      : /^Locale$|^"(en|es)" \| "(en|es)"$/.test(param.type) ? { source: "localeOf(t)", value: "en" }
      : /^CardCopy$/.test(param.type) ? { source: "cardCopy[localeOf(t)]", value: ctx.cardCopy.en }
      : undefined;
    if (fixed) {
      candidates = candidates.map((c) => ({ source: [...c.source, fixed.source], value: [...c.value, fixed.value] }));
    } else if (param.optional) {
      break;
    } else {
      candidates = candidates.flatMap((c) =>
        hrefShapes.map((shape) => ({ source: [...c.source, shape.source], value: [...c.value, shape.value(ctx)] })),
      );
    }
  }
  return candidates;
}

type Tree = { contract: string; signature: string; [key: string]: unknown };
const isTree = (v: unknown): v is Tree =>
  typeof v === "object" && v !== null && "contract" in v && "signature" in v;

const pascal = (s: string): string =>
  s.replace(/(^|[-_\s])([a-z0-9])/gi, (_m, _sep, c: string) => c.toUpperCase());

const vite = await createServer({
  root: docs,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  resolve: {
    // The docs app's own `paths` (apps/docs/tsconfig.json), which is what Astro hands Vite there.
    alias: {
      "@/": `${docs}/src/`,
      "@core/": `${repo}/packages/core/`,
      "@vanilla/": `${repo}/packages/vanilla/`,
      "@react/": `${repo}/packages/react/`,
      "@contracts/": `${repo}/contracts/`,
      "@artifacts/": `${repo}/artifacts/`,
    },
  },
});

try {
  const load = (path: string) => vite.ssrLoadModule(path) as Promise<Record<string, unknown>>;
  const { validateUsageTree } = await load("@skryensya/ai-compiler/validate");
  const { sheetsForTree } = await load("@skryensya/ai-compiler/sheets-for-tree");
  const { ui } = await load(join(docs, "src/i18n/ui.ts"));
  const { componentNavigation } = await load(join(docs, "src/lib/navigation.ts"));
  const { placeholderHrefs } = await load(join(docs, "src/lib/placeholder-hrefs.ts"));
  const { cardCopy } = await load(join(docs, "src/examples/card-data.ts"));

  const en = (ui as Record<string, Record<string, string>>).en!;
  const t = Object.assign((key: string) => en[key] ?? key, { locale: "en" });
  const errors = (tree: Tree): number =>
    (validateUsageTree as (tree: Tree) => { problems: { severity: string }[] })(tree).problems.filter(
      (p) => p.severity === "error",
    ).length;

  /* href → "Group/Label", from the catalog the docs rail renders. */
  const titles = new Map<string, string>();
  for (const group of componentNavigation as { group: string; items: { href: string; label: string }[] }[]) {
    for (const item of group.items) titles.set(item.href, `Components/${en[group.group] ?? group.group}/${item.label}`);
  }

  /*
   * EVERY DOCS PAGE THAT SHOWS DEMOS, by route: the page component it renders and the demo modules
   * that component imports. English routes only; a Spanish route renders the same component.
   */
  type Page = { route: string; source: string; modules: Set<string> };
  const pages: Page[] = [];
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? entry.name === "es" ? [] : walk(join(dir, entry.name))
        : entry.name.endsWith(".astro") ? [join(dir, entry.name)] : [],
    );
  const pagesRoot = join(docs, "src/pages");
  for (const file of walk(pagesRoot).sort()) {
    const component = /from\s+"[^"]*\/components\/pages\/(\w+Page)\.astro"/.exec(readFileSync(file, "utf8"))?.[1];
    if (!component) continue;
    const source = readFileSync(join(docs, "src/components/pages", `${component}.astro`), "utf8");
    const modules = new Set([...source.matchAll(/from\s*"[./]*\/demos\/([\w-]+)"/g)].map((m) => m[1]!));
    const route = file.slice(pagesRoot.length).replace(/\.astro$/, "").replace(/\/index$/, "") || "/";
    pages.push({ route, source, modules });
  }

  /* The page a module belongs to: the one named after it, else the first one that imports it. */
  const homeOf = (module: string): Page | undefined =>
    pages.find((p) => p.route === `/components/${module}`) ?? pages.find((p) => p.modules.has(module));

  /* A page's previews, in order: which tree each one calls and the css it passes. */
  function pagePreviews(page: Page | undefined): { tree: string; css?: string; cssFrom?: string }[] {
    if (!page) return [];
    const { source } = page;
    // Every name the page imports from a demo module, so a css identifier can be traced to its export.
    const importedFrom = new Map<string, string>();
    for (const [, names, module] of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*"[./]*\/demos\/([\w-]+)"/g)) {
      for (const name of names!.split(",").map((n) => n.trim().split(/\s+as\s+/).pop()!).filter(Boolean)) {
        importedFrom.set(name, module!);
      }
    }
    const previews: { tree: string; css?: string; cssFrom?: string }[] = [];
    for (const [block] of source.matchAll(/<ComponentPreview\b[\s\S]*?\/>/g)) {
      const tree = /tree=\{\s*(\w+)/.exec(block)?.[1];
      if (!tree) continue;
      const css = /\bcss=\{\s*(\w+)\s*\}/.exec(block)?.[1];
      const cssFrom = css ? importedFrom.get(css) : undefined;
      previews.push({ tree, ...(css && cssFrom ? { css, cssFrom } : {}) });
    }
    return previews;
  }

  const expected = new Map<string, string>();
  const files: { module: string; title: string; text: string }[] = [];
  const report: string[] = [];

  for (const file of readdirSync(demosDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).sort()) {
    const module = basename(file, ".ts");
    if (helperModules.has(module)) continue;
    let exports: Record<string, unknown>;
    try {
      exports = await load(join(demosDir, file));
    } catch (error) {
      report.push(`${module}: not loadable (${(error as Error).message.split("\n")[0]})`);
      continue;
    }

    const home = homeOf(module);
    const previews = pagePreviews(home);
    const stories: { name: string; exportName: string; call: string; css?: string; cssFrom?: string; rank: number }[] = [];
    const sheets = new Set<string>();

    const declared = declaredParams(join(demosDir, file));
    const ctx: Ctx = {
      t,
      cardCopy: cardCopy as Record<string, unknown>,
      placeholderHrefs: placeholderHrefs as () => unknown,
    };
    for (const [exportName, value] of Object.entries(exports)) {
      const params = declared.get(exportName);
      let chosen: { call: string; tree: Tree } | undefined;
      if (params === null && isTree(value) && errors(value) === 0) {
        chosen = { call: `() => demos.${exportName}`, tree: value };
      } else if (params && typeof value === "function") {
        for (const candidate of callCandidates(params, ctx)) {
          try {
            const tree = value(...candidate.value);
            if (isTree(tree) && errors(tree) === 0) {
              const args = candidate.source.join(", ");
              chosen = {
                call: args === "t" ? `demos.${exportName}` : `(t) => demos.${exportName}(${args})`,
                tree,
              };
              break;
            }
          } catch {
            /* wrong argument shape for this factory; try the next */
          }
        }
      }
      if (!chosen) continue;
      for (const sheet of (sheetsForTree as (tree: Tree) => { sheets: string[] })(chosen.tree).sheets) sheets.add(sheet);

      const position = previews.findIndex((p) => p.tree === exportName);
      const preview = previews[position];
      const bare = exportName
        .replace(new RegExp(`^${pascal(module).replace(/^./, (c) => c.toLowerCase())}(?=[A-Z])`), "")
        .replace(/Tree$/, "");
      stories.push({
        name: pascal(bare.replace(/^Tree$/, "") || "Default"),
        exportName,
        call: chosen.call,
        ...(preview?.css ? { css: preview.css, cssFrom: preview.cssFrom } : {}),
        rank: /anatomy/i.test(exportName) ? -1 : position === -1 ? Number.MAX_SAFE_INTEGER : position,
      });
    }

    if (stories.length === 0) {
      report.push(`${module}: no valid tree exports`);
      continue;
    }
    stories.sort((a, b) => a.rank - b.rank);
    /* Names the file itself declares, which a story export must not shadow. */
    const seen = new Set(["Meta", "StoryObj", "Default" + "Export"]);
    for (const story of stories) if (/^(Meta|StoryObj)$/.test(story.name)) story.name = `${story.name}Story`;
    for (const story of stories) {
      if (seen.has(story.name)) story.name = pascal(story.exportName.replace(/Tree$/, ""));
      seen.add(story.name);
    }

    /* The catalog's group and label; a component page the catalog does not list (paused) keeps its
       own name; a demo that no component page shows (foundations, templates) sits apart. */
    const title =
      (home && titles.get(home.route)) ??
      (home?.route.startsWith("/components/")
        ? `Components/Unlisted/${pascal(home.route.split("/").pop()!)}`
        : `Foundations/${pascal(module)}`);
    const cssImports = new Map<string, Set<string>>();
    for (const s of stories) if (s.css && s.cssFrom) (cssImports.get(s.cssFrom) ?? cssImports.set(s.cssFrom, new Set()).get(s.cssFrom)!).add(s.css);
    const uses = (text: string) => stories.some((s) => s.call.includes(text));

    const lines = [
      `// GENERATED by scripts/generate-stories.ts from apps/docs/src/demos/${file}. Do not edit;`,
      `// change the demo (or the docs page that shows it) and run \`pnpm generate\`.`,
      ...[...sheets].sort().map((sheet) => `import "${sheet}";`),
      `import type { Meta, StoryObj } from "@storybook/react-vite";`,
      `import * as demos from "@docs/demos/${module}";`,
      ...[...cssImports].map(([from, names]) =>
        from === module
          ? `const { ${[...names].join(", ")} } = demos;`
          : `import { ${[...names].join(", ")} } from "@docs/demos/${from}";`,
      ),
      ...(uses("placeholderHrefs(") ? [`import { placeholderHrefs } from "@docs/lib/placeholder-hrefs";`] : []),
      ...(uses("cardCopy[") ? [`import { cardCopy } from "@docs/examples/card-data";`] : []),
      ...(uses("localeOf(") ? [`import { localeOf } from "../translate";`] : []),
      `import { treeStory${cssImports.size > 0 ? ", withCss" : ""} } from "../tree-story";`,
      ``,
      `export default { title: __TITLE__, tags: ["autodocs"] } satisfies Meta;`,
      ``,
      ...stories.map((s) => {
        const factory = s.call;
        const extra = s.css ? `, { decorators: [withCss(${s.css})] }` : "";
        return `export const ${s.name}: StoryObj = treeStory(${factory}${extra});`;
      }),
      ``,
    ];
    files.push({ module, title, text: lines.join("\n") });
  }

  /* Two modules on one page (Drawer shows `drawer` and `vaul`) would share a title and collide on
     story ids, so a shared title gets each module's name under it. */
  for (const file of files) {
    const shared = files.filter((other) => other.title === file.title).length > 1;
    const title = shared ? `${file.title}/${pascal(file.module)}` : file.title;
    expected.set(`${file.module}.stories.tsx`, file.text.replace("__TITLE__", JSON.stringify(title)));
  }

  const onDisk = existsSync(outDir) ? readdirSync(outDir).filter((f) => f.endsWith(".stories.tsx")) : [];
  const stale = [
    ...[...expected].filter(([name, text]) => !existsSync(join(outDir, name)) || readFileSync(join(outDir, name), "utf8") !== text).map(([n]) => n),
    ...onDisk.filter((name) => !expected.has(name)),
  ];

  if (check) {
    if (stale.length > 0) {
      console.error(`generate-stories: out of date, run \`pnpm generate\`:\n  ${stale.join("\n  ")}`);
      process.exitCode = 1;
    } else console.log(`generate-stories: ${expected.size} files up to date.`);
  } else {
    mkdirSync(outDir, { recursive: true });
    for (const name of onDisk) if (!expected.has(name)) rmSync(join(outDir, name));
    for (const [name, text] of expected) writeFileSync(join(outDir, name), text);
    const count = [...expected.values()].reduce((n, text) => n + (text.match(/^export const /gm)?.length ?? 0), 0);
    console.log(`generate-stories: ${expected.size} files, ${count} stories.`);
    for (const line of report) console.log(`  skipped ${line}`);
  }
} finally {
  await vite.close();
}
