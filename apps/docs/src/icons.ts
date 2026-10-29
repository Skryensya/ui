/*
 * The site's icons.
 *
 * The site brings no geometry of its own: it binds a published set, which is the path it documents.
 * Phosphor is the site's choice, not the system's: core names no tenants (decision 2), so there is no
 * "official" set, there are three published ones and you choose.
 *
 * Changing sets is changing the two lines below. No call site moves, and that is exactly what the
 * stable vocabulary buys.
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import { materialIcons } from "@skryensya/icons-material";
import { phosphorIcons } from "@skryensya/icons-phosphor";

/*
 * THE SET AND ITS ID ARE THE SAME FACT, and that is why they come from the same place.
 *
 * `siteIcons` is the geometry that `iconMarkup` serializes at build; `siteIconSet` is the id written
 * on `<html>` so CSS and preview frames can name the same set. Keeping both beside each other avoids
 * a runtime icon-swap module in the docs shell: the chrome ships already painted in the site set.
 */
export const siteIconSet = "phosphor";
export const siteIcons = phosphorIcons;

/** The three published sets, so the page shows them side by side instead of asserting they exist. */
export const allSets: readonly { id: string; label: string; licence: string; set: IconSet }[] = [
  { id: "lucide", label: "Lucide", licence: "ISC", set: lucideIcons },
  { id: "phosphor", label: "Phosphor", licence: "MIT", set: phosphorIcons },
  { id: "material", label: "Material Symbols", licence: "Apache-2.0", set: materialIcons },
];

/*
 * The site's serializer: the only string encoding of the markup contract, over `renderIconBox`.
 *
 * The system does NOT ship this (decision 15): a vanilla consumer writes the `<svg>` by hand, and what
 * the system documents is exactly this shape. Here it lives as a site helper, and the two public
 * entry points, stable role and own geometry, are one-line adapters over it, instead of two string
 * templates that could drift apart. The box (class, viewBox, size, a11y, precedence) is computed by
 * core; the site only serializes it to a string.
 */
function svgString(
  icon: IconData,
  dataIcon: string,
  { size, className, extraAttrs }: { size?: IconSize; className?: string; extraAttrs?: Readonly<Record<string, string>> } = {},
): string {
  const { presentation, box, body } = renderIconBox({ icon, dataIcon, size, className });
  const serialize = (pairs: [string, string][]) => pairs.map(([k, v]) => `${k}="${v}"`).join(" ");
  // presentation, then the consumer's extra attrs (between set and box, as in the other bindings),
  // and finally the box, which wins.
  const attrs = [
    serialize(presentation),
    ...(extraAttrs ? [serialize(Object.entries(extraAttrs) as [string, string][])] : []),
    serialize(box),
  ].filter(Boolean);

  return `<svg ${attrs.join(" ")}>${body}</svg>`;
}

/**
 * The markup contract for a stable role. An icon is decorative by default: in a trigger with text, the
 * text already names the action.
 */
export function iconMarkup(
  name: StableIconName,
  { className, size, set = siteIcons }: { className?: string; size?: IconSize; set?: IconSet } = {},
): string {
  return svgString(set[name], name, { size, className });
}

/**
 * Markup for own geometry, same shape as `iconMarkup`, but the name is not a stable role, so
 * the site's icon-set swap leaves it alone (`applyIconSet` skips unknown `data-icon` keys).
 */
export function iconDataMarkup(
  name: string,
  icon: IconData,
  {
    className,
    size,
    attrs: extraAttrs,
  }: { className?: string; size?: IconSize; attrs?: Readonly<Record<string, string>> } = {},
): string {
  return svgString(icon, name, { size, className, extraAttrs });
}

const strokeAttrs = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/*
 * An icon OUTSIDE the set, the only thing that is opt-in. There is no SetIcon: this is geometry passed
 * as `data`, and the coupling to the project is visible at the call site, which is the point.
 */
export const sparkle: IconData = {
  viewBox: "0 0 24 24",
  attrs: { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linejoin": "round" },
  body: `<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />`,
};


/* The reader-preferences button. No stable role draws "adjust how this reads": `settings` is a gear and `appearance`
   reads as a brush, so this is Phosphor's own circle-half (the display / theme glyph), in the set's own attrs. */
export const displayIcon: IconData = {
  viewBox: "0 0 256 256",
  attrs: siteIcons.settings.attrs,
  body: `<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,16.37a86.4,86.4,0,0,1,16,3V212.67a86.4,86.4,0,0,1-16,3Zm32,9.26a87.81,87.81,0,0,1,16,10.54V195.83a87.81,87.81,0,0,1-16,10.54ZM40,128a88.11,88.11,0,0,1,80-87.63V215.63A88.11,88.11,0,0,1,40,128Zm160,50.54V77.46a87.82,87.82,0,0,1,0,101.08Z"/>`,
};

/* Lucide Sun / Moon / Monitor lived here for the docs theme toggle; they are now the stable
 * roles mode-light / mode-dark / mode-system in the published sets. */

/* Contrast toggle glyphs, a two-state pair that cross-fades in place:
 * an empty ring for normal, and the same ring with its inner half filled for high, so the
 * fill visibly appears the moment contrast turns on. The filled half uses currentColor while the ring
 * stays stroked. */
/* Phosphor's `github-logo` (regular): a brand mark, so it is not a stable role in any set. */
export const githubLogo: IconData = {
  viewBox: "0 0 256 256",
  attrs: { fill: "currentColor" },
  body: `<path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z" />`,
};

export const contrastNormal: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="10" />`,
};

export const contrastHigh: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="10" /><path d="M12 6a6 6 0 0 1 0 12z" fill="currentColor" stroke="none" />`,
};

/* The header's language picker stopped being own geometry: `language` is now a stable role (see
 * `stableIconNames` in core), the three published sets draw it, and `LanguageMenu.astro` asks for it
 * with `iconMarkup("language")` like any other role. */

/* Playback transport for the /motion samples, another pair of two states that swap in the same slot.
 * They are not stable roles: play/pause is a player's vocabulary, not the system's, so it comes in as
 * the page's own geometry (decision 15) instead of forcing the three published sets to draw it. */
export const play: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<polygon points="6 3 20 12 6 21 6 3" />`,
};

export const pause: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />`,
};
