import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Person {
  id: string;
  name: string;
  initials: string;
  email?: string;
  away?: boolean;
}
interface Content {
  label: string;
  selected: string;
  people: Person[];
}

const { pattern, use } = definePattern<Content>({
  id: "assignee-picker",
  subject: "form",
  scale: "component",
  title: { en: "Person picker", es: "Selector de persona" },
  layout: { en: "A UserSelect: each option is an avatar with a name and, when there is one, an email; one starts chosen.", es: "Un UserSelect: cada opción es un avatar con un nombre y, si lo hay, un correo; una empieza elegida." },
  fields: { label: { en: "What the person will be: the control's accessible name.", es: "Qué será la persona: el nombre accesible del control." }, selected: { en: "The id of the person chosen at the start.", es: "El id de la persona elegida al empezar." }, people: { en: "The people: an id, a name, initials, an optional email, and whether they are unavailable.", es: "Las personas: un id, un nombre, iniciales, un correo opcional y si no están disponibles." } },
  notes: [
    { en: "The email disambiguates two people with the same name; show it whenever you have it.", es: "El correo desambigua a dos personas con el mismo nombre; muéstralo siempre que lo tengas." },
    { en: "An unavailable person stays in the list, dimmed, so the reader knows why they cannot be picked.", es: "Una persona no disponible se queda en la lista, atenuada, para que quien lee sepa por qué no se puede elegir." },
  ],
  build: ({ label, selected, people }, ctx) => ({
    contract: "user-select",
    signature: "UserSelect",
    options: { name: `${ctx.ns}-person`, value: selected },
    attrs: { "aria-label": label },
    slots: {
      items: people.map((person): ItemInput => ({ options: { id: person.id, ...(person.away ? { disabled: true } : {}) }, slots: { name: person.name, initials: person.initials, ...(person.email ? { email: person.email } : {}) } })),
    },
  }),
});

export const assigneePicker: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "picker-assignee",
      intent: "input/choice/person-picker",
      title: { en: "Assign a task", es: "Asignar una tarea" },
      purpose: { en: "Choose which teammate owns an item, from people the reader recognises by face and name.", es: "Elegir qué compañero es responsable de un elemento, entre personas que quien lee reconoce por cara y nombre." },
      content: {
        label: { en: "Assignee", es: "Responsable" },
        selected: "jane",
        people: [
          { id: "jane", name: "Jane Cooper", initials: "JC", email: "jane@acme.dev" },
          { id: "maria", name: "Maria Fuentes", initials: "MF", email: "maria@acme.dev" },
          { id: "sam", name: "Sam Lee", initials: "SL" },
          { id: "alex", name: "Alex Kim", initials: "AK", email: "alex@acme.dev", away: true },
        ],
      },
    }),
  ],
};
