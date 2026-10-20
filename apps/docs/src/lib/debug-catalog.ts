// Explicit inventory: adding a catalog page must not silently manufacture coverage for it.
const groups = {
  layout: ["app-shell", "card", "changelog", "expandable-tile", "footer", "grid", "hero", "icon", "inline", "layout-grid", "media-overlay", "placeholder", "stack", "tile-button", "tile-checkbox", "tile-link", "tile-radio-group", "tile-switch", "wrapper"],
  navigation: ["annotation", "app-bar", "dialog-stack", "drawer", "megamenu", "navbar", "sidebar", "skip-link", "toc", "tour", "window", "vaul"],
  media: ["audio-player", "back-to-top", "canvas", "compare-slider", "diagram", "expressive-avatar", "fade-edge", "image-cropper", "marquee", "morph-stack", "presence", "scroll-expand", "scroll-stack", "video-player"],
  forms: ["color-picker", "editor", "qr-code", "questionnaire", "resizable", "table-pager", "treegrid"],
  utilities: ["hotkey", "scrollbar", "toast"],
} as const;

export type CatalogBreakGroup = keyof typeof groups;
export const catalogBreaks = Object.entries(groups).flatMap(([group, ids]) => ids.map((id) => ({
  id,
  group: group as CatalogBreakGroup,
  href: `/debug/${id}-break`,
  docsHref: ["hotkey", "scrollbar", "vaul"].includes(id) ? `/${id}` : `/components/${id}`,
})));
