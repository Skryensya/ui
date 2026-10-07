import { expect, it } from "vitest";
import { captureFixture } from "@skryensya/reference-model/testing";
import { createIntegrations } from "./integrations.js";
import { memoryStore } from "./store.js";
import { memoryAssets } from "./assets.js";
import { ReferenceService } from "./service.js";

it("collects, manually classifies and accepts without Jev or GitHub credentials", async () => {
  const integrations = createIntegrations({});
  expect(integrations.classifyOnCapture).toBe(false);
  expect(createIntegrations({ TYPESAFE_API_KEY: "key" }).classifyOnCapture).toBe(true);
  const service = new ReferenceService(
    memoryStore(),
    memoryAssets(),
    integrations.classifier,
    integrations.publisher,
  );
  let ingest = await service.create(captureFixture());
  expect(ingest.status).toBe("captured");
  expect(
    await service.assets.get(ingest.capture.screenshotAssetId),
  ).toBeDefined();
  await expect(
    service.classify(ingest.id, ingest.revision),
  ).rejects.toMatchObject({ status: 503 });
  ingest = await service.get(ingest.id);
  expect(ingest.status).toBe("review");
  ingest = await service.classification(ingest.id, ingest.revision, {
    subject: { value: "card", source: "human" },
    scale: { value: "component", source: "human" },
    intent: { value: "metrics/usage/quota", source: "human" },
  });
  ingest = await service.decide(ingest.id, ingest.revision, "accepted");
  expect(ingest.status).toBe("accepted");
  await expect(
    service.preview(ingest.id, ingest.revision, {
      kind: "fixed",
      exampleId: "collection-only",
      title: { en: "Reference", es: "Referencia" },
      purpose: { en: "Review", es: "Revisión" },
      tree: { contract: "Text", signature: "body", children: "Curated" },
    }),
  ).rejects.toMatchObject({ status: 503 });
  expect((await service.get(ingest.id)).publications).toEqual([]);
  expect((await service.get(ingest.id)).status).toBe("accepted");
});
it("enables configured integrations without contacting providers at startup", () => {
  expect(
    createIntegrations({
      TYPESAFE_API_KEY: "test",
      REFERENCE_GITHUB_TOKEN: "test",
      REFERENCE_GITHUB_OWNER: "org",
      REFERENCE_GITHUB_REPO: "repo",
    }).publisher,
  ).toBeDefined();
  expect(() => createIntegrations({ REFERENCE_GITHUB_TOKEN: "test" })).toThrow(
    "REFERENCE_GITHUB_OWNER is required",
  );
});
