import { z } from "zod";
import type { MakerAgentContext } from "@skryensya/maker-model";
import type { Message, ProviderAdapter, ProviderConnection, ToolSpec } from "./providers.js";

/*
 * THE BRIEF: what a request is worth before anything is built. A separate, small model call reads the request and the
 * page it applies to and answers three things: the GOAL in one sentence, a CHECKLIST of outcomes someone could check on
 * the page (every part the request names, so none is forgotten later), and the ASSUMPTIONS it makes. The brief never
 * designs, never writes content and never asks: a name, a price, a claim, a link that is not in the request, the page
 * or the conversation is written down as an assumption and built as a placeholder, never as a fact.
 */
export const briefInput = z.object({
  kind: z.enum(["edit", "build"]),
  goal: z.string().min(1).max(500),
  checklist: z.array(z.string().min(1).max(240)).min(1).max(10),
  /** For a page or a site: its information architecture before anything is built, one entry per section in order. */
  plan: z.array(z.object({ section: z.string().min(1).max(80), role: z.string().min(1).max(40), content: z.string().max(240).default(""), components: z.array(z.string().max(40)).max(8).default([]) }).strict()).max(14).default([]),
  known: z.array(z.string().max(240)).max(10).default([]),
  assumptions: z.array(z.string().max(240)).max(8).default([]),
}).strict();

export type Brief = z.infer<typeof briefInput>;

export const BRIEF_SYSTEM_PROMPT = `You are the briefing step of Skryensya Maker's AI. You build nothing and you never answer in text:
you read a request and the page it applies to, and you call submit_brief exactly once.

kind
- "edit": the request names exactly what to change on what already exists (change this text, remove that block, move it, set
  that option). Its checklist is the one or two things that must be true afterwards.
- "build": anything that adds new content or structure (a page, a section, a site, "improve it", "make it better").

goal: one sentence, in the person's own terms.

checklist: three to eight outcomes someone could verify by looking at the page ("A Hero with a headline, one supporting
sentence and a primary and a secondary button", "The three plans sit side by side", "A footer with the contact line"). Include
EVERY part the request names, so that none is forgotten, and the structure it needs (what sits side by side, what stacks).

NEVER INVENT, NEVER ASK. Content that only the person can supply (the name of the business, what it does, headline claims, features,
prices, testimonials, numbers, contact data, links, images, tone) is not yours to make up. Build the STRUCTURE and leave that content as
clearly marked placeholders, and record each in assumptions ("Headline and plan names are placeholders"). When the request is vague, pick
the likeliest reading from the request, the page and the project, and record that choice in assumptions too.

plan: ONLY for a page or a whole site (kind build and more than one section). The information architecture, decided before anything is
built: one entry per section, in page order, none merged. section is its working name ("Hero", "Pricing"); role is what it is FOR (navigation,
hero, features, steps, pricing, testimonials, faq, cta, contact, footer, content); content is what it says, from the request or as an honest
placeholder; components are the design system's components it will use (Navbar, Hero, Grid, Box, Accordion, Footer...). Every section sits in
a Wrapper, and the page has one h1. Leave plan empty for an edit or a single block.

known: the facts you rely on and where they came from (the request, the page, an earlier answer, the project).

project, when present, is the project's own description by its author: the product, its audience, its tone. What it says is known.`;

const briefSpec = (): ToolSpec => {
  const { $schema: _dialect, ...parameters } = z.toJSONSchema(briefInput) as Record<string, unknown>;
  return { name: "submit_brief", description: "Submit the brief for this request. Call exactly once.", parameters };
};

/** A brief that promises nothing: used when the briefing call fails, so a hiccup never blocks the build. */
/* No checklist: with nothing to check against, nothing is reviewed. */
export const fallbackBrief = (goal: string): Brief => ({ kind: "build", goal: goal.slice(0, 500), checklist: [], plan: [], known: [], assumptions: [] });

export async function makeBrief(args: {
  adapter: ProviderAdapter;
  connection: ProviderConnection;
  signal: AbortSignal;
  intent: string;
  context: MakerAgentContext;
  pageOutline: string;
  history: readonly { content: string; outcome?: string }[];
  /** What the project is, in its author's words: the product, its audience and tone, without being asked. */
  projectPrompt?: string;
}): Promise<Brief> {
  const input = JSON.stringify({
    intent: args.intent,
    ...(args.projectPrompt ? { project: args.projectPrompt } : {}),
    selection: { primary: args.context.selection.primary, selectedIds: args.context.selection.selectedIds },
    pageOutline: args.pageOutline,
    earlier: args.history.slice(-4).map((turn) => ({ intent: turn.content.slice(0, 600), ...(turn.outcome ? { outcome: turn.outcome } : {}) })),
  });
  const messages: Message[] = [{ role: "user", content: input }];
  const reply = await args.adapter.complete(args.connection, BRIEF_SYSTEM_PROMPT, messages, [briefSpec()], args.signal);
  const call = reply.calls.find((entry) => entry.name === "submit_brief");
  if (!call) return fallbackBrief(args.intent);
  let parsed: ReturnType<typeof briefInput.safeParse>;
  try { parsed = briefInput.safeParse(JSON.parse(call.arguments)); } catch { return fallbackBrief(args.intent); }
  if (!parsed.success) return fallbackBrief(args.intent);
  return parsed.data;
}
