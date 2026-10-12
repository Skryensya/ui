import { definePattern, type PatternModule } from "../../model/types.js";
import { surface } from "../kit.js";
import { amountWell } from "./amount-well.js";
import { decisionRow } from "./decision-row.js";
import { headingStack } from "./heading-stack.js";

interface Amount {
  label: string;
  value: string;
}
interface Content {
  eyebrow: string;
  title: string;
  subtitle: string;
  rows: Amount[];
  total: Amount;
  secondary: string;
  primary: string;
}

const { pattern, use } = definePattern<Content>({
  id: "statement-card",
  subject: "card",
  scale: "component",
  title: { en: "Statement card", es: "Card de estado de cuenta" },
  layout: { en: "A heading block, an amount well that shows how a total adds up, and a decision row to act on it.", es: "Un bloque de encabezado, un pozo de montos que muestra cómo suma un total y una fila de decisión para actuar sobre él." },
  fields: { eyebrow: { en: "The kind of statement.", es: "El tipo de estado." }, title: { en: "What it covers.", es: "Qué cubre." }, subtitle: { en: "The period or the source.", es: "El período o el origen." }, rows: { en: "The lines that add up.", es: "Las líneas que suman." }, total: { en: "The sum, with its label.", es: "La suma, con su etiqueta." }, secondary: { en: "The way out.", es: "La salida." }, primary: { en: "The way forward.", es: "El camino adelante." } },
  notes: [{ en: "It is the amount well, the heading block and the decision row put in one card: each keeps its own pattern, so a change to one reaches every card that holds it.", es: "Es el pozo de montos, el bloque de encabezado y la fila de decisión puestos en una card: cada uno conserva su patrón, así que un cambio en uno llega a toda card que lo contiene." }],
  build: ({ eyebrow, title, subtitle, rows, total, secondary, primary }, ctx) =>
    surface([headingStack.pattern.build({ eyebrow, title, subtitle }, ctx), amountWell.pattern.build({ rows, total }, ctx), decisionRow.pattern.build({ secondary, primary }, ctx)]),
});

export const statementCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "royalties-statement",
      intent: "metrics/money/breakdown",
      title: { en: "Royalties statement", es: "Estado de regalías" },
      purpose: { en: "How a payout adds up, with the action that claims it.", es: "Cómo suma un pago, con la acción que lo cobra." },
      content: {
        eyebrow: { en: "Statement", es: "Estado de cuenta" },
        title: { en: "October royalties", es: "Regalías de octubre" },
        subtitle: { en: "Closed on October 31", es: "Cerrado el 31 de octubre" },
        rows: [
          { label: { en: "Net royalties", es: "Regalías netas" }, value: { en: "$1,248.75", es: "1.248,75 US$" } },
          { label: { en: "Processing fee", es: "Comisión" }, value: { en: "-$37.46", es: "-37,46 US$" } },
        ],
        total: { label: { en: "Total to claim", es: "Total a cobrar" }, value: { en: "$1,211.29", es: "1.211,29 US$" } },
        secondary: { en: "Download", es: "Descargar" },
        primary: { en: "Claim", es: "Cobrar" },
      },
    }),
    use({
      id: "credits-statement",
      intent: "metrics/money/breakdown",
      title: { en: "Credits ledger", es: "Libro de créditos" },
      purpose: { en: "What was granted, used and left when the unit is not money, with the action to top up.", es: "Lo que se otorgó, usó y queda cuando la unidad no es dinero, con la acción para recargar." },
      content: {
        eyebrow: { en: "Usage", es: "Uso" },
        title: { en: "Credits this month", es: "Créditos de este mes" },
        subtitle: { en: "Resets on November 1", es: "Se renueva el 1 de noviembre" },
        rows: [
          { label: { en: "Plan credits", es: "Créditos del plan" }, value: "5,000" },
          { label: { en: "Top-ups", es: "Recargas" }, value: "1,200" },
          { label: { en: "Used this month", es: "Usados este mes" }, value: "-4,350" },
        ],
        total: { label: { en: "Credits left", es: "Créditos restantes" }, value: "1,850" },
        secondary: { en: "View usage", es: "Ver uso" },
        primary: { en: "Top up", es: "Recargar" },
      },
    }),
  ],
};
