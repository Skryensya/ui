/*
 * Switching the site's icon set at runtime, the way a reader would see a consumer change theirs.
 *
 * The page ships painted in Phosphor (`iconMarkup` at build). Another set arrives as its own chunk,
 * written by `skryensya icons` into `src/icon-sets/`, and replaces the geometry of every
 * `svg[data-icon]` whose role it draws: viewBox, presentation attributes and body. Class, size and
 * accessibility stay, they belong to the box and not to the set. Its stylesheet replaces the native
 * select and carousel icons. `[data-icon-set-fixed]` opts a subtree out: the comparison tables show
 * one set per column on purpose.
 */
import type { IconData, IconSet } from "@skryensya/core/icon";
import { defaultIconSet, siteIconSetIds, type SiteIconSetId } from "../lib/icon-set-options";

const modules = import.meta.glob<{ icons: IconSet }>("../icon-sets/*.ts");
const sheets = import.meta.glob<string>("../icon-sets/*.css", { query: "?raw", import: "default" });

export const isSiteIconSet = (id: string | null | undefined): id is SiteIconSetId =>
  !!id && (siteIconSetIds as string[]).includes(id);

/** Written on `<html>` once the reader's set is painted; until then site.css hides icons so the default set never flashes (layout is kept, so no CLS). */
const ICONS_READY = "data-sk-icons-ready";

/** The set and its stylesheet. Cached by the module loader, so a second pick costs nothing. */
export async function loadIconSet(id: SiteIconSetId): Promise<{ set: IconSet; css: string }> {
  const [module, css] = await Promise.all([modules[`../icon-sets/${id}.ts`]!(), sheets[`../icon-sets/${id}.css`]!()]);
  return { set: module.icons, css };
}

/* Every presentation attribute any mapped set writes on its <svg>; cleared before the new set's go on. */
const PRESENTATION = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin"];

function paint(svg: SVGElement, icon: IconData): void {
  for (const name of PRESENTATION) svg.removeAttribute(name);
  for (const [name, value] of Object.entries(icon.attrs ?? {})) svg.setAttribute(name, value);
  svg.setAttribute("viewBox", icon.viewBox);
  // Trusted geometry: generated at build from the site's own dev dependencies (decision 15).
  svg.innerHTML = icon.body;
}

/** Repaints every `svg[data-icon]` under `root` whose role `set` draws, outside `[data-icon-set-fixed]`. */
export function repaintIcons(root: ParentNode, set: IconSet): void {
  const svgs = root instanceof SVGElement && root.matches("svg[data-icon]") ? [root] : [...root.querySelectorAll<SVGElement>("svg[data-icon]")];
  for (const svg of svgs) {
    if (svg.closest("[data-icon-set-fixed]")) continue;
    const icon = (set as Record<string, IconData | undefined>)[svg.getAttribute("data-icon")!];
    if (icon) paint(svg, icon);
  }
}

/** Puts the set's native-control stylesheet after the default one, so it wins in the same layer. */
export function applyIconSetCss(doc: Document, css: string | null): void {
  let style = doc.getElementById("docs-icon-set-css");
  if (css === null) return style?.remove();
  if (!style) {
    style = doc.createElement("style");
    style.id = "docs-icon-set-css";
    doc.head.append(style);
  }
  style.textContent = css;
}

/**
 * Keeps `doc` painted in the set its `<html data-icon-set>` names: now, on every change of the
 * attribute, and for icons added later (a menu that renders its items on open). `onSet` hears each
 * loaded set, for a React root that has to re-render with it.
 */
export function followIconSet(doc: Document, onSet?: (set: IconSet | null) => void): void {
  let current: IconSet | null = null;
  let token = 0;
  const sync = async () => {
    const id = doc.documentElement.getAttribute("data-icon-set");
    const mine = ++token;
    const wanted = isSiteIconSet(id) ? id : defaultIconSet;
    // The page was built in the default: nothing to load until a reader leaves it.
    if (wanted === defaultIconSet && !current) return void doc.documentElement.setAttribute(ICONS_READY, "");
    try {
      const { set, css } = await loadIconSet(wanted);
      if (mine !== token) return;
      current = set;
      applyIconSetCss(doc, wanted === defaultIconSet ? null : css);
      repaintIcons(doc, set);
      onSet?.(set);
    } finally {
      // Also on a failed chunk: site.css hides the built-in glyphs until this is set, and must never keep them hidden.
      if (mine === token) doc.documentElement.setAttribute(ICONS_READY, "");
    }
  };
  new MutationObserver(sync).observe(doc.documentElement, { attributes: true, attributeFilter: ["data-icon-set"] });
  new MutationObserver((records) => {
    if (!current) return;
    for (const record of records)
      for (const node of record.addedNodes) if (node instanceof Element) repaintIcons(node, current);
  }).observe(doc.documentElement, { childList: true, subtree: true });
  void sync();
}
