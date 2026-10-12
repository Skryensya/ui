import { definePattern, type PatternModule } from "../../model/types.js";
import { icon } from "../kit.js";

interface Content {
  label: string;
  items: { label: string; icon: string; unavailable?: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "quick-actions-dock",
  subject: "action",
  scale: "component",
  title: { en: "Quick-actions dock", es: "Dock de acciones rápidas" },
  layout: { en: "A Dock: a small row of icon buttons, each with its own name, that swell as the pointer passes over.", es: "Un Dock: una fila pequeña de botones de ícono, cada uno con su propio nombre, que crecen al pasar el puntero." },
  fields: { label: { en: "What the dock is: it names the group.", es: "Qué es el dock: nombra el grupo." }, items: { en: "Each action: its name, the icon role that draws it, and whether it is unavailable.", es: "Cada acción: su nombre, el rol de ícono que la dibuja y si no está disponible." } },
  notes: [
    { en: "Every button is named: the icon is decoration, and the swelling is only for a mouse (a keyboard and a touch screen get plain buttons).", es: "Cada botón tiene nombre: el ícono es decoración, y el crecimiento es solo para ratón (el teclado y la pantalla táctil reciben botones simples)." },
    { en: "Keep it to the few actions used all day; it is a launcher, not a toolbar with arrow-key navigation.", es: "Limítalo a las pocas acciones que se usan todo el día; es un lanzador, no una barra de herramientas con navegación por flechas." },
  ],
  build: ({ label, items }) => ({
    contract: "dock",
    signature: "Dock",
    options: { label },
    children: items.map((item) => ({ contract: "dock", signature: "DockItem", options: { label: item.label, ...(item.unavailable ? { disabled: true } : {}) }, children: icon(item.icon, "md") })),
  }),
});

export const quickActionsDock: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "dock-workspace", intent: "actions/toolbars/launcher-dock", title: { en: "Workspace shortcuts", es: "Atajos del espacio de trabajo" }, purpose: { en: "Keep the handful of actions people reach for all day in one place at the edge of the screen.", es: "Tener en un solo lugar, al borde de la pantalla, las pocas acciones que la gente usa todo el día." }, content: { label: { en: "Quick actions", es: "Acciones rápidas" }, items: [{ label: { en: "Search", es: "Buscar" }, icon: "search" }, { label: { en: "Add", es: "Agregar" }, icon: "add" }, { label: { en: "Settings", es: "Ajustes" }, icon: "settings" }, { label: { en: "Archive", es: "Archivo" }, icon: "folder", unavailable: true }] } }),
  ],
};
