import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  action: string;
  menuLabel: string;
  triggerLabel: string;
  items: { value: string; label: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "save-with-alternatives",
  subject: "action",
  scale: "component",
  title: { en: "Action with alternatives", es: "Acción con alternativas" },
  layout: { en: "A split ButtonGroup: the main action as an accent button, welded to a small menu of related ways to do it.", es: "Un ButtonGroup dividido: la acción principal como botón de acento, soldada a un menú pequeño de formas relacionadas de hacerlo." },
  fields: { action: { en: "The default action, as a verb.", es: "La acción por defecto, como verbo." }, menuLabel: { en: "The menu's name.", es: "El nombre del menú." }, triggerLabel: { en: "The small button's name.", es: "El nombre del botón pequeño." }, items: { en: "The other ways: a value and a label each.", es: "Las otras formas: un valor y una etiqueta cada una." } },
  notes: [
    { en: "One press does the default; the alternatives sit one step away and are variations of the same act, not other tasks.", es: "Una pulsación hace lo habitual; las alternativas están a un paso y son variaciones del mismo acto, no otras tareas." },
    { en: "The two halves wear one look (colour and size): they read as one control only when they match.", es: "Las dos mitades llevan un solo aspecto (color y tamaño): se leen como un solo control solo si coinciden." },
  ],
  build: ({ action, menuLabel, triggerLabel, items }): UsageTree => ({
    contract: "button-group",
    signature: "ButtonGroup",
    children: [
      { contract: "button", signature: "Button.action", options: { tone: "accent" }, slots: { children: action } },
      {
        contract: "menu",
        signature: "Menu",
        options: { label: menuLabel, triggerLabel, triggerTone: "accent", triggerIconOnly: true },
        slots: { items: items.map((item): ItemInput => ({ options: { value: item.value }, slots: { label: item.label } })) },
      },
    ],
  }),
});

export const saveWithAlternatives: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "split-save", intent: "actions/buttons/primary-with-alternatives", title: { en: "Save and more", es: "Guardar y más" }, purpose: { en: "Offer the usual save and two nearby variations without cluttering the toolbar.", es: "Ofrecer el guardado habitual y dos variaciones cercanas sin llenar la barra." }, content: { action: { en: "Save", es: "Guardar" }, menuLabel: { en: "Other ways to save", es: "Otras formas de guardar" }, triggerLabel: { en: "More", es: "Más" }, items: [{ value: "copy", label: { en: "Save a copy", es: "Guardar una copia" } }, { value: "template", label: { en: "Save as template", es: "Guardar como plantilla" } }] } }),
  ],
};
