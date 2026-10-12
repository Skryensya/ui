import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  hint: string;
}

const { pattern, use } = definePattern<Content>({
  id: "time-slot-field",
  subject: "form",
  scale: "fragment",
  title: { en: "Time field", es: "Campo de hora" },
  layout: { en: "A TimeField with a visible label and a hint that says which times are allowed.", es: "Un TimeField con etiqueta visible y una ayuda que dice qué horas se admiten." },
  fields: { label: { en: "What the time is for.", es: "Para qué es la hora." }, hint: { en: "The window or rule, before the reader gets it wrong.", es: "La ventana o la regla, antes de que quien lee se equivoque." } },
  notes: [
    { en: "A time is typed in segments (hour, minute), not picked from a clock face: it is faster with a keyboard and every screen reader knows it.", es: "Una hora se escribe por segmentos (hora, minuto), no se elige en un reloj: es más rápido con teclado y todo lector de pantalla la conoce." },
    { en: "The hint states the window up front; a rule discovered in an error message costs the reader a retry.", es: "La ayuda dice la ventana desde el principio; una regla descubierta en un mensaje de error cuesta un reintento." },
  ],
  build: ({ label, hint }, ctx) => ({ contract: "time-field", signature: "TimeField", options: { name: `${ctx.ns}-time`, required: true }, slots: { label, hint } }),
});

export const timeSlotField: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "time-appointment",
      intent: "input/fields/time-of-day",
      title: { en: "Appointment time", es: "Hora de la cita" },
      purpose: { en: "Ask for a time of day inside a window the business keeps.", es: "Pedir una hora del día dentro de una ventana que el negocio mantiene." },
      content: { label: { en: "Appointment time", es: "Hora de la cita" }, hint: { en: "We are open from 9:00 to 18:00.", es: "Atendemos de 9:00 a 18:00." } },
    }),
  ],
};
