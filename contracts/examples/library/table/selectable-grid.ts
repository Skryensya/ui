import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  rows: string[][];
}

const { pattern, use } = definePattern<Content>({
  id: "selectable-grid",
  subject: "table",
  scale: "component",
  title: { en: "Navigable grid", es: "Cuadrícula navegable" },
  layout: { en: "A DataGrid of rows and cells of the same kind, moved through in two dimensions with the arrow keys.", es: "Una DataGrid de filas y celdas del mismo tipo, recorridas en dos dimensiones con las flechas." },
  fields: { label: { en: "What the grid holds: it names it.", es: "Qué contiene la cuadrícula: la nombra." }, rows: { en: "The rows, each a list of cell texts.", es: "Las filas, cada una una lista de textos de celda." } },
  notes: [
    { en: "A grid is one stop in the tab order and the arrows move inside it: the reader crosses a screenful of cells without tabbing through each.", es: "Una cuadrícula es una sola parada en el orden de tabulación y las flechas se mueven dentro: quien lee cruza una pantalla de celdas sin tabular por cada una." },
    { en: "Use it when every cell is a peer (time slots, seats, emoji); a table with headers and relationships is a Table.", es: "Úsala cuando todas las celdas son pares (horarios, asientos, emojis); una tabla con encabezados y relaciones es una Table." },
  ],
  build: ({ label, rows }) => ({
    contract: "data-grid",
    signature: "DataGrid",
    options: { label },
    children: rows.map((row) => ({ contract: "data-grid", signature: "DataGridRow", children: row.map((cell) => ({ contract: "data-grid", signature: "DataGridCell", children: cell })) })),
  }),
});

export const selectableGrid: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "grid-time-slots", intent: "data/collections/peer-grid", title: { en: "Time slots", es: "Horarios" }, purpose: { en: "Let someone move across a set of equal choices in two directions and pick one.", es: "Dejar que alguien se mueva por un conjunto de opciones iguales en dos direcciones y elija una." }, content: { label: { en: "Available times", es: "Horarios disponibles" }, rows: [["09:00", "09:30", "10:00"], ["10:30", "11:00", "11:30"]] } }),
  ],
};
