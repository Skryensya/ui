import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline, surface, titleBlock } from "../kit.js";

interface Content {
  title: string;
  subtitle: string;
  label: string;
  hint?: string;
  placeholder: string;
  options: { value: string; label: string; description?: string }[];
  submit: string;
}

const { pattern, use } = definePattern<Content>({
  id: "searchable-choice-card",
  subject: "form",
  scale: "component",
  title: { en: "Searchable choice card", es: "Card de elección con búsqueda" },
  layout: { en: "A title block, a Combobox that filters a long list as the person types, and one action to confirm the choice.", es: "Un bloque de título, un Combobox que filtra una lista larga mientras se escribe y una acción para confirmar la elección." },
  fields: { title: { en: "What is being chosen.", es: "Qué se elige." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, label: { en: "The field's name.", es: "El nombre del campo." }, hint: { en: "What to type or what the choice changes.", es: "Qué escribir o qué cambia la elección." }, placeholder: { en: "What the empty field says.", es: "Lo que dice el campo vacío." }, options: { en: "The known values: a stable `value`, a label and optionally a description.", es: "Los valores conocidos: un `value` estable, una etiqueta y, si hace falta, una descripción." }, submit: { en: "The way forward.", es: "El camino adelante." } },
  notes: [{ en: "A combobox earns its place when the list is too long to scan: under about seven values a radio group or a select reads faster.", es: "Un combobox se justifica cuando la lista es demasiado larga para recorrerla: bajo unos siete valores, un grupo de radios o un select se lee más rápido." }],
  build: ({ title, subtitle, label, hint, placeholder, options, submit }, ctx) =>
    surface([
      titleBlock(title, subtitle),
      {
        contract: "combobox",
        signature: "Combobox",
        options: { name: `${ctx.ns}-choice`, placeholder },
        slots: { label, ...(hint ? { hint } : {}), items: options.map((option) => ({ options: { value: option.value }, slots: { label: option.label, ...(option.description ? { description: option.description } : {}) } })) },
      },
      inline([action(submit, { variant: "soft", tone: "accent", size: "sm" })], { gap: "sm", justify: "end" }),
    ]),
});

export const searchableChoiceCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "choice-assignee",
      intent: "input/fields/assign-owner",
      title: { en: "Assign an owner", es: "Asignar un responsable" },
      purpose: { en: "Pick one person out of a team by typing part of the name.", es: "Elegir a una persona de un equipo escribiendo parte del nombre." },
      content: { title: { en: "Assign the task", es: "Asignar la tarea" }, subtitle: { en: "Review the October invoice", es: "Revisar la factura de octubre" }, label: { en: "Owner", es: "Responsable" }, hint: { en: "Type a name or an email.", es: "Escribe un nombre o un correo." }, placeholder: { en: "Search people", es: "Buscar personas" }, options: [{ value: "marta", label: "Marta Ruiz", description: { en: "Finance", es: "Finanzas" } }, { value: "tomas", label: "Tomás Vidal", description: { en: "Purchasing", es: "Compras" } }, { value: "lucia", label: "Lucía Paredes", description: { en: "Operations", es: "Operaciones" } }, { value: "ines", label: "Inés Calvo", description: { en: "Legal", es: "Legal" } }, { value: "diego", label: "Diego Rojas", description: { en: "Finance", es: "Finanzas" } }, { value: "paula", label: "Paula Soto", description: { en: "Support", es: "Soporte" } }, { value: "andres", label: "Andrés Mena", description: { en: "Sales", es: "Ventas" } }, { value: "carla", label: "Carla Núñez", description: { en: "Design", es: "Diseño" } }], submit: { en: "Assign", es: "Asignar" } },
    }),
    use({
      id: "choice-timezone",
      intent: "input/fields/pick-timezone",
      title: { en: "Pick a time zone", es: "Elegir una zona horaria" },
      purpose: { en: "Find one zone among dozens by the name of a city.", es: "Encontrar una zona entre decenas por el nombre de una ciudad." },
      content: { title: { en: "Your time zone", es: "Tu zona horaria" }, subtitle: { en: "Meetings and reminders follow it", es: "Las reuniones y los recordatorios la siguen" }, label: { en: "Time zone", es: "Zona horaria" }, hint: { en: "Search by city.", es: "Busca por ciudad." }, placeholder: { en: "Madrid, Santiago, Tokyo…", es: "Madrid, Santiago, Tokio…" }, options: [{ value: "madrid", label: "Europe/Madrid", description: "UTC+2" }, { value: "london", label: "Europe/London", description: "UTC+1" }, { value: "santiago", label: "America/Santiago", description: "UTC-3" }, { value: "bogota", label: "America/Bogotá", description: "UTC-5" }, { value: "new-york", label: "America/New_York", description: "UTC-4" }, { value: "tokyo", label: "Asia/Tokyo", description: "UTC+9" }, { value: "sydney", label: "Australia/Sydney", description: "UTC+11" }], submit: { en: "Save", es: "Guardar" } },
    }),
  ],
};
