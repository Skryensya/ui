import { definePattern, type PatternModule } from "../../model/types.js";
import { avatar, box, heading, inline, stack, text, type Person } from "../kit.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

interface Content {
  src: string;
  alt: string;
  /** The Badge on the image: the kind of thing it is. */
  kind: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  author: Person;
  meta: string;
}

const { pattern, use } = definePattern<Content>({
  id: "media-top-card",
  subject: "card",
  scale: "component",
  title: { en: "Card with media on top", es: "Card con imagen arriba" },
  layout: { en: "An image flush to the card's top edge, then an inset block: eyebrow, linked title, a line of context and a byline.", es: "Una imagen al borde superior de la card y, debajo, un bloque con margen: antetítulo, título con enlace, una línea de contexto y la autoría." },
  fields: { src: { en: "Image address.", es: "Dirección de la imagen." }, alt: { en: "What the image shows.", es: "Qué muestra la imagen." }, kind: { en: "The label on the image.", es: "La etiqueta sobre la imagen." }, eyebrow: { en: "Reading time or section.", es: "Tiempo de lectura o sección." }, title: { en: "The headline, which is the card's link.", es: "El titular, que es el enlace de la card." }, subtitle: { en: "A line that earns the click.", es: "Una línea que gana el clic." }, href: { en: "Where it goes.", es: "A dónde va." }, author: { en: "Who made it.", es: "Quién lo hizo." }, meta: { en: "The date.", es: "La fecha." } },
  notes: [{ en: "Two Boxes: the outer clips and has no padding so the image reaches the edge; the inner one gives the copy its inset. Padding on the outer would inset the photo too.", es: "Dos Box: el externo recorta y no tiene padding para que la imagen llegue al borde; el interno da el margen al texto. Padding en el externo también achicaría la foto." }],
  build: ({ src, alt, kind, eyebrow, title, subtitle, href, author, meta }): UsageTree =>
    box(
      [
        {
          contract: "image-frame",
          signature: "ImageFrame",
          options: { src, alt, aspect: "16/9", fit: "cover", radius: "none" },
          slots: { caption: { contract: "media-overlay", signature: "MediaOverlay", options: { edge: "top" }, children: [{ contract: "badge", signature: "Badge", children: kind }] } },
        },
        box(
          [
            stack(
              [
                stack(
                  [text(eyebrow, { textRole: "eyebrow" }), heading({ contract: "typography", signature: "Link", options: { href }, children: title }, "h4"), text(subtitle, { size: "sm", tone: "secondary" })],
                  { gap: "xs" },
                ),
                inline([avatar(author), stack([text(author.name, { size: "sm", weight: "label" }), text(meta, { size: "caption", tone: "tertiary" })], { gap: "none" })], { gap: "sm", inlineAlign: "center", wrap: false }),
              ],
              { gap: "md" },
            ),
          ],
          { padding: "lg" },
        ),
      ],
      { surface: "surface", border: "subtle", boxElement: "article" },
    ),
});

const post = (key: string, catalog: boolean, content: { src: string; kind: { en: string; es: string }; eyebrow: { en: string; es: string }; title: { en: string; es: string }; subtitle: { en: string; es: string }; author: Person; meta: { en: string; es: string } }) =>
  use({
    id: `post-${key}`,
    intent: "content/publishing/post",
    title: catalog ? { en: "Post", es: "Publicación" } : content.title,
    purpose: { en: "Something to read, with its author and date.", es: "Un contenido para leer, con su autor y su fecha." },
    catalog,
    content: { ...content, alt: { en: "Sample image", es: "Imagen de ejemplo" }, href: "#" },
  });

export const mediaTopCard: PatternModule<Content> = {
  pattern,
  uses: [
    post("backlog", true, {
      src: "https://dummyimage.com/640x360/d9e2ec/334e68&text=%20",
      kind: { en: "Guide", es: "Guía" },
      eyebrow: { en: "6 min read", es: "6 min de lectura" },
      title: { en: "Sorting a backlog that grew without a plan", es: "Cómo ordenar un backlog que creció sin plan" },
      subtitle: { en: "Three steps to tell what is urgent from what is only noise.", es: "Tres pasos para separar lo urgente de lo que solo hace ruido." },
      author: { name: "Marta Ruiz", initials: "MR" },
      meta: { en: "October 3", es: "3 de octubre" },
    }),
    post("reports", false, {
      src: "https://dummyimage.com/640x360/e3f2e1/2f5d3a&text=%20",
      kind: { en: "News", es: "Novedades" },
      eyebrow: { en: "3 min read", es: "3 min de lectura" },
      title: { en: "Exporting reports now takes one click", es: "Exportar reportes ahora toma un clic" },
      subtitle: { en: "Pick the range and the format: the file lands in your inbox.", es: "Elige el rango, el formato y listo: el archivo llega a tu correo." },
      author: { name: "Tomás Vidal", initials: "TV" },
      meta: { en: "September 28", es: "28 de septiembre" },
    }),
    post("support-team", false, {
      src: "https://dummyimage.com/640x360/f6e7d8/7a4b1e&text=%20",
      kind: { en: "Story", es: "Caso" },
      eyebrow: { en: "8 min read", es: "8 min de lectura" },
      title: { en: "A support team that answered twice as many", es: "Un equipo de soporte que respondió el doble" },
      subtitle: { en: "What changed when common answers stopped living in a document.", es: "Lo que cambió cuando las respuestas frecuentes dejaron de vivir en un documento." },
      author: { name: "Lucía Paredes", initials: "LP" },
      meta: { en: "September 19", es: "19 de septiembre" },
    }),
  ],
};
