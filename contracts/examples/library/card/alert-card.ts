import { definePattern, type PatternModule } from "../../model/types.js";
import { action, icon, inline, navAction, stack, surface, text } from "../kit.js";

interface Content {
  icon: string;
  title: string;
  body: string;
  time: string;
  dismissLabel: string;
  primary: string;
  secondary: string;
}

const { pattern, use } = definePattern<Content>({
  id: "alert-card",
  subject: "card",
  scale: "component",
  title: { en: "Notification card", es: "Card de notificación" },
  layout: { en: "An icon with a dismiss button across from it, then a title with a line of detail and a time, and two actions underneath.", es: "Un ícono, un título con una línea de detalle y una hora, un botón de cerrar y dos acciones debajo." },
  fields: { icon: { en: "The icon role that matches what happened.", es: "El rol de ícono que corresponde a lo que pasó." }, title: { en: "What happened, in a few words.", es: "Qué pasó, en pocas palabras." }, body: { en: "What it means and what to do.", es: "Qué significa y qué hacer." }, time: { en: "When it happened.", es: "Cuándo pasó." }, dismissLabel: { en: "The dismiss button's name.", es: "El nombre del botón de cerrar." }, primary: { en: "The action that fixes or follows it.", es: "La acción que lo arregla o lo sigue." }, secondary: { en: "The way to put it off.", es: "La forma de dejarlo para después." } },
  notes: [
    { en: "A notification card stays until it is handled or dismissed: it asks for a decision, unlike a toast, which reports and leaves.", es: "Una card de notificación se queda hasta que se atiende o se descarta: pide una decisión, a diferencia de un toast, que informa y se va." },
    { en: "The dismiss button has a name (`Dismiss`), and the actions are verbs about the thing (`Update card`, not `OK`).", es: "El botón de cerrar tiene nombre (`Descartar`) y las acciones son verbos sobre la cosa (`Actualizar tarjeta`, no `Aceptar`)." },
  ],
  build: ({ icon: name, title, body, time, dismissLabel, primary, secondary }) =>
    surface([
      inline([icon(name, "md"), action(icon("close", "sm"), { variant: "ghost", size: "sm", iconOnly: true }, { "aria-label": dismissLabel })], { gap: "md", inlineAlign: "center", justify: "between" }),
      stack([text(title, { weight: "emphasis" }), text(body, { size: "sm", tone: "secondary" }), text(time, { size: "caption", tone: "secondary" })], { gap: "xs" }),
      inline([navAction(primary, "#", { variant: "soft", tone: "accent", size: "sm" }), action(secondary, { variant: "ghost", size: "sm" })], { gap: "sm" }),
    ]),
});

export const alertCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "alert-payment-failed", intent: "collaboration/messages/alert-card", title: { en: "A payment failed", es: "Un pago falló" }, purpose: { en: "Tell someone something needs their action, and let them act or postpone it from the card.", es: "Avisar que algo necesita su acción y dejar que actúe o lo posponga desde la card." }, content: { icon: "warning", title: { en: "Your payment failed", es: "Tu pago falló" }, body: { en: "The card ending 4242 was declined. Update it to keep your plan.", es: "La tarjeta terminada en 4242 fue rechazada. Actualízala para mantener tu plan." }, time: { en: "2 hours ago", es: "hace 2 horas" }, dismissLabel: { en: "Dismiss", es: "Descartar" }, primary: { en: "Update card", es: "Actualizar tarjeta" }, secondary: { en: "Remind me tomorrow", es: "Recordarme mañana" } } }),
    use({ id: "alert-new-comment", intent: "collaboration/messages/alert-card", title: { en: "A new comment", es: "Un comentario nuevo" }, purpose: { en: "Surface activity on something the reader owns, with a way straight to it.", es: "Mostrar actividad sobre algo que quien lee posee, con una vía directa hacia ello." }, content: { icon: "info", title: { en: "Ana commented on your draft", es: "Ana comentó tu borrador" }, body: { en: "“Can we move the pricing section up?”", es: "«¿Podemos subir la sección de precios?»" }, time: { en: "10 minutes ago", es: "hace 10 minutos" }, dismissLabel: { en: "Dismiss", es: "Descartar" }, primary: { en: "Open the draft", es: "Abrir el borrador" }, secondary: { en: "Mark as read", es: "Marcar como leído" } } }),
  ],
};
