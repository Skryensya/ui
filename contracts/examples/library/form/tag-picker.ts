import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  mode: "single" | "multiple";
  items: { value: string; label: string; selected?: boolean; disabled?: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "tag-picker",
  subject: "form",
  scale: "component",
  title: { en: "Option list", es: "Lista de opciones" },
  layout: { en: "A Listbox with a visible label and a handful of options, some starting selected, one unavailable.", es: "Un Listbox con etiqueta visible y un puñado de opciones, algunas ya elegidas, una no disponible." },
  fields: {
    label: { en: "What the reader is choosing: it is the list's name.", es: "Qué elige quien lee: es el nombre de la lista." },
    mode: { en: "`multiple` ticks any number; `single` keeps one.", es: "`multiple` marca cualquier cantidad; `single` deja una." },
    items: { en: "The options: a value, its label, and whether it starts selected or unavailable.", es: "Las opciones: un valor, su etiqueta y si empieza elegida o no disponible." },
  },
  notes: [
    { en: "An unavailable option stays in the list, dimmed, instead of vanishing: the reader learns it exists and can see it is not for them.", es: "Una opción no disponible se queda en la lista, atenuada, en vez de desaparecer: quien lee sabe que existe y ve que no es para él." },
    { en: "Choose a Listbox over a group of checkboxes when the options are many or short and the choice is one filter among others.", es: "Elige un Listbox y no un grupo de casillas cuando las opciones son muchas o cortas y la elección es un filtro más." },
  ],
  build: ({ label, mode, items }) => ({
    contract: "listbox",
    signature: "Listbox",
    options: { selectionMode: mode },
    slots: {
      label,
      items: items.map((item): ItemInput => ({ options: { value: item.value, ...(item.selected ? { defaultSelected: true } : {}), ...(item.disabled ? { disabled: true } : {}) }, slots: { label: item.label } })),
    },
  }),
});

export const tagPicker: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "picker-issue-labels",
      intent: "input/choice/option-list",
      title: { en: "Issue labels", es: "Etiquetas de una incidencia" },
      purpose: { en: "Let someone tag an item with any of a fixed set of labels, some already applied.", es: "Dejar que alguien etiquete un elemento con cualquiera de un conjunto fijo, algunas ya aplicadas." },
      content: {
        label: { en: "Labels", es: "Etiquetas" },
        mode: "multiple",
        items: [
          { value: "bug", label: { en: "Bug", es: "Error" }, selected: true },
          { value: "docs", label: { en: "Documentation", es: "Documentación" } },
          { value: "design", label: { en: "Design", es: "Diseño" }, selected: true },
          { value: "legacy", label: { en: "Legacy", es: "Heredado" }, disabled: true },
        ],
      },
    }),
  ],
};
