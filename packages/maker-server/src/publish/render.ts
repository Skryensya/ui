import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { validateUsageTree, type Problem } from "@skryensya/ai-compiler/validate";
import { composePage, toUsageTree, type MakerNode, type MakerPageEntry, type MakerSite } from "@skryensya/maker-model";

/*
 * A MAKER SITE AS STATIC FILES: one HTML document per page, at the path the page declares
 * (`/` → `index.html`, `/about` → `about/index.html`), each loading the shared site kit from a
 * content-addressed path. The markup is the emitter's, the same `validate_ui` returns, so a
 * published page is exactly what the stage showed with the vanilla binding.
 *
 * Nothing of the author's reaches the document as code: text is escaped by the emitter, `style` and
 * `class` were never authorable, and a URL that runs code refuses the whole publication.
 */

export type SiteFile = { readonly path: string; readonly type: string; readonly body: string };

export type Rendered =
  | { readonly ok: true; readonly files: readonly SiteFile[]; readonly pending: readonly (Problem & { page: string })[] }
  | { readonly ok: false; readonly reason: string };

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

export function pageFile(page: MakerPageEntry): string {
  return page.path === "/" ? "index.html" : `${page.path.slice(1)}/index.html`;
}

/** `root` is what is drawn when it is not the page's own tree: the page inside its layout. */
export function document(page: MakerPageEntry, options: { siteTitle: string; kitBase: string; lang: string; root?: MakerNode }): string {
  const title = page.path === "/" ? options.siteTitle : `${page.name} · ${options.siteTitle}`;
  const body = emitMarkup(toUsageTree(options.root ?? page.root));
  return `<!doctype html>
<html lang="${escape(options.lang)}" data-scheme="system">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escape(title)}</title>
<link rel="stylesheet" href="${escape(options.kitBase)}/kit.css">
<script type="module" src="${escape(options.kitBase)}/kit.js"></script>
</head>
<body>
${body}
</body>
</html>
`;
}

export function renderSite(site: MakerSite, options: { siteTitle: string; kitBase: string; lang?: string }): Rendered {
  const lang = options.lang ?? "es";
  const pending: (Problem & { page: string })[] = [];
  /* Every page is published inside its layout, so the layout's header and footer are in each file and checked with it. */
  const drawn = new Map(site.pages.map((page) => [page.id, composePage(site, page).root]));
  for (const page of site.pages) {
    for (const problem of validateUsageTree(toUsageTree(drawn.get(page.id)!)).problems) {
      if (problem.rule === "unsafe-url") return { ok: false, reason: `Page "${page.name}" (${page.path}): ${problem.message}` };
      if (problem.severity === "error") pending.push({ ...problem, page: page.path });
    }
  }
  const files = site.pages.map((page) => ({
    path: pageFile(page),
    type: "text/html; charset=utf-8",
    body: document(page, { siteTitle: options.siteTitle, kitBase: options.kitBase, lang, root: drawn.get(page.id)! }),
  }));
  return { ok: true, files, pending };
}
