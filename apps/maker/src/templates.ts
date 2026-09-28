import { randomId, siteFromTemplate, type MakerSite } from "@skryensya/maker-model";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { CATALOGUE_HASH } from "./state";

/*
 * THE DOCS GALLERY'S TEMPLATES, as starting points (artifacts/templates.json, written by the docs'
 * own check). Loaded only when asked for: the file holds every template in every locale, and a
 * Maker opened to edit a project never needs it.
 */

export type TemplateLocale = "es" | "en";
export type TemplateEntry = { id: string; title: string; description: string; tree: UsageTree };

type Artifact = { templates: { id: string; locales: Record<string, { title: string; description: string; tree: UsageTree }> }[] };

let loaded: Promise<Artifact> | undefined;

export async function listTemplates(locale: TemplateLocale): Promise<TemplateEntry[]> {
  loaded ??= import("../../../artifacts/templates.json").then((module) => module.default as unknown as Artifact);
  const artifact = await loaded;
  return artifact.templates
    .map((template) => {
      const localized = template.locales[locale] ?? template.locales.es;
      return localized ? { id: template.id, ...localized } : undefined;
    })
    .filter((entry): entry is TemplateEntry => entry !== undefined);
}

export async function templateSite(id: string, locale: TemplateLocale): Promise<{ title: string; site: MakerSite } | undefined> {
  const template = (await listTemplates(locale)).find((entry) => entry.id === id);
  if (!template) return undefined;
  return { title: template.title, site: siteFromTemplate(template.tree, { pageName: template.title, sourceHash: CATALOGUE_HASH, newId: randomId }) };
}
