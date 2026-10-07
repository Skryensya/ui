import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline } from "../kit.js";

interface Content {
  /** The quiet way out. Comes first. */
  secondary: string;
  /** The action that moves things forward. Comes last, and is the only accented one. */
  primary: string;
}

const { pattern, use } = definePattern<Content>({
  id: "decision-row",
  subject: "card",
  scale: "fragment",
  title: { en: "Decision row", es: "Fila de decisión" },
  layout: { en: "Two actions at the end of a row: a ghost one, then a soft accent one.", es: "Dos acciones al final de una fila: una fantasma y luego una suave con acento." },
  fields: { secondary: { en: "The way out.", es: "La salida." }, primary: { en: "The way forward.", es: "El camino adelante." } },
  notes: [{ en: "One accent per row. Both are small: the decision belongs to the card, it does not shout over it.", es: "Un solo acento por fila. Ambos son pequeños: la decisión pertenece a la card, no grita sobre ella." }],
  build: ({ secondary, primary }) => inline([action(secondary, { variant: "ghost", size: "sm" }), action(primary, { variant: "soft", tone: "accent", size: "sm" })], { gap: "sm", justify: "end" }),
});

export const decisionRow: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "approve-decline",
      intent: "decision/confirmation/decision-row",
      title: { en: "Actions", es: "Acciones" },
      purpose: { en: "The row that closes a card asking for a decision.", es: "La fila con la que cierra una card que pide una decisión." },
      content: { secondary: { en: "Decline", es: "Rechazar" }, primary: { en: "Approve", es: "Aprobar" } },
    }),
  ],
};
