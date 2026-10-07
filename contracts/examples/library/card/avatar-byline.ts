import { definePattern, type PatternModule } from "../../model/types.js";
import { avatar, inline, stack, text, type Person } from "../kit.js";

interface Content {
  person: Person;
  /** What goes under the name: a role and a date, a time, a count. */
  meta: string;
}

const { pattern, use } = definePattern<Content>({
  id: "avatar-byline",
  subject: "card",
  scale: "fragment",
  title: { en: "Avatar byline", es: "Autoría con avatar" },
  layout: { en: "An avatar, then a name over one quiet line of detail, on one row that never wraps.", es: "Un avatar y, a su lado, un nombre sobre una línea de detalle, en una fila que no se parte." },
  fields: { person: { en: "Name and initials.", es: "Nombre e iniciales." }, meta: { en: "The line under the name.", es: "La línea bajo el nombre." } },
  build: ({ person, meta }) =>
    inline([avatar(person), stack([text(person.name, { size: "sm", weight: "label" }), text(meta, { size: "caption", tone: "tertiary" })], { gap: "none" })], { gap: "sm", inlineAlign: "center", wrap: false }),
});

export const avatarByline: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "byline-editor",
      intent: "content/attribution/byline",
      title: { en: "Byline", es: "Autoría" },
      purpose: { en: "Who did something and when, beside their avatar.", es: "Quién hizo algo y cuándo, junto a su avatar." },
      content: { person: { name: "Marta Ruiz", initials: "MR" }, meta: { en: "Editor · October 3", es: "Editora · 3 de octubre" } },
    }),
  ],
};
