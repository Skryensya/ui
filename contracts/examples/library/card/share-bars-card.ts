import { definePattern, type PatternModule } from "../../model/types.js";
import { heading, stack, surface, text, type Node } from "../kit.js";

interface Content {
  title: string;
  footnote: string;
  parts: readonly { label: string; share: number; valueText: string; leading: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "share-bars-card",
  subject: "card",
  scale: "component",
  title: { en: "Shares card", es: "Card de partes" },
  layout: { en: "A heading, one Meter per part stacked under it, and a footnote with the total behind them.", es: "Un encabezado, un Meter por parte apilados debajo, y una nota con el total que hay detrás." },
  fields: { title: { en: "What is divided: a question, a source, a status.", es: "Qué se divide: una pregunta, una fuente, un estado." }, footnote: { en: "How many it adds up to and until when.", es: "A cuántos suma y hasta cuándo." }, parts: { en: "Each part: its label, its share from 0 to 100, the reading in words and whether it leads.", es: "Cada parte: su etiqueta, su parte de 0 a 100, la lectura en palabras y si lidera." } },
  notes: [
    { en: "A Meter per part, each with its own name and a reading in words: the bar is never the only place the number is.", es: "Un Meter por parte, cada uno con su nombre y una lectura en palabras: la barra nunca es el único lugar del número." },
    { en: "Only the leading part takes the success tone; the rest keep the accent so the eye lands once. The parts may be votes, visits or items: the layout does not know.", es: "Solo la parte que lidera toma el tono de éxito; el resto conserva el acento para que la mirada caiga una vez. Las partes pueden ser votos, visitas o ítems: el layout no lo sabe." },
  ],
  build: ({ title, footnote, parts }) =>
    surface([
      heading(title, "h5"),
      stack(parts.map((part): Node => ({ contract: "meter", signature: "Meter", options: { label: part.label, value: part.share, max: 100, valueText: part.valueText, tone: part.leading ? "success" : "accent" } })), { gap: "md" }),
      text(footnote, { size: "caption", tone: "tertiary" }),
    ]),
});

export const shareBarsCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "shares-poll", intent: "metrics/key-figures/distribution", title: { en: "Poll results", es: "Resultados de una encuesta" }, purpose: { en: "Show how a group voted on one question, with the leader visible at a glance.", es: "Mostrar cómo votó un grupo en una pregunta, con el que lidera visible de un vistazo." }, content: { title: { en: "Where should the team lunch be?", es: "¿Dónde será el almuerzo del equipo?" }, footnote: { en: "48 votes · closes Friday", es: "48 votos · cierra el viernes" }, parts: [{ label: { en: "The Italian place", es: "El italiano" }, share: 54, valueText: "54%", leading: true }, { label: { en: "The food hall", es: "El patio de comidas" }, share: 31, valueText: "31%", leading: false }, { label: { en: "Cook at the office", es: "Cocinar en la oficina" }, share: 15, valueText: "15%", leading: false }] } }),
    use({ id: "shares-traffic", intent: "metrics/key-figures/distribution", title: { en: "Traffic by source", es: "Tráfico por fuente" }, purpose: { en: "Tell where visits come from so effort goes to the channel that works.", es: "Decir de dónde vienen las visitas para dirigir el esfuerzo al canal que funciona." }, content: { title: { en: "Visits by source", es: "Visitas por fuente" }, footnote: { en: "18,240 visits · last 30 days", es: "18.240 visitas · últimos 30 días" }, parts: [{ label: { en: "Search", es: "Búsqueda" }, share: 62, valueText: "62%", leading: true }, { label: { en: "Direct", es: "Directo" }, share: 24, valueText: "24%", leading: false }, { label: { en: "Social", es: "Redes" }, share: 14, valueText: "14%", leading: false }] } }),
  ],
};
