import { definePattern, type PatternModule } from "../../model/types.js";
import { action, box, heading, icon, inline, stack, surface, text } from "../kit.js";

interface Content {
  month: string;
  day: string;
  title: string;
  when: string;
  duration: string;
  host: string;
  cta: string;
}

const row = (name: string, label: string) => inline([icon(name, "sm"), text(label, { size: "sm", tone: "secondary" })], { gap: "xs", inlineAlign: "center" });

const { pattern, use } = definePattern<Content>({
  id: "event-card",
  subject: "card",
  scale: "component",
  title: { en: "Event card", es: "Card de evento" },
  layout: { en: "A date block (month over day) beside a title and three facts with icons, and one action under them.", es: "Un bloque de fecha (mes sobre día) junto a un título y tres datos con ícono, y una acción debajo." },
  fields: { month: { en: "The month, short.", es: "El mes, corto." }, day: { en: "The day number.", es: "El número del día." }, title: { en: "What the event is.", es: "Qué es el evento." }, when: { en: "The full date and time, in words.", es: "La fecha y la hora completas, en palabras." }, duration: { en: "How long it lasts.", es: "Cuánto dura." }, host: { en: "Who runs it.", es: "Quién lo conduce." }, cta: { en: "The action, as a verb.", es: "La acción, como verbo." } },
  notes: [
    { en: "The date block is a quick scan aid, not the only place the date is: the full date and time are in words beside it.", es: "El bloque de fecha ayuda a escanear, no es el único lugar de la fecha: la fecha y la hora completas están en palabras a su lado." },
    { en: "Every fact has an icon and words; the icon helps scanning and never carries the meaning alone.", es: "Cada dato tiene ícono y palabras; el ícono ayuda a escanear y nunca lleva el significado solo." },
  ],
  build: ({ month, day, title, when, duration, host, cta }) =>
    surface([
      inline(
        [
          box([stack([text(month, { textRole: "eyebrow" }), heading(day, "h3")], { gap: "none", align: "center" })], { surface: "sunken", padding: "md" }),
          stack([heading(title, "h5"), row("calendar", when), row("clock", duration), row("user", host)], { gap: "xs" }),
        ],
        { gap: "md", inlineAlign: "start" },
      ),
      inline([action(cta, { variant: "soft", tone: "accent", size: "sm" })]),
    ]),
});

export const eventCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "event-meetup", intent: "content/events/event-card", title: { en: "A meetup", es: "Un encuentro" }, purpose: { en: "Announce an in-person event with the facts a person needs to decide whether to come.", es: "Anunciar un evento presencial con los datos que alguien necesita para decidir si va." }, content: { month: { en: "NOV", es: "NOV" }, day: "14", title: { en: "Design systems meetup", es: "Encuentro de sistemas de diseño" }, when: { en: "Thursday, November 14, 18:30", es: "Jueves 14 de noviembre, 18:30" }, duration: { en: "2 hours", es: "2 horas" }, host: { en: "Hosted by Marta Ruiz", es: "Conduce Marta Ruiz" }, cta: { en: "Save my seat", es: "Reservar mi lugar" } } }),
  ],
};
