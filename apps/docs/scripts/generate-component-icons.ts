/*
 * Generates the component catalogue's icons: one Phosphor glyph per component page.
 *
 * WHY THESE ARE NOT STABLE ROLES. `stableIconNames` (core/icon.ts) holds interface roles every set has
 * to draw; "carousel" or "qr-code" name a page of this site, not a role an app reaches for, and adding
 * ~80 of them would be ~240 drawings owed by three sets. So the catalogue keeps its own table. Where a
 * stable role already says the same thing (`calendar`, `code`, `folder`…) the entry names the ROLE, and
 * the icon follows the site's set like every other role on the page.
 *
 * WHY GENERATED DATA, same reasoning as `@skryensya/icons-phosphor`'s own generator: the page receives
 * IconData and zero Phosphor runtime. The `.svg` assets are resolved THROUGH `@skryensya/icons-phosphor`, the set this
 * site already binds, so the geometry here is always the same Phosphor release as the rest of the chrome.
 *
 *   node scripts/generate-component-icons.ts          writes src/lib/generated/component-icons.ts
 *   node scripts/generate-component-icons.ts --check  fails when that file is stale
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stableIconNames } from "@skryensya/core/icon";

const require = createRequire(import.meta.url);
/* The package's own entry (its exports map does not publish package.json); its devDependency resolves from there. */
const setRequire = createRequire(require.resolve("@skryensya/icons-phosphor"));

/* Page → Phosphor's name, or `role:<stable role>`. The only part a human maintains. */
const MAP: Record<string, string> = {
  "/components/accordion": "rows",
  "/components/app-shell": "layout",
  "/components/annotation": "note-pencil",
  "/components/diagram": "graph",
  "/components/avatar": "user-circle",
  "/components/expressive-avatar": "smiley",
  "/components/back-to-top": "arrow-line-up",
  "/components/badge": "seal",
  "/components/box": "square",
  "/components/breadcrumb": "caret-double-right",
  "/components/button": "cursor-click",
  "/components/calendar": "role:calendar",
  "/components/callout": "megaphone",
  "/components/card": "rectangle",
  "/components/canvas": "frame-corners",
  "/components/carousel": "slideshow",
  "/components/changelog": "clock-counter-clockwise",
  "/components/checkbox": "check-square",
  "/components/clipboard": "clipboard-text",
  "/components/listbox": "list-checks",
  "/components/code-preview": "role:code",
  "/components/color-picker": "eyedropper",
  "/components/combobox": "list-magnifying-glass",
  "/components/command-palette": "role:search",
  "/components/comment-thread": "chats",
  "/components/data-grid": "grid-nine",
  "/components/date-picker": "calendar-dots",
  "/components/comparison-table": "columns",
  "/components/description-list": "list-bullets",
  "/components/dialog": "app-window",
  "/components/dialog-stack": "stack",
  "/components/drawer": "sidebar-simple",
  "/components/empty-state": "tray",
  "/components/fade-edge": "gradient",
  "/components/feed": "rss",
  "/components/drop-zone": "upload-simple",
  "/components/footer": "align-bottom-simple",
  "/components/form-field": "textbox",
  "/components/grid": "squares-four",
  "/components/heading": "text-h",
  "/components/hero": "presentation",
  "/components/icon": "shapes",
  "/components/image-frame": "image",
  "/components/media-overlay": "image-square",
  "/components/morph-stack": "stack-simple",
  "/components/lightbox": "images",
  "/components/inline": "columns",
  "/components/input": "cursor-text",
  "/components/kbd": "keyboard",
  "/components/layout-grid": "layout",
  "/components/link": "link",
  "/components/list": "list",
  "/components/loader": "spinner",
  "/components/marquee": "arrows-horizontal",
  "/components/megamenu": "browser",
  "/components/menu": "list",
  "/components/app-bar": "app-window",
  "/components/menubar": "browsers",
  "/components/message": "chat",
  "/components/meter": "gauge",
  "/components/navbar": "browser",
  "/components/number-field": "hash",
  "/components/pagination": "files",
  "/components/placeholder": "selection",
  "/components/password-input": "key",
  "/components/search-field": "magnifying-glass",
  "/components/otp-input": "password",
  "/components/popover": "chat-text",
  "/components/presence": "eye",
  "/components/procedure": "list-numbers",
  "/components/timeline": "git-commit",
  "/components/progress": "circle-notch",
  "/components/qr-code": "qr-code",
  "/components/quote": "quotes",
  "/components/questionnaire": "clipboard-text",
  "/components/radio-group": "radio-button",
  /* `StarHalf` and not `Star`: the half-filled glyph is the one that says "a scale with a fraction
     on it" rather than "favourite", which is what a whole star reads as everywhere else. */
  "/components/rating": "star-half",
  "/components/segmented": "columns",
  "/components/select": "caret-up-down",
  "/components/resizable": "columns",
  "/components/compare-slider": "arrows-left-right",
  "/components/video-player": "play-circle",
  "/components/audio-player": "headphones",
  "/components/scroll-expand": "arrows-out-simple",
  "/components/scroll-stack": "stack",
  "/components/separator": "minus",
  "/components/sidebar": "sidebar",
  "/components/skip-link": "skip-forward",
  "/components/slider": "sliders-horizontal",
  "/components/button-group": "caret-circle-down",
  "/components/stack": "rows",
  "/components/stat": "trend-up",
  "/components/state-button": "toggle-left",
  "/components/steps": "footprints",
  "/components/switch": "toggle-right",
  "/components/table": "table",
  "/components/table-pager": "grid-four",
  "/components/tags-input": "tag-simple",
  "/components/tabs": "tabs",
  "/components/tag": "tag",
  "/components/text": "text-t",
  "/components/tile-link": "arrow-square-out",
  "/components/tile-checkbox": "check-square",
  "/components/tile-switch": "toggle-right",
  "/components/tile-radio-group": "radio-button",
  "/components/expandable-tile": "caret-up-down",
  "/components/tile-button": "selection",
  "/components/time-field": "role:clock",
  "/components/toast": "bell-ringing",
  "/components/toc": "list-dashes",
  "/components/toolbar": "toolbox",
  "/components/tooltip": "info",
  "/components/tour": "signpost",
  "/components/tree-view": "tree-structure",
  "/components/treegrid": "tree-view",
  "/components/user-select": "users",
  "/components/window": "app-window",
  "/components/wrapper": "frame-corners",
  "/hotkey": "command",
  "/nav-list": "role:menu",
  "/scrollbar": "arrows-down-up",
  "/vaul": "align-bottom",
};

