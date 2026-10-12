import type { UsageTree } from "@skryensya/core/usage-tree";
import { definePattern, type PatternModule } from "../../model/types.js";

interface Content {
  label: string;
  comments: { author: string; when: string; text: string }[];
}

const { pattern, use } = definePattern<Content>({
  id: "comment-feed",
  subject: "list",
  scale: "component",
  title: { en: "Comment feed", es: "Feed de comentarios" },
  layout: { en: "A Feed of articles, each announced as `author, when` and then its text, with its place in the set.", es: "Un Feed de artículos, cada uno anunciado como `autor, cuándo` y luego su texto, con su lugar en el conjunto." },
  fields: { label: { en: "What the feed is: it names the region.", es: "Qué es el feed: nombra la región." }, comments: { en: "The entries, in reading order: who, when, and what they wrote.", es: "Las entradas, en orden de lectura: quién, cuándo y qué escribió." } },
  notes: [
    { en: "Each entry knows its position and the size of the set, so a screen reader can say `2 of 2` and a long feed can load more without losing its place.", es: "Cada entrada conoce su posición y el tamaño del conjunto, así que un lector de pantalla puede decir `2 de 2` y un feed largo puede cargar más sin perder el lugar." },
    { en: "Use a feed for an open-ended stream the reader scrolls; a fixed handful of items is a plain list.", es: "Usa un feed para un flujo abierto que se recorre con scroll; un puñado fijo de elementos es una lista simple." },
  ],
  build: ({ label, comments }) => ({
    contract: "feed",
    signature: "Feed",
    options: { label },
    children: comments.map((comment, index): UsageTree => ({
      contract: "feed",
      signature: "FeedArticle",
      options: { posInset: index + 1, setSize: comments.length },
      slots: { label: `${comment.author}, ${comment.when}`, children: comment.text },
    })),
  }),
});

export const commentFeed: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "feed-review-comments",
      intent: "collaboration/messages/comment-feed",
      title: { en: "Review comments", es: "Comentarios de una revisión" },
      purpose: { en: "Show what the team said about a change, oldest first, in a stream that can grow.", es: "Mostrar lo que el equipo dijo sobre un cambio, lo más antiguo primero, en un flujo que puede crecer." },
      content: {
        label: { en: "Comments", es: "Comentarios" },
        comments: [
          { author: "Ana", when: { en: "2 hours ago", es: "hace 2 horas" }, text: { en: "The deploy went well, thanks for reviewing.", es: "El despliegue salió bien, gracias por revisar." } },
          { author: "Bruno", when: { en: "1 hour ago", es: "hace 1 hora" }, text: { en: "I found an edge case in the filter.", es: "Encontré un caso borde en el filtro." } },
        ],
      },
    }),
  ],
};
