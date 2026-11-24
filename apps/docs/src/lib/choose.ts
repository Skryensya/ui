import index from "@artifacts/ai-index.json";
import type { Locale } from "../i18n";
import { localizePath } from "../i18n";
import { componentItems } from "./navigation";

/*
 * "WHICH COMPONENT?": every signature a person can pick on its own (not a part of another), with the
 * first reason its contract gives to use it. The same rows as `choose.md`, the file agents read, so
 * the page and the package never disagree; the reasons stay in the contracts' English.
 */

export type ChooseRow = { readonly signature: string; readonly need: string; readonly href?: string };
export type ChooseGroup = { readonly category: string; readonly rows: readonly ChooseRow[] };

const ORDER = ["actions", "forms", "navigation", "overlays", "feedback", "data", "content", "layout", "other"] as const;

export const CATEGORY_LABEL: Record<Locale, Record<(typeof ORDER)[number], string>> = {
  en: { actions: "Actions", forms: "Forms", navigation: "Navigation", overlays: "Overlays", feedback: "Feedback", data: "Data", content: "Content", layout: "Layout", other: "Other" },
  es: { actions: "Acciones", forms: "Formularios", navigation: "Navegación", overlays: "Superposiciones", feedback: "Feedback", data: "Datos", content: "Contenido", layout: "Layout", other: "Otros" },
};

const pages = new Set<string>(componentItems.map((item) => item.href));
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** The page that documents a signature: its own (`Carousel.progressive` → progressive-carousel), its base's, or its family's. */
export function pageOf(signature: string, contract: string): string | undefined {
  const [base, variant] = signature.split(".") as [string, string | undefined];
  const candidates = [variant ? `${kebab(variant)}-${kebab(base)}` : undefined, kebab(base), contract].filter(Boolean);
  return candidates.map((slug) => `/components/${slug}`).find((href) => pages.has(href));
}

const firstSentence = (text: string) => text.split(/(?<=[.;:])\s/)[0]!.replace(/[;:.]$/, "");

export function chooseGroups(locale: Locale): ChooseGroup[] {
  const groups = new Map<string, ChooseRow[]>();
  for (const entry of index.contracts) {
    for (const signature of entry.signatures) {
      const reason = signature.useWhen[0];
      if ((signature as { deprecated?: string }).deprecated || signature.parents.length > 0 || !reason) continue;
      const href = pageOf(signature.id, entry.id);
      const category = entry.category ?? "other";
      groups.set(category, [...(groups.get(category) ?? []), { signature: signature.id, need: firstSentence(reason), ...(href ? { href: localizePath(href, locale) } : {}) }]);
    }
  }
  return ORDER.flatMap((category) => (groups.has(category) ? [{ category: CATEGORY_LABEL[locale][category], rows: groups.get(category)! }] : []));
}
