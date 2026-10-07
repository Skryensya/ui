import { definePattern, type PatternModule } from "../../model/types.js";
import { icon } from "../kit.js";

interface Content {
  title: string;
  /** What is lost, and that it cannot be undone. */
  body: string;
  action: string;
}

const { pattern, use } = definePattern<Content>({
  id: "danger-callout",
  subject: "form",
  scale: "component",
  title: { en: "Danger callout", es: "Callout de peligro" },
  layout: { en: "A danger Callout: a warning icon, a title, what is lost, and a soft danger action.", es: "Un Callout de peligro: un ícono de advertencia, un título, qué se pierde y una acción suave de peligro." },
  fields: { title: { en: "The action's name.", es: "El nombre de la acción." }, body: { en: "What is lost and that it cannot be undone.", es: "Qué se pierde y que no se puede deshacer." }, action: { en: "The destructive action.", es: "La acción destructiva." } },
  notes: [{ en: "Outside the form's card, so it cannot be mistaken for one more field. The action is soft, not solid: the solid danger button belongs to the confirmation dialog it opens.", es: "Fuera de la card del formulario, para no confundirla con un campo más. La acción es suave y no sólida: el botón de peligro sólido pertenece al diálogo de confirmación que abre." }],
  build: ({ title, body, action }) => ({
    contract: "callout",
    signature: "Callout",
    options: { tone: "danger" },
    slots: { icon: icon("warning"), title, children: body, actions: { contract: "button", signature: "Button.action", options: { tone: "danger", variant: "soft", size: "sm" }, children: action } },
  }),
});

export const dangerCallout: PatternModule<Content> = {
  pattern,
  uses: [use({ id: "danger-delete-account", intent: "decision/destructive/danger-zone", title: { en: "Danger zone", es: "Zona de peligro" }, purpose: { en: "An action that cannot be undone, set apart and explained.", es: "Una acción que no se puede deshacer, aparte y explicada." }, content: { title: { en: "Delete the account", es: "Eliminar la cuenta" }, body: { en: "Your projects and files are erased. This cannot be undone.", es: "Se borran tus proyectos y archivos. No se puede deshacer." }, action: { en: "Delete account", es: "Eliminar cuenta" } } })],
};
