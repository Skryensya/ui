import { definePattern, type PatternModule } from "../../model/types.js";
import { badge, stack, surface, text, type Tone } from "../kit.js";
import { amountWell } from "./amount-well.js";

interface Amount {
  label: string;
  value: string;
}
interface Content {
  label: string;
  figure: string;
  status: string;
  statusTone: Tone;
  rows: Amount[];
  total: Amount;
  note: string;
}

const { pattern, use } = definePattern<Content>({
  id: "figure-breakdown-card",
  subject: "card",
  scale: "component",
  title: { en: "Figure with a breakdown", es: "Cifra con desglose" },
  layout: { en: "A large labelled figure with a status badge, an amount well that shows how it adds up, and a note in small type.", es: "Una cifra grande con etiqueta y una insignia de estado, un pozo de montos que muestra cómo suma, y una nota en letra pequeña." },
  fields: { label: { en: "What the figure is.", es: "Qué es la cifra." }, figure: { en: "The figure, formatted.", es: "La cifra, con formato." }, status: { en: "Its state.", es: "Su estado." }, statusTone: { en: "The state's tone.", es: "El tono del estado." }, rows: { en: "What it is made of.", es: "De qué se compone." }, total: { en: "What it adds up to: the figure again, labelled.", es: "A cuánto suma: la cifra otra vez, con etiqueta." }, note: { en: "The rule that governs it.", es: "La regla que lo gobierna." } },
  build: ({ label, figure, status, statusTone, rows, total, note }, ctx) =>
    surface([
      stack([{ contract: "stat", signature: "Stat", slots: { label, value: figure } }, badge(status, statusTone, "sm")], { gap: "xs", align: "start" }),
      amountWell.pattern.build({ rows, total }, ctx),
      text(note, { size: "sm", tone: "secondary" }),
    ]),
});

export const figureBreakdownCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "balance-claimable",
      intent: "metrics/money/balance",
      title: { en: "Balance", es: "Saldo" },
      purpose: { en: "An available amount, its status and where it comes from.", es: "Un monto disponible, su estado y de dónde sale." },
      content: {
        label: { en: "Claimable balance", es: "Saldo disponible" },
        figure: { en: "$1,211.29", es: "1.211,29 US$" },
        status: { en: "Setup pending", es: "Configuración pendiente" },
        statusTone: "warning",
        rows: [
          { label: { en: "Net royalties", es: "Regalías netas" }, value: { en: "$1,248.75", es: "1.248,75 US$" } },
          { label: { en: "Processing fee", es: "Comisión" }, value: { en: "-$37.46", es: "-37,46 US$" } },
        ],
        total: { label: { en: "Total to claim", es: "Total a cobrar" }, value: { en: "$1,211.29", es: "1.211,29 US$" } },
        note: { en: "Once your bank is connected, balances over $10 are paid out on the 15th of each month.", es: "Cuando conectes tu banco, los saldos sobre $10 se transfieren el día 15 de cada mes." },
      },
    }),
  ],
};
