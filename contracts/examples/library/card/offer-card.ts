import { definePattern, type PatternModule } from "../../model/types.js";
import { action, badge, heading, icon, inline, navAction, stack, surface, text } from "../kit.js";

interface Content {
  badgeLabel: string;
  title: string;
  body: string;
  benefits: readonly string[];
  primary: string;
  secondary: string;
}

const { pattern, use } = definePattern<Content>({
  id: "offer-card",
  subject: "card",
  scale: "component",
  title: { en: "Offer card", es: "Card de oferta" },
  layout: { en: "A raised surface with a badge, a title and a line of context, a short list of benefits each with a check, and a primary action beside a quiet one.", es: "Una superficie elevada con una insignia, un título y una línea de contexto, una lista corta de beneficios cada uno con un check, y una acción principal junto a una discreta." },
  fields: { badgeLabel: { en: "What is on offer, in a word.", es: "Qué se ofrece, en una palabra." }, title: { en: "What the reader gains.", es: "Qué gana quien lee." }, body: { en: "Why now.", es: "Por qué ahora." }, benefits: { en: "Three or fewer concrete benefits.", es: "Tres o menos beneficios concretos." }, primary: { en: "The action that accepts.", es: "La acción que acepta." }, secondary: { en: "The way to decline without penalty.", es: "La forma de rechazar sin penalización." } },
  notes: [
    { en: "An offer may ask once and leave: the decline is a real button with equal reach, not a faint link.", es: "Una oferta puede pedir una vez y retirarse: rechazar es un botón real de igual alcance, no un enlace tenue." },
    { en: "Benefits are things the reader can do, not adjectives. Plans and new features fit; an invitation is a banner, not this card.", es: "Los beneficios son cosas que se pueden hacer, no adjetivos. Caben planes, invitaciones y funciones nuevas." },
  ],
  build: ({ badgeLabel, title, body, benefits, primary, secondary }) =>
    surface(
      [
        inline([badge(badgeLabel, "accent", "sm")]),
        stack([heading(title, "h5"), text(body, { size: "sm", tone: "secondary" })], { gap: "xs" }),
        stack(benefits.map((benefit) => inline([icon("check", "sm"), text(benefit, { size: "sm" })], { gap: "xs", inlineAlign: "center" })), { gap: "xs" }),
        inline([navAction(primary, "#", { variant: "solid", tone: "accent", size: "sm" }), action(secondary, { variant: "ghost", size: "sm" })], { gap: "sm" }),
      ],
      true,
    ),
});

export const offerCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "offer-upgrade", intent: "marketing/conversion/offer", title: { en: "A plan upgrade", es: "Mejora de plan" }, purpose: { en: "Offer the next plan at the moment a limit blocks the reader.", es: "Ofrecer el siguiente plan justo cuando un límite bloquea a quien lee." }, content: { badgeLabel: "Team", title: { en: "You've used all your storage", es: "Usaste todo tu almacenamiento" }, body: { en: "Move to Team to keep uploading without deleting anything.", es: "Pasa a Team para seguir subiendo sin borrar nada." }, benefits: [{ en: "1 TB of storage", es: "1 TB de almacenamiento" }, { en: "Version history for 90 days", es: "Historial de versiones por 90 días" }, { en: "Up to 10 seats", es: "Hasta 10 asientos" }], primary: { en: "Upgrade to Team", es: "Mejorar a Team" }, secondary: { en: "Not now", es: "Ahora no" } } }),
  ],
};
