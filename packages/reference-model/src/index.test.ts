import { describe, expect, it } from "vitest";
import {
  captureInputSchema,
  ingestSchema,
  classificationSchema,
  mergeClassification,
  confirmClassification,
  transition,
  usageTreeSchema,
  matches,
  filterSchema,
} from "./index.js";
import {
  captureFixture,
  ingestFixture,
  classificationFixture,
} from "./testing.js";
describe("reference evidence and lifecycle", () => {
  it("parses canonical inputs, rejects unknown taxonomy, scripts and malformed trees", () => {
    expect(captureInputSchema.parse(captureFixture()).raw.mode).toBe("region");
    expect(ingestSchema.parse(ingestFixture()).revision).toBe(1);
    expect(() =>
      captureInputSchema.parse({ ...captureFixture(), scripts: ["alert(1)"] }),
    ).toThrow();
    const script = captureFixture();
    script.raw.root.tag = "script";
    script.raw.root.text = "alert(1)";
    expect(() => captureInputSchema.parse(script)).toThrow();
    expect(() =>
      captureInputSchema.parse({
        ...captureFixture(),
        source: { url: "javascript:alert(1)", hostname: "example.com" },
      }),
    ).toThrow();
    expect(() =>
      classificationSchema.parse({
        ...classificationFixture(),
        intent: { value: "made/up/intent", source: "classifier" },
      }),
    ).toThrow();
    expect(() => usageTreeSchema.parse(null)).toThrow();
    expect(() =>
      usageTreeSchema.parse({
        contract: "typography",
        signature: "Text",
        children: { script: "evil" },
      }),
    ).toThrow();
  });
  it("requires explicit acceptance and a verified merged publication", () => {
    const accepted = transition(ingestFixture(), "accepted");
    expect(accepted.status).toBe("accepted");
    expect(() =>
      transition({ ...accepted, classification: undefined }, "publishing"),
    ).toThrow();
    expect(() =>
      transition({ ...ingestFixture(), classification: undefined }, "accepted"),
    ).toThrow();
    expect(() => transition(accepted, "published")).toThrow();
    expect(() =>
      transition(transition(accepted, "publishing"), "published"),
    ).toThrow("merged PR");
    expect(ingestFixture().status).toBe("review");
  });
  it("never overwrites human fields or mutates current/proposed classifications", () => {
    const current = classificationFixture();
    current.subject = { value: "hero", source: "human" };
    const proposal = classificationFixture();
    const result = mergeClassification(current, proposal);
    expect(result.subject).toEqual(current.subject);
    expect(result.intent).toEqual(proposal.intent);
    expect(proposal.subject?.value).toBe("card");
    expect(current.subject?.value).toBe("hero");
  });
  it("explicitly confirms unchanged proposals without inventing human confidence", () => {
    const original = classificationFixture();
    const confirmed = confirmClassification(original);
    expect(confirmed.subject).toEqual({ value: "card", source: "human" });
    expect(original.subject?.source).toBe("classifier");
    expect(
      mergeClassification(
        { ...original, ...confirmed },
        {
          ...original,
          subject: { value: "hero", source: "classifier", confidence: 0.99 },
        },
      ).subject?.value,
    ).toBe("card");
  });
  it("filters by dimensions, dates, confidence, status and publication", () => {
    const i = ingestFixture();
    expect(
      matches(
        i,
        filterSchema.parse({
          subject: "card",
          minConfidence: 0.8,
          inbox: "true",
          published: "false",
        }),
      ),
    ).toBe(true);
    expect(matches(i, filterSchema.parse({ minConfidence: 0.9 }))).toBe(false);
    expect(
      matches(i, filterSchema.parse({ from: "2027-01-01T00:00:00Z" })),
    ).toBe(false);
    expect(matches(i, filterSchema.parse({ intent: "metrics/usage" }))).toBe(
      true,
    );
  });
});
