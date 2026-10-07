import { definePattern, type PatternModule } from "../../model/types.js";
import { action, avatar, heading, inline, stack, surface, text, type Person } from "../kit.js";

interface Content {
  person: Person;
  /** Under the name: a role, a title. */
  subtitle: string;
  tags: string[];
  /** The one action: its label, and the longer name a screen reader hears. */
  action: string;
  actionLabel: string;
}

const { pattern, use } = definePattern<Content>({
  id: "centered-identity-card",
  subject: "card",
  scale: "component",
  title: { en: "Centred identity card", es: "Card de identidad centrada" },
  layout: { en: "A large avatar, the name over a subtitle, a row of tags and one soft action, all centred in one column.", es: "Un avatar grande, el nombre sobre un subtítulo, una fila de etiquetas y una acción suave, todo centrado en una columna." },
  fields: { person: { en: "Name and initials.", es: "Nombre e iniciales." }, subtitle: { en: "Role or title.", es: "Rol o cargo." }, tags: { en: "Two or three short keywords.", es: "Dos o tres palabras clave cortas." }, action: { en: "The button's visible label.", es: "La etiqueta visible del botón." }, actionLabel: { en: "The button's accessible name, naming the person.", es: "El nombre accesible del botón, que nombra a la persona." } },
  notes: [{ en: "Identity is the subject, so the layout centres: a reader scans a row of these by face and name. The action's accessible name carries the person, because eight 'Message' buttons are indistinguishable by ear.", es: "La identidad es el sujeto, así que el layout centra: se recorre una fila de estas por cara y nombre. El nombre accesible de la acción lleva a la persona, porque ocho botones 'Mensaje' son indistinguibles al oído." }],
  build: ({ person, subtitle, tags, action: label, actionLabel }) =>
    surface([
      stack(
        [
          avatar(person, "xl"),
          stack([heading(person.name, "h5"), text(subtitle, { size: "sm", tone: "secondary" })], { gap: "none", align: "center" }),
          inline(
            tags.map((tag) => ({ contract: "tag", signature: "Tag", children: tag })),
            { gap: "xs", justify: "center" },
          ),
          action(label, { variant: "soft", size: "sm" }, { "aria-label": actionLabel }),
        ],
        { gap: "sm", align: "center" },
      ),
    ]),
});

const people = {
  marta: { person: { name: "Marta Ruiz", initials: "MR" }, role: { en: "Product designer", es: "Diseñadora de producto" }, tags: [{ en: "Design", es: "Diseño" }, { en: "Product", es: "Producto" }] },
  tomas: { person: { name: "Tomás Vidal", initials: "TV" }, role: { en: "Platform engineer", es: "Ingeniero de plataforma" }, tags: [{ en: "Engineering", es: "Ingeniería" }, { en: "Remote", es: "Remoto" }] },
  lucia: { person: { name: "Lucía Paredes", initials: "LP" }, role: { en: "Support lead", es: "Líder de soporte" }, tags: [{ en: "Support", es: "Soporte" }] },
  ines: { person: { name: "Inés Calvo", initials: "IC" }, role: { en: "User researcher", es: "Investigadora de usuarios" }, tags: [{ en: "Research", es: "Investigación" }, { en: "Product", es: "Producto" }] },
  andres: { person: { name: "Andrés Soto", initials: "AS" }, role: { en: "Data analyst", es: "Analista de datos" }, tags: [{ en: "Data", es: "Datos" }, { en: "Remote", es: "Remoto" }] },
  pablo: { person: { name: "Pablo Mena", initials: "PM" }, role: { en: "Content editor", es: "Editor de contenido" }, tags: [{ en: "Content", es: "Contenido" }] },
} as const;

const member = (key: keyof typeof people, catalog: boolean) => {
  const entry = people[key];
  return use({
    id: `profile-${key}`,
    intent: "identity/people/profile",
    title: catalog ? { en: "Profile", es: "Perfil" } : entry.person.name,
    purpose: { en: "A person: who they are, what they do and how to reach them.", es: "Una persona: quién es, qué hace y cómo contactarla." },
    catalog,
    content: {
      person: entry.person,
      subtitle: entry.role,
      tags: [...entry.tags],
      action: { en: "Message", es: "Mensaje" },
      actionLabel: { en: `Send a message to ${entry.person.name}`, es: `Enviar un mensaje a ${entry.person.name}` },
    },
  });
};

export const centeredIdentityCard: PatternModule<Content> = {
  pattern,
  uses: [member("marta", true), member("tomas", false), member("lucia", false), member("ines", false), member("andres", false), member("pablo", false)],
};
