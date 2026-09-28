import { describe, expect, it } from "vitest";
import { useTranslations, type Locale } from "../../i18n";
import { templateSections } from "../../lib/templates-nav";
import { templateTrees } from "./registry";

/*
 * THE TEMPLATES, AS DATA THE MAKER CAN OPEN.
 *
 * The gallery's page templates are functions of the docs' translations (which need Vite, for
 * `import.meta.glob`), so nothing outside this app can call them. This writes each one, resolved in
 * every locale, to `artifacts/templates.json`: the Maker offers them as starting points, and the
 * gallery's "Open in Maker" link names one by id. It is a file snapshot, so `check` fails when the
 * file no longer matches the templates, and `pnpm --filter @skryensya/docs generate:templates`
 * rewrites it.
 */
const locales: Locale[] = ["es", "en"];

describe("the templates artifact", () => {
  it("matches every template, in every locale", async () => {
    const data = {
      generatedBy: "apps/docs/src/demos/templates/artifact.test.ts",
      templates: templateSections(useTranslations("es")).map((section) => ({
        id: section.id,
        locales: Object.fromEntries(
          locales.map((locale) => {
            const t = useTranslations(locale);
            const localized = templateSections(t).find((entry) => entry.id === section.id)!;
            return [locale, { title: localized.title, description: localized.label, tree: templateTrees(t, locale)[section.id]!() }];
          }),
        ),
      })),
    };
    await expect(`${JSON.stringify(data, null, 2)}\n`).toMatchFileSnapshot("../../../../../artifacts/templates.json");
  });
});
