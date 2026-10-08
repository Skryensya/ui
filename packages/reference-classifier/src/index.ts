import { z } from "zod";
import {
  intents,
  subjects,
  SCALES,
  densities,
  classificationSchema,
  mergeClassification,
  type RawCapture,
  type ReferenceIngest,
  type ReferenceClassification,
} from "@skryensya/reference-model";

export type Choice = { value: string; confidence: number; model: string };
export interface ChoiceBoundary {
  choose(
    state: unknown,
    question: string,
    criteria: Record<string, unknown>,
  ): Promise<Choice>;
}
const answerSchema = z.object({
  model: z.string(),
  answers: z.object({
    category: z.object({
      type: z.literal("choice"),
      choice: z.string(),
      confidence: z.number().min(0).max(1),
      probabilities: z.record(z.string(), z.number().min(0).max(1)),
    }),
  }),
});
/** Narrow HTTP adapter; see https://docs.typesafe.ai/api. No text-generation endpoint. */
export function jevBoundary(
  apiKey: string,
  model = "jev-1.13.0",
  transport: typeof fetch = fetch,
): ChoiceBoundary {
  return {
    async choose(state, question, criteria) {
      const response = await transport("https://api.typesafe.ai/v1/systemone", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          state,
          model,
          questions: {
            category: { type: "choice", instructions: question, criteria },
          },
        }),
        signal: AbortSignal.timeout(30_000),
      });
      // Jev's body says what it rejected (an unknown model, a malformed question); a bare status does not.
      if (!response.ok) {
        const detail = (await response.text().catch(() => "")).slice(0, 500);
        throw new Error(`Jev failed: ${response.status}${detail ? ` ${detail}` : ""}`);
      }
      const result = answerSchema.parse(await response.json());
      if (!Object.hasOwn(criteria, result.answers.category.choice))
        throw new Error("Jev returned an unknown category");
      return {
        value: result.answers.category.choice,
        confidence: result.answers.category.confidence,
        model: result.model,
      };
    },
  };
}
/*
 * WHAT JEV SEES. Jev 1.13 reads at most 64k tokens per request, and TypeSafe's guidance is that
 * accuracy falls as the state fills with detail unrelated to the decision. So the state is a compact
 * outline under a fixed character budget, not the capture: breadth first, so a full page shows all of
 * its sections before any one section's depth; only the attributes and layout styles that say what a
 * node is; integer geometry. The complete capture stays in asset storage for human inspection.
 * Jev counts about a token per character of JSON (a ~250-character request is billed 328 tokens in
 * TypeSafe's own example, and an ~80k-character state was refused), so 32k characters leaves room
 * for each question's criteria inside the 64k window.
 */
