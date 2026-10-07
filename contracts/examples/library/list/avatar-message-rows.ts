import { definePattern, type PatternModule } from "../../model/types.js";
import { avatar, inlineText, list, type Person } from "../kit.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  label: string;
  /** The word that names the unread mark, so the dot is not the only cue. */
  unreadLabel: string;
  rows: { person: Person; text: string; when: string; unread?: boolean }[];
}

const { pattern, use } = definePattern<Content>({
  id: "avatar-message-rows",
  subject: "list",
  scale: "component",
  title: { en: "Avatar message rows", es: "Filas de mensaje con avatar" },
  layout: { en: "Rows with dividers: an avatar, the name over a line of what happened, and the time at the end, with a dot after it when unread.", es: "Filas con divisores: un avatar, el nombre sobre una línea de qué pasó y la hora al final, con un punto después si no se leyó." },
  fields: { label: { en: "The list's accessible name.", es: "El nombre accesible de la lista." }, unreadLabel: { en: "The unread dot's accessible name.", es: "El nombre accesible del punto de no leída." }, rows: { en: "Each row: who, what, when and whether it is unread.", es: "Cada fila: quién, qué, cuándo y si está sin leer." } },
  notes: [{ en: "The time and the dot go in the row's trailing slot as loose nodes, not an Inline: the slot is a span, and a layout primitive is a div. The dot is a BadgeDot whose `label` is its name; a bare dot says nothing.", es: "La hora y el punto van en el slot trailing como nodos sueltos y no en un Inline: el slot es un span y un primitivo de layout es un div. El punto es un BadgeDot cuyo `label` es su nombre; un punto solo no dice nada." }],
  build: ({ label, unreadLabel, rows }) =>
    list(
      label,
      rows.map((row) => ({
        leading: avatar(row.person),
        title: row.person.name,
        description: row.text,
        trailing: [inlineText(row.when, { size: "caption", tone: "tertiary" }), ...(row.unread ? [{ contract: "badge", signature: "BadgeDot", options: { tone: "accent", label: unreadLabel } } satisfies UsageTree] : [])],
      })),
    ),
});

const marta = { name: "Marta Ruiz", initials: "MR" };
const tomas = { name: "Tomás Vidal", initials: "TV" };
const lucia = { name: "Lucía Paredes", initials: "LP" };
const ines = { name: "Inés Calvo", initials: "IC" };
const pablo = { name: "Pablo Mena", initials: "PM" };

export const avatarMessageRows: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "notifications-recent",
      intent: "collaboration/messages/notifications",
      title: { en: "Notifications", es: "Notificaciones" },
      purpose: { en: "Who did what and when, with unread ones marked.", es: "Quién hizo qué y cuándo, con las no leídas marcadas." },
      content: {
        label: { en: "Notifications", es: "Notificaciones" },
        unreadLabel: { en: "Unread", es: "No leída" },
        rows: [
          { person: marta, text: { en: "Commented on “Quarter plan”", es: "Comentó en «Plan del trimestre»" }, when: { en: "2 min ago", es: "Hace 2 min" }, unread: true },
          { person: tomas, text: { en: "Assigned you “Review contract”", es: "Te asignó «Revisar contrato»" }, when: { en: "1 h ago", es: "Hace 1 h" }, unread: true },
          { person: lucia, text: { en: "Uploaded 3 new files", es: "Subió 3 archivos nuevos" }, when: { en: "Yesterday", es: "Ayer" } },
          { person: ines, text: { en: "Approved your access request", es: "Aprobó tu solicitud de acceso" }, when: { en: "Monday", es: "Lunes" } },
        ],
      },
    }),
    use({
      id: "activity-recent",
      intent: "collaboration/work/activity-feed",
      title: { en: "Recent activity", es: "Actividad reciente" },
      purpose: { en: "Who did what lately, newest first.", es: "Quién hizo qué últimamente, lo más reciente primero." },
      catalog: false,
      content: {
        label: { en: "Recent activity", es: "Actividad reciente" },
        unreadLabel: { en: "Unread", es: "No leída" },
        rows: [
          { person: marta, text: { en: "Approved the October invoice", es: "Aprobó la factura de octubre" }, when: { en: "5 min ago", es: "Hace 5 min" } },
          { person: tomas, text: { en: "Invited two people to the team", es: "Invitó a dos personas al equipo" }, when: { en: "1 h ago", es: "Hace 1 h" } },
          { person: pablo, text: { en: "Published a new guide", es: "Publicó una guía nueva" }, when: { en: "Yesterday", es: "Ayer" } },
        ],
      },
    }),
  ],
};
