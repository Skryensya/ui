import { expect, it, vi } from "vitest";
import {
  captureFixture,
  classificationFixture,
} from "@skryensya/reference-model/testing";
import type { ReferencePublisher } from "@skryensya/reference-model";
import { ReferenceService } from "./service.js";
import { memoryStore } from "./store.js";
import { memoryAssets, filesystemAssets, s3Assets } from "./assets.js";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const publisher: ReferencePublisher = {
  async preview(i, r) {
    return {
      ingestId: i.id,
      revision: i.revision,
      exampleId: r.exampleId,
      kind: r.kind,
      baseSha: "a".repeat(40),
      digest: "digest",
      files: [
        {
          path: "contracts/examples/fixed/reference-fixture.ts",
          content: "curated",
        },
      ],
      validation: { valid: true, output: "passed" },
    };
  },
  async validate() {
    return { valid: true, output: "passed" };
  },
  async publish() {
    return {
      branch: "reference/test",
      commitSha: "sha",
      prNumber: 1,
      prUrl: "https://github.com/test/repo/pull/1",
    };
  },
  async merged() {
    return true;
  },
  async reconcile() {
    return undefined;
  },
};
function fixture(pub = publisher) {
  const store = memoryStore(),
    assets = memoryAssets();
  return new ReferenceService(
    store,
    assets,
    {
      async classify() {
        return classificationFixture();
      },
    },
    pub,
  );
}
it("keeps capture, classification, review and publication separate through the complete workflow", async () => {
  const s = fixture();
  let i = await s.create(captureFixture());
  expect(i.status).toBe("captured");
  expect(await s.assets.get(i.capture.rawCaptureAssetId)).toBeDefined();
  i = await s.classify(i.id, i.revision);
  expect(i.status).toBe("review");
  i = await s.classification(i.id, i.revision, {
    subject: { value: "hero", source: "human" },
  });
  i = await s.classify(i.id, i.revision);
  expect(i.classification?.subject).toEqual({ value: "hero", source: "human" });
  i = await s.decide(i.id, i.revision, "accepted");
  await expect(
    s.classification(i.id, i.revision, {
      subject: { value: "card", source: "human" },
    }),
  ).rejects.toMatchObject({ status: 409 });
  const preview = await s.preview(i.id, i.revision, {
    kind: "fixed",
    exampleId: "fixture",
    title: { en: "Fixture", es: "Ejemplo" },
    purpose: { en: "Inspect", es: "Inspeccionar" },
  });
  i = await s.publish(i.id, i.revision, preview.digest);
  expect(i.status).toBe("publishing");
  expect(i.publications[0].status).toBe("pr-open");
  i = await s.markMerged(i.id, i.revision, i.publications[0].id);
  expect(i.status).toBe("published");
  expect(await s.assets.get(i.capture.rawCaptureAssetId)).toBeDefined();
});
it("enforces one publication lease, records failures, and prevents stale previews", async () => {
  const fail = vi.fn(async () => {
    throw new Error("GitHub unavailable");
  });
  const s = fixture({ ...publisher, publish: fail });
  let i = await s.create(captureFixture());
  i = await s.classify(i.id, i.revision);
  i = await s.decide(i.id, i.revision, "accepted");
  const request = {
    kind: "fixed" as const,
    exampleId: "fixture",
    title: { en: "Fixture", es: "Ejemplo" },
    purpose: { en: "Inspect", es: "Inspeccionar" },
  };
  await s.preview(i.id, i.revision, request);
  const attempts = await Promise.allSettled([
    s.publish(i.id, i.revision, "digest"),
    s.publish(i.id, i.revision, "digest"),
  ]);
  expect(attempts.every((r) => r.status === "rejected")).toBe(true);
  expect(fail).toHaveBeenCalledOnce();
  i = await s.get(i.id);
  expect(i.status).toBe("accepted");
  expect(i.publications[0].status).toBe("failed");
  await s.preview(i.id, i.revision, request);
  await s.decide(i.id, i.revision, "review");
  await expect(s.publish(i.id, i.revision, "digest")).rejects.toMatchObject({
    status: 409,
  });
});
it("rejects synthetic classifier provenance in manual writes and allows rejection/re-review", async () => {
  const s = fixture();
  let i = await s.create(captureFixture());
  await expect(
    s.classification(i.id, i.revision, {
      subject: { value: "card", source: "classifier" },
    }),
  ).rejects.toMatchObject({ status: 400 });
  i = await s.decide(i.id, i.revision, "rejected");
  expect(i.review?.decision).toBe("rejected");
  i = await s.decide(i.id, i.revision, "review");
  expect(i.review?.decision).toBe("pending");
});
it("persists filesystem assets separately, rejects traversal and signs S3/R2 requests", async () => {
  const dir = await mkdtemp(join(tmpdir(), "reference-assets-test-"));
  try {
    const a = filesystemAssets(dir);
    await a.put("test/raw.json", {
      bytes: new TextEncoder().encode("{}"),
      contentType: "application/json",
    });
    expect(await a.get("test/raw.json")).toBeDefined();
    await expect(a.get("../secret.json")).rejects.toThrow("Invalid asset");
    await expect(a.get("/tmp/secret.json")).rejects.toThrow("Invalid asset");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  const transport: typeof fetch = async (_url, init) => {
    expect((init!.headers as Record<string, string>).authorization).toContain(
      "AWS4-HMAC-SHA256",
    );
    return new Response("{}", { status: 200 });
  };
  expect(
    await s3Assets(
      {
        endpoint: "https://account.r2.cloudflarestorage.com",
        bucket: "references",
        region: "auto",
        accessKeyId: "test",
        secretAccessKey: "secret",
      },
      transport,
    ).get("test/raw.json"),
  ).toBeDefined();
});