/* Phosphor publishes `.svg` files: keep what is inside the root element. */
const bodyOf = (name: string, href: string) => {
  let svg: string;
  try {
    svg = readFileSync(setRequire.resolve(`@phosphor-icons/core/assets/regular/${name}.svg`), "utf8");
  } catch {
    throw new Error(`Phosphor has no "${name}" (for ${href}); was it renamed in an upgrade?`);
  }
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
};

const entries = Object.entries(MAP).map(([href, source]) => {
  if (source.startsWith("role:")) {
    const role = source.slice(5);
    /* Checked for the same reason the glyph branch is: an invented role emits a string the icon
       union does not contain, and the only place that failed was `astro check`, one build later. */
    if (!(stableIconNames as readonly string[]).includes(role)) {
      throw new Error(`"${role}" is not a stable icon role (for ${href}); name a Phosphor glyph instead.`);
    }
    return `  ${JSON.stringify(href)}: ${JSON.stringify(role)},`;
  }
  return `  ${JSON.stringify(href)}: { viewBox: "0 0 256 256", attrs: ATTRS, body: ${JSON.stringify(bodyOf(source, href))} },`;
});

const output = `/*
 * GENERATED by scripts/generate-component-icons.ts, do not edit by hand.
 *
 * Phosphor Icons geometry (MIT), "regular" weight, thickened by a 4-unit stroke, redistributed under its license. A string entry is a stable icon role.
 */
import type { IconData, StableIconName } from "@skryensya/core/icon";

const ATTRS = {"fill":"currentColor","stroke":"currentColor","stroke-width":"4","stroke-linejoin":"round"} as const;

export const componentIcons: Readonly<Record<string, IconData | StableIconName>> = {
${entries.join("\n")}
};
`;

const target = resolve(import.meta.dirname, "../src/lib/generated/component-icons.ts");

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {}
  if (current !== output) {
    console.error("component-icons.ts is stale: run node scripts/generate-component-icons.ts");
    process.exit(1);
  }
} else {
  writeFileSync(target, output);
  console.log(`component-icons.ts: ${entries.length} entries`);
}
