import type { ComponentContract } from "./contract.js";

export type ExpressiveAvatarSize = "sm" | "md" | "lg" | "xl";
export type ExpressiveAvatarAppearance = "plain" | "brutalist";
export type ExpressiveAvatarMode = "pixel" | "image";
export type ExpressiveAvatarDirection =
  | "base"
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type ExpressiveAvatarMouth =
  | "default"
  | "neutral"
  | "closed"
  | "a"
  | "e"
  | "i"
  | "o"
  | "u"
  | "smile";

export type ExpressiveAvatarHat = "none" | "la-cap" | "batman-mask";
export type ExpressiveAvatarOutfit = "base" | "sweater-alt" | "batman";

/** The events an expressive avatar listens to on its root, for a trigger with no reference to the component. */
export const expressiveAvatarEvents = {
  /** Detail: `{ expression: string | null, duration?: number }`. Shows an expression, or clears it with null. */
  express: "sk:expressiveavatarexpress",
} as const;

export const expressiveAvatarGridSize = 6;

export const expressiveAvatarGrid = [
  ["base-tile-00", "base-tile-00", "base-tile-01", "base-tile-02", "base-tile-00", "base-tile-00"],
  ["base-tile-00", "base-tile-03", "base-tile-04", "base-tile-05", "base-tile-06", "base-tile-00"],
  ["base-tile-00", "base-tile-07", "left-eye-base", "right-eye-base", "base-tile-08", "base-tile-00"],
  ["base-tile-00", "base-tile-09", "mouth-rest-left", "mouth-rest-right", "base-tile-10", "base-tile-00"],
  ["base-tile-11", "base-tile-12", "base-tile-13", "base-tile-14", "base-tile-15", "base-tile-16"],
  ["base-tile-17", "base-tile-18", "base-tile-19", "base-tile-20", "base-tile-21", "base-tile-22"],
] as const;

export const expressiveAvatarHatIndices = [2, 3, 7, 8, 9, 10, 13, 14, 15, 16, 19, 20, 21, 22] as const;
export const expressiveAvatarOutfitIndices = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35] as const;

export const expressiveAvatarHats: Record<ExpressiveAvatarHat, string[]> = {
  none: Array(14).fill("hat-empty"),
  "la-cap": [
    "la-cap-slot-02", "la-cap-slot-03", "la-cap-slot-07", "la-cap-slot-08", "la-cap-slot-09", "la-cap-slot-10",
    "la-cap-slot-13", "la-cap-slot-14", "la-cap-slot-15", "la-cap-slot-16", "la-cap-slot-19", "hat-empty",
    "hat-empty", "la-cap-slot-22",
  ],
  "batman-mask": [
    "batman-mask-slot-02", "batman-mask-slot-03", "batman-mask-slot-07", "batman-mask-slot-08", "batman-mask-slot-09", "batman-mask-slot-10",
    "batman-mask-slot-13", "batman-mask-slot-14", "batman-mask-slot-15", "batman-mask-slot-16", "batman-mask-slot-19", "batman-mask-slot-20",
    "batman-mask-slot-21", "batman-mask-slot-22",
  ],
};

export const expressiveAvatarOutfits: Record<ExpressiveAvatarOutfit, string[]> = {
  base: [
    "base-tile-11", "base-tile-12", "base-tile-13", "base-tile-14", "base-tile-15", "base-tile-16",
    "base-tile-17", "base-tile-18", "base-tile-19", "base-tile-20", "base-tile-21", "base-tile-22",
  ],
  "sweater-alt": [
    "sweater-alt-tile-11", "sweater-alt-tile-12", "sweater-alt-tile-13", "sweater-alt-tile-14", "sweater-alt-tile-15", "base-tile-16",
    "sweater-alt-tile-17", "sweater-alt-tile-18", "sweater-alt-tile-19", "sweater-alt-tile-20", "sweater-alt-tile-21", "sweater-alt-tile-22",
  ],
  batman: [
    "batman-tile-11", "batman-tile-12", "batman-tile-13", "batman-tile-14", "batman-tile-15", "batman-tile-16",
    "batman-tile-17", "batman-tile-18", "batman-tile-19", "batman-tile-20", "batman-tile-21", "batman-tile-22",
  ],
};

export const expressiveAvatarLeftEyeTiles: Record<ExpressiveAvatarDirection | "blink", string> = {
  base: "left-eye-base",
  "top-left": "left-eye-top-left",
  top: "left-eye-top",
  "top-right": "left-eye-top-right",
  left: "left-eye-left",
  right: "left-eye-right",
  "bottom-left": "left-eye-bottom-left",
  bottom: "left-eye-bottom",
  "bottom-right": "left-eye-bottom-right",
  blink: "left-eye-blink",
};

export const expressiveAvatarRightEyeTiles: Record<ExpressiveAvatarDirection | "blink" | "wink", string> = {
  base: "right-eye-base",
  "top-left": "right-eye-top-left",
  top: "right-eye-top",
  "top-right": "right-eye-top-right",
  left: "right-eye-left",
  right: "right-eye-right",
  "bottom-left": "right-eye-bottom-left",
  bottom: "right-eye-bottom",
  "bottom-right": "right-eye-bottom-right",
  blink: "right-eye-blink",
  wink: "right-eye-wink",
};

export const expressiveAvatarMouthLeftTiles: Record<ExpressiveAvatarMouth, string> = {
  default: "mouth-rest-left",
  neutral: "neutral-slight-open-left",
  closed: "closed-m-b-p-left",
  a: "a-wide-open-left",
  e: "e-mid-open-left",
  i: "i-tight-stretched-left",
  o: "o-rounded-left",
  u: "u-tight-rounded-left",
  smile: "smile-left",
};

