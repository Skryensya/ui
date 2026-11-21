import type { IconSize, StableIconName } from "@skryensya/core/icon";
import { iconMarkup } from "../icons";

/*
 * ICON PLACEHOLDERS PAINTED AT BUILD. Authored markup writes `<span data-sk-icon="check">` and the vanilla enhancer
 * swaps it for the real `<svg>` once the page's script runs, which left every such icon (the theme toggle in the header,
 * the preferences panel, the canvas specimens) empty on first load. Done here the way the enhancer does it (`buildIcon`):
 * the same svg from `iconMarkup`, carrying over the attributes the author put on the placeholder, in the site's default
 * set that the reader's set repaints (`scripts/icon-set.ts`). A placeholder with a label, or one the set does not draw,
 * is left for the script, which still handles it.
 */
const PLACEHOLDER = /<span\b([^>]*\bdata-sk-icon="([a-z0-9-]+)"[^>]*)>\s*<\/span>/g;
const ATTRIBUTE = /([a-zA-Z_:][-\w:.]*)(?:="([^"]*)")?/g;
const HANDLED = new Set(["data-sk-icon", "data-sk-icon-size", "data-sk-icon-label", "class"]);

export function paintIconPlaceholders(html: string): string {
  return html.replace(PLACEHOLDER, (placeholder, attributes: string, name: string) => {
    const author = new Map<string, string>();
    for (const [, key, value] of attributes.matchAll(ATTRIBUTE)) author.set(key!, value ?? "");
    if (author.has("data-sk-icon-label")) return placeholder;
    const carried = [...author].filter(([key]) => !HANDLED.has(key.toLowerCase())).map(([key, value]) => (value ? `${key}="${value}"` : key));
    try {
      const svg = iconMarkup(name as StableIconName, { size: author.get("data-sk-icon-size") as IconSize | undefined, className: author.get("class") || undefined });
      return carried.length ? svg.replace("<svg", `<svg ${carried.join(" ")}`) : svg;
    } catch {
      return placeholder;
    }
  });
}
