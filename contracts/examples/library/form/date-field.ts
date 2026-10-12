import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  value: string;
  placeholder: string;
}

const { pattern, use } = definePattern<Content>({
  id: "date-field",
  subject: "form",
  scale: "fragment",
  title: { en: "Date field", es: "Campo de fecha" },
  layout: { en: "A DatePicker: a typed field with a calendar behind a button, starting on a date.", es: "Un DatePicker: un campo escrito con un calendario tras un botón, que empieza en una fecha." },
  fields: { label: { en: "What the date is for.", es: "Para qué es la fecha." }, value: { en: "The date it starts on, as year-month-day.", es: "La fecha en la que empieza, como año-mes-día." }, placeholder: { en: "The format to type, shown when it is empty.", es: "El formato a escribir, visible cuando está vacío." } },
  notes: [
    { en: "The field can be typed in as well as picked: a calendar is slow for a date you already know, and a typed date works with the keyboard alone.", es: "El campo se puede escribir además de elegir: un calendario es lento para una fecha que ya sabes, y una fecha escrita funciona solo con teclado." },
    { en: "The value is always year-month-day, whatever the screen shows, so the form sends one format.", es: "El valor es siempre año-mes-día, sea lo que sea que muestre la pantalla, así el formulario envía un solo formato." },
  ],
  build: ({ label, value, placeholder }, ctx) => ({ contract: "date-picker", signature: "DatePicker", options: { name: `${ctx.ns}-date`, value, placeholder }, slots: { label } }),
});

export const dateField: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "date-booking", intent: "input/fields/date", title: { en: "Booking date", es: "Fecha de la reserva" }, purpose: { en: "Ask for a day in the near future, with the calendar one click away.", es: "Pedir un día cercano, con el calendario a un clic." }, content: { label: { en: "Booking date", es: "Fecha de la reserva" }, value: "2026-03-12", placeholder: { en: "YYYY-MM-DD", es: "AAAA-MM-DD" } } }),
  ],
};
