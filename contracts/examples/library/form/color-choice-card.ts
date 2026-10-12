import { definePattern, type PatternModule } from "../../model/types.js";
import { action, inline, surface, text, titleBlock } from "../kit.js";

interface Content {
  title: string;
  subtitle: string;
  label: string;
  triggerLabel: string;
  /** The colour that starts chosen, `#rrggbb`. */
  value: string;
  /** The colours offered at a click, `#rrggbb` separated by spaces. */
  swatches: string;
  /** What the colour will colour, in a line. */
  note: string;
  submit: string;
}

const { pattern, use } = definePattern<Content>({
  id: "color-choice-card",
  subject: "form",
  scale: "component",
  title: { en: "Colour choice card", es: "Card de elección de color" },
  layout: { en: "A title block, a ColorPicker with a few ready swatches, a note on what the colour changes and one action to apply it.", es: "Un bloque de título, un ColorPicker con unas muestras listas, una nota sobre qué cambia el color y una acción para aplicarlo." },
  fields: { title: { en: "What is being coloured.", es: "Qué se colorea." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, label: { en: "The field's name.", es: "El nombre del campo." }, triggerLabel: { en: "The button's accessible name.", es: "El nombre accesible del botón." }, value: { en: "The colour that starts chosen.", es: "El color que empieza elegido." }, swatches: { en: "Four to eight ready colours.", es: "De cuatro a ocho colores listos." }, note: { en: "What the colour changes.", es: "Qué cambia el color." }, submit: { en: "The way forward.", es: "El camino adelante." } },
  notes: [{ en: "Offer the colours the job allows: a handful of swatches beat a free picker when only a few combinations keep text legible.", es: "Ofrece los colores que la tarea admite: unas pocas muestras valen más que un selector libre cuando solo pocas combinaciones mantienen legible el texto." }],
  build: ({ title, subtitle, label, triggerLabel, value, swatches, note, submit }, ctx) =>
    surface([
      titleBlock(title, subtitle),
      { contract: "color-picker", signature: "ColorPicker", options: { name: `${ctx.ns}-color`, triggerLabel, value, swatches }, slots: { label } },
      text(note, { size: "sm", tone: "secondary" }),
      inline([action(submit, { variant: "soft", tone: "accent", size: "sm" })], { gap: "sm", justify: "end" }),
    ]),
});

export const colorChoiceCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "color-choice-brand",
      intent: "input/preferences/brand-color",
      title: { en: "Brand colour", es: "Color de marca" },
      purpose: { en: "Set the colour a whole product takes its accents from.", es: "Fijar el color de donde un producto entero toma sus acentos." },
      content: { title: { en: "Your brand colour", es: "El color de tu marca" }, subtitle: { en: "Buttons and links will follow it", es: "Los botones y los enlaces lo seguirán" }, label: { en: "Brand colour", es: "Color de marca" }, triggerLabel: { en: "Choose a colour", es: "Elegir un color" }, value: "#3366ff", swatches: "#3366ff #22c55e #f59e0b #ef4444 #111827 #8b5cf6", note: { en: "Text on top of it stays readable in light and dark.", es: "El texto encima se mantiene legible en claro y oscuro." }, submit: { en: "Apply to the site", es: "Aplicar al sitio" } },
    }),
    use({
      id: "color-choice-avatar",
      intent: "input/preferences/avatar-color",
      title: { en: "Avatar colour", es: "Color de avatar" },
      purpose: { en: "Choose the background an initials avatar takes when there is no photo.", es: "Elegir el fondo que toma un avatar de iniciales cuando no hay foto." },
      content: { title: { en: "Your avatar", es: "Tu avatar" }, subtitle: { en: "Shown when you have no photo", es: "Se muestra cuando no tienes foto" }, label: { en: "Background", es: "Fondo" }, triggerLabel: { en: "Choose a colour", es: "Elegir un color" }, value: "#8b5cf6", swatches: "#8b5cf6 #3366ff #0ea5e9 #22c55e #f59e0b #ef4444", note: { en: "The initials turn white or black to match.", es: "Las iniciales pasan a blanco o negro según el fondo." }, submit: { en: "Save", es: "Guardar" } },
    }),
  ],
};
