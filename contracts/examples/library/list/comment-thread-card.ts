import { definePattern, type PatternModule } from "../../model/types.js";
import type { UsageTree } from "@skryensya/core/usage-tree";
import { avatar, surface, titleBlock, type Person } from "../kit.js";

interface Entry {
  person: Person;
  time: string;
  body: string;
  /** Replies nest: each one is an entry of its own. */
  replies?: Entry[];
}
interface Content {
  title: string;
  subtitle: string;
  /** The thread's accessible name. */
  label: string;
  hideReplies: string;
  comments: Entry[];
}

const comment = (entry: Entry, id: string, hideReplies: string): UsageTree => ({
  contract: "comment-thread",
  signature: "Comment",
  options: { commentId: id, ...(entry.replies?.length ? { collapsible: true, collapseLabel: hideReplies } : {}) },
  slots: {
    avatar: avatar(entry.person, "sm"),
    author: entry.person.name,
    timestamp: entry.time,
    children: entry.body,
    ...(entry.replies?.length ? { replies: entry.replies.map((reply, index) => comment(reply, `${id}-${index + 1}`, hideReplies)) } : {}),
  },
});

const { pattern, use } = definePattern<Content>({
  id: "comment-thread-card",
  subject: "list",
  scale: "component",
  title: { en: "Comment thread card", es: "Card con hilo de comentarios" },
  layout: { en: "A title block over a CommentThread: each comment has its avatar, author, time and text, and replies nest under the one they answer.", es: "Un bloque de título sobre un CommentThread: cada comentario tiene su avatar, autor, hora y texto, y las respuestas se anidan bajo el que responden." },
  fields: { title: { en: "What the conversation is about.", es: "De qué trata la conversación." }, subtitle: { en: "One line of context.", es: "Una línea de contexto." }, label: { en: "The thread's accessible name.", es: "El nombre accesible del hilo." }, hideReplies: { en: "The fold control's accessible name.", es: "El nombre accesible del control de plegado." }, comments: { en: "The comments, top to bottom; a comment with replies folds.", es: "Los comentarios, de arriba abajo; un comentario con respuestas se pliega." } },
  notes: [{ en: "Replies are real nesting, not flat entries that name who they answer: the thread line follows the structure.", es: "Las respuestas son anidación real, no entradas planas que nombran a quién responden: la línea del hilo sigue la estructura." }],
  build: ({ title, subtitle, label, hideReplies, comments }, ctx) =>
    surface([
      titleBlock(title, subtitle),
      { contract: "comment-thread", signature: "CommentThread", options: { label }, slots: { children: comments.map((entry, index) => comment(entry, `${ctx.ns}-${index + 1}`, hideReplies)) } },
    ]),
});

const fold = { en: "Hide replies", es: "Ocultar respuestas" };
const MARTA = { name: "Marta Ruiz", initials: "MR" };
const TOMAS = { name: "Tomás Vidal", initials: "TV" };
const LUCIA = { name: "Lucía Paredes", initials: "LP" };
const INES = { name: "Inés Calvo", initials: "IC" };

export const commentThreadCard: PatternModule<Content> = {
  pattern,
  uses: [
    use({
      id: "thread-article",
      intent: "collaboration/messages/article-discussion",
      title: { en: "Article discussion", es: "Discusión de un artículo" },
      purpose: { en: "Readers answer an article and each other, with replies under what they answer.", es: "Las personas lectoras responden a un artículo y entre ellas, con las respuestas bajo lo que responden." },
      content: { title: { en: "Comments", es: "Comentarios" }, subtitle: { en: "3 comments on “Why we rewrote our onboarding”", es: "3 comentarios en «Por qué reescribimos nuestro onboarding»" }, label: { en: "Article comments", es: "Comentarios del artículo" }, hideReplies: fold, comments: [{ person: MARTA, time: { en: "2 hours ago", es: "hace 2 horas" }, body: { en: "The part about removing the third step matches what we saw: people did not miss it.", es: "La parte de quitar el tercer paso coincide con lo que vimos: nadie lo echó de menos." }, replies: [{ person: TOMAS, time: { en: "1 hour ago", es: "hace 1 hora" }, body: { en: "Did you measure drop-off before and after, or only completion?", es: "¿Medisteis el abandono antes y después, o solo la finalización?" } }] }, { person: LUCIA, time: { en: "40 minutes ago", es: "hace 40 minutos" }, body: { en: "Thanks for sharing the numbers. It is rare to see them.", es: "Gracias por compartir las cifras. Es raro verlas." } }] },
    }),
    use({
      id: "thread-support",
      intent: "collaboration/messages/support-thread",
      title: { en: "Support thread", es: "Hilo de soporte" },
      purpose: { en: "A customer's question and the team's answer, readable as one exchange.", es: "La pregunta de un cliente y la respuesta del equipo, legibles como un solo intercambio." },
      content: { title: { en: "Ticket #2041", es: "Ticket n.º 2041" }, subtitle: { en: "Invoice shows the wrong tax rate", es: "La factura muestra un impuesto incorrecto" }, label: { en: "Ticket conversation", es: "Conversación del ticket" }, hideReplies: fold, comments: [{ person: LUCIA, time: { en: "Monday, 9:12", es: "Lunes, 9:12" }, body: { en: "Our October invoice charges 21% and we are exempt. Can you correct it?", es: "Nuestra factura de octubre cobra el 21 % y estamos exentos. ¿Pueden corregirla?" }, replies: [{ person: TOMAS, time: { en: "Monday, 9:40", es: "Lunes, 9:40" }, body: { en: "Sorry about that. I have reissued it with the exemption applied; you will get it by email in a minute.", es: "Disculpa. La reemití con la exención aplicada; te llegará por correo en un minuto." } }] }] },
    }),
  ],
};
