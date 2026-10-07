import { definePattern, type PatternModule } from "../../model/types.js";
import { icon, list } from "../kit.js";

interface Content {
  label: string;
  rows: { icon: string; title: string; body: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "icon-chevron-links",
  subject: "list",
  scale: "component",
  title: { en: "Icon rows that are links", es: "Filas con ícono que son enlaces" },
  layout: { en: "Rows that are each a link: a leading icon, a title over a line of what is there, a chevron at the end.", es: "Filas que son cada una un enlace: un ícono al inicio, un título sobre una línea de lo que hay y un chevron al final." },
  fields: { label: { en: "The list's accessible name.", es: "El nombre accesible de la lista." }, rows: { en: "Each destination: icon, title, what changes there.", es: "Cada destino: ícono, título, qué se cambia ahí." } },
  notes: [{ en: "Each row IS the link (ListItemLink), so the chevron is decoration and the row has one focus stop. Compare the card version, which does the same with tiles.", es: "Cada fila ES el enlace (ListItemLink), así que el chevron es decoración y la fila tiene un foco. Compara la versión en card, que hace lo mismo con tiles." }],
  build: ({ label, rows }) => list(label, rows.map((row) => ({ leading: icon(row.icon), title: row.title, description: row.body, trailing: icon("chevron-right", "sm"), href: "#" }))),
});

export const iconChevronLinks: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "settings-menu-list",
      intent: "navigation/destinations/settings-menu",
      title: { en: "Settings menu", es: "Menú de ajustes" },
      purpose: { en: "Rows that each lead to a screen, saying what changes there.", es: "Filas que llevan cada una a una pantalla, diciendo qué se cambia ahí." },
      related: [{ id: "shortcuts-settings", kind: "alternative", why: { en: "Prefer the tile version when each destination deserves card weight and sits apart from a list.", es: "Prefiere la versión en tiles cuando cada destino merece peso de card y va aparte de una lista." } }],
      content: {
        label: { en: "Settings", es: "Ajustes" },
        rows: [
          { icon: "user", title: { en: "Profile", es: "Perfil" }, body: { en: "Name, photo and contact details", es: "Nombre, foto y datos de contacto" } },
          { icon: "mask", title: { en: "Security", es: "Seguridad" }, body: { en: "Password and two-step verification", es: "Contraseña y verificación en dos pasos" } },
          { icon: "info", title: { en: "Notifications", es: "Notificaciones" }, body: { en: "What we tell you and where", es: "Qué te avisamos y por dónde" } },
          { icon: "language", title: { en: "Language", es: "Idioma" }, body: { en: "Language and date format", es: "Idioma y formato de fechas" } },
        ],
      },
    }),
  ],
};
