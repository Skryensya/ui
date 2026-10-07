import { definePattern, type PatternModule } from "../../model/types.js";
import { heading, icon, inline, navAction } from "../kit.js";

interface Content {
  title: string;
  more: string;
}

const { pattern, use } = definePattern<Content>({
  id: "title-with-link",
  subject: "list",
  scale: "fragment",
  title: { en: "Title with a link to the rest", es: "Título con enlace al resto" },
  layout: { en: "A heading at the start and a ghost link with an arrow at the end of one row.", es: "Un título al inicio y un enlace fantasma con flecha al final de una fila." },
  fields: { title: { en: "What the list is.", es: "Qué es la lista." }, more: { en: "The link to the full list.", es: "El enlace a la lista completa." } },
  build: ({ title, more }) => inline([heading(title), { ...navAction(more, "#", { variant: "ghost", size: "sm" }), slots: { post: icon("arrow-right", "sm") } }], { gap: "sm", justify: "between", inlineAlign: "center" }),
});

export const titleWithLink: PatternModule<Content> = {
  pattern,
  uses: [use({ id: "files-header", intent: "content/presentation/section-header", title: { en: "List header", es: "Encabezado de lista" }, purpose: { en: "Names the list and leads to the rest when only a few are shown.", es: "Nombra la lista y lleva al resto cuando solo se muestran unos pocos." }, content: { title: { en: "Recent files", es: "Archivos recientes" }, more: { en: "See all", es: "Ver todos" } } })],
};
