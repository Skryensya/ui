/*
 * The no-toolchain path, two ways: one batteries-included bundle, or tokens plus only the
 * component/pattern CSS a page actually links. The Sass path stays the authoring surface AND the
 * a-la-carte path for a bundler-aware consumer: `@use "@skryensya/core/tokens"` plus whichever
 * `components/*.css` or `patterns/*.css` it imports. This script serves the reader with no bundler:
 *
 *   <link rel="stylesheet" href=".../@skryensya/core/dist/skryensya.css">             batteries included
 *   <link rel="stylesheet" href=".../@skryensya/core/dist/tokens.css">                tokens only, then
 *   <link rel="stylesheet" href=".../@skryensya/core/dist/components/button.css">     pick what you use
 *
 * (Physical paths: a browser cannot resolve package `exports`. The `@skryensya/core/components/*`
 * specifier is for a bundler and still points at the commented sources in css/.)
 *
 * `components/*.css` and `patterns/*.css` already declare their own cross-file dependencies via
 * native `@import url(...)` (calendar imports button, layout imports box/wrapper/image-frame, …), so
 * linking just the files a page uses pulls in exactly what those files need: nothing more. Every
 * generated file here is minified: the reader of a linked stylesheet edits their own CSS, not this
 * one, so there is nothing gained by shipping it expanded. `primitives.scss` already includes the
 * public palette set, so the bundle needs no brand selection or attribute. Generated output is never
 * committed; it is published via package.json `files`.
 */
import { compile, compileString } from "sass";
import { transform } from "lightningcss";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CSS = join(ROOT, "css");
const DIST = join(ROOT, "dist");

/** Minifies compiled CSS. No `targets`: this ships modern syntax (oklch, color-mix, cascade
 * layers, `::scroll-marker`) as-authored rather than downleveling it for older engines.
 * `errorRecovery`: lightningcss's own parser doesn't know every pseudo-element this source uses
 * yet (`::picker(select)`, `::scroll-button`, both behind `@supports`/progressive enhancement) and
 * without it ABORTS THE WHOLE BUNDLE on the first one instead of just warning - one component a
 * browser already renders correctly then fails every OTHER component's build too. With it on,
 * lightningcss keeps a rule it cannot parse byte-for-byte (so a browser that implements the
 * pseudo-element still gets it) and only logs a warning for the ones it does not recognize. */
const minify = (code: string, filename: string) =>
  transform({ filename, code: Buffer.from(code), minify: true, errorRecovery: true }).code;

/** Writes a minified file under `dist/`, creating parent directories as needed. */
function writeDist(relPath: string, css: string, filename: string) {
  const out = join(DIST, relPath);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, minify(css, filename));
  return out;
}

// Token tiers already include palettes; optional dimensions follow. The layer statement fixes priority
// regardless of source order.
//
// EVERY dimension ships here, radius AND press scale. The bundle is the no-toolchain path, so a
// dimension missing from this list is a dimension that does not exist for that consumer. The Sass path
// stays opt-in per dimension; the bundle is batteries-included by definition, and an unused
// `[data-press-scale]` block costs one declaration.
const ENTRY = `
@use "layers";
@use "primitives";
@use "semantic";
@use "modes/hc";
@use "modes/hc-appearance";
@use "dimensions/radius";
@use "dimensions/press-scale";
@use "mixins";
@layer primitives, semantic, components, overrides;
@include mixins.forced-colors;
`;

const tokensCss = compileString(ENTRY, { loadPaths: [CSS], style: "expanded" }).css;

/*
 * A sheet's APPEARANCE siblings (`button.tactile.css` beside `button.css`) must land AFTER their base:
 * the bundle strips every `@import`, so file order IS the cascade, and plain alphabetical order puts
 * `button.brutalist.css` before `button.css` ('b' < 'c'). Sorted by the base's name first, base before
 * its siblings, so every other pair keeps the order it always had.
 */
const baseOf = (names: ReadonlySet<string>, f: string) => {
  const m = /^(.+)\.[a-z]+\.css$/.exec(f);
  return m && names.has(`${m[1]}.css`) ? `${m[1]}.css` : f;
};
const readDir = (sub: string) => {
  const names = new Set(readdirSync(join(CSS, sub)).filter((f) => f.endsWith(".css")));
  const key = (f: string) => baseOf(names, f);
  return [...names]
    .sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : a === key(a) ? -1 : b === key(b) ? 1 : a < b ? -1 : 1))
    .map((f) => ({ f, css: readFileSync(join(CSS, sub, f), "utf8") }));
};

const patterns = readDir("patterns");
const components = readDir("components");
// Effects (ADR-20): opt-in decorative motion applied over an element or component. Bundled AFTER
// components so an effect class can sit on top of a component's own rules; never in `foundation.css`
// or `tokens.css`, which are the pre-component baseline.
const effects = readDir("effects");

