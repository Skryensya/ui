import { definePattern, type PatternModule } from "../../model/types.js";
import { action, avatar, inline, navAction, separator, stack, surface, text } from "../kit.js";

interface Content {
  name: string;
  initials: string;
  role: string;
  email: string;
  phone: string;
  cta: string;
}

const { pattern, use } = definePattern<Content>({
  id: "contact-card",
  subject: "card",
  scale: "component",
  title: { en: "Contact card", es: "Card de contacto" },
  layout: { en: "An avatar beside a name and a role, a rule, two contact links stacked, and one action.", es: "Un avatar junto a un nombre y un rol, una línea, dos enlaces de contacto apilados y una acción." },
  fields: { name: { en: "Who they are.", es: "Quién es." }, initials: { en: "The avatar's two letters.", es: "Las dos letras del avatar." }, role: { en: "What they do for the reader.", es: "Qué hace por quien lee." }, email: { en: "Their email address.", es: "Su correo." }, phone: { en: "Their phone number.", es: "Su teléfono." }, cta: { en: "The main action, as a verb.", es: "La acción principal, como verbo." } },
  notes: [
    { en: "The email and the phone are real `mailto:` and `tel:` links: one tap on a phone starts the call, and nothing needs copying.", es: "El correo y el teléfono son enlaces reales `mailto:` y `tel:`: un toque en el teléfono inicia la llamada y nada hay que copiar." },
    { en: "State what the person is for (`Your account manager`), not only a job title: it tells the reader when to write to them.", es: "Di para qué es la persona (`Tu gerente de cuenta`), no solo un cargo: le dice a quien lee cuándo escribirle." },
  ],
  build: ({ name, initials, role, email, phone, cta }) =>
    surface([
      inline([avatar({ name, initials }, "lg"), stack([text(name, { weight: "emphasis" }), text(role, { size: "sm", tone: "secondary" })], { gap: "none" })], { gap: "md", inlineAlign: "center" }),
      separator(),
      stack([navAction(email, `mailto:${email}`, { variant: "ghost", size: "sm" }), navAction(phone, `tel:${phone.replace(/\s/g, "")}`, { variant: "ghost", size: "sm" })], { gap: "xs", align: "start" }),
      inline([action(cta, { variant: "soft", tone: "accent", size: "sm" })]),
    ]),
});

export const contactCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "contact-account-manager", intent: "identity/people/contact-card", title: { en: "Account manager", es: "Gerente de cuenta" }, purpose: { en: "Put a named person and two ways to reach them where a customer needs help.", es: "Poner a una persona con nombre y dos vías para contactarla donde un cliente necesita ayuda." }, content: { name: "Ana Salgado", initials: "AS", role: { en: "Your account manager", es: "Tu gerente de cuenta" }, email: "ana@northwind.example", phone: "+34 600 123 456", cta: { en: "Send a message", es: "Enviar un mensaje" } } }),
  ],
};
