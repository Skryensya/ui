/*
 * Icon sets from Iconify: an icon set is a brand, and Iconify is where the brands already live.
 *
 * The kit used to publish its own set packages (icons-lucide, -phosphor, -material), each a generator
 * over one library. Iconify's `@iconify-json/<prefix>` packages already normalise 200+ libraries into one
 * JSON shape, `{ body, width?, height? }` per icon, which is IconData minus the viewBox. So the kit keeps
 * only what is ours: which drawing occupies each ROLE (the maps below) and the adapter. The geometry is
 * the consumer's dependency, chosen by them; there is no default set.
 *
 * Pure data and string work, no DOM and no Node: the CLI (`skryensya icons`) runs it at build time to
 * write the ~76 icons a project needs, because an `icons.json` is 0.6–9 MB and does not belong in a
 * browser bundle. Calling it at runtime works too, wherever the size does not matter (a server, a test).
 */
import { brandIconNames, isComponentIconName, type IconData, type IconSet, type InterfaceIconName, type StableIconName } from "./icon.js";
import { brandFallback, brandMaps } from "./iconify-brands.js";

/** The slice of Iconify's `IconifyJSON` the adapter reads. */
export type IconifyJSON = {
  prefix: string;
  icons: Record<string, { body: string; width?: number; height?: number; left?: number; top?: number }>;
  aliases?: Record<string, { parent: string; width?: number; height?: number; left?: number; top?: number; rotate?: number; hFlip?: boolean; vFlip?: boolean }>;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
};

/** Role → Iconify name. Complete over the vocabulary; extra names (a toolbar's `bold`) ride along. */
export type IconifyMap = Readonly<Record<StableIconName, string>> & Readonly<Record<string, string>>;

/** What a map must name at least: a hand-written map for another set may skip the component marks. */
export type IconifyRoleMap = Readonly<Record<InterfaceIconName, string>> & Readonly<Record<string, string>>;

export type IconifyPreset = {
  /** The Iconify prefix, and the package name's tail: `@iconify-json/<prefix>`. */
  prefix: string;
  map: IconifyMap;
  /** Presentation attributes for the outer `<svg>` of every icon (see IconData.attrs). */
  attrs?: Readonly<Record<string, string>>;
  /** Roles whose outline body is painted solid: a play mark reads as "play" at 20px only when filled. */
  fill?: readonly string[];
  /** Suffixes tried in order before each bare name: Material's outlined style is `<name>-outline`. */
  variant?: string | readonly string[] | undefined;
  /** Who drew it, for the generated file's header. */
  licence: string;
};

/** The geometry of one Iconify name, following aliases. Throws when the set has no such icon. */
function resolveIcon(json: IconifyJSON, name: string): IconData {
  // shortcut: an alias that rotates or flips its parent is rejected, not transformed; none of the mapped names needs it.
  let current = name;
  let box: { width?: number; height?: number; left?: number; top?: number } = {};
  for (let hops = 0; hops < 8; hops++) {
    const icon = json.icons[current];
    if (icon) {
      const left = box.left ?? icon.left ?? json.left ?? 0;
      const top = box.top ?? icon.top ?? json.top ?? 0;
      const width = box.width ?? icon.width ?? json.width ?? 16;
      const height = box.height ?? icon.height ?? json.height ?? 16;
      return { body: icon.body, viewBox: `${left} ${top} ${width} ${height}` };
    }
    const alias = json.aliases?.[current];
    if (!alias) break;
    if (alias.rotate || alias.hFlip || alias.vFlip) throw new Error(`${json.prefix}:${name} is a transformed alias, map the role to its parent instead`);
    box = { width: box.width ?? alias.width, height: box.height ?? alias.height, left: box.left ?? alias.left, top: box.top ?? alias.top };
    current = alias.parent;
  }
  throw new Error(`${json.prefix} has no icon "${name}"; was it renamed upstream?`);
}

/**
 * Binds an Iconify collection to the stable vocabulary: each role gets the geometry its map names.
 * Throws on the first role the collection cannot draw, so a set with a hole never reaches a page.
 */
