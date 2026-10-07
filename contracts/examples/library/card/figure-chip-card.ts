import { definePattern, type Localized, type PatternModule } from "../../model/types.js";
import { badge, icon, inline, stack, surface, text } from "../kit.js";

interface Content {
  label: string;
  value: string;
  /** The change, short, in the chip: "+12.5%". */
  chip: string;
  /** What the change means, in a few words. */
  headline: string;
  note: string;
  trend: "up" | "down";
}

const { pattern, use } = definePattern<Content>({
  id: "figure-chip-card",
  subject: "card",
  scale: "component",
  title: { en: "Figure with a chip", es: "Cifra con chip" },
  layout: { en: "A labelled figure with its change as a chip at the end of the same row, then a one-line verdict with a trend arrow and a quiet note.", es: "Una cifra con etiqueta y su variación como chip al final de la misma fila, y después un veredicto de una línea con flecha de tendencia y una nota discreta." },
  fields: { label: { en: "What is measured.", es: "Qué se mide." }, value: { en: "The figure, formatted.", es: "La cifra, con formato." }, chip: { en: "The change.", es: "La variación." }, headline: { en: "What the change means.", es: "Qué significa la variación." }, note: { en: "The period or the caveat.", es: "El periodo o la salvedad." }, trend: { en: "Which way it moved.", es: "Hacia dónde se movió." } },
  notes: [{ en: "The chip is a Badge and says the number; the verdict beside the arrow says what it means, so a reader who skips the chip still gets the message. Direction is also in the arrow, never colour alone.", es: "El chip es una Badge y dice el número; el veredicto junto a la flecha dice qué significa, así que quien se salta el chip igual entiende. La dirección también va en la flecha, nunca solo en color." }],
  build: ({ label, value, chip, headline, note, trend }) =>
    surface([
      inline([{ contract: "stat", signature: "Stat", slots: { label, value } }, badge(chip, "neutral", "sm")], { gap: "sm", justify: "between", inlineAlign: "start", wrap: false }),
      stack([inline([text(headline, { size: "sm", weight: "label" }), icon(`arrow-${trend}`, "sm")], { gap: "xs", inlineAlign: "center" }), text(note, { size: "sm", tone: "secondary" })], { gap: "none" }),
    ]),
});

const kpi = (key: string, catalog: boolean, content: Localized<Content>) => ({ key, catalog, content });

const kpis = [
  kpi("revenue", true, { label: { en: "Total revenue", es: "Ingresos totales" }, value: { en: "$1,250", es: "1.250 US$" }, chip: "+12.5%", headline: { en: "Trending up this month", es: "Al alza este mes" }, note: { en: "Visitors for the last 6 months", es: "Visitas de los últimos 6 meses" }, trend: "up" }),
  kpi("customers", false, { label: { en: "New customers", es: "Clientes nuevos" }, value: { en: "1,234", es: "1.234" }, chip: "-20%", headline: { en: "Down 20% this period", es: "Baja de 20 % este periodo" }, note: { en: "Acquisition needs attention", es: "La captación necesita atención" }, trend: "down" }),
  kpi("accounts", false, { label: { en: "Active accounts", es: "Cuentas activas" }, value: { en: "45,678", es: "45.678" }, chip: "+12.5%", headline: { en: "Strong retention", es: "Buena retención" }, note: { en: "Usage exceeds the target", es: "El uso supera la meta" }, trend: "up" }),
  kpi("growth", false, { label: { en: "Growth rate", es: "Crecimiento" }, value: { en: "4.5%", es: "4,5 %" }, chip: "+4.5%", headline: { en: "Steady increase", es: "Aumento sostenido" }, note: { en: "Meets the projection", es: "Dentro de lo proyectado" }, trend: "up" }),
];

export const figureChipCard: PatternModule<Content> = {
  pattern,
  uses: kpis.map(({ key, catalog, content }) =>
    use({
      id: `kpi-${key}`,
      intent: "metrics/key-figures/kpi",
      title: catalog ? { en: "Key figure", es: "Cifra clave" } : content.label,
      purpose: { en: "A key figure with its change and what it means.", es: "Una cifra clave con su variación y lo que significa." },
      catalog,
      content,
    }),
  ),
};
