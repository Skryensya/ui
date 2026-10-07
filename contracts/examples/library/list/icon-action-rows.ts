import { definePattern, type PatternModule } from "../../model/types.js";
import { action, icon, list } from "../kit.js";

interface Content {
  label: string;
  rows: { icon: string; title: string; meta: string; actionLabel: string; actionIcon: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "icon-action-rows",
  subject: "list",
  scale: "component",
  title: { en: "Icon rows with an action", es: "Filas con ícono y acción" },
  layout: { en: "Rows with a leading icon, a name over a line of detail, and one icon-only action at the end.", es: "Filas con un ícono al inicio, un nombre sobre una línea de detalle y una acción solo de ícono al final." },
  fields: { label: { en: "The list's accessible name.", es: "El nombre accesible de la lista." }, rows: { en: "Each row: icon, name, detail, and the action's accessible name and icon.", es: "Cada fila: ícono, nombre, detalle, y el nombre accesible y el ícono de la acción." } },
  notes: [{ en: "The action is icon-only, so its accessible name carries the row's name: a list of eight 'Download' buttons is unusable by ear.", es: "La acción es solo de ícono, así que su nombre accesible lleva el nombre de la fila: una lista de ocho botones 'Descargar' es inusable al oído." }],
  build: ({ label, rows }) => list(label, rows.map((row) => ({ leading: icon(row.icon), title: row.title, description: row.meta, trailing: action(icon(row.actionIcon, "sm"), { variant: "ghost", size: "sm", iconOnly: true }, { "aria-label": row.actionLabel }) }))),
});

export const iconActionRows: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "files-recent",
      intent: "collaboration/files/file-list",
      title: { en: "Files", es: "Archivos" },
      purpose: { en: "Documents with their size and one direct action per row.", es: "Documentos con su tamaño y una acción directa por fila." },
      content: {
        label: { en: "Files", es: "Archivos" },
        rows: [
          { icon: "file", title: "informe-anual.pdf", meta: { en: "2.4 MB · edited yesterday", es: "2,4 MB · editado ayer" }, actionLabel: { en: "Download informe-anual.pdf", es: "Descargar informe-anual.pdf" }, actionIcon: "download" },
          { icon: "file", title: "presupuesto-2026.xlsx", meta: { en: "860 KB · edited 3 days ago", es: "860 KB · editado hace 3 días" }, actionLabel: { en: "Download presupuesto-2026.xlsx", es: "Descargar presupuesto-2026.xlsx" }, actionIcon: "download" },
          { icon: "file", title: "presentacion-ventas.key", meta: { en: "12 MB · edited last week", es: "12 MB · editado la semana pasada" }, actionLabel: { en: "Download presentacion-ventas.key", es: "Descargar presentacion-ventas.key" }, actionIcon: "download" },
        ],
      },
    }),
  ],
};
