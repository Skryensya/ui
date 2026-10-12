import { definePattern, type PatternModule } from "../../model/types.js";
import { action, heading, icon, inline, stack, surface, text, type Node } from "../kit.js";

interface Content {
  kind: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  facts: readonly { label: string; value: string }[];
  actionLabel: string;
}

const { pattern, use } = definePattern<Content>({
  id: "route-card",
  subject: "card",
  scale: "component",
  title: { en: "Route card", es: "Card de ruta" },
  layout: { en: "An eyebrow, a route (origin and destination as large codes with an arrow between), a row of three Stats and one action.", es: "Un sobretítulo, una ruta (origen y destino como códigos grandes con una flecha entre ellos), una fila de tres Stats y una acción." },
  fields: { kind: { en: "What is travelling.", es: "Qué viaja." }, fromCode: { en: "The origin, short.", es: "El origen, corto." }, fromName: { en: "The origin, in words.", es: "El origen, en palabras." }, toCode: { en: "The destination, short.", es: "El destino, corto." }, toName: { en: "The destination, in words.", es: "El destino, en palabras." }, facts: { en: "Three label and value pairs about the journey.", es: "Tres pares etiqueta y valor sobre el recorrido." }, actionLabel: { en: "What to do with it.", es: "Qué hacer con él." } },
  notes: [
    { en: "The codes are for scanning, the names under them are for knowing: neither stands alone.", es: "Los códigos sirven para escanear, los nombres debajo para saber: ninguno vale solo." },
    { en: "The arrow is decorative; the route reads as origin then destination by the order of the markup. A person, a parcel or a dataset can be what moves.", es: "La flecha es decorativa; la ruta se lee como origen y luego destino por el orden del marcado. Lo que se mueve puede ser una persona, un paquete o un conjunto de datos." },
  ],
  build: ({ kind, fromCode, fromName, toCode, toName, facts, actionLabel }) =>
    surface([
      text(kind, { textRole: "eyebrow" }),
      inline([stack([heading(fromCode, "h3"), text(fromName, { size: "sm", tone: "secondary" })], { gap: "none" }), icon("arrow-right", "md"), stack([heading(toCode, "h3"), text(toName, { size: "sm", tone: "secondary" })], { gap: "none" })], { gap: "lg", inlineAlign: "center", justify: "between" }),
      inline(facts.map((fact): Node => ({ contract: "stat", signature: "Stat", slots: { label: fact.label, value: fact.value } })), { gap: "lg", wrap: true }),
      action(actionLabel, { variant: "soft", tone: "accent", size: "sm" }),
    ]),
});

export const routeCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "route-boarding-pass", intent: "status/progress/journey", title: { en: "A boarding pass", es: "Una tarjeta de embarque" }, purpose: { en: "Hold what someone needs at the gate: route, time, seat.", es: "Reunir lo que alguien necesita en la puerta: ruta, hora, asiento." }, content: { kind: { en: "Boarding pass", es: "Tarjeta de embarque" }, fromCode: "SCL", fromName: "Santiago", toCode: "LIM", toName: "Lima", facts: [{ label: { en: "Departs", es: "Sale" }, value: "08:45" }, { label: { en: "Gate", es: "Puerta" }, value: "B12" }, { label: { en: "Seat", es: "Asiento" }, value: "14A" }], actionLabel: { en: "Add to wallet", es: "Añadir a la billetera" } } }),
    use({ id: "route-migration", intent: "status/progress/journey", title: { en: "A data migration", es: "Una migración de datos" }, purpose: { en: "Show what is moving from one system to another and how much, before it is confirmed.", es: "Mostrar qué se mueve de un sistema a otro y cuánto, antes de confirmar." }, content: { kind: { en: "Migration", es: "Migración" }, fromCode: "v1", fromName: { en: "Legacy database", es: "Base heredada" }, toCode: "v2", toName: { en: "New workspace", es: "Espacio nuevo" }, facts: [{ label: { en: "Records", es: "Registros" }, value: "12,480" }, { label: { en: "Duration", es: "Duración" }, value: "~20 min" }, { label: { en: "Downtime", es: "Interrupción" }, value: { en: "None", es: "Ninguna" } }], actionLabel: { en: "Start migration", es: "Iniciar migración" } } }),
  ],
};
