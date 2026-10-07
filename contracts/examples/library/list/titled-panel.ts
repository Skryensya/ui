import { definePattern, type PatternModule } from "../../model/types.js";
import { heading, icon, inline, navAction, stack, surface } from "../kit.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  title: string;
  /** A link to the whole thing, at the end of the title row. */
  more?: string;
  /** A filter at the end of the title row. */
  filter?: { label: string; options: { value: string; label: string }[] };
  /** The id of the use the panel holds. */
  body: string;
  /** A link under the body. */
  footer?: string;
}

const { pattern, use } = definePattern<Content>({
  id: "titled-panel",
  subject: "list",
  scale: "composition",
  title: { en: "Titled panel", es: "Panel con título" },
  layout: { en: "A card with a title row (and, at its end, a link or a filter), the body of another use, and an optional link under it.", es: "Una card con una fila de título (y, al final, un enlace o un filtro), el cuerpo de otro uso y un enlace opcional debajo." },
  fields: { title: { en: "What the panel is.", es: "Qué es el panel." }, more: { en: "A link to the full list, beside the title.", es: "Un enlace a la lista completa, junto al título." }, filter: { en: "A segmented filter beside the title.", es: "Un filtro segmentado junto al título." }, body: { en: "Id of the use the panel holds.", es: "Id del uso que contiene el panel." }, footer: { en: "A link under the body.", es: "Un enlace bajo el cuerpo." } },
  notes: [{ en: "The panel is only the frame: title, body, way out. What it holds is a use of its own, so the same list is reachable bare or framed without being written twice.", es: "El panel es solo el marco: título, cuerpo, salida. Lo que contiene es un uso propio, así que la misma lista se alcanza sin marco o con él sin escribirla dos veces." }],
  build: ({ title, more, filter, body, footer }, ctx) => {
    const end: UsageTree[] = [
      ...(filter
        ? [{ contract: "segmented", signature: "Segmented", options: { value: filter.options[0]!.value, label: filter.label, size: "sm" }, slots: { items: filter.options.map((option) => ({ options: { value: option.value }, slots: { label: option.label } })) } } satisfies UsageTree]
        : []),
      ...(more ? [{ ...navAction(more, "#", { variant: "ghost", size: "sm" }), slots: { post: icon("arrow-right", "sm") } } satisfies UsageTree] : []),
    ];
    return surface([
      end.length > 0 ? inline([heading(title), ...end], { gap: "sm", justify: "between", inlineAlign: "center" }) : stack([heading(title)]),
      ctx.render(body),
      ...(footer ? [navAction(footer, "#", { variant: "ghost", size: "sm" })] : []),
    ]);
  },
});

export const titledPanel: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "panel-inbox",
      intent: "collaboration/messages/inbox-panel",
      title: { en: "Inbox", es: "Bandeja de entrada" },
      purpose: { en: "Notifications in a panel with a filter and a way to the full list.", es: "Notificaciones en un panel con filtro y salida a la lista completa." },
      content: { title: { en: "Notifications", es: "Notificaciones" }, filter: { label: { en: "Show", es: "Mostrar" }, options: [{ value: "all", label: { en: "All", es: "Todas" } }, { value: "unread", label: { en: "Unread", es: "No leídas" } }] }, body: "notifications-recent", footer: { en: "See all notifications", es: "Ver todas las notificaciones" } },
    }),
    use({
      id: "panel-files",
      intent: "collaboration/files/file-list",
      title: { en: "Recent files panel", es: "Panel de archivos recientes" },
      purpose: { en: "The file list in a panel that leads to all files.", es: "La lista de archivos en un panel que lleva a todos." },
      catalog: false,
      content: { title: { en: "Recent files", es: "Archivos recientes" }, more: { en: "See all", es: "Ver todos" }, body: "files-recent" },
    }),
    use({
      id: "panel-members",
      intent: "identity/people/members",
      title: { en: "Members panel", es: "Panel de miembros" },
      purpose: { en: "The member list in a panel that leads to the whole team.", es: "La lista de miembros en un panel que lleva a todo el equipo." },
      catalog: false,
      content: { title: { en: "Members", es: "Miembros" }, more: { en: "See all", es: "Ver todos" }, body: "members-team" },
    }),
    use({
      id: "panel-activity",
      intent: "collaboration/work/activity-feed",
      title: { en: "Activity panel", es: "Panel de actividad" },
      purpose: { en: "Recent activity in a panel with a way to the full history.", es: "La actividad reciente en un panel con salida al historial completo." },
      catalog: false,
      content: { title: { en: "Recent activity", es: "Actividad reciente" }, body: "activity-recent", footer: { en: "See all activity", es: "Ver toda la actividad" } },
    }),
  ],
};
