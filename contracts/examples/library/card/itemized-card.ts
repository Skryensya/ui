import { definePattern, type PatternModule } from "../../model/types.js";
import { action, heading, inline, inlineText, list, separator, stack, surface, text } from "../kit.js";

interface Content {
  title: string;
  meta: string;
  linesLabel: string;
  lines: readonly { name: string; detail: string; amount: string }[];
  totalLabel: string;
  total: string;
  actionLabel: string;
}

const { pattern, use } = definePattern<Content>({
  id: "itemized-card",
  subject: "card",
  scale: "component",
  title: { en: "Itemized card", es: "Card de líneas con total" },
  layout: { en: "A title with a reference line, a list of named lines with a figure at the end of each, a separator, the total across from its label, and one action.", es: "Un título con una línea de referencia, una lista de líneas con nombre y una cifra al final de cada una, un separador, el total frente a su etiqueta y una acción." },
  fields: { title: { en: "What the lines add up to.", es: "A qué suman las líneas." }, meta: { en: "Reference, date or status, in one line.", es: "Referencia, fecha o estado, en una línea." }, linesLabel: { en: "The list's accessible name.", es: "El nombre accesible de la lista." }, lines: { en: "A name, a detail and a figure each.", es: "Nombre, detalle y cifra de cada línea." }, totalLabel: { en: "The word for the total.", es: "La palabra para el total." }, total: { en: "The total, formatted.", es: "El total, con formato." }, actionLabel: { en: "What to do with the whole.", es: "Qué hacer con el conjunto." } },
  notes: [
    { en: "The figures sit in the row's `trailing` slot as inline text, so they align on one edge and the list stays a list for assistive technology.", es: "Las cifras van en el slot `trailing` como texto en línea, así quedan en un mismo borde y la lista sigue siendo una lista para la tecnología de apoyo." },
    { en: "The total is outside the list: it is the sum of the rows, not another row. The unit is the content's: money, hours, points.", es: "El total queda fuera de la lista: es la suma de las filas, no otra fila. La unidad es del contenido: dinero, horas, puntos." },
  ],
  build: ({ title, meta, linesLabel, lines, totalLabel, total, actionLabel }) =>
    surface([
      stack([heading(title, "h5"), text(meta, { size: "caption", tone: "tertiary" })], { gap: "xs" }),
      list(linesLabel, lines.map((line) => ({ title: line.name, description: line.detail, trailing: inlineText(line.amount, { weight: "emphasis" }) }))),
      separator(),
      inline([text(totalLabel, { weight: "emphasis" }), heading(total, "h5")], { gap: "md", justify: "between", inlineAlign: "center" }),
      inline([action(actionLabel, { variant: "soft", tone: "accent", size: "sm" })], { justify: "end" }),
    ]),
});

export const itemizedCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "itemized-receipt", intent: "data/summaries/itemized-total", title: { en: "A paid receipt", es: "Un recibo pagado" }, purpose: { en: "Prove what was paid for a period, line by line.", es: "Probar qué se pagó por un periodo, línea por línea." }, content: { title: { en: "Receipt for October", es: "Recibo de octubre" }, meta: { en: "INV-2041 · Paid October 1", es: "INV-2041 · Pagado el 1 de octubre" }, linesLabel: { en: "Charges", es: "Cargos" }, lines: [{ name: "Team plan", detail: { en: "10 seats", es: "10 asientos" }, amount: "$90.00" }, { name: { en: "Extra storage", es: "Almacenamiento extra" }, detail: "100 GB", amount: "$12.00" }, { name: { en: "Tax", es: "Impuestos" }, detail: "8%", amount: "$8.16" }], totalLabel: { en: "Total paid", es: "Total pagado" }, total: "$110.16", actionLabel: { en: "Download PDF", es: "Descargar PDF" } } }),
  ],
};
