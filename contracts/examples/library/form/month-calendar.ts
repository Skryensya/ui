import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  value: string;
  min: string;
  max: string;
}

const { pattern, use } = definePattern<Content>({
  id: "month-calendar",
  subject: "form",
  scale: "component",
  title: { en: "Month calendar", es: "Calendario del mes" },
  layout: { en: "A Calendar showing one month with a date chosen, and the days outside the allowed range unavailable.", es: "Un Calendar que muestra un mes con una fecha elegida, y los días fuera del rango permitido no disponibles." },
  fields: { label: { en: "What the date is for: the calendar's name.", es: "Para qué es la fecha: el nombre del calendario." }, value: { en: "The chosen date.", es: "La fecha elegida." }, min: { en: "The first allowed date.", es: "La primera fecha permitida." }, max: { en: "The last allowed date.", es: "La última fecha permitida." } },
  notes: [
    { en: "Dates outside the range stay on the grid, dimmed and skipped by the keyboard, so the month still looks like a month.", es: "Las fechas fuera del rango se quedan en la cuadrícula, atenuadas y saltadas por el teclado, así que el mes sigue pareciendo un mes." },
    { en: "A calendar is for seeing days in context (what falls on a weekend, how far away it is); if the reader already knows the date, a typed date field is faster.", es: "Un calendario es para ver los días en contexto (qué cae en fin de semana, qué tan lejos está); si quien lee ya sabe la fecha, un campo de fecha escrito es más rápido." },
  ],
  build: ({ label, value, min, max }) => ({ contract: "calendar", signature: "Calendar", options: { value, min, max }, slots: { label } }),
});

export const monthCalendar: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "calendar-booking", intent: "input/fields/date-in-context", title: { en: "Booking window", es: "Ventana de reserva" }, purpose: { en: "Let someone choose a day among those a booking allows, seeing the whole month.", es: "Dejar que alguien elija un día entre los que una reserva permite, viendo todo el mes." }, content: { label: { en: "Booking date", es: "Fecha de la reserva" }, value: "2026-03-12", min: "2026-03-01", max: "2026-03-31" } }),
  ],
};
