import { expect, it } from "vitest";
import { createClassifier, jevBoundary, type ChoiceBoundary } from "./index.js";
import {
  captureFixture,
  ingestFixture,
} from "@skryensya/reference-model/testing";
it("hierarchically narrows intent and preserves human decisions", async () => {
  const calls: string[][] = [];
  const boundary: ChoiceBoundary = {
    async choose(_state, question, criteria) {
      calls.push(Object.keys(criteria));
      const value = question.includes("job domain")
        ? "metrics"
        : question.includes("area")
          ? "usage"
          : question.includes("reader")
            ? "metrics/usage/quota"
            : question.includes("person")
              ? "card"
              : question.includes("much")
                ? "component"
                : "compact";
      return { value, confidence: 0.9, model: "jev-test" };
    },
  };
  const ingest = ingestFixture();
  ingest.classification!.subject = { value: "hero", source: "human" };
  const result = await createClassifier(boundary).classify(
    ingest,
    captureFixture().raw,
  );
  expect(result.subject?.value).toBe("hero");
  expect(result.intent?.value).toBe("metrics/usage/quota");
  expect(calls[1]).not.toContain("access");
  expect(calls[2].every((s) => s.startsWith("metrics/usage/"))).toBe(true);
  expect(result.classifier).toBe("jev-hierarchical");
  expect(result.classifierVersion).toBe("1; models=jev-test");
});
it("rejects invalid outputs at an injected boundary", async () => {
  const boundary: ChoiceBoundary = {
    async choose() {
      return { value: "invented", confidence: 1, model: "test" };
    },
  };
  await expect(
    createClassifier(boundary).classify(ingestFixture(), captureFixture().raw),
  ).rejects.toThrow("Invalid classifier");
});
it("uses the documented Jev answers.choice HTTP protocol and validates confidence", async () => {
  const transport: typeof fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    expect(body.questions.category.type).toBe("choice");
    expect(body.model).toBe("jev-test");
    return Response.json({
      model: "jev-test",
      answers: {
        category: {
          type: "choice",
          choice: "card",
          probabilities: { card: 1 },
          confidence: 0.95,
        },
      },
    });
  };
  expect(
    (
      await jevBoundary("key", "jev-test", transport).choose({}, "subject?", {
        card: "Card",
      })
    ).value,
  ).toBe("card");
  await expect(
    jevBoundary("key", "jev-test", transport).choose({}, "subject?", {
      table: "Table",
    }),
  ).rejects.toThrow("unknown category");
  await expect(
    jevBoundary(
      "key",
      "jev-test",
      async () => new Response("failure", { status: 503 }),
    ).choose({}, "subject?", {}),
  ).rejects.toThrow("503");
});
