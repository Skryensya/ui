/*
 * STYLESHEETS FOR WHAT IS CLOSED AT LOAD, INSERTED OFF THE FIRST PAINT.
 *
 * A sheet that only styles a `<dialog>` the reader has not opened yet (the palette, the drawer, the
 * preference sheet, the hook playground, the tour) has no business holding the first paint. Its
 * owner imports it as `?inline` from a client script, and this inserts it once that script runs,
 * which the layout already starts after the first frame (`defer-module-scripts.ts`).
 *
 * `?inline`, not `?url`: Astro's client build deletes a CSS file whose module a page also imports
 * normally, so a `?url` could point at nothing (dialog-vaul.css did). The text rides in the script's
 * own chunk, processed and minified like any sheet.
 *
 * WHERE IT LANDS IS THE CASCADE, not a detail. These sheets override some (the palette over Dialog
 * and Button) and are overridden by others (a page's own Tile tweaks), so first in `<head>` loses the
 * former and last loses the latter. They go right after the layout's component sheets, where
 * Base.astro imported them: `styles/deferred-styles-anchor.css` marks that spot, inside Base's bundle
 * in a build and as its own `<style>` in dev. No anchor (a page without the layout): appended.
 * Each call goes after the previous calls' sheets, so a sheet two owners share (Dialog) sits at its
 * first insertion and whatever overrides it, from either owner, still comes later.
 */
const ANCHOR = "--docs-deferred-styles-anchor";
const inserted = new Set<string>();
let last: Element | null = null;

function anchorSheet(): Element | null {
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSStyleRule && rule.style.getPropertyValue(ANCHOR)) return sheet.ownerNode as Element;
      }
    } catch {
      /* A cross-origin sheet hides its rules; it is not the anchor. */
    }
  }
  return null;
}

export function insertDeferredStyles(sheets: readonly string[]): void {
  for (const css of sheets) {
    if (inserted.has(css)) continue;
    inserted.add(css);
    const after = last ?? anchorSheet();
    const style = Object.assign(document.createElement("style"), { textContent: css });
    if (after) after.after(style);
    else document.head.append(style);
    last = style;
  }
}
