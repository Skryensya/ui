import { definePattern, type PatternModule } from "../../model/types.js";
import { surface, text, titleBlock } from "../kit.js";

interface Content {
  title: string;
  subtitle: string;
  /** The `value` of the entry that starts open. */
  open: string;
  entries: { value: string; question: string; answer: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "faq-accordion",
  subject: "list",
  scale: "component",
  title: { en: "Questions accordion", es: "Acordeón de preguntas" },
  layout: { en: "A title block over an Accordion where one entry is open at a time: the question is the trigger, the answer its panel.", es: "Un bloque de título sobre un Accordion donde una entrada está abierta a la vez: la pregunta es el disparador y la respuesta su panel." },
  fields: { title: { en: "What the questions are about.", es: "De qué tratan las preguntas." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, open: { en: "The `value` of the entry that starts open.", es: "El `value` de la entrada que empieza abierta." }, entries: { en: "Each entry: a stable `value`, the question and its answer.", es: "Cada entrada: un `value` estable, la pregunta y su respuesta." } },
  notes: [{ en: "One open at a time (`single`) keeps the card the same height from start to end; use `multiple` when people compare answers.", es: "Una abierta a la vez (`single`) mantiene la card con la misma altura; usa `multiple` cuando se comparan respuestas." }],
  build: ({ title, subtitle, open, entries }) =>
    surface([
      titleBlock(title, subtitle),
      {
        contract: "accordion",
        signature: "Accordion",
        options: { type: "single", defaultValue: open },
        children: entries.map((entry) => ({
          contract: "accordion",
          signature: "Accordion.Item",
          options: { value: entry.value },
          children: [
            { contract: "accordion", signature: "Accordion.Trigger", children: entry.question },
            { contract: "accordion", signature: "Accordion.Content", children: text(entry.answer, { size: "sm", tone: "secondary" }) },
          ],
        })),
      },
    ]),
});

export const faqAccordion: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "billing-faq",
      intent: "content/documentation/faq",
      title: { en: "Billing questions", es: "Preguntas de facturación" },
      purpose: { en: "The questions people ask before they pay, answered where they ask them.", es: "Las preguntas que la gente hace antes de pagar, respondidas donde las hace." },
      content: {
        title: { en: "Billing questions", es: "Preguntas de facturación" },
        subtitle: { en: "Quick answers about plans and payments", es: "Respuestas rápidas sobre planes y pagos" },
        open: "cancel",
        entries: [
          { value: "cancel", question: { en: "Can I cancel at any time?", es: "¿Puedo cancelar en cualquier momento?" }, answer: { en: "Yes. You keep access until the end of the period you already paid for, and nothing is charged after it.", es: "Sí. Conservas el acceso hasta el final del período que ya pagaste y no se cobra nada después." } },
          { value: "invoice", question: { en: "Where do I find my invoices?", es: "¿Dónde encuentro mis facturas?" }, answer: { en: "In Settings, under Billing. Each one can be downloaded as a PDF.", es: "En Ajustes, en Facturación. Cada una se puede descargar en PDF." } },
          { value: "change", question: { en: "What happens if I change plan?", es: "¿Qué pasa si cambio de plan?" }, answer: { en: "The new price applies from the next period, and any unused time is credited.", es: "El nuevo precio se aplica desde el siguiente período y el tiempo sin usar se abona." } },
        ],
      },
    }),
  ],
};
