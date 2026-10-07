import { definePattern, type PatternModule } from "../../model/types.js";
import { heading, stack, text } from "../kit.js";

interface Content {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Makes the title the block's one link (a card that goes to one place). */
  href?: string;
}

const { pattern, use } = definePattern<Content>({
  id: "heading-stack",
  subject: "card",
  scale: "fragment",
  title: { en: "Heading stack", es: "Encabezado apilado" },
  layout: { en: "A small eyebrow, the title and one line of context, one above the other, no gap between ideas.", es: "Un antetítulo pequeño, el título y una línea de contexto, uno sobre otro." },
  fields: { eyebrow: { en: "The category, one or two words.", es: "La categoría, una o dos palabras." }, title: { en: "What the block is called.", es: "Cómo se llama el bloque." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, href: { en: "When set, the title is the block's only link.", es: "Si se da, el título es el único enlace del bloque." } },
  notes: [{ en: "The link, when there is one, wraps the title only: the whole card as an anchor is a different pattern, and a title inside its own link keeps the heading's accessible name clean.", es: "El enlace, si lo hay, envuelve solo el título: la card entera como ancla es otro patrón, y un título dentro de su enlace deja limpio el nombre accesible." }],
  build: ({ eyebrow, title, subtitle, href }) =>
    stack(
      [
        text(eyebrow, { textRole: "eyebrow" }),
        heading(href ? { contract: "typography", signature: "Link", options: { href }, children: title } : title, "h4"),
        text(subtitle, { size: "sm", tone: "secondary" }),
      ],
      { gap: "xs" },
    ),
});

export const headingStack: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "project-heading",
      intent: "content/presentation/heading-block",
      title: { en: "Heading", es: "Encabezado" },
      purpose: { en: "The block a card opens with: category, title and one line of context.", es: "El bloque con el que abre una card: categoría, título y una línea de contexto." },
      content: { eyebrow: { en: "Project", es: "Proyecto" }, title: { en: "Customer portal redesign", es: "Rediseño del portal de clientes" }, subtitle: { en: "Updated 2 hours ago", es: "Actualizado hace 2 horas" } },
    }),
  ],
};
