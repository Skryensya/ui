import { definePattern, type PatternModule } from "../../model/types.js";
import { action, badge, icon, inline, separator, surface, text, titleBlock, type Tone } from "../kit.js";

interface Content {
  status: string;
  statusTone: Tone;
  moreLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  details: { term: string; value: string }[];
  secondary: string;
  primary: string;
}

const { pattern, use } = definePattern<Content>({
  id: "status-detail-card",
  subject: "card",
  scale: "component",
  title: { en: "Status and details card", es: "Card de estado y detalles" },
  layout: { en: "A status badge and an overflow button on top, a title block, a description list of facts, a rule and a decision row.", es: "Una insignia de estado y un botón de más acciones arriba, un bloque de título, una lista de descripción con datos, una línea y una fila de decisión." },
  fields: { status: { en: "Where the item stands.", es: "En qué punto está el elemento." }, statusTone: { en: "The status's tone.", es: "El tono del estado." }, moreLabel: { en: "The overflow button's accessible name.", es: "El nombre accesible del botón de más acciones." }, eyebrow: { en: "A reference: an id, a number.", es: "Una referencia: un id, un número." }, title: { en: "What the item is.", es: "Qué es el elemento." }, subtitle: { en: "Where it came from.", es: "De dónde vino." }, details: { en: "Two to four facts: a term and its value.", es: "De dos a cuatro datos: un término y su valor." }, secondary: { en: "The way out.", es: "La salida." }, primary: { en: "The way forward.", es: "El camino adelante." } },
  notes: [{ en: "The facts are a DescriptionList, not a table or a stack of texts: term and value stay paired for assistive technology and align in columns.", es: "Los datos son una DescriptionList y no una tabla ni textos apilados: término y valor quedan emparejados para la tecnología asistiva y se alinean en columnas." }],
  build: ({ status, statusTone, moreLabel, eyebrow, title, subtitle, details, secondary, primary }) =>
    surface([
      inline([badge(status, statusTone), action(icon("more", "sm"), { variant: "ghost", size: "sm", iconOnly: true }, { "aria-label": moreLabel })], { gap: "sm", justify: "between", inlineAlign: "center" }),
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [text(eyebrow, { textRole: "eyebrow" }), titleBlock(title, subtitle)],
      },
      {
        contract: "description-list",
        signature: "DescriptionList",
        options: { layout: "columns", density: "compact" },
        children: details.map((detail) => ({ contract: "description-list", signature: "DescriptionItem", slots: { term: detail.term }, children: detail.value })),
      },
      separator(),
      inline([action(secondary, { variant: "ghost", size: "sm" }), action(primary, { variant: "soft", tone: "accent", size: "sm" })], { gap: "sm", justify: "end" }),
    ]),
});

export const statusDetailCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "task-invoice-review",
      intent: "collaboration/work/task",
      title: { en: "Task", es: "Tarea" },
      purpose: { en: "An item with a status, details and the actions it allows.", es: "Un elemento con estado, detalles y las acciones que admite." },
      content: { status: { en: "In review", es: "En revisión" }, statusTone: "warning", moreLabel: { en: "More actions", es: "Más acciones" }, eyebrow: "INV-2041", title: { en: "Review the October invoice", es: "Revisar la factura de octubre" }, subtitle: { en: "Sent by the purchasing team", es: "Enviada por el equipo de compras" }, details: [{ term: { en: "Owner", es: "Responsable" }, value: "Marta Ruiz" }, { term: { en: "Due", es: "Vence" }, value: { en: "October 14", es: "14 de octubre" } }, { term: { en: "Amount", es: "Monto" }, value: { en: "$1,240", es: "1.240 US$" } }], secondary: { en: "Decline", es: "Rechazar" }, primary: { en: "Approve", es: "Aprobar" } },
    }),
  ],
};
