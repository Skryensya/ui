import { describe, expect, it } from "vitest";
import { canonicalPath } from "../i18n";
import { buildComponentSearchIndex } from "./component-search-index";
import { prepareComponentSearch, scoreComponentQuery } from "./component-search";
import { getNavigation } from "./navigation";

const index = buildComponentSearchIndex();
const prepared = [...index].map(([href, entry]) => ({ href, text: prepareComponentSearch(entry.names, entry.context) }));
const find = (query: string) => prepared
  .map(({ href, text }) => ({ href, rank: scoreComponentQuery(text, query) }))
  .filter((entry): entry is { href: string; rank: number } => entry.rank !== null)
  .sort((a, b) => a.rank - b.rank)
  .map((entry) => entry.href);

describe("bilingual component search index", () => {
  for (const locale of ["es", "en"] as const) {
    it(`indexes every visible component name and alias in ${locale}`, () => {
      const items = getNavigation(locale).find((section) => section.id === "components")!.groups.flatMap((group) => group.items.filter((item) => !item.todo));
      expect([...index.keys()].sort()).toEqual(items.map((item) => canonicalPath(item.href)).sort());
      for (const item of items) {
        const entry = index.get(canonicalPath(item.href))!;
        for (const name of [item.label, ...(item.aliases ?? [])]) expect(entry.names, item.href).toContain(name);
      }
    });
  }

  it.each([
    ["boton", "/components/button"],
    ["buton", "/components/button"],
    ["btn", "/components/button"],
    ["campo de texto", "/components/input"],
    ["text field", "/components/input"],
    ["snackbar", "/components/toast"],
    ["notificación temporal", "/components/toast"],
    ["dropdown", "/components/select"],
    ["dtpkr", "/components/date-picker"],
    ["calendrio", "/components/calendar"],
    ["casilla de verificación", "/components/checkbox"],
    ["barra lateral", "/components/sidebar"],
    ["chip", "/components/tag"],
    ["tabla", "/components/table"],
    ["presencia", "/components/presence"],
    ["superposición multimedia", "/components/media-overlay"],
    ["cuadrícula de diseño", "/components/layout-grid"],
    ["paginador de tabla", "/components/table-pager"],
  ])("puts %s's intended component first", (query, href) => {
    expect(find(query)[0]).toBe(href);
  });

  it("keeps both languages' descriptions and category names searchable", () => {
    const input = index.get("/components/input")!;
    expect(input.context).toContain("Formularios");
    expect(input.context).toContain("Forms");
    expect(find("navigation")).toContain("/components/sidebar");
    expect(find("navegación")).toContain("/components/sidebar");
  });

  it("does not guess a component from unrelated prose or an unknown name", () => {
    expect(find("zzzxxyyqqq")).toEqual([]);
    expect(find("no-component-matches-this-query")).toEqual([]);
  });
});
