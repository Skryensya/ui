import { definePattern, type PatternModule } from "../../model/types.js";
import { icon, navAction } from "../kit.js";

interface Content {
  tone: "neutral" | "info" | "success" | "warning";
  icon: string;
  title: string;
  body: string;
  action: string;
}

const { pattern, use } = definePattern<Content>({
  id: "inline-notice",
  subject: "feedback",
  scale: "component",
  title: { en: "Inline notice", es: "Aviso en línea" },
  layout: { en: "A Callout with an icon, a title, one line of detail and one soft link to the next step.", es: "Un Callout con ícono, título, una línea de detalle y un enlace suave al siguiente paso." },
  fields: { tone: { en: "How serious the notice is: it only paints, it never interrupts.", es: "Qué tan serio es el aviso: solo pinta, nunca interrumpe." }, icon: { en: "The icon that matches the tone.", es: "El ícono que corresponde al tono." }, title: { en: "What the notice is about.", es: "De qué trata el aviso." }, body: { en: "What changes and when.", es: "Qué cambia y cuándo." }, action: { en: "Where to read more or act, as a verb.", es: "Dónde leer más o actuar, como verbo." } },
  notes: [
    { en: "The tone stops at `warning`: `danger` is an alert that interrupts, and it has its own pattern, the error with a retry.", es: "El tono llega hasta `warning`: `danger` es una alerta que interrumpe, y tiene su propio patrón, el error con reintento." },
    { en: "The action is a link, not a button: a notice leads somewhere, it does not run anything.", es: "La acción es un enlace y no un botón: un aviso lleva a algún lado, no ejecuta nada." },
  ],
  build: ({ tone, icon: name, title, body, action }) => ({
    contract: "callout",
    signature: "Callout",
    options: { tone },
    slots: { icon: icon(name), title, actions: [navAction(action, "#", { variant: "soft", size: "sm" })] },
    children: body,
  }),
});

export const inlineNotice: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "notice-plan-change", intent: "status/notices/inline-notice", title: { en: "Plan change", es: "Cambio de plan" }, purpose: { en: "Tell the reader something about their account will change, and where to read the details.", es: "Avisar que algo de la cuenta va a cambiar, y dónde leer el detalle." }, content: { tone: "info", icon: "info", title: { en: "Your plan changes on November 1", es: "Tu plan cambia el 1 de noviembre" }, body: { en: "Team moves to per-seat pricing. Your current price holds until then.", es: "Team pasa a precio por asiento. Tu precio actual se mantiene hasta entonces." }, action: { en: "See what changes", es: "Ver qué cambia" } } }),
    use({ id: "notice-maintenance", intent: "status/notices/inline-notice", title: { en: "Scheduled maintenance", es: "Mantenimiento programado" }, purpose: { en: "Warn about a window in which the service will be limited, before it happens.", es: "Advertir de una ventana con el servicio limitado, antes de que ocurra." }, content: { tone: "warning", icon: "warning", title: { en: "Exports pause on Saturday", es: "Las exportaciones se pausan el sábado" }, body: { en: "From 02:00 to 04:00 UTC exports are queued and run when we are back.", es: "De 02:00 a 04:00 UTC las exportaciones quedan en cola y corren al volver." }, action: { en: "Status page", es: "Página de estado" } } }),
  ],
};
