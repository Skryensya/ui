import { expect, it } from "vitest";
import { classificationState, createClassifier, jevBoundary, STATE_BUDGET, type ChoiceBoundary } from "./index.js";
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
it("reports what Jev rejected, not only the status", async () => {
  const boundary = jevBoundary(
    "key",
    "jev-unknown",
    async () => new Response('{"error":"unknown model jev-unknown"}', { status: 400 }),
  );
  await expect(boundary.choose({}, "Which?", { a: "a" })).rejects.toThrow(
    'Jev failed: 400 {"error":"unknown model jev-unknown"}',
  );
});

type Node = ReturnType<typeof captureFixture>["raw"]["root"];
const node = (tag: string, children: Node[] = [], text = ""): Node => ({
  tag,
  attributes: { "aria-label": "x".repeat(4000), href: "https://example.com/" + "p".repeat(4000) },
  text,
  styles: { display: "flex", gap: "12.5px", color: "rgb(0, 0, 0)" },
  rect: { x: 10.123456, y: 20.987654, width: 300.5, height: 40.25 },
  children,
});
it("keeps a huge page under Jev's budget and outlines every section before any one's depth", () => {
  const deep = (depth: number): Node => node("div", depth ? [deep(depth - 1), deep(depth - 1)] : [], "t".repeat(2000));
  const sections = Array.from({ length: 8 }, (_, i) => node("section", [deep(10)], `Section ${i}`));
  const raw = { ...captureFixture().raw, mode: "page" as const, root: node("body", sections) };
  const state = classificationState(ingestFixture(), raw);
  expect(JSON.stringify(state).length).toBeLessThanOrEqual(STATE_BUDGET);
  expect(state.evidenceTruncated).toBe(true);
  expect(state.nodes.filter((n) => n.tag === "section")).toHaveLength(8);
  const first = state.nodes[1];
  expect(first.attributes?.["aria-label"].length).toBeLessThanOrEqual(80);
  expect(first.attributes).not.toHaveProperty("href");
  expect(first.layout).toEqual({ display: "flex", gap: "12.5px" });
  expect(first.rect).toEqual([10, 21, 301, 40]);
});
it("sends the whole capture when it fits", () => {
  const state = classificationState(ingestFixture(), captureFixture().raw);
  expect(state.nodes).toHaveLength(1);
  expect(state.evidenceTruncated).toBe(false);
});
