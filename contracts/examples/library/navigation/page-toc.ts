import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  title: string;
  entries: { id: string; label: string; nested?: boolean }[];
  current: string;
}

const { pattern, use } = definePattern<Content>({
  id: "page-toc",
  subject: "navigation",
  scale: "component",
  title: { en: "On this page", es: "En esta página" },
  layout: { en: "A Toc: a titled list of links to the page's own sections, nested ones indented, the current one marked.", es: "Un Toc: una lista con título de enlaces a las secciones de la propia página, las anidadas con sangría, la actual marcada." },
  fields: { title: { en: "The list's name.", es: "El nombre de la lista." }, entries: { en: "The sections: an anchor, a label, and whether it sits under another.", es: "Las secciones: un ancla, una etiqueta y si está bajo otra." }, current: { en: "The anchor of the section the reader is in.", es: "El ancla de la sección en la que está quien lee." } },
  notes: [
    { en: "The current section is marked with `aria-current` and not only by colour, and the links are plain anchors: it works with no script.", es: "La sección actual se marca con `aria-current` y no solo con color, y los enlaces son anclas simples: funciona sin script." },
    { en: "List sections that exist, one level of nesting at most; a table of contents that mirrors every heading is the page again.", es: "Lista las secciones que existen, con un nivel de anidado como máximo; una tabla de contenidos que repite cada encabezado es la página otra vez." },
  ],
  build: ({ title, entries, current }) => ({
    contract: "toc",
    signature: "Toc",
    options: { title },
    slots: { items: entries.map((entry): ItemInput => ({ options: { href: `#${entry.id}`, ...(entry.id === current ? { current: true } : {}), ...(entry.nested ? { level: "h3" } : {}) }, slots: { children: entry.label } })) },
  }),
});

export const pageToc: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "toc-article", intent: "navigation/destinations/on-this-page", title: { en: "An article's sections", es: "Las secciones de un artículo" }, purpose: { en: "Let the reader see the shape of a long page and jump to the part they need.", es: "Dejar que quien lee vea la forma de una página larga y salte a la parte que necesita." }, content: { title: { en: "On this page", es: "En esta página" }, current: "summary", entries: [{ id: "summary", label: { en: "Summary", es: "Resumen" } }, { id: "detail", label: { en: "Detail", es: "Detalle" }, nested: true }, { id: "references", label: { en: "References", es: "Referencias" } }] } }),
  ],
};
