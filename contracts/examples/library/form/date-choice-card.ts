import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline, surface, titleBlock } from "../kit.js";

interface Content {
  title: string;
  subtitle: string;
  label: string;
  placeholder: string;
  clearLabel: string;
  /** The calendar's language: `en`, `es`. */
  locale: string;
  /** `single` for one date, `range` for a stay or a period. */
  selectionMode: "single" | "range";
  /** Earliest date that can be picked, `YYYY-MM-DD`. */
  min?: string;
  /** Latest date that can be picked, `YYYY-MM-DD`. */
  max?: string;
  /** The date that starts chosen, `YYYY-MM-DD` (single only). */
  value?: string;
  submit: string;
}

const { pattern, use } = definePattern<Content>({
  id: "date-choice-card",
  subject: "form",
  scale: "component",
  title: { en: "Date choice card", es: "Card de elección de fecha" },
  layout: { en: "A title block, a DatePicker that opens a calendar behind its field, and one action to confirm.", es: "Un bloque de título, un DatePicker que abre un calendario tras su campo y una acción para confirmar." },
  fields: { title: { en: "What the date is for.", es: "Para qué es la fecha." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, label: { en: "The field's name.", es: "El nombre del campo." }, placeholder: { en: "What the empty field says.", es: "Lo que dice el campo vacío." }, clearLabel: { en: "The clear button's accessible name.", es: "El nombre accesible del botón de borrar." }, locale: { en: "The calendar's language.", es: "El idioma del calendario." }, selectionMode: { en: "`single` or `range`.", es: "`single` o `range`." }, min: { en: "Earliest pickable date.", es: "Primera fecha elegible." }, max: { en: "Latest pickable date.", es: "Última fecha elegible." }, value: { en: "A date already chosen.", es: "Una fecha ya elegida." }, submit: { en: "The way forward.", es: "El camino adelante." } },
  notes: [{ en: "The limits (`min`, `max`) are what the job needs, not a decoration: a due date cannot be in the past, a birth date cannot be in the future. Say why in the subtitle so a greyed-out day is not a mystery.", es: "Los límites (`min`, `max`) son lo que la tarea necesita, no un adorno: una fecha de entrega no puede estar en el pasado ni un nacimiento en el futuro. Explica por qué en el subtítulo para que un día gris no sea un misterio." }],
  build: ({ title, subtitle, label, placeholder, clearLabel, locale, selectionMode, min, max, value, submit }, ctx) =>
    surface([
      titleBlock(title, subtitle),
      {
        contract: "date-picker",
        signature: "DatePicker",
        options: { name: `${ctx.ns}-date`, locale, placeholder, clearLabel, selectionMode, ...(min ? { min } : {}), ...(max ? { max } : {}), ...(value ? { value } : {}) },
        slots: { label },
      },
      inline([action(submit, { variant: "soft", tone: "accent", size: "sm" })], { gap: "sm", justify: "end" }),
    ]),
});

const lang = { en: "en", es: "es" };
const clear = { en: "Clear date", es: "Borrar fecha" };

export const dateChoiceCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "date-choice-delivery",
      intent: "input/fields/pick-delivery-date",
      title: { en: "Delivery date", es: "Fecha de entrega" },
      purpose: { en: "Pick one day for something to arrive, from the first one possible.", es: "Elegir un día para que algo llegue, desde el primero posible." },
      content: { title: { en: "When should it arrive?", es: "¿Cuándo debe llegar?" }, subtitle: { en: "The earliest day is Monday, October 20", es: "El primer día posible es el lunes 20 de octubre" }, label: { en: "Delivery date", es: "Fecha de entrega" }, placeholder: { en: "Choose a day", es: "Elige un día" }, clearLabel: clear, locale: lang, selectionMode: "single", min: "2026-10-20", submit: { en: "Confirm date", es: "Confirmar fecha" } },
    }),
    use({
      id: "date-choice-stay",
      intent: "input/fields/pick-stay",
      title: { en: "Stay dates", es: "Fechas de estancia" },
      purpose: { en: "Pick a start and an end in one go: a stay, a leave, a campaign.", es: "Elegir un inicio y un fin de una vez: una estancia, una licencia, una campaña." },
      content: { title: { en: "Book your stay", es: "Reserva tu estancia" }, subtitle: { en: "Choose your check-in and check-out days", es: "Elige los días de entrada y de salida" }, label: { en: "Check-in and check-out", es: "Entrada y salida" }, placeholder: { en: "Choose your dates", es: "Elige tus fechas" }, clearLabel: clear, locale: lang, selectionMode: "range", min: "2026-10-12", submit: { en: "Check availability", es: "Ver disponibilidad" } },
    }),
  ],
};
