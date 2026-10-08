import type { ComponentContract } from "./contract.js";

export type ExpressiveAvatarSize = "sm" | "md" | "lg" | "xl";
export type ExpressiveAvatarAppearance = "plain" | "brutalist";
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

/** The mouths the face can be in. `default` is the resting one, the others are what speech and the smile ask for. */
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

/**
 * THE LOOKS A FACE HAS ON ITS OWN, by name: where it looks (`base` is straight ahead and the one every
 * other falls back to), the blink and the wink, and the mouths. Each is a whole image. An expression you
 * make up is one more name with one more image, and nothing else.
 */
export const expressiveAvatarLooks = [
  "base",
  "top-left",
  "top",
  "top-right",
  "left",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
  "blink",
  "wink",
  "neutral",
  "closed",
  "a",
  "e",
  "i",
  "o",
  "u",
  "smile",
] as const;
export type ExpressiveAvatarLook = (typeof expressiveAvatarLooks)[number];

/** The events an expressive avatar listens to on its root, for a trigger with no reference to the component. */
export const expressiveAvatarEvents = {
  /** Detail: `{ expression: string | null, duration?: number }`. Shows an expression, or clears it with null. */
  express: "sk:expressiveavatarexpress",
} as const;

/**
 * THE IMAGES OF A FACE, from a folder that names them after the looks: `images("/avatars/ada")` is
 * `{ base: "/avatars/ada/base.webp", blink: "/avatars/ada/blink.webp", ... }`. Pass `looks` to list only
 * the ones you drew (every look without an image shows `base`), and add your own names to it for the
 * expressions you made up.
 */
export function expressiveAvatarImages(
  directory: string,
  options: { extension?: string; looks?: readonly string[] } = {},
): Record<string, string> {
  const { extension = "webp", looks = expressiveAvatarLooks } = options;
  const folder = directory.replace(/\/+$/, "");
  const suffix = extension.replace(/^\./, "");
  return Object.fromEntries(looks.map((look) => [look, `${folder}/${look}.${suffix}`]));
}

export type ExpressiveAvatarImageReport = {
  /** True when the set can be used as it is: it has `base`, and every image is the same square. */
  ok: boolean;
  /** Whether `base`, the fallback and the only one required, is there. */
  hasBase: boolean;
  /** The built-in looks the set has an image for, in the order of `expressiveAvatarLooks`. */
  looks: string[];
  /** The built-in looks without one: they show `base`. */
  missing: string[];
  /** Names that are not built-ins: the expressions you made up. */
  custom: string[];
  /** Images that are not square. */
  notSquare: string[];
  /** The distinct sizes found, as `width×height`. More than one means the face would jump when it changes. */
  sizes: string[];
};

/** Checks a set of images (by name, with their pixel size) against what a face needs. */
export function checkExpressiveAvatarImages(images: Readonly<Record<string, { width: number; height: number }>>): ExpressiveAvatarImageReport {
  const names = Object.keys(images);
  const builtIn = new Set<string>(expressiveAvatarLooks);
  const looks = expressiveAvatarLooks.filter((look) => look in images);
  const notSquare = names.filter((name) => images[name]!.width !== images[name]!.height);
  const sizes = [...new Set(names.map((name) => `${images[name]!.width}×${images[name]!.height}`))];
  const hasBase = "base" in images;
  return {
    ok: hasBase && notSquare.length === 0 && sizes.length === 1,
    hasBase,
    looks,
    missing: expressiveAvatarLooks.filter((look) => !(look in images)),
    custom: names.filter((name) => !builtIn.has(name)),
    notSquare,
    sizes,
  };
}

export const expressiveAvatarParts = {
  root: "sk-expressive-avatar",
  image: "sk-expressive-avatar__image",
  host: "sk-expressive-avatar-host",
  bubble: "sk-expressive-avatar__bubble",
} as const;

export const expressiveAvatarContract = {
  id: "expressive-avatar",
  category: "content",
  css: "@skryensya/core/components/expressive-avatar.css",
  parts: expressiveAvatarParts,
  hooks: ["--sk-expressive-avatar-size", "--sk-expressive-avatar-bg", "--sk-expressive-avatar-image-rendering"],
  options: {
    name: { type: "string", attr: "aria-label" },
    size: { type: "enum", values: ["sm", "md", "lg", "xl"], default: "md", attr: "data-size" },
    appearance: { type: "enum", values: ["plain", "brutalist"], default: "plain", attr: "data-appearance" },
    /** The look on show, by name: a built-in (`smile`, `top-left`...) or any name that has an image. */
    expression: { type: "string", default: "base", attr: "data-expression" },
    /** The image of the face. In React, `images` gives one per expression and this is the one-image shorthand. */
    src: { type: "string", attr: "src" },
    loading: { type: "enum", values: ["eager", "lazy"], default: "lazy", attr: "loading" },
    decoding: { type: "enum", values: ["async", "auto", "sync"], default: "async", attr: "decoding" },
  },
  signatures: {
    ExpressiveAvatar: {
      intent: ["expressive-identity", "reactive-avatar", "character-portrait"],
      host: { element: "span" },
      options: ["name", "size", "appearance", "expression", "src", "loading", "decoding"],
      requires: ["name", "src"],
      slots: {},
      template: {
        element: "span",
        part: "root",
        host: true,
        attrs: { role: "img" },
        children: [
          {
            element: "img",
            part: "image",
            attrs: { alt: "", "aria-hidden": "true" },
            options: ["src", "loading", "decoding"],
          },
        ],
      },
      react: { from: "@skryensya/react/expressive-avatar", name: "ExpressiveAvatar" },
    },
  },
} as const satisfies ComponentContract;
