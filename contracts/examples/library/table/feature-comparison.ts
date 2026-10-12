import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  aspect: string;
  columns: string[];
  rows: { label: string; cells: string[] }[];
}

const { pattern, use } = definePattern<Content>({
  id: "feature-comparison",
  subject: "table",
  scale: "component",
  title: { en: "Feature comparison", es: "Comparación de características" },
  layout: { en: "A ComparisonTable: a column per option, a row per aspect, the aspect name as the row header.", es: "Una ComparisonTable: una columna por opción, una fila por aspecto, el nombre del aspecto como encabezado de fila." },
  fields: { aspect: { en: "What the first column holds, for assistive technology.", es: "Qué contiene la primera columna, para la tecnología asistiva." }, columns: { en: "The options being compared.", es: "Las opciones que se comparan." }, rows: { en: "One row per aspect: its name, then one cell per column, in order.", es: "Una fila por aspecto: su nombre y una celda por columna, en orden." } },
  notes: [
    { en: "Every cell says the same kind of thing (a number, a yes, a short phrase): a comparison is read across a row, so a row that mixes kinds cannot be compared.", es: "Cada celda dice el mismo tipo de cosa (un número, un sí, una frase corta): una comparación se lee a lo largo de una fila, así que una fila que mezcla tipos no se puede comparar." },
    { en: "Use it for two to four options; past that, filter first or compare in pairs.", es: "Úsala para dos a cuatro opciones; más allá, filtra primero o compara de a pares." },
  ],
  build: ({ aspect, columns, rows }) => ({
    contract: "comparison-table",
    signature: "ComparisonTable",
    options: { aspectLabel: aspect },
    slots: { columns: columns.map((column) => ({ contract: "comparison-table", signature: "ComparisonColumn", children: column })) },
    children: rows.map((row) => ({
      contract: "comparison-table",
      signature: "ComparisonRow",
      slots: { label: row.label, children: row.cells.map((cell) => ({ contract: "comparison-table", signature: "ComparisonCell", children: cell })) },
    })),
  }),
});

export const featureComparison: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "comparison-plans",
      intent: "data/collections/feature-comparison",
      title: { en: "Two plans", es: "Dos planes" },
      purpose: { en: "Put two plans side by side so the difference between them is the only thing left to read.", es: "Poner dos planes lado a lado para que la diferencia entre ellos sea lo único que quede por leer." },
      content: {
        aspect: { en: "Feature", es: "Característica" },
        columns: [{ en: "Basic plan", es: "Plan básico" }, { en: "Full plan", es: "Plan completo" }],
        rows: [
          { label: { en: "Users", es: "Usuarios" }, cells: [{ en: "Up to 3", es: "Hasta 3" }, { en: "Unlimited", es: "Sin límite" }] },
          { label: { en: "Support", es: "Soporte" }, cells: [{ en: "By email", es: "Por correo" }, { en: "By phone, 24/7", es: "Por teléfono, 24/7" }] },
          { label: { en: "History", es: "Historial" }, cells: [{ en: "30 days", es: "30 días" }, { en: "Unlimited", es: "Sin límite" }] },
        ],
      },
    }),
  ],
};
