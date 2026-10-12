import type { UsageTree } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Entry {
  label: string;
  size: string;
  open?: boolean;
  children?: Entry[];
}
interface Content {
  label: string;
  nameHeader: string;
  sizeHeader: string;
  entries: Entry[];
}

/** Flattens the visible rows, computing each row's level, its place among its siblings and the size of that set. */
const rows = (entries: Entry[], level = 1, prefix = ""): UsageTree[] =>
  entries.flatMap((entry, index) => {
    const value = `${prefix}${index}`;
    const branch = Boolean(entry.children?.length);
    const row: UsageTree = {
      contract: "treegrid",
      signature: "TreegridRow",
      options: { level, setSize: entries.length, posInset: index + 1, value, ...(branch ? { expanded: Boolean(entry.open) } : {}) },
      children: [
        { contract: "treegrid", signature: "TreegridCell", children: entry.label },
        { contract: "treegrid", signature: "TreegridCell", children: entry.size },
      ],
    };
    return branch && entry.open ? [row, ...rows(entry.children!, level + 1, `${value}-`)] : [row];
  });

const { pattern, use } = definePattern<Content>({
  id: "file-explorer-grid",
  subject: "table",
  scale: "component",
  title: { en: "Tree with columns", es: "Árbol con columnas" },
  layout: { en: "A Treegrid: rows nested under branches that open and close, each row with a name and a size in columns.", es: "Un Treegrid: filas anidadas bajo ramas que se abren y se cierran, cada fila con un nombre y un tamaño en columnas." },
  fields: { label: { en: "What the grid lists: it names it.", es: "Qué lista la cuadrícula: la nombra." }, nameHeader: { en: "The first column's header.", es: "El encabezado de la primera columna." }, sizeHeader: { en: "The second column's header.", es: "El encabezado de la segunda columna." }, entries: { en: "The entries: a name, a size, whether a branch starts open, and its children.", es: "Las entradas: un nombre, un tamaño, si una rama empieza abierta y sus hijos." } },
  notes: [
    { en: "Only the visible rows are written, and each knows its level, its place among its siblings and how many there are: that is what lets a screen reader say `level 2, 1 of 1`.", es: "Solo se escriben las filas visibles, y cada una conoce su nivel, su lugar entre sus hermanas y cuántas hay: eso permite que un lector de pantalla diga `nivel 2, 1 de 1`." },
    { en: "Use it when a hierarchy also has columns to compare; a hierarchy of names alone is a TreeView, and flat columns are a Table.", es: "Úsalo cuando una jerarquía además tiene columnas que comparar; una jerarquía de solo nombres es un TreeView, y columnas planas son una Table." },
  ],
  build: ({ label, nameHeader, sizeHeader, entries }) => ({
    contract: "treegrid",
    signature: "TreegridScroll",
    children: {
      contract: "treegrid",
      signature: "Treegrid",
      options: { label },
      children: [
        { contract: "treegrid", signature: "TreegridHead", children: { contract: "treegrid", signature: "TreegridHeadRow", children: [{ contract: "treegrid", signature: "TreegridColumnHeader", children: nameHeader }, { contract: "treegrid", signature: "TreegridColumnHeader", children: sizeHeader }] } },
        { contract: "treegrid", signature: "TreegridBody", children: rows(entries) },
      ],
    },
  }),
});

export const fileExplorerGrid: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "treegrid-documents",
      intent: "collaboration/files/file-explorer",
      title: { en: "Documents and sizes", es: "Documentos y tamaños" },
      purpose: { en: "Browse nested folders while comparing the size of what is inside them.", es: "Recorrer carpetas anidadas mientras se compara el tamaño de lo que hay dentro." },
      content: {
        label: { en: "Files", es: "Archivos" },
        nameHeader: { en: "Name", es: "Nombre" },
        sizeHeader: { en: "Size", es: "Tamaño" },
        entries: [
          { label: { en: "Documents", es: "Documentos" }, size: "-", open: true, children: [{ label: { en: "report.pdf", es: "informe.pdf" }, size: "2.1 MB" }, { label: { en: "budget.xlsx", es: "presupuesto.xlsx" }, size: "480 KB" }] },
          { label: { en: "Photos", es: "Fotos" }, size: "-", children: [{ label: "trip.jpg", size: "3.4 MB" }] },
        ],
      },
    }),
  ],
};