export const expressiveAvatarMouthRightTiles: Record<ExpressiveAvatarMouth, string> = {
  default: "mouth-rest-right",
  neutral: "neutral-slight-open-right",
  closed: "closed-m-b-p-right",
  a: "a-wide-open-right",
  e: "e-mid-open-right",
  i: "i-tight-stretched-right",
  o: "o-rounded-right",
  u: "u-tight-rounded-right",
  smile: "smile-right",
};

export const expressiveAvatarParts = {
  root: "sk-expressive-avatar",
  grid: "sk-expressive-avatar__grid",
  tile: "sk-expressive-avatar__tile",
  image: "sk-expressive-avatar__image",
  host: "sk-expressive-avatar-host",
  bubble: "sk-expressive-avatar__bubble",
} as const;

export const expressiveAvatarContract = {
  id: "expressive-avatar",
  category: "content",
  css: "@skryensya/core/components/expressive-avatar.css",
  parts: expressiveAvatarParts,
  hooks: [
    "--sk-expressive-avatar-size",
    "--sk-expressive-avatar-scale",
    "--sk-expressive-avatar-bg",
  ],
  options: {
    mode: { type: "enum", values: ["pixel", "image"], default: "pixel", attr: "data-mode" },
    name: { type: "string", attr: "aria-label" },
    size: { type: "enum", values: ["sm", "md", "lg", "xl"], default: "md", attr: "data-size" },
    appearance: { type: "enum", values: ["plain", "brutalist"], default: "plain", attr: "data-appearance" },
    direction: {
      type: "enum",
      values: [
        "base",
        "top-left",
        "top",
        "top-right",
        "left",
        "right",
        "bottom-left",
        "bottom",
        "bottom-right",
      ],
      default: "base",
      attr: "data-direction",
    },
    mouth: {
      type: "enum",
      values: ["default", "neutral", "closed", "a", "e", "i", "o", "u", "smile"],
      default: "default",
      attr: "data-mouth",
    },
    outfit: { type: "enum", values: ["base", "sweater-alt", "batman"], default: "base", attr: "data-outfit" },
    hat: { type: "enum", values: ["none", "la-cap", "batman-mask"], default: "none", attr: "data-hat" },
  },
  signatures: {
    ExpressiveAvatar: {
      intent: ["expressive-identity", "reactive-avatar", "character-portrait"],
      host: { element: "span" },
      options: ["mode", "name", "size", "appearance", "direction", "mouth", "outfit", "hat"],
      requires: ["name"],
      slots: {},
      template: { element: "span", part: "root", host: true, attrs: { role: "img" } },
      react: { from: "@skryensya/react/expressive-avatar", name: "ExpressiveAvatar" },
    },
  },
} as const satisfies ComponentContract;

/**
 * A TILESET: one image, a grid of equal cells, and the names of what is in them. The tile `names[i]` is at
 * column `i % columns`, row `floor(i / columns)`. The bundled one is `expressiveAvatarAtlasLayout`
 * (`@skryensya/core/expressive-avatar-atlas`); one of your own keeps those names in that order for what it
 * replaces and may add more after them, which is how a face gets a look it did not have.
 */
export type ExpressiveAvatarTileset = {
  /** The image. Omitted, the stylesheet's `--sk-expressive-avatar-atlas` is used (the bundled tileset). */
  src?: string;
  /** Pixels of one cell in the image. Default 25. */
  tileSize?: number;
  columns: number;
  names: readonly string[];
};

/** Where a tile is in a tileset's grid, or null when the tileset has no tile of that name. */
export function expressiveAvatarTilePosition(tileset: Pick<ExpressiveAvatarTileset, "columns" | "names">, name: string): { column: number; row: number } | null {
  const index = tileset.names.indexOf(name);
  return index < 0 ? null : { column: index % tileset.columns, row: Math.floor(index / tileset.columns) };
}

/**
 * Every tile a face needs to be drawn at all: the head and body of the grid, and the left and right
 * halves of each look of the eyes and each shape of the mouth. A sheet that has these can show every
 * expression; outfits and hats are extras on top.
 */
export const expressiveAvatarRequiredTiles: readonly string[] = [
  ...new Set([
    ...expressiveAvatarGrid.flat(),
    ...Object.values(expressiveAvatarLeftEyeTiles),
    ...Object.values(expressiveAvatarRightEyeTiles),
    ...Object.values(expressiveAvatarMouthLeftTiles),
    ...Object.values(expressiveAvatarMouthRightTiles),
  ]),
];

export type ExpressiveAvatarTilesetReport = {
  /** True when nothing a face needs is missing. */
  ok: boolean;
  /** Required tiles the sheet does not have. */
  missing: string[];
  /** Outfits the sheet draws completely (`base` is the body in the required tiles). */
  outfits: string[];
  /** Hats the sheet draws completely. */
  hats: string[];
};

/** Checks the names a tileset provides against what a face needs. */
export function checkExpressiveAvatarTileset(ids: Iterable<string>): ExpressiveAvatarTilesetReport {
  const have = new Set(ids);
  const missing = expressiveAvatarRequiredTiles.filter((name) => !have.has(name));
  const complete = (tiles: readonly string[]) => tiles.every((name) => have.has(name));
  const outfits = (Object.keys(expressiveAvatarOutfits) as ExpressiveAvatarOutfit[]).filter((name) => name === "base" || complete(expressiveAvatarOutfits[name]));
  const hats = (Object.keys(expressiveAvatarHats) as ExpressiveAvatarHat[]).filter((name) => name === "none" || complete(expressiveAvatarHats[name]));
  return { ok: missing.length === 0, missing, outfits, hats };
}