export const STATE_BUDGET = 32_000;
const ATTRIBUTES = ["aria-label", "type", "alt", "title", "placeholder", "heading-level"];
const STYLES: Record<string, string[]> = {
  display: ["block", "inline"],
  "flex-direction": ["row"],
  "grid-template-columns": ["none"],
  gap: ["normal", "0px"],
  padding: ["0px"],
  "border-radius": ["0px"],
};
const clip = (value: string, max: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};
type StateNode = {
  parent: number | null;
  tag: string;
  role?: string;
  text?: string;
  attributes?: Record<string, string>;
  layout?: Record<string, string>;
  rect: [number, number, number, number];
};
function stateNode(node: RawCapture["root"], parent: number | null): StateNode {
  const attributes = Object.fromEntries(
    ATTRIBUTES.filter((k) => node.attributes[k]).map((k) => [k, clip(node.attributes[k], 80)]),
  );
  const layout = Object.fromEntries(
    Object.entries(STYLES)
      .map(([k, defaults]) => [k, node.styles[k] ?? "", defaults] as const)
      .filter(([, v, defaults]) => v && !defaults.includes(v))
      .map(([k, v]) => [k, clip(v, 80)]),
  );
  const text = clip(node.text, 160);
  return {
    parent,
    tag: node.tag,
    ...(node.role ? { role: node.role } : {}),
    ...(text ? { text } : {}),
    ...(Object.keys(attributes).length ? { attributes } : {}),
    ...(Object.keys(layout).length ? { layout } : {}),
    rect: [node.rect.x, node.rect.y, node.rect.width, node.rect.height].map(Math.round) as StateNode["rect"],
  };
}
export function classificationState(ingest: ReferenceIngest, raw: RawCapture) {
  const head = {
    source: { hostname: ingest.source.hostname, title: clip(ingest.source.title ?? "", 200) },
    pageTitle: clip(raw.pageTitle ?? "", 200),
    mode: raw.mode,
    viewport: { width: raw.viewport.width, height: raw.viewport.height },
    bounds: Object.fromEntries(Object.entries(raw.bounds).map(([k, v]) => [k, Math.round(v)])),
  };
  const nodes: StateNode[] = [];
  let size = JSON.stringify(head).length + 64;
  const queue: { node: RawCapture["root"]; parent: number | null }[] = [{ node: raw.root, parent: null }];
  let next = 0;
  for (; next < queue.length; next++) {
    const { node, parent } = queue[next];
    const entry = stateNode(node, parent);
    const cost = JSON.stringify(entry).length + 1;
    if (size + cost > STATE_BUDGET) break;
    size += cost;
    const index = nodes.push(entry) - 1;
    for (const child of node.children) queue.push({ node: child, parent: index });
  }
  return { ...head, nodes, evidenceTruncated: raw.truncated || next < queue.length };
}
export interface ReferenceClassifier {
  classify(
    ingest: ReferenceIngest,
    raw: RawCapture,
  ): Promise<ReferenceClassification>;
}
export function createClassifier(
  boundary: ChoiceBoundary,
): ReferenceClassifier {
  return {
    async classify(ingest, raw) {
      const state = classificationState(ingest, raw);
      const choose = async (
        question: string,
        criteria: Record<string, unknown>,
      ) => {
        const result = await boundary.choose(state, question, criteria);
        if (
          !Object.hasOwn(criteria, result.value) ||
          !Number.isFinite(result.confidence) ||
          result.confidence < 0 ||
          result.confidence > 1
        )
          throw new Error("Invalid classifier output");
        return result;
      };
      const domain = await choose(
        "What job domain does this UI serve?",
        Object.fromEntries(
          [...new Set(intents.map((i) => i.id.split("/")[0]))].map((id) => [
            id,
            id,
          ]),
        ),
      );
      const scoped = intents.filter((i) => i.id.startsWith(`${domain.value}/`));
      const area = await choose(
        "Which area within this domain?",
        Object.fromEntries(
          [...new Set(scoped.map((i) => i.id.split("/")[1]))].map((id) => [
            id,
            id,
          ]),
        ),
      );
      const intent = await choose(
        "Which reader job does the UI perform?",
        Object.fromEntries(
          scoped
            .filter((i) => i.id.split("/")[1] === area.value)
            .map((i) => [i.id, i.job]),
        ),
      );
      const [subject, scale, density] = await Promise.all([
        choose(
          "What would a person call this UI?",
          Object.fromEntries(subjects.map((s) => [s.id, s.lede])),
        ),
        choose(
          "How much of a page is captured?",
          Object.fromEntries(SCALES.map((s) => [s, s])),
        ),
        choose(
          "How densely is the content arranged?",
          Object.fromEntries(densities.map((s) => [s, s])),
        ),
      ]);
      const field = (v: Choice) => ({
        value: v.value,
        confidence: v.confidence,
        source: "classifier" as const,
      });
      return mergeClassification(
        ingest.classification,
        classificationSchema.parse({
          subject: field(subject),
          scale: field(scale),
          intent: {
            ...field(intent),
            confidence: Math.min(
              domain.confidence,
              area.confidence,
              intent.confidence,
            ),
          },
          density: field(density),
          classifier: "jev-hierarchical",
          classifierVersion:
            "1; models=" +
            [
              ...new Set(
                [domain, area, intent, subject, scale, density].map(
                  (v) => v.model,
                ),
              ),
            ].join(","),
          updatedAt: new Date().toISOString(),
        }),
      );
    },
  };
}
export { captureToUsageTree, type CaptureTree } from "./usage-tree.js";
