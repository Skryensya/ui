import { definePattern, type PatternModule } from "../../model/types.js";
import { inline, stack, text } from "../kit.js";

interface Content {
  name: string;
  role: string;
  src: string;
}

const { pattern, use } = definePattern<Content>({
  id: "avatar-greeting",
  subject: "card",
  scale: "fragment",
  title: { en: "Avatar with a greeting", es: "Avatar con saludo" },
  layout: { en: "An ExpressiveAvatar that reacts to the pointer, beside a name and a line of role.", es: "Un ExpressiveAvatar que reacciona al puntero, junto a un nombre y una línea de rol." },
  fields: {
    name: { en: "Who it is: also the avatar's accessible name.", es: "Quién es: también el nombre accesible del avatar." },
    role: { en: "What they do, in one line.", es: "Qué hace, en una línea." },
    src: { en: "The artwork the expressions are drawn from.", es: "La ilustración de la que salen las expresiones." },
  },
  notes: [
    { en: "The avatar carries the person's name: its movement is decoration and must not be the only thing that says who this is.", es: "El avatar lleva el nombre de la persona: su movimiento es decoración y no puede ser lo único que diga quién es." },
    { en: "Use it where one face is the point (a host, an assistant, a profile header); a list of people wants the still Avatar.", es: "Úsalo donde una cara es lo importante (un anfitrión, un asistente, la cabecera de un perfil); una lista de personas pide el Avatar quieto." },
  ],
  build: ({ name, role, src }) =>
    inline(
      [
        { contract: "expressive-avatar", signature: "ExpressiveAvatar", options: { name, src, size: "lg" } },
        stack([text(name, { weight: "emphasis" }), text(role, { size: "sm", tone: "secondary" })], { gap: "none" }),
      ],
      { gap: "md", inlineAlign: "center" },
    ),
});

export const avatarGreeting: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "greeting-host",
      intent: "identity/people/animated-avatar",
      title: { en: "A host", es: "Una anfitriona" },
      purpose: { en: "Put a friendly face on the first screen, where a person is welcoming the reader.", es: "Poner una cara amable en la primera pantalla, donde una persona da la bienvenida." },
      content: { name: "Robin", role: { en: "Your onboarding guide", es: "Tu guía de bienvenida" }, src: "/expressive-avatar/states/base.webp" },
    }),
  ],
};
