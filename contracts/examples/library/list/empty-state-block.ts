import { definePattern, type PatternModule } from "../../model/types.js";
import { icon } from "../kit.js";

interface Content {
  icon: string;
  title: string;
  body: string;
  action: string;
  actionIcon: string;
}

const { pattern, use } = definePattern<Content>({
  id: "empty-state-block",
  subject: "list",
  scale: "component",
  title: { en: "Empty state block", es: "Bloque de estado vacío" },
  layout: { en: "An icon, a title, one line that says what to do, and one soft action with its own icon.", es: "Un ícono, un título, una línea que dice qué hacer y una acción suave con su propio ícono." },
  fields: { icon: { en: "What is missing.", es: "Qué falta." }, title: { en: "That there is nothing yet.", es: "Que todavía no hay nada." }, body: { en: "How to start.", es: "Cómo empezar." }, action: { en: "The first step as a verb.", es: "El primer paso, como verbo." }, actionIcon: { en: "The action's icon.", es: "El ícono de la acción." } },
  notes: [{ en: "An EmptyState is a section with its own role: it replaces the list, it does not sit under an empty one.", es: "Un EmptyState es una sección con su propio rol: reemplaza a la lista, no va debajo de una vacía." }],
  build: (content) => ({
    contract: "empty-state",
    signature: "EmptyState",
    slots: {
      icon: icon(content.icon),
      title: content.title,
      description: content.body,
      actions: { contract: "button", signature: "Button.action", options: { variant: "soft", size: "sm" }, slots: { pre: icon(content.actionIcon, "sm") }, children: content.action },
    },
  }),
});

export const emptyStateBlock: PatternModule<Content> = {
  pattern,
  uses: [use({ id: "empty-files", intent: "status/emptiness/empty-collection", title: { en: "Empty list", es: "Lista vacía" }, purpose: { en: "What shows while there is nothing yet, and how to start.", es: "Lo que se ve cuando todavía no hay nada, y cómo empezar." }, content: { icon: "folder", title: { en: "No files yet", es: "Todavía no hay archivos" }, body: { en: "Upload the first one or drop it here.", es: "Sube el primero o arrástralo hasta aquí." }, action: { en: "Upload file", es: "Subir archivo" }, actionIcon: "upload" } })],
};
