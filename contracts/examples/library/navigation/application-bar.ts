import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface MenuSpec {
  title: string;
  strong?: boolean;
  items?: { value: string; label: string }[];
}
interface Content {
  label: string;
  menus: MenuSpec[];
  status: string[];
}

const items = (list: { value: string; label: string }[]): ItemInput[] => list.map((item) => ({ options: { value: item.value }, slots: { label: item.label } }));

const { pattern, use } = definePattern<Content>({
  id: "application-bar",
  subject: "navigation",
  scale: "component",
  title: { en: "Application bar", es: "Barra de aplicación" },
  layout: { en: "An AppBar: the application's own name first and in bold, its menus as words, and a few words of status at the end.", es: "Una AppBar: el nombre de la propia aplicación primero y en negrita, sus menús como palabras y unas palabras de estado al final." },
  fields: { label: { en: "The bar's name.", es: "El nombre de la barra." }, menus: { en: "The menus, left to right: a title, whether it is the application's own, and its commands.", es: "Los menús, de izquierda a derecha: un título, si es el de la propia aplicación y sus comandos." }, status: { en: "Short words of state at the end.", es: "Palabras cortas de estado al final." } },
  notes: [
    { en: "The titles are words, not buttons, and a menu opens by being chosen, never by hovering alone.", es: "Los títulos son palabras, no botones, y un menú se abre al elegirlo, nunca solo al pasar el puntero." },
    { en: "It is the one short line across the top of an application, not a site's header of destinations (that is a navbar).", es: "Es la línea corta de arriba de una aplicación, no el encabezado de destinos de un sitio (eso es una navbar)." },
  ],
  build: ({ label, menus, status }) => ({
    contract: "app-bar",
    signature: "AppBar",
    options: { label },
    children: menus.map((menu) => ({
      contract: "app-bar",
      signature: "AppBarMenu",
      ...(menu.strong ? { options: { strong: true } } : {}),
      ...(menu.items ? { slots: { children: menu.title, items: items(menu.items) } } : { children: menu.title }),
    })),
    slots: { status: status.map((word) => ({ contract: "app-bar", signature: "AppBarStatus", children: word })) },
  }),
});

export const applicationBar: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "appbar-editor",
      intent: "navigation/shells/application-bar",
      title: { en: "An editor's bar", es: "Barra de un editor" },
      purpose: { en: "Give a desktop-style app its menus and a place to say what state it is in.", es: "Dar a una app de estilo escritorio sus menús y un lugar para decir en qué estado está." },
      content: {
        label: "Maker",
        menus: [
          { title: "Maker", strong: true, items: [{ value: "about", label: { en: "About Maker", es: "Acerca de Maker" } }] },
          { title: { en: "File", es: "Archivo" }, items: [{ value: "new", label: { en: "New", es: "Nuevo" } }, { value: "export", label: { en: "Export", es: "Exportar" } }] },
          { title: { en: "Help", es: "Ayuda" } },
        ],
        status: [{ en: "Saved", es: "Guardado" }],
      },
    }),
  ],
};
