import { z } from "zod";

/*
 * A ROUND OF QUESTIONS, put to the person before anything is built. The agent interviews the way a design review does:
 * every decision it cannot settle from the page, the contracts or the conversation is one question, each with the
 * answer it recommends, and the whole frontier of questions that do not depend on each other goes out in ONE round.
 * Facts it can read (the outline, a contract) are never asked; only decisions are. The round ends the turn, and the
 * person's answers come back as the next message.
 */
export const askedQuestion = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(1200).optional(),
  /** Named alternatives, when there are a few clear ones. Without them the question is answered in words. */
  options: z.array(z.string().min(1).max(160)).min(2).max(6).optional(),
  /** What the agent would choose, and the person can accept with one click: one of the options, or a short answer. */
  recommended: z.string().min(1).max(300),
}).strict();

export const askInput = z.object({ questions: z.array(askedQuestion).min(1).max(6) }).strict();

export type AskedQuestion = z.infer<typeof askedQuestion>;

/** The round as plain text: what the agent said, kept in the conversation so the next turn knows what was asked. */
export function questionsText(questions: readonly AskedQuestion[]): string {
  return [
    `Before I build this, ${questions.length === 1 ? "one question" : `${questions.length} questions`}:`,
    ...questions.map((q, i) => `Q${i + 1} ${q.title}${q.body ? `: ${q.body}` : ""}${q.options ? ` Options: ${q.options.join(" / ")}.` : ""} (I would: ${q.recommended})`),
  ].join("\n");
}
