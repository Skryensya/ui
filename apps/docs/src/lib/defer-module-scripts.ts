import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

/*
 * MODULE SCRIPTS START AFTER FIRST PAINT, NOT BEFORE IT.
 *
 * A `<script type="module" src>` never blocks rendering, but its request starts the moment the
 * parser sees it, and the enhancer runtime behind it fans out into ~60 small modules. On a phone's
 * connection all of that shares the pipe with the HTML and the stylesheets the first paint is
 * waiting on. Measured on /components/listbox (Lighthouse, simulated mobile): first paint 1.53s with
 * the scripts in the page, 1.38s with them started after the first frame.
 *
 * Nothing here needs to run before the reader sees the page: every enhancer upgrades markup that
 * already renders on its own, and what must happen before paint (theme, language, preview binding)
 * is `is:inline`, which this leaves alone. The tags are re-inserted rather than `import()`ed in a
 * chain: an inserted module script with `async = false` downloads in parallel with the others and
 * still runs in insertion order (HTML's "execute in order as soon as possible" list), and one failing
 * does not stop the rest, exactly like the parser-inserted tags they replace.
 */
export function deferModuleScripts(html: string): string {
  const sources: string[] = [];
  const out = html.replace(/<script type="module" src="([^"]+)"><\/script>/g, (_, src: string) => {
    sources.push(src);
    return "";
  });
  if (sources.length === 0) return html;
  /* The timer is the fallback for a tab opened in the background, where frames never come. */
  const loader =
    `<script>(function(s){var go=function(){go=null;s.forEach(function(u){var e=document.createElement("script");e.type="module";e.async=false;e.src=u;document.body.appendChild(e)})};` +
    `requestAnimationFrame(function(){setTimeout(function(){go&&go()})});setTimeout(function(){go&&go()},2000)})(${JSON.stringify(sources)})</script>`;
  return out.replace("</body>", `${loader}</body>`);
}

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith(".html")).map((e) => join(e.parentPath, e.name));
}

export function deferModuleScriptsIntegration(): AstroIntegration {
  return {
    name: "docs:defer-module-scripts",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        for (const file of await htmlFiles(fileURLToPath(dir))) {
          const html = await readFile(file, "utf8");
          const deferred = deferModuleScripts(html);
          if (deferred !== html) await writeFile(file, deferred);
        }
      },
    },
  };
}
