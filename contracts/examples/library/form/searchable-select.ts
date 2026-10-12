import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  hint: string;
  placeholder: string;
  items: { value: string; label: string; description?: string; unavailable?: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "searchable-select",
  subject: "form",
  scale: "component",
  title: { en: "Searchable select", es: "Selector con búsqueda" },
  layout: { en: "A Combobox: a field that filters a list as the reader types, with a label, a hint and options that can carry a description.", es: "Un Combobox: un campo que filtra una lista mientras se escribe, con etiqueta, ayuda y opciones que pueden llevar descripción." },
  fields: { label: { en: "What is being chosen.", es: "Qué se elige." }, hint: { en: "How the field works, in one line.", es: "Cómo funciona el campo, en una línea." }, placeholder: { en: "An example of what to type.", es: "Un ejemplo de lo que escribir." }, items: { en: "The options: a value, a label, an optional description, and whether one is unavailable.", es: "Las opciones: un valor, una etiqueta, una descripción opcional y si alguna no está disponible." } },
  notes: [
    { en: "Reach for it when the list is too long to scan (about ten options or more); a short list is a Select or a Listbox.", es: "Úsalo cuando la lista es demasiado larga para recorrerla (unas diez opciones o más); una lista corta es un Select o un Listbox." },
    { en: "The reader can only pick what is in the list: the field filters, it never creates, so a value it returns is always one you offered.", es: "Quien lee solo puede elegir lo que está en la lista: el campo filtra, nunca crea, así que un valor que devuelve es siempre uno que ofreciste." },
  ],
  build: ({ label, hint, placeholder, items }, ctx) => ({
    contract: "combobox",
    signature: "Combobox",
    options: { name: `${ctx.ns}-choice`, placeholder },
    slots: { label, hint, items: items.map((item): ItemInput => ({ options: { value: item.value, ...(item.unavailable ? { disabled: true } : {}) }, slots: { label: item.label, ...(item.description ? { description: item.description } : {}) } })) },
  }),
});

export const searchableSelect: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "select-country",
      intent: "input/choice/search-select",
      title: { en: "Country", es: "País" },
      purpose: { en: "Pick one item out of a long, known list by typing a few letters of it.", es: "Elegir un elemento de una lista larga y conocida escribiendo unas letras." },
      content: {
        label: { en: "Country", es: "País" },
        hint: { en: "Type to filter the list", es: "Escribe para filtrar la lista" },
        placeholder: { en: "Search a country", es: "Buscar país" },
        items: [
          { value: "cl", label: { en: "Chile", es: "Chile" }, description: { en: "South America", es: "América del Sur" } },
          { value: "mx", label: { en: "Mexico", es: "México" }, description: { en: "North America", es: "América del Norte" } },
          { value: "pt", label: { en: "Portugal", es: "Portugal" }, description: { en: "Not available yet", es: "Aún no disponible" }, unavailable: true },
        ],
      },
    }),
  ],
};
