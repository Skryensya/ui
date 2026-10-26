import { defaultLocale } from "../i18n/locales";
import { availableLocales, localizePath, publishedCanonicals } from "../i18n";

/*
 * THE LANGUAGE REDIRECT'S MAP, for nginx (`nginx.docs.conf` includes it; `Dockerfile.docs` copies it
 * out of the web root). Every page published in both languages, both directions, written as nginx
 * `map` blocks: `$sk_twin_es` is the Spanish twin of an unprefixed page, `$sk_twin_en` the English
 * twin of a Spanish one. Built from the same page directory as the `hreflang` alternates, so the
 * server can never redirect onto a translation that does not exist.
 *
 * The redirect used to run in the browser, before paint: a reader whose browser asked for Spanish
 * downloaded the whole English page (its HTML, every stylesheet, the font) only to throw it away.
 * Answering at the server costs one round trip instead.
 */
export function buildLangTwins(): string {
  const toEs: string[] = [];
  const toEn: string[] = [];
  for (const canonical of publishedCanonicals()) {
    if (availableLocales(canonical).length < 2) continue;
    const en = localizePath(canonical, defaultLocale);
    const es = localizePath(canonical, "es");
    // Both spellings of each URL: nginx sees `/architecture` and `/architecture/` as different keys.
    for (const from of new Set([en, en === "/" ? en : `${en}/`])) toEs.push(`  "${from}" "${es}";`);
    for (const from of new Set([es, `${es}/`])) toEn.push(`  "${from}" "${en}";`);
  }
  return [
    `map $uri $sk_twin_es {\n  default "";\n${toEs.join("\n")}\n}`,
    `map $uri $sk_twin_en {\n  default "";\n${toEn.join("\n")}\n}`,
  ].join("\n\n") + "\n";
}

export function GET(): Response {
  return new Response(buildLangTwins(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
