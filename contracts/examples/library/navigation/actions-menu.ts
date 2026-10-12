import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  trigger: string;
  items: { value: string; label: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "actions-menu",
  subject: "navigation",
  scale: "component",
  title: { en: "Actions menu", es: "Menú de acciones" },
  layout: { en: "A Menu: a button that opens a short list of commands, each one a single action.", es: "Un Menu: un botón que abre una lista corta de comandos, cada uno una sola acción." },
  fields: { label: { en: "The menu's name.", es: "El nombre del menú." }, trigger: { en: "The button's visible words.", es: "Las palabras visibles del botón." }, items: { en: "The commands: a value and a label each, as verbs.", es: "Los comandos: un valor y una etiqueta cada uno, como verbos." } },
  notes: [
    { en: "A menu holds commands (things that happen); destinations are links and belong in a navigation list, so the roles stay honest.", es: "Un menú reúne comandos (cosas que pasan); los destinos son enlaces y van en una lista de navegación, para que los roles sean honestos." },
    { en: "Keep it to a handful of commands; past about seven, group them or move the rare ones elsewhere.", es: "Mantenlo en un puñado de comandos; más allá de unos siete, agrúpalos o lleva los raros a otro sitio." },
  ],
  build: ({ label, trigger, items }) => ({
    contract: "menu",
    signature: "Menu",
    options: { label },
    slots: { trigger, items: items.map((item): ItemInput => ({ options: { value: item.value }, slots: { label: item.label } })) },
  }),
});

export const actionsMenu: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "menu-row-actions", intent: "actions/menus/command-menu", title: { en: "Row actions", es: "Acciones de una fila" }, purpose: { en: "Collect what can be done to one item behind a single button.", es: "Reunir lo que se puede hacer con un elemento detrás de un solo botón." }, content: { label: { en: "Actions", es: "Acciones" }, trigger: { en: "Actions", es: "Acciones" }, items: [{ value: "edit", label: { en: "Edit", es: "Editar" } }, { value: "duplicate", label: { en: "Duplicate", es: "Duplicar" } }, { value: "archive", label: { en: "Archive", es: "Archivar" } }] } }),
  ],
};
