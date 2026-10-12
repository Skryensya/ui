import { definePattern, type PatternModule } from "../../model/types.js";
import { icon, surface, text, titleBlock, type Tone } from "../kit.js";

interface Event {
  /** Machine-readable moment for the `<time>` element. */
  datetime: string;
  /** The moment as a person reads it. */
  time: string;
  heading: string;
  body?: string;
  tone: Tone;
  icon: string;
}
interface Content {
  title: string;
  subtitle: string;
  events: Event[];
}

const { pattern, use } = definePattern<Content>({
  id: "event-timeline",
  subject: "feedback",
  scale: "component",
  title: { en: "Event timeline card", es: "Card con línea de tiempo" },
  layout: { en: "A title block over a Timeline: one marker per event, its time, its heading and an optional line of detail.", es: "Un bloque de título sobre una Timeline: un marcador por evento, su hora, su encabezado y una línea opcional de detalle." },
  fields: { title: { en: "What the history is of.", es: "De qué es la historia." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, events: { en: "Each event: a machine time, the time as read, a heading, an optional detail, a tone and an icon name.", es: "Cada evento: una hora para máquinas, la hora como se lee, un encabezado, un detalle opcional, un tono y el nombre de un icono." } },
  notes: [{ en: "The tone carries the state (success done, accent current, neutral still to come): the marker's colour is the only thing that changes between events.", es: "El tono lleva el estado (éxito hecho, acento actual, neutro por venir): el color del marcador es lo único que cambia entre eventos." }],
  build: ({ title, subtitle, events }) =>
    surface([
      titleBlock(title, subtitle),
      {
        contract: "timeline",
        signature: "Timeline",
        children: events.map((event) => ({
          contract: "timeline",
          signature: "TimelineItem",
          options: { time: event.datetime, tone: event.tone },
          slots: { time: event.time, heading: event.heading, icon: icon(event.icon, "sm") },
          ...(event.body ? { children: text(event.body, { size: "sm", tone: "secondary" }) } : {}),
        })),
      },
    ]),
});

export const eventTimeline: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "order-tracking",
      intent: "status/progress/order-tracking",
      title: { en: "Order tracking", es: "Seguimiento de pedido" },
      purpose: { en: "Where an order has been and where it stands, newest step last.", es: "Por dónde pasó un pedido y en qué punto está, con el paso más reciente al final." },
      content: {
        title: { en: "Order #4821", es: "Pedido n.º 4821" },
        subtitle: { en: "Arrives Thursday, October 16", es: "Llega el jueves 16 de octubre" },
        events: [
          { datetime: "2026-10-12T09:10", time: { en: "Oct 12, 9:10", es: "12 oct, 9:10" }, heading: { en: "Order placed", es: "Pedido realizado" }, tone: "success", icon: "check" },
          { datetime: "2026-10-13T16:40", time: { en: "Oct 13, 4:40 pm", es: "13 oct, 16:40" }, heading: { en: "Packed and handed to the carrier", es: "Empaquetado y entregado al transportista" }, body: { en: "Parcel 1 of 1, 2.4 kg.", es: "Paquete 1 de 1, 2,4 kg." }, tone: "success", icon: "check" },
          { datetime: "2026-10-15T08:00", time: { en: "Today", es: "Hoy" }, heading: { en: "Out for delivery", es: "En reparto" }, body: { en: "The driver is 6 stops away.", es: "El repartidor está a 6 paradas." }, tone: "accent", icon: "clock" },
          { datetime: "2026-10-16", time: { en: "Thursday", es: "Jueves" }, heading: { en: "Delivered", es: "Entregado" }, tone: "neutral", icon: "calendar" },
        ],
      },
    }),
    use({
      id: "security-history",
      intent: "status/progress/event-history",
      title: { en: "Security history", es: "Historial de seguridad" },
      purpose: { en: "What changed on an account and when, so an unexpected change stands out.", es: "Qué cambió en una cuenta y cuándo, para que un cambio inesperado resalte." },
      content: {
        title: { en: "Account security", es: "Seguridad de la cuenta" },
        subtitle: { en: "The last three changes", es: "Los últimos tres cambios" },
        events: [
          { datetime: "2026-10-14T11:02", time: { en: "Oct 14, 11:02", es: "14 oct, 11:02" }, heading: { en: "Password changed", es: "Contraseña cambiada" }, body: { en: "From a laptop in Madrid.", es: "Desde un portátil en Madrid." }, tone: "success", icon: "check" },
          { datetime: "2026-10-09T20:15", time: { en: "Oct 9, 8:15 pm", es: "9 oct, 20:15" }, heading: { en: "New device signed in", es: "Un dispositivo nuevo inició sesión" }, body: { en: "A phone you had not used before.", es: "Un teléfono que no habías usado antes." }, tone: "warning", icon: "clock" },
          { datetime: "2026-09-30T08:30", time: { en: "Sep 30, 8:30", es: "30 sep, 8:30" }, heading: { en: "Two-step verification turned on", es: "Verificación en dos pasos activada" }, tone: "success", icon: "check" },
        ],
      },
    }),
  ],
};
