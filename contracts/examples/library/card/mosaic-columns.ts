import { definePattern, type PatternModule } from "../../model/types.js";
import { grid, stack } from "../kit.js";

interface Content {
  /** Each column is a list of use ids, top to bottom. */
  columns: string[][];
}

const { pattern, use } = definePattern<Content>({
  id: "mosaic-columns",
  subject: "card",
  scale: "composition",
  title: { en: "Mosaic of columns", es: "Mosaico de columnas" },
  layout: { en: "Three columns that each stack their own cards, so heights differ and nothing is stretched to match its neighbour.", es: "Tres columnas que apilan cada una sus cards, así las alturas difieren y nada se estira para igualar a su vecino." },
  fields: { columns: { en: "Per column, the ids of the uses it stacks.", es: "Por columna, los ids de los usos que apila." } },
  notes: [{ en: "Columns of stacks, not a grid with spans: a product's home mixes unrelated cards, and a span would stretch the short ones to the tall one's height.", es: "Columnas de pilas y no una grilla con spans: la home de un producto mezcla cards sin relación, y un span estiraría las cortas a la altura de la alta." }],
  build: ({ columns }, ctx) => grid(columns.map((ids) => stack(ids.map((id) => ctx.render(id)), { gap: "md" })), { columns: "3", gap: "md", responsive: true }),
});

export const mosaicColumns: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "finance-board", intent: "metrics/money/finance-board", title: { en: "Finance", es: "Finanzas" }, purpose: { en: "A mosaic of cards of different heights that tell an account's state.", es: "Un mosaico de cards de distinta altura que cuentan el estado de una cuenta." }, content: { columns: [["balance-claimable", "planning-links"], ["kpi-revenue", "goals-savings"], ["connect-mobile-app", "shortcuts-settings"]] } }),
  ],
};
