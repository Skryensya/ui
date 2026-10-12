import { definePattern, type PatternModule } from "../../model/types.js";
import { avatar, inline, stack, surface, text } from "../kit.js";

interface Content {
  quote: string;
  name: string;
  initials: string;
  role: string;
}

const { pattern, use } = definePattern<Content>({
  id: "testimonial-card",
  subject: "card",
  scale: "component",
  title: { en: "Testimonial card", es: "Card de testimonio" },
  layout: { en: "A surface with one Quote, then an avatar beside a name and a line of role.", es: "Una superficie con un Quote y luego un avatar junto a un nombre y una línea de rol." },
  fields: { quote: { en: "What they said, as said.", es: "Lo que dijeron, tal cual." }, name: { en: "Who said it.", es: "Quién lo dijo." }, initials: { en: "The avatar's two letters.", es: "Las dos letras del avatar." }, role: { en: "What they do, and where.", es: "Qué hacen y dónde." } },
  notes: [
    { en: "The quote leads and the person follows: the words are the proof, and the byline is what makes them believable.", es: "La cita va primero y la persona después: las palabras son la prueba y la firma es lo que las hace creíbles." },
    { en: "A real name and role beat a first name only; a testimonial nobody can attribute is decoration.", es: "Un nombre y un rol reales valen más que solo un nombre de pila; un testimonio que nadie puede atribuir es decoración." },
  ],
  build: ({ quote, name, initials, role }) =>
    surface([
      { contract: "quote", signature: "Quote", children: undefined, slots: { children: quote } },
      inline([avatar({ name, initials }, "md"), stack([text(name, { weight: "emphasis", size: "sm" }), text(role, { size: "sm", tone: "secondary" })], { gap: "none" })], { gap: "sm", inlineAlign: "center" }),
    ]),
});

export const testimonialCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({ id: "testimonial-customer", intent: "marketing/proof/customer-quote", title: { en: "A customer", es: "Un cliente" }, purpose: { en: "Back a claim with the words of someone who used the product.", es: "Respaldar una afirmación con las palabras de alguien que usó el producto." }, content: { quote: { en: "We cut our release checklist from two hours to ten minutes.", es: "Pasamos de dos horas a diez minutos en nuestra lista de lanzamiento." }, name: "Lucía Paredes", initials: "LP", role: { en: "Engineering lead, Northwind", es: "Líder de ingeniería, Northwind" } } }),
  ],
};
