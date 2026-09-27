import type { Translate } from "@docs/i18n";
import { defaultLocale, ui, type Locale } from "@docs/i18n/ui";

/*
 * The docs translator, over the docs dictionaries, WITHOUT `@docs/i18n` at runtime. That module also
 * globs every `.astro` page for its route table, which would drag the whole site into this bundle;
 * the types it exports are erased, so importing them from there is free.
 *
 * Same lookup as `useTranslations`: the locale's string, then the default locale's, then the key.
 */
export function translator(locale: Locale): Translate {
  const t = (key: string, vars?: Record<string, string>): string => {
    const table = ui[locale] as Record<string, string>;
    const fallback = ui[defaultLocale] as Record<string, string>;
    const value = table[key] ?? fallback[key] ?? key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match);
  };
  return Object.assign(t, { locale });
}

export const isLocale = (value: unknown): value is Locale => typeof value === "string" && value in ui;

/** The locale a translator speaks, for the demos that take a locale rather than `t`. */
export const localeOf = (t: Translate): Locale => (t as Translate & { locale?: Locale }).locale ?? defaultLocale;
