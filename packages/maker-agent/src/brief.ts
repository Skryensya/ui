import { z } from "zod";
import type { MakerAgentContext } from "@skryensya/maker-model";
import type { Message, ProviderAdapter, ProviderConnection, ToolSpec } from "./providers.js";
import { askedQuestion, type AskedQuestion } from "./questions.js";

/*
 * THE BRIEF: what a request is worth before anything is built. A separate, small model call reads the request and the
 * page it applies to and answers three things: the GOAL in one sentence, a CHECKLIST of outcomes someone could check on
 * the page (every part the request names, so none is forgotten later), and what is MISSING that only the person can
 * supply. The brief never designs and never writes content. Nothing is invented: a name, a price, a claim, a link that
 * is not in the request, the page or the conversation is asked for; when the person has said to just proceed, it is
 * written down as an assumption and built as a placeholder, never as a fact.
 */
export const briefInput = z.object({
  kind: z.enum(["edit", "build"]),
  goal: z.string().min(1).max(500),
  checklist: z.array(z.string().min(1).max(240)).min(1).max(10),
  /** For a page or a site: its information architecture before anything is built, one entry per section in order. */
  plan: z.array(z.object({ section: z.string().min(1).max(80), role: z.string().min(1).max(40), content: z.string().max(240).default(""), components: z.array(z.string().max(40)).max(8).default([]) }).strict()).max(14).default([]),
  known: z.array(z.string().max(240)).max(10).default([]),
  assumptions: z.array(z.string().max(240)).max(8).default([]),
  missing: z.array(askedQuestion).max(3).default([]),
}).strict();

export type Brief = z.infer<typeof briefInput>;

export const BRIEF_SYSTEM_PROMPT = `You are the briefing step of Skryensya Maker's AI. You build nothing and you never answer in text:
you read a request and the page it applies to, and you call submit_brief exactly once.

kind
- "edit": the request names exactly what to change on what already exists (change this text, remove that block, move it, set
  that option). Its checklist is the one or two things that must be true afterwards, and missing is empty.
- "build": anything that adds new content or structure (a page, a section, a site, "improve it", "make it better").

goal: one sentence, in the person's own terms.

checklist: three to eight outcomes someone could verify by looking at the page ("A Hero with a headline, one supporting
sentence and a primary and a secondary button", "The three plans sit side by side", "A footer with the contact line"). Include
EVERY part the request names, so that none is forgotten, and the structure it needs (what sits side by side, what stacks).

NEVER INVENT, BUT ASK LITTLE. Content that only the person can supply (the name of the business, what it does, headline
claims, features, prices, testimonials, numbers, contact data, links, images, tone) is not yours to make up. What you do about it
depends on whether you can build anything useful without it:
- If you can build the STRUCTURE and leave the content as clearly marked placeholders, do that: record each in assumptions
  ("Headline and plan names are placeholders") and do NOT ask. Placeholder text is cheap to replace; a question is not cheap to answer.
  Most requests fall here, including "a pricing section", "a hero", "a landing page for my bakery".
- Ask (put it in missing) ONLY when any build would be a coin flip: the request has no subject, a whole page or site whose purpose or
  audience you cannot tell from anything given, or two readings that would produce very different pages. Those are the only things worth
  interrupting for. At most THREE questions, the fewest that unblock you, each with a recommended answer and named options when a few
  are clear, and only if canAsk is true.
- Never ask for copy, prices, names or numbers, never what pageOutline already shows, nor styling the design system decides well, nor
  anything just to be thorough.
- If canAsk is false (they said to just do it, or you have already asked once), do not ask: assume, as placeholders and never as facts.

plan: ONLY for a page or a whole site (kind build and more than one section). The information architecture, decided before anything is
built: one entry per section, in page order, none merged. section is its working name ("Hero", "Pricing"); role is what it is FOR (navigation,
hero, features, steps, pricing, testimonials, faq, cta, contact, footer, content); content is what it says, from the request or as an honest
placeholder; components are the design system's components it will use (Navbar, Hero, Grid, Box, Accordion, Footer...). Every section sits in
a Wrapper, and the page has one h1. Leave plan empty for an edit or a single block.

known: the facts you rely on and where they came from (the request, the page, an earlier answer).`;

const briefSpec = (): ToolSpec => {
  const { $schema: _dialect, ...parameters } = z.toJSONSchema(briefInput) as Record<string, unknown>;
  return { name: "submit_brief", description: "Submit the brief for this request. Call exactly once.", parameters };
};

/** Phrases that mean "stop asking, proceed": the person has decided to accept the recommendations. */
const PROCEED = /\b(just do it|go ahead|use (my|your|the) recommendations?|hazlo|adelante|usa (tus|mis) recomendaciones)\b/i;

/**
 * THE AI ASKS, BUT NOT FOR EVERYTHING. A question is worth the interruption only when any build would be a coin flip (no
 * subject, an unknowable purpose or audience). Everything that can be a clearly marked placeholder is built as one and named in
 * the answer, and a correction is one more message. One round per request, at most three questions. The switch stays so asking
 * can be turned off in one place.
 */
export const ASKING_ENABLED = true;

export function canAskAgain(content: string, askedBefore: number): boolean {
  return ASKING_ENABLED && askedBefore < 1 && !PROCEED.test(content);
}

/** A brief that asks nothing and promises nothing: used when the briefing call fails, so a hiccup never blocks the build. */
/* No checklist: with nothing to check against, nothing is reviewed. */
export const fallbackBrief = (goal: string): Brief => ({ kind: "build", goal: goal.slice(0, 500), checklist: [], plan: [], known: [], assumptions: [], missing: [] });

export async function makeBrief(args: {
  adapter: ProviderAdapter;
  connection: ProviderConnection;
  signal: AbortSignal;
  intent: string;
  context: MakerAgentContext;
  pageOutline: string;
  history: readonly { content: string; outcome?: string; asked?: boolean }[];
  canAsk: boolean;
}): Promise<Brief> {
  const input = JSON.stringify({
    intent: args.intent,
    canAsk: args.canAsk,
    selection: { primary: args.context.selection.primary, selectedIds: args.context.selection.selectedIds },
    pageOutline: args.pageOutline,
    earlier: args.history.slice(-4).map((turn) => ({ intent: turn.content.slice(0, 600), ...(turn.outcome ? { outcome: turn.outcome } : {}), ...(turn.asked ? { asked: true } : {}) })),
  });
  const messages: Message[] = [{ role: "user", content: input }];
  const reply = await args.adapter.complete(args.connection, BRIEF_SYSTEM_PROMPT, messages, [briefSpec()], args.signal);
  const call = reply.calls.find((entry) => entry.name === "submit_brief");
  if (!call) return fallbackBrief(args.intent);
  let parsed: ReturnType<typeof briefInput.safeParse>;
  try { parsed = briefInput.safeParse(JSON.parse(call.arguments)); } catch { return fallbackBrief(args.intent); }
  if (!parsed.success) return fallbackBrief(args.intent);
  const brief = parsed.data;
  /* A brief may only ask when asking is allowed, and an edit never asks. */
  return args.canAsk && brief.kind === "build" ? brief : { ...brief, missing: [] };
}

export type { AskedQuestion };
