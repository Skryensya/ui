import { dirname, resolve } from "node:path";
import type { AstroUserConfig } from "astro";

/* docs does not depend on vite (see astro.config.ts), so the plugin type comes through astro. */
type Plugins = NonNullable<NonNullable<AstroUserConfig["vite"]>["plugins"]>;

/*
 * CORE'S `@import`S BECOME MODULE IMPORTS, SO A SHARED SHEET SHIPS ONCE.
 *
 * Core stylesheets name their dependencies with `@import url("./button.css")`, the right contract
 * for a consumer that links one file. Vite, though, inlines every `@import` into the sheet that
 * holds it, so each chunk that reaches tour.css, annotation.css, select.css… carried its own copy
 * of button.css and loader.css: measured on /es/componentes/button-group, 10 render-blocking
 * sheets, ~500KB, button.css in four of them.
 *
 * Here the `@import` lines are taken out before Vite's CSS pipeline sees them and re-added after
 * it as `import` statements of the module it produced. Each sheet is then ONE module in the graph,
 * Rollup puts a shared one in one chunk, and a dependency still lands before its dependant (an
 * import runs before the module that imports it), which is the order `@import` gave.
 */
const CORE_CSS = /\/packages\/core\/css\/.+\.css$/;
const IMPORT = /^@import url\("(\.{1,2}\/[^"]+\.css)"\);\s*$/gm;

export function cssImportGraph(): Plugins {
  const deps = new Map<string, string[]>();
  const matches = (id: string) => !id.includes("?") && CORE_CSS.test(id);

  return [
    {
      name: "sk-css-import-graph:strip",
      enforce: "pre",
      transform(code: string, id: string) {
        if (!matches(id)) return;
        const found: string[] = [];
        const stripped = code.replace(IMPORT, (_, path: string) => {
          found.push(resolve(dirname(id), path));
          return "";
        });
        if (found.length === 0) return;
        deps.set(id, found);
        return { code: stripped, map: null };
      },
    },
    {
      name: "sk-css-import-graph:link",
      enforce: "post",
      transform(code: string, id: string) {
        const found = matches(id) ? deps.get(id) : undefined;
        if (!found) return;
        return { code: found.map((path) => `import ${JSON.stringify(path)};\n`).join("") + code, map: null };
      },
    },
  ];
}