// One @charset, at the very top, strip any that the parts carry in. Every part's own
// `@import url("./sibling.css")` also gets stripped here: the bundle already inlines every pattern
// and every component unconditionally, so the imported file is always present in full elsewhere in
// this same file, making the `@import` pure dead weight. And, worse, invalid CSS in this position
// (an `@import` may only precede other rules, which this bundle's tokens section already emitted).
const strip = (css: string) =>
  css.replace(/@charset[^;]*;\s*/gi, "").replace(/^@import\s+url\([^)]*\)\s*;\s*$/gim, "");
const section = (label: string, items: { f: string; css: string }[]) =>
  items.map(({ f, css }) => `/* ── ${label}/${f} ── */\n${strip(css)}`).join("\n\n");

const bundle =
  `@charset "UTF-8";\n` +
  `/* @skryensya/core, batteries-included bundle. Generated by scripts/build-css.ts (ADR-19). */\n\n` +
  strip(tokensCss) +
  `\n\n` +
  section("patterns", patterns) +
  `\n\n` +
  section("components", components) +
  `\n\n` +
  section("effects", effects) +
  `\n`;

mkdirSync(DIST, { recursive: true });
const results: [string, string, string][] = [];

results.push([
  "skryensya.css",
  writeDist("skryensya.css", bundle, "skryensya.css"),
  `tokens + ${patterns.length} patterns + ${components.length} components + ${effects.length} effects`,
]);

// The a-la-carte files for a page with no bundler, which can only link physical files (it cannot
// resolve `exports`). Same sources the Sass/bundler path reads from css/, minified: 51% of a
// component's source bytes are comments, and prose does not gzip away (button.css: 18.4 kB gz as
// authored, 3.0 kB minified). Their own `@import url(...)` between siblings stays, and still resolves
// because patterns/ and components/ keep their relative layout here.
let singles = 0;
let singlesBytes = 0;
for (const [sub, items] of [["components", components], ["patterns", patterns], ["effects", effects]] as const)
  for (const { f, css } of items) {
    singlesBytes += readFileSync(writeDist(`${sub}/${f}`, css, f)).length;
    singles++;
  }

// The foundation alone, no patterns or components: everything a consumer needs before it links even
// one component. Same ENTRY as the full bundle above (so it stays in lockstep with it), just without
// the two `section(...)` calls that append patterns and components. Published as the no-toolchain
// baseline a static app can link once before choosing component CSS.
const foundationCss = `@charset "UTF-8";\n` + strip(tokensCss) + `\n`;
results.push([
  "foundation.css",
  writeDist("foundation.css", foundationCss, "foundation.css"),
  "tokens + modes/hc + dimensions/radius + dimensions/press-scale, no patterns or components",
]);

// The a-la-carte path: tokens compiled standalone, so a page can link just the components it uses
// instead of the whole bundle. Primitives + semantic only, matching what a bare `@use
// "@skryensya/core/tokens"` gives a Sass consumer before it opts into modes/dimensions. The four
// patterns `tokens.scss` ships in base. State-layer, visually-hidden, icon, query container; never opt-in, see that
// file's own header. Are inlined here rather than `@import`-ed: their source `@import
// url("./patterns/…")` is only valid relative to css/, and this file is published from dist/.
const TOKENS_ENTRY = `
@use "layers";
@use "primitives";
@use "semantic";
@use "modes/hc";
@use "modes/hc-appearance";
@use "mixins";
@layer primitives, semantic, components, overrides;
@include mixins.forced-colors;
`;
const BASE_PATTERNS = ["state-layer.css", "visually-hidden.css", "icon.css", "query-container.css"];
const tokensOnlyCss = compileString(TOKENS_ENTRY, { loadPaths: [CSS], style: "expanded" }).css;
const tokensOut =
  `@charset "UTF-8";\n` +
  strip(tokensOnlyCss) +
  `\n\n` +
  section("patterns", patterns.filter((p) => BASE_PATTERNS.includes(p.f)));

results.push([
  "tokens.css",
  writeDist("tokens.css", tokensOut, "tokens.css"),
  "primitives + semantic + high contrast + forced colors + the always-on patterns",
]);

for (const [rel, label] of [
  ["dimensions/radius.scss", "dimensions/radius.css"],
  ["dimensions/press-scale.scss", "dimensions/press-scale.css"],
]) {
  const css = compile(join(CSS, rel), { loadPaths: [CSS], style: "expanded" }).css;
  results.push([label, writeDist(label, css, label), "optional, opt in like the Sass path"]);
}

for (const [name, path, note] of results) {
  const kb = (readFileSync(path).length / 1024).toFixed(1);
  console.log(`✓ dist/${name}, ${kb} kB (${note})`);
}
console.log(`✓ dist/{components,patterns,effects}/*.css, ${singles} files, ${(singlesBytes / 1024).toFixed(1)} kB in total (minified, for linking one by one without a bundler)`);
