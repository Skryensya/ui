import { definePattern, type PatternModule } from "../../model/types.js";
import { avatar, badge, list, type Person } from "../kit.js";

interface Content {
  label: string;
  rows: { person: Person; email: string; role: string; owner?: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "avatar-role-rows",
  subject: "list",
  scale: "component",
  title: { en: "Avatar rows with a role", es: "Filas con avatar y rol" },
  layout: { en: "Rows with an avatar, a name over an email, and the person's role as a badge at the end.", es: "Filas con un avatar, un nombre sobre un correo y el rol de la persona como insignia al final." },
  fields: { label: { en: "The list's accessible name.", es: "El nombre accesible de la lista." }, rows: { en: "Each row: person, email, role, and whether the role is the owner's.", es: "Cada fila: persona, correo, rol y si el rol es el del propietario." } },
  build: ({ label, rows }) => list(label, rows.map((row) => ({ leading: avatar(row.person), title: row.person.name, description: row.email, trailing: badge(row.role, row.owner ? "accent" : "neutral", "sm") }))),
});

const person = (name: string, initials: string) => ({ name, initials });

export const avatarRoleRows: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "members-team",
      intent: "identity/people/members",
      title: { en: "Members", es: "Miembros" },
      purpose: { en: "People with their email and their role on the team.", es: "Personas con su correo y su rol en el equipo." },
      content: {
        label: { en: "Members", es: "Miembros" },
        rows: [
          { person: person("Marta Ruiz", "MR"), email: "marta@example.com", role: { en: "Owner", es: "Propietaria" }, owner: true },
          { person: person("Tomás Vidal", "TV"), email: "tomas@example.com", role: { en: "Editor", es: "Editor" } },
          { person: person("Lucía Paredes", "LP"), email: "lucia@example.com", role: { en: "Editor", es: "Editor" } },
          { person: person("Inés Calvo", "IC"), email: "ines@example.com", role: { en: "Viewer", es: "Lector" } },
        ],
      },
    }),
  ],
};
