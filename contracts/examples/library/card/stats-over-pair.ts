import { definePattern, type PatternModule } from "../../model/types.js";
import { grid, lanes, stack } from "../kit.js";

interface Content {
  statsLabel: string;
  /** Ids of the figures in the top row. */
  stats: string[];
  /** The two panels under it. */
  left: string;
  right: string;
}

const { pattern, use } = definePattern<Content>({
  id: "stats-over-pair",
  subject: "card",
  scale: "composition",
  title: { en: "Figures over a pair", es: "Cifras sobre un par" },
  layout: { en: "A row of figures, and under it two panels side by side that become one lane on a phone.", es: "Una fila de cifras y, debajo, dos paneles lado a lado que pasan a un carril en el teléfono." },
  fields: { statsLabel: { en: "The figures' accessible name.", es: "El nombre accesible de las cifras." }, stats: { en: "Ids of the figures.", es: "Ids de las cifras." }, left: { en: "Id of the first panel.", es: "Id del primer panel." }, right: { en: "Id of the second panel.", es: "Id del segundo panel." } },
  build: ({ statsLabel, stats, left, right }, ctx) =>
    stack([lanes(statsLabel, stats.map((id) => ctx.render(id))), grid([ctx.render(left), ctx.render(right)], { columns: "2", gap: "md", responsive: true })], { gap: "md" }),
});

export const statsOverPair: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "account-overview", intent: "metrics/key-figures/account-overview", title: { en: "Overview", es: "Resumen" }, purpose: { en: "An account's figures, its quota and recent activity.", es: "Las cifras de una cuenta, su cuota y la actividad reciente." }, content: { statsLabel: { en: "This month's figures", es: "Cifras del mes" }, stats: ["stat-active-customers", "stat-revenue", "stat-open-tickets"], left: "quota-storage", right: "panel-activity" } }),
  ],
};
