import { definePattern, type PatternModule } from "../../model/types.js";
import { icon, inline, inlineText } from "../kit.js";

interface Content {
  states: { icon: string; label: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "icon-word-states",
  subject: "list",
  scale: "fragment",
  title: { en: "Icon and word states", es: "Estados con ícono y palabra" },
  layout: { en: "A row of states, each an icon beside its word.", es: "Una fila de estados, cada uno un ícono junto a su palabra." },
  fields: { states: { en: "Each state: icon name and word.", es: "Cada estado: nombre del ícono y palabra." } },
  notes: [{ en: "The word is always there: a state carried by colour or an icon alone is lost to a colour-blind reader and to a monochrome print.", es: "La palabra siempre está: un estado llevado solo por color o por un ícono se pierde para quien no distingue colores y en una impresión monocroma." }],
  build: ({ states }) => inline(states.map((state) => inline([icon(state.icon, "sm"), inlineText(state.label, { size: "sm" })], { gap: "xs", inlineAlign: "center", wrap: false })), { gap: "lg" }),
});

export const iconWordStates: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "task-states",
      intent: "status/progress/state-indicator",
      title: { en: "Status", es: "Estado" },
      purpose: { en: "Where an item stands, with an icon and a word so colour is not the only cue.", es: "Dónde está un elemento, con ícono y palabra para no depender del color." },
      content: { states: [{ icon: "check", label: { en: "Done", es: "Hecho" } }, { icon: "clock", label: { en: "In progress", es: "En curso" } }, { icon: "warning", label: { en: "Blocked", es: "Bloqueado" } }] },
    }),
  ],
};
