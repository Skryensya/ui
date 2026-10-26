import { definePattern, type PatternModule } from "../../model/types.js";
import { inline, surface, titleBlock } from "../kit.js";

interface Content {
  title: string;
  subtitle: string;
  /** The default action: what a click on the main half does. */
  action: string;
  /** The names of the alternatives the other half opens. */
  alternatives: { value: string; label: string }[];
  /** The menu trigger's accessible name. */
  more: string;
  variant: "solid" | "soft";
  tone?: "accent";
}

const { pattern, use } = definePattern<Content>({
  id: "split-action-card",
  subject: "action",
  scale: "component",
  title: { en: "Split action card", es: "Card con acción dividida" },
  layout: { en: "A title block over one split ButtonGroup at the end: the main half runs the default, the other half opens the alternatives.", es: "Un bloque de título sobre un ButtonGroup dividido al final: la mitad principal ejecuta lo habitual y la otra abre las alternativas." },
  fields: { title: { en: "What the action is about.", es: "De qué trata la acción." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, action: { en: "The default action's label.", es: "La etiqueta de la acción habitual." }, alternatives: { en: "Two or three variants of the default: a stable `value` and a label.", es: "Dos o tres variantes de lo habitual: un `value` estable y una etiqueta." }, more: { en: "The accessible name of the menu half.", es: "El nombre accesible de la mitad del menú." }, variant: { en: "`solid` for the page's one main action, `soft` for a quieter one.", es: "`solid` para la acción principal de la página, `soft` para una más discreta." }, tone: { en: "`accent` when the action is the point of the card.", es: "`accent` cuando la acción es el centro de la card." } },
  notes: [{ en: "The alternatives are variants of the default, not other jobs: if they do something different, they are separate buttons.", es: "Las alternativas son variantes de lo habitual, no otras tareas: si hacen algo distinto, son botones separados." }],
  build: ({ title, subtitle, action, alternatives, more, variant, tone }) =>
    surface([
      titleBlock(title, subtitle),
      inline(
        [
          {
            contract: "button-group",
            signature: "ButtonGroup",
            children: [
              { contract: "button", signature: "Button.action", options: { variant, size: "md", ...(tone ? { tone } : {}) }, slots: { children: action } },
              {
                contract: "menu",
                signature: "Menu",
                options: { label: more, triggerLabel: more, triggerVariant: variant, triggerSize: "md", triggerIconOnly: true, ...(tone ? { triggerTone: tone } : {}) },
                slots: { items: alternatives.map((entry) => ({ options: { value: entry.value }, slots: { label: entry.label } })) },
              },
            ],
          },
        ],
        { gap: "sm", justify: "end" },
      ),
    ]),
});

export const splitActionCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "split-card-save",
      intent: "actions/buttons/save-variants",
      title: { en: "Save and save as", es: "Guardar y guardar como" },
      purpose: { en: "Save in the usual way, with the other ways to save one step away.", es: "Guardar de la forma habitual, con las otras formas de guardar a un paso." },
      content: { title: { en: "Quarterly report", es: "Informe trimestral" }, subtitle: { en: "Edited 4 minutes ago", es: "Editado hace 4 minutos" }, action: { en: "Save", es: "Guardar" }, alternatives: [{ value: "copy", label: { en: "Save a copy", es: "Guardar una copia" } }, { value: "template", label: { en: "Save as template", es: "Guardar como plantilla" } }], more: { en: "More ways to save", es: "Más formas de guardar" }, variant: "solid" },
    }),
    use({
      id: "split-card-send",
      intent: "actions/buttons/send-variants",
      title: { en: "Send or schedule", es: "Enviar o programar" },
      purpose: { en: "Send now, or choose another moment, without a second screen.", es: "Enviar ahora, o elegir otro momento, sin una segunda pantalla." },
      content: { title: { en: "October newsletter", es: "Boletín de octubre" }, subtitle: { en: "To 2,431 subscribers", es: "A 2.431 suscriptores" }, action: { en: "Send now", es: "Enviar ahora" }, alternatives: [{ value: "schedule", label: { en: "Schedule for later", es: "Programar para más tarde" } }, { value: "test", label: { en: "Send a test", es: "Enviar una prueba" } }], more: { en: "More ways to send", es: "Más formas de enviar" }, variant: "solid", tone: "accent" },
    }),
  ],
};
