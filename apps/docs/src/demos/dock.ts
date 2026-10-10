import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const actions = (t: Translate): UsageTree[] =>
  ([
    [t("dockPage.search"), "search"],
    [t("dockPage.notes"), "edit"],
    [t("dockPage.add"), "add"],
    [t("dockPage.files"), "file"],
    [t("dockPage.settings"), "settings"],
  ] as const).map(([label, name]) => ({
    contract: "dock",
    signature: "DockItem",
    options: { label },
    children: { contract: "icon", signature: "Icon", options: { name, size: "md" } },
  }));

const dock = (t: Translate, label: string, style?: string): UsageTree => ({
  contract: "dock",
  signature: "Dock",
  options: { label },
  ...(style ? { attrs: { style } } : {}),
  children: actions(t),
});

export const dockTree = (t: Translate): UsageTree => dock(t, t("dockPage.quick"));

export const dockSizeTree = (t: Translate, size: "compact" | "regular" | "roomy"): UsageTree => {
  const sizes = {
    compact: "--sk-dock-size: 2.75rem; --sk-dock-gap: var(--space-inline-2xs); --sk-dock-padding: var(--space-inset-2xs); --sk-dock-magnification: 1.16; --sk-dock-lift: var(--motion-distance-md);",
    regular: "--sk-dock-size: max(var(--size-control-lg), var(--size-touch-target)); --sk-dock-gap: var(--space-inline-xs); --sk-dock-padding: var(--space-inset-xs);",
    roomy: "--sk-dock-size: 4rem; --sk-dock-gap: var(--space-inline-sm); --sk-dock-padding: var(--space-inset-sm); --sk-dock-magnification: 1.3; --sk-dock-lift: var(--motion-distance-lg);",
  } as const;
  return dock(t, t("dockPage.quick"), sizes[size]);
};

export const dockSurfaceTree = (t: Translate, surface: "glass" | "solid" | "pill"): UsageTree => {
  const surfaces = {
    glass: "--sk-dock-bg: color-mix(in oklab, var(--color-bg-surface) 76%, transparent); --sk-dock-border-color: color-mix(in oklab, currentColor 10%, transparent); --sk-dock-radius: var(--radius-surface); --sk-dock-shadow: var(--elevation-modal);",
    solid: "--sk-dock-bg: var(--color-bg-surface); --sk-dock-border-color: var(--color-border-subtle); --sk-dock-radius: var(--radius-control); --sk-dock-shadow: var(--elevation-raised);",
    pill: "--sk-dock-bg: color-mix(in oklab, var(--color-bg-surface) 76%, transparent); --sk-dock-border-color: color-mix(in oklab, currentColor 10%, transparent); --sk-dock-radius: var(--radius-pill); --sk-dock-item-radius: var(--radius-pill); --sk-dock-shadow: var(--elevation-modal);",
  } as const;
  return dock(t, t("dockPage.quick"), surfaces[surface]);
};
