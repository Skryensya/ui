import { expect, it } from "vitest";
import {
  captureFixture,
  classificationFixture,
} from "@skryensya/reference-model/testing";
import type {
  ReferencePublisher,
  ReferenceClassification,
} from "@skryensya/reference-model";
import { ReferenceService } from "./service.js";
import { memoryStore } from "./store.js";
import { memoryAssets } from "./assets.js";
const publisher: ReferencePublisher = {
  async preview(i, r) {
    return {
      ingestId: i.id,
      revision: i.revision,
      exampleId: r.exampleId,
      kind: r.kind,
      baseSha: "sha",
      files: [
        {
          path: "contracts/examples/fixed/reference-fixture.ts",
          content: "curated",
        },
      ],
      digest: "digest",
      validation: { valid: true, output: "passed" },
    };
  },
  async validate() {
    return { valid: true, output: "passed" };
  },
  async publish() {
    throw new Error("Lost response after PR creation");
  },
  async merged() {
    return true;
  },
  async reconcile(p) {
    return {
      branch: p.branch!,
      commitSha: "commit",
      prNumber: 9,
      prUrl: "https://github.com/test/repo/pull/9",
    };
  },
};
it("recovers a GitHub receipt without creating another PR or silently marking published", async () => {
  const s = new ReferenceService(
    memoryStore(),
    memoryAssets(),
    {
      async classify() {
        return classificationFixture();
      },
    },
    publisher,
  );
  let i = await s.create(captureFixture());
  i = await s.classify(i.id, i.revision);
  i = await s.decide(i.id, i.revision, "accepted");
  await s.preview(i.id, i.revision, {
    kind: "fixed",
    exampleId: "fixture",
    title: { en: "Fixture", es: "Ejemplo" },
    purpose: { en: "Show", es: "Mostrar" },
  });
  await expect(s.publish(i.id, i.revision, "digest")).rejects.toThrow(
    "Lost response",
  );
  i = await s.get(i.id);
  i = await s.reconcile(i.id, i.revision, i.publications[0].id);
  expect(i.status).toBe("publishing");
  expect(i.publications[0].prNumber).toBe(9);
  expect(i.publications[0].status).toBe("pr-open");
});
it("does not apply a superseded classifier run to a newer processing job", async () => {
  const proposals: ((c: ReferenceClassification) => void)[] = [];
  const s = new ReferenceService(
    memoryStore(),
    memoryAssets(),
    { classify: async () => new Promise((resolve) => proposals.push(resolve)) },
    publisher,
  );
  const created = await s.create(captureFixture()),
    first = s.classify(created.id, created.revision);
  // Attach a rejection handler before resolving the obsolete job.
  const rejected = expect(first).rejects.toThrow("superseded");
  while (proposals.length < 1) await new Promise((r) => setTimeout(r, 0));
  let i = await s.get(created.id);
  i = await s.decide(i.id, i.revision, "review");
  const second = s.classify(i.id, i.revision);
  while (proposals.length < 2) await new Promise((r) => setTimeout(r, 0));
  proposals[0](classificationFixture());
  await rejected;
  expect((await s.get(i.id)).status).toBe("processing");
  proposals[1](classificationFixture());
  expect((await second).status).toBe("review");
});
it("makes exact fingerprints insensitive to JSON object key order, while structure ignores copy", async () => {
  const s = new ReferenceService(
    memoryStore(),
    memoryAssets(),
    {
      async classify() {
        return classificationFixture();
      },
    },
    publisher,
  );
  const a = captureFixture(),
    b = captureFixture();
  a.raw.root.styles = { display: "flex", gap: "8px" };
  b.raw.root.styles = { gap: "8px", display: "flex" };
  const first = await s.create(a),
    second = await s.create(b);
  expect(first.capture.domHash).toBe(second.capture.domHash);
  b.raw.root.text = "A different meaning";
  const third = await s.create(b);
  expect(first.capture.structureHash).toBe(third.capture.structureHash);
  expect(first.capture.domHash).not.toBe(third.capture.domHash);
});
