import type { Locale, Text } from "./types.js";

/**
 * A `{ en, es }` pair, and nothing else: exactly those two string keys. Anything wider is content
 * that merely has an `en` field, not a pair of translations.
 */
export function isLocalePair(value: unknown): value is { readonly en: string; readonly es: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length === 2 && keys.includes("en") && keys.includes("es") && typeof (value as { en: unknown }).en === "string" && typeof (value as { es: unknown }).es === "string";
}

export const textIn = (text: Text, locale: Locale): string => (typeof text === "string" ? text : text[locale]);

/** The same content with every `{ en, es }` pair replaced by the string for `locale`, at any depth. */
export function resolveContent<T>(value: T, locale: Locale): T {
  if (isLocalePair(value)) return value[locale] as unknown as T;
  if (Array.isArray(value)) return value.map((entry) => resolveContent(entry, locale)) as unknown as T;
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveContent(entry, locale)])) as T;
  }
  return value;
}

/** Every string of a content value that is a pair, as `[path, pair]`, so a gate can check both halves are written. */
export function pairsIn(value: unknown, path = ""): readonly (readonly [string, { readonly en: string; readonly es: string }])[] {
  if (isLocalePair(value)) return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((entry, index) => pairsIn(entry, `${path}[${index}]`));
  if (typeof value === "object" && value !== null) return Object.entries(value).flatMap(([key, entry]) => pairsIn(entry, path ? `${path}.${key}` : key));
  return [];
}
