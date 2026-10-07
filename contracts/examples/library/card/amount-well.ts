import { definePattern, type PatternModule } from "../../model/types.js";
import { box, inline, separator, stack, text } from "../kit.js";

interface Amount {
  label: string;
  value: string;
}
interface Content {
  rows: Amount[];
  total: Amount;
}

const row = ({ label, value }: Amount, strong = false) =>
  inline([text(label, { size: "sm", tone: "secondary" }), text(value, { size: "sm", weight: strong ? "emphasis" : "label" })], { gap: "sm", justify: "between", inlineAlign: "baseline" });

const { pattern, use } = definePattern<Content>({
  id: "amount-well",
  subject: "card",
  scale: "fragment",
  title: { en: "Amount well", es: "Pozo de montos" },
  layout: { en: "In a sunken box: rows with the label at the start and the figure at the end, a rule, and the total in a heavier weight.", es: "En una caja hundida: filas con la etiqueta al inicio y la cifra al final, una línea, y el total con más peso." },
  fields: { rows: { en: "The lines that add up: label and formatted amount.", es: "Las líneas que suman: etiqueta y monto con formato." }, total: { en: "The sum, with its label.", es: "La suma, con su etiqueta." } },
  notes: [{ en: "Amounts arrive formatted: the pattern does no arithmetic and no locale formatting, so a use decides currency and separators.", es: "Los montos llegan con formato: el patrón no calcula ni formatea por idioma, así que cada uso decide moneda y separadores." }],
  build: ({ rows, total }) => box([stack([...rows.map((entry) => row(entry)), separator(), row(total, true)], { gap: "sm" })], { surface: "sunken", padding: "md" }),
});

export const amountWell: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "royalties-breakdown",
      intent: "metrics/money/breakdown",
      title: { en: "Breakdown", es: "Desglose" },
      purpose: { en: "Rows of amounts that add up to a total, in a sunken well.", es: "Filas de montos que suman un total, en un pozo hundido." },
      content: {
        rows: [
          { label: { en: "Net royalties", es: "Regalías netas" }, value: { en: "$1,248.75", es: "1.248,75 US$" } },
          { label: { en: "Processing fee", es: "Comisión" }, value: { en: "-$37.46", es: "-37,46 US$" } },
        ],
        total: { label: { en: "Total to claim", es: "Total a cobrar" }, value: { en: "$1,211.29", es: "1.211,29 US$" } },
      },
    }),
  ],
};
