import { definePattern, type PatternModule } from "../../model/types.js";
import { action, box, icon, inline, navAction, stack, surface, text } from "../kit.js";

interface Content {
  icon: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
}

const { pattern, use } = definePattern<Content>({
  id: "invite-banner",
  subject: "card",
  scale: "component",
  title: { en: "Invitation banner", es: "Banner de invitación" },
  layout: { en: "One row on a surface, short enough to stay on one line: an icon tile, a title over a line of context, and the accept and decline actions at the end.", es: "Una fila sobre una superficie, lo bastante corta para quedar en una línea: una baldosa con ícono, un título sobre una línea de contexto y las acciones de aceptar y rechazar al final." },
  fields: { icon: { en: "The icon role that stands for the ask.", es: "El rol de ícono que representa la petición." }, title: { en: "The ask, as a sentence.", es: "La petición, como frase." }, body: { en: "Why it is worth it, with a fact from the reader's own use.", es: "Por qué vale la pena, con un dato del uso de quien lee." }, primary: { en: "The action that accepts.", es: "La acción que acepta." }, secondary: { en: "The way to put it off.", es: "La forma de dejarlo para después." } },
  notes: [
    { en: "A banner asks one thing, in one row, and sits above the work instead of replacing it: it is a request, not a feature list.", es: "Un banner pide una cosa, en una fila, y se pone sobre el trabajo en vez de reemplazarlo: es una petición, no una lista de funciones." },
    { en: "Tie the ask to something the reader already did (`5 projects to share`): an invitation with no reason is a nag.", es: "Ata la petición a algo que quien lee ya hizo (`5 proyectos por compartir`): una invitación sin motivo es una insistencia." },
  ],
  build: ({ icon: name, title, body, primary, secondary }) =>
    surface([
      inline(
        [
          inline([box([icon(name, "md")], { surface: "sunken", padding: "sm" }), stack([text(title, { weight: "emphasis" }), text(body, { size: "sm", tone: "secondary" })], { gap: "none" })], { gap: "md", inlineAlign: "center" }),
          inline([navAction(primary, "#", { variant: "solid", tone: "accent", size: "sm" }), action(secondary, { variant: "ghost", size: "sm" })], { gap: "sm" }),
        ],
        { gap: "md", inlineAlign: "center", justify: "between" },
      ),
    ]),
});

export const inviteBanner: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "invite-teammates", intent: "marketing/conversion/invitation", title: { en: "Invite the team", es: "Invitar al equipo" }, purpose: { en: "Ask someone to bring in their team once they have seen the value alone.", es: "Pedir que traigan a su equipo cuando ya vieron el valor por su cuenta." }, content: { icon: "user", title: { en: "Bring your team", es: "Suma a tu equipo" }, body: { en: "5 projects to share.", es: "5 proyectos por compartir." }, primary: { en: "Invite", es: "Invitar" }, secondary: { en: "Later", es: "Luego" } } }),
  ],
};
