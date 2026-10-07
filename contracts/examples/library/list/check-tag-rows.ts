import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  rows: { title: string; tag: string; done?: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "check-tag-rows",
  subject: "list",
  scale: "component",
  title: { en: "Checkable rows with a tag", es: "Filas marcables con etiqueta" },
  layout: { en: "Rows with a checkbox whose label is the item, and a tag that keeps the end of the row at its own width.", es: "Filas con un checkbox cuya etiqueta es el elemento, y una etiqueta que conserva el final de la fila con su propio ancho." },
  fields: { label: { en: "The list's accessible name.", es: "El nombre accesible de la lista." }, rows: { en: "Each row: the item, its category and whether it starts done.", es: "Cada fila: el elemento, su categoría y si empieza hecho." } },
  notes: [{ en: "The checkbox is `fill` and the tag is `fit`: the item's words wrap inside the label while the tag never shrinks. The checkbox's own label is the task, so clicking the words ticks it.", es: "El checkbox es `fill` y la etiqueta `fit`: las palabras del elemento se parten dentro del label y la etiqueta nunca se encoge. El label del checkbox es la tarea, así que hacer clic en las palabras lo marca." }],
  build: ({ label, rows }, ctx) => ({
    contract: "list",
    signature: "List",
    options: { dividers: true },
    attrs: { "aria-label": label },
    children: rows.map((row, index) => ({
      contract: "list",
      signature: "ListItemPlain",
      children: {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", justify: "between", inlineAlign: "center", wrap: false },
        children: [
          { contract: "checkbox", signature: "Checkbox", options: { name: ctx.ns, value: String(index), defaultChecked: Boolean(row.done) }, attrs: { "data-sizing": "fill" }, children: row.title },
          { contract: "tag", signature: "Tag", attrs: { "data-sizing": "fit" }, children: row.tag },
        ],
      },
    })),
  }),
});

const docs = { en: "Docs", es: "Documentación" };
const web = { en: "Web", es: "Web" };
const support = { en: "Support", es: "Soporte" };
const legal = { en: "Legal", es: "Legal" };
const monthly = { title: { en: "Prepare the monthly report", es: "Preparar el informe mensual" }, tag: docs, done: true };
const pricing = { title: { en: "Update the pricing page", es: "Actualizar la página de precios" }, tag: web };
const answer = { title: { en: "Answer support", es: "Responder a soporte" }, tag: support };
const contract = { title: { en: "Review the supplier contract", es: "Revisar el contrato del proveedor" }, tag: legal };
const label = { en: "Tasks", es: "Tareas" };

export const checkTagRows: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "tasks-all", intent: "collaboration/work/checklist", title: { en: "Tasks", es: "Tareas" }, purpose: { en: "Items to tick off as done, with their category.", es: "Elementos que se marcan como hechos, con su categoría." }, content: { label, rows: [monthly, pricing, answer, contract] } }),
    use({ id: "tasks-today", intent: "collaboration/work/checklist", title: { en: "Tasks due today", es: "Tareas para hoy" }, purpose: { en: "The checklist of what is due today.", es: "La lista de lo que vence hoy." }, catalog: false, content: { label, rows: [monthly, pricing] } }),
    use({ id: "tasks-week", intent: "collaboration/work/checklist", title: { en: "Tasks due this week", es: "Tareas de esta semana" }, purpose: { en: "The checklist of what is due this week.", es: "La lista de lo que vence esta semana." }, catalog: false, content: { label, rows: [answer, contract] } }),
  ],
};
