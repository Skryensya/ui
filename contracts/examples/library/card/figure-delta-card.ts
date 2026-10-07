import { definePattern, type PatternModule } from "../../model/types.js";
import { box, icon } from "../kit.js";

interface Content {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

const { pattern, use } = definePattern<Content>({
  id: "figure-delta-card",
  subject: "card",
  scale: "component",
  title: { en: "Figure with its change", es: "Cifra con su variación" },
  layout: { en: "One Stat in a bordered box: label, figure, and the change with a trend arrow beneath.", es: "Un Stat en una caja con borde: etiqueta, cifra y debajo la variación con una flecha de tendencia." },
  fields: { label: { en: "What is measured.", es: "Qué se mide." }, value: { en: "The figure, formatted.", es: "La cifra, con formato." }, change: { en: "The change and its period.", es: "La variación y su periodo." }, trend: { en: "Which way it moved.", es: "Hacia dónde se movió." } },
  notes: [{ en: "The quieter sibling of the chip card: no verdict line. The Stat colours the change by what the trend means to the caller, so a drop in tickets can be green.", es: "La hermana más sobria de la card con chip: sin línea de veredicto. El Stat colorea la variación según lo que significa la tendencia para quien llama, así que una baja de tickets puede ser verde." }],
  build: ({ label, value, change, trend }) =>
    box([{ contract: "stat", signature: "Stat", options: { trend }, slots: { label, value, change: [icon(`arrow-${trend}`, "sm"), change] } }], { surface: "surface", border: "subtle", padding: "lg" }),
});

export const figureDeltaCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "stat-active-customers", intent: "metrics/key-figures/kpi", title: { en: "Active customers", es: "Clientes activos" }, purpose: { en: "A headline figure with its monthly change.", es: "Una cifra principal con su variación mensual." }, catalog: false, content: { label: { en: "Active customers", es: "Clientes activos" }, value: { en: "1,284", es: "1.284" }, change: { en: "8% this month", es: "8% este mes" }, trend: "up" } }),
    use({ id: "stat-revenue", intent: "metrics/key-figures/kpi", title: { en: "Revenue", es: "Ingresos" }, purpose: { en: "A headline figure with its monthly change.", es: "Una cifra principal con su variación mensual." }, catalog: false, content: { label: { en: "Revenue", es: "Ingresos" }, value: { en: "$48,900", es: "48.900 US$" }, change: { en: "3% this month", es: "3% este mes" }, trend: "up" } }),
    use({ id: "stat-open-tickets", intent: "metrics/key-figures/kpi", title: { en: "Open tickets", es: "Tickets abiertos" }, purpose: { en: "A headline figure with its monthly change.", es: "Una cifra principal con su variación mensual." }, catalog: false, content: { label: { en: "Open tickets", es: "Tickets abiertos" }, value: "37", change: { en: "12% this month", es: "12% este mes" }, trend: "down" } }),
  ],
};
