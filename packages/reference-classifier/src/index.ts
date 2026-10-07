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
  model = "jev-1.13",
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
      if (!response.ok) throw new Error(`Jev failed: ${response.status}`);
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
      // Classification sees bounded semantic evidence, not an unbounded page/style dump.
      // The complete original capture remains in asset storage for human inspection.
      const nodes: unknown[] = [];
      let textBudget = 12_000;
      function collect(node: RawCapture["root"], parent: number | null) {
        if (nodes.length >= 300) return;
        const index = nodes.length;
        const text = node.text.slice(0, Math.min(400, textBudget));
        textBudget -= text.length;
        nodes.push({
          parent,
          tag: node.tag,
          role: node.role,
          text,
          attributes: Object.fromEntries(
            Object.entries(node.attributes)
              .slice(0, 20)
              .map(([k, v]) => [k, v.slice(0, 200)]),
          ),
          styles: Object.fromEntries(
            [
              "display",
              "flex-direction",
              "grid-template-columns",
              "gap",
              "padding",
              "border-radius",
            ].map((k) => [k, node.styles[k]]),
          ),
          rect: node.rect,
        });
        for (const child of node.children) {
          if (nodes.length >= 300) break;
          collect(child, index);
        }
      }
      collect(raw.root, null);
      const state = {
        source: ingest.source,
        pageTitle: raw.pageTitle,
        mode: raw.mode,
        viewport: raw.viewport,
        bounds: raw.bounds,
        nodes,
        evidenceTruncated: raw.truncated || nodes.length >= 300,
      };
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
