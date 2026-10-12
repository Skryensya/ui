import type { ItemInput } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";
import { stack, text } from "../kit.js";

interface Content {
  title: string;
  caption: string;
  label: string;
  kind: "bar" | "line" | "area";
  format: "number" | "compact" | "percent";
  points: { label: string; value: number }[];
}

const { pattern, use } = definePattern<Content>({
  id: "trend-chart",
  subject: "table",
  scale: "component",
  title: { en: "Trend chart", es: "Gráfico de tendencia" },
  layout: { en: "A title and a line of context over a Chart of one series, named for assistive technology.", es: "Un título y una línea de contexto sobre un Chart de una serie, con nombre para la tecnología asistiva." },
  fields: {
    title: { en: "What the series measures.", es: "Qué mide la serie." },
    caption: { en: "The period and the unit, so the figures need no legend.", es: "El periodo y la unidad, para que las cifras no necesiten leyenda." },
    label: { en: "The chart's accessible name: the whole claim, in a sentence.", es: "El nombre accesible del gráfico: toda la afirmación, en una frase." },
    kind: { en: "`bar` compares, `line` shows direction, `area` shows volume over time.", es: "`bar` compara, `line` muestra dirección, `area` muestra volumen en el tiempo." },
    format: { en: "How a value reads: whole, compact (38.2K) or a percentage.", es: "Cómo se lee un valor: entero, compacto (38,2 K) o porcentaje." },
    points: { en: "The series, in order, each with its own label.", es: "La serie, en orden, cada punto con su etiqueta." },
  },
  notes: [
    { en: "One series per chart: a second one asks for a legend and a colour the reader has to decode. Two measures are two charts.", es: "Una serie por gráfico: una segunda pide leyenda y un color que hay que descifrar. Dos medidas son dos gráficos." },
    { en: "The accessible name carries the conclusion, not `Chart`: it is what a screen reader reads in place of the picture.", es: "El nombre accesible lleva la conclusión, no `Gráfico`: es lo que lee un lector de pantalla en lugar de la imagen." },
  ],
  build: ({ title, caption, label, kind, format, points }) =>
    stack(
      [
        text(title, { size: "sm", weight: "emphasis" }),
        text(caption, { size: "caption", tone: "secondary" }),
        {
          contract: "chart",
          signature: "Chart",
          options: { kind, format, tone: "accent", height: "md", label },
          slots: { items: points.map((point): ItemInput => ({ options: { value: point.value }, slots: { label: point.label } })) },
        },
      ],
      { gap: "xs" },
    ),
});

const week = (en: string, es: string) => ({ en, es });

export const trendChart: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "trend-weekly-visits",
      intent: "metrics/trends/trend-chart",
      title: { en: "Visits by week", es: "Visitas por semana" },
      purpose: { en: "Show whether a number is rising, with enough history to tell a trend from a bad week.", es: "Mostrar si una cifra sube, con historial suficiente para distinguir una tendencia de una mala semana." },
      content: {
        title: { en: "Weekly visits", es: "Visitas semanales" },
        caption: { en: "Last eight weeks, all pages", es: "Últimas ocho semanas, todas las páginas" },
        label: { en: "Visits rose from 38.2K to 61.4K over the last eight weeks", es: "Las visitas subieron de 38,2 K a 61,4 K en las últimas ocho semanas" },
        kind: "area",
        format: "compact",
        points: [38200, 41500, 39800, 47200, 44100, 52600, 57300, 61400].map((value, index) => ({ label: week(`W${index + 1}`, `S${index + 1}`), value })),
      },
    }),
    use({
      id: "trend-signup-conversion",
      intent: "metrics/trends/trend-chart",
      title: { en: "Conversion by month", es: "Conversión por mes" },
      purpose: { en: "Compare one rate across periods, where the gaps between bars are the point.", es: "Comparar una tasa entre periodos, donde las diferencias entre barras son lo importante." },
      content: {
        title: { en: "Sign-up conversion", es: "Conversión de registro" },
        caption: { en: "Share of visitors who created an account, by month", es: "Proporción de visitantes que crearon una cuenta, por mes" },
        label: { en: "Sign-up conversion rose from 2.1 to 4.8 percent between May and October", es: "La conversión de registro subió del 2,1 al 4,8 por ciento entre mayo y octubre" },
        kind: "bar",
        format: "percent",
        points: [
          { label: { en: "May", es: "May" }, value: 2.1 },
          { label: { en: "Jun", es: "Jun" }, value: 3.4 },
          { label: { en: "Jul", es: "Jul" }, value: 2.9 },
          { label: { en: "Aug", es: "Ago" }, value: 4.2 },
          { label: { en: "Sep", es: "Sep" }, value: 3.6 },
          { label: { en: "Oct", es: "Oct" }, value: 4.8 },
        ],
      },
    }),
  ],
};