export function iconSetFromIconify(
  json: IconifyJSON,
  preset: Pick<IconifyPreset, "attrs" | "fill" | "variant"> & { map: IconifyRoleMap },
  /**
   * `components`: also bind the `component-*` marks, for an app that lists the kit's components.
   * `brands`: also bind the `brand-*` logos, the collection's own where it draws one, Tabler's where not.
   */
  { components = false, brands = false }: { components?: boolean; brands?: boolean } = {},
): IconSet {
  const set: Record<string, IconData> = {};
  const map: Record<string, string> = { ...preset.map, ...(brands ? brandMaps[json.prefix] : {}) };
  for (const [role, name] of Object.entries(map)) {
    if (!components && isComponentIconName(role)) continue;
    const styled = [preset.variant ?? []].flat().map((suffix) => name + suffix).find((n) => json.icons[n] || json.aliases?.[n]) ?? name;
    const icon = resolveIcon(json, styled);
    const solid = preset.fill?.includes(role);
    const body = solid ? icon.body.replaceAll('fill="none"', 'fill="currentColor"') : icon.body;
    const attrs = solid ? { ...preset.attrs, fill: "currentColor" } : preset.attrs;
    set[role] = { ...icon, body, ...(attrs ? { attrs } : {}) };
  }
  /* A logo the collection does not draw: Tabler's, with its own stroke attributes. */
  if (brands) for (const role of brandIconNames) set[role] ??= brandFallback[role];
  return set as IconSet;
}

export { iconifyPresets } from "./iconify-presets.js";

/* ── The native controls: pseudo-elements cannot hold an icon placeholder, so the set paints them ── */

const toSvgImage = ({ viewBox, body, attrs = {} }: IconData, color: string) => {
  const presentation = Object.entries(attrs)
    .map(([name, value]) => ` ${name}="${value === "currentColor" ? color : value}"`)
    .join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="${viewBox}" ` +
    `style="color-scheme:light dark"${presentation}>${body.replaceAll("currentColor", color)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/**
 * The stylesheet that binds a set to the controls whose icon is a pseudo-element: Carousel's native
 * `::scroll-button()` (an image in system colours, legible in forced colours) and the native select's
 * `::picker-icon` / `::checkmark` (a mask in `currentColor`, so it follows the control's text colour).
 * Without it the browser draws its own, which is the right fallback. Load it once, beside the set.
 */
export function iconSetCss(set: IconSet): string {
  return `@layer overrides {
  .sk-carousel {
    --sk-carousel-native-previous-icon: ${toSvgImage(set["chevron-left"], "CanvasText")};
    --sk-carousel-native-next-icon: ${toSvgImage(set["chevron-right"], "CanvasText")};
    --sk-carousel-native-previous-disabled-icon: ${toSvgImage(set["chevron-left"], "GrayText")};
    --sk-carousel-native-next-disabled-icon: ${toSvgImage(set["chevron-right"], "GrayText")};
  }

  @supports (appearance: base-select) and selector(select::picker(select)) {
    .sk-select-native::picker-icon {
      content: "";
      background: currentColor;
      mask: ${toSvgImage(set["chevron-down"], "black")} center / contain no-repeat;
    }

    .sk-select-native:open::picker-icon {
      mask-image: ${toSvgImage(set["chevron-up"], "black")};
    }

    .sk-select-native option::checkmark {
      content: "";
      background: currentColor;
      mask: ${toSvgImage(set.check, "black")} center / contain no-repeat;
    }
  }
}
`;
}

/** The TypeScript module the CLI writes: the set as data, typed against the vocabulary. */
export function iconSetModule(set: IconSet, header: string): string {
  const entries = Object.entries(set).map(([role, icon]) => `  ${JSON.stringify(role)}: ${JSON.stringify(icon)},`);
  return `${header}
import type { IconSet } from "@skryensya/core/icon";

const generated = {
${entries.join("\n")}
};

/** \`satisfies IconSet\` proves the roles are all there; extra names (a toolbar's \`bold\`) ride along. */
export const icons = generated satisfies IconSet;
`;
}
