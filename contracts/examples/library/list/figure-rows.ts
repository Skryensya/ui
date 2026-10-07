import { definePattern, type PatternModule } from "../../model/types.js";
import { badge, icon, inlineText, list } from "../kit.js";

interface Content {
  label: string;
  rows: { direction: "up" | "down"; title: string; meta: string; amount: string; change: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "figure-rows",
  subject: "list",
  scale: "component",
  title: { en: "Rows with a figure", es: "Filas con una cifra" },
  layout: { en: "Rows with a direction arrow, a name over a line of detail, and at the end a figure with its change as a chip.", es: "Filas con una flecha de dirección, un nombre sobre una línea de detalle y, al final, una cifra con su variación como chip." },
  fields: { label: { en: "The list's accessible name.", es: "El nombre accesible de la lista." }, rows: { en: "Each row: direction, name, detail, amount and change.", es: "Cada fila: dirección, nombre, detalle, monto y variación." } },
  notes: [{ en: "The figure and the chip are loose nodes in the trailing slot: the slot wraps them under each other on a narrow card, right-aligned, instead of crushing the name.", es: "La cifra y el chip son nodos sueltos en el slot trailing: el slot los apila uno bajo otro en una card angosta, alineados a la derecha, en vez de aplastar el nombre." }],
  build: ({ label, rows }) =>
    list(
      label,
      rows.map((row) => ({
        leading: icon(row.direction === "up" ? "arrow-up" : "arrow-down"),
        title: row.title,
        description: row.meta,
        trailing: [inlineText(row.amount, { size: "sm", weight: "label" }), badge(row.change, row.direction === "up" ? "success" : "danger", "sm")],
      })),
    ),
});

export const figureRows: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "holdings-portfolio",
      intent: "metrics/money/holdings",
      title: { en: "Holdings", es: "Cartera" },
      purpose: { en: "One figure per row, with its change at the end.", es: "Una cifra por fila, con su variación al final." },
      content: {
        label: { en: "Holdings", es: "Cartera" },
        rows: [
          { direction: "up", title: { en: "Global fund", es: "Fondo global" }, meta: { en: "450 shares", es: "450 participaciones" }, amount: { en: "$12,480.50", es: "12.480,50 US$" }, change: "+2.1%" },
          { direction: "up", title: { en: "Short-term bonds", es: "Bonos a corto plazo" }, meta: { en: "112 shares", es: "112 participaciones" }, amount: { en: "$5,340", es: "5.340 US$" }, change: "+0.4%" },
          { direction: "down", title: { en: "Emerging markets", es: "Mercados emergentes" }, meta: { en: "85 shares", es: "85 participaciones" }, amount: { en: "$3,120.75", es: "3.120,75 US$" }, change: "-1.3%" },
        ],
      },
    }),
  ],
};
