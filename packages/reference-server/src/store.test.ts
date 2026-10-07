import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ReferenceService } from "./service.js";
import { memoryAssets } from "./assets.js";
import {
  captureFixture,
  classificationFixture,
} from "@skryensya/reference-model/testing";
import { ingestFixture, timestamp } from "@skryensya/reference-model/testing";
import { filterSchema, transition } from "@skryensya/reference-model";
import { memoryStore, postgresStore, type ReferenceStore } from "./store.js";
for (const kind of ["memory", "postgres"] as const) {
  describe.skipIf(
    kind === "postgres" && !process.env.REFERENCE_TEST_DATABASE_URL,
  )(`${kind} semantic parity`, () => {
    let store: ReferenceStore;
    const ids: string[] = [];
    beforeAll(async () => {
      store =
        kind === "memory"
          ? memoryStore()
          : await postgresStore(process.env.REFERENCE_TEST_DATABASE_URL!);
    });
    afterAll(async () => {
      for (const id of ids) {
        const i = await store.get(id);
        if (i) await store.remove(id, i.revision);
      }
      await store.close();
    });
    it("creates, filters, isolates returned records, preserves provenance and rejects obsolete revisions", async () => {
      const i = { ...ingestFixture(), id: randomUUID() };
      ids.push(i.id);
      await store.create(i);
      await expect(store.create(i)).rejects.toMatchObject({ status: 409 });
      const read = await store.get(i.id);
      expect(read).toEqual(i);
      read!.source.hostname = "changed";
      expect((await store.get(i.id))!.source.hostname).toBe("example.com");
      const next = await store.update(i.id, 1, (current) => ({
        ...current,
        classification: {
          ...current.classification!,
          subject: { value: "hero", source: "human" },
        },
      }));
      expect(next.revision).toBe(2);
      await expect(
        store.update(i.id, 1, (current) => current),
      ).rejects.toMatchObject({ status: 409 });
      await expect(store.remove(i.id, 1)).rejects.toMatchObject({
        status: 409,
      });
      const found = await store.list(
        filterSchema.parse({
          host: "example.com",
          subject: "hero",
          from: timestamp,
          to: timestamp,
          published: "false",
        }),
      );
      expect(found.some((r) => r.id === i.id)).toBe(true);
      expect(
        (
          await store.list(
            filterSchema.parse({ status: "accepted", host: "example.com" }),
          )
        ).some((r) => r.id === i.id),
      ).toBe(false);
      expect((await store.get(i.id))?.classification?.subject?.source).toBe(
        "human",
      );
    });
    it("atomically enforces accept/reject and persists multiple publication attempts", async () => {
      const i = { ...ingestFixture(), id: randomUUID() };
      ids.push(i.id);
      await store.create(i);
      const results = await Promise.allSettled([
        store.update(i.id, 1, (i) => transition(i, "accepted")),
        store.update(i.id, 1, (i) => transition(i, "rejected")),
      ]);
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      const current = (await store.get(i.id))!;
      const pub = {
        id: randomUUID(),
        ingestId: i.id,
        exampleId: "curated-reference",
        kind: "fixed" as const,
        generatedFiles: [
          "contracts/examples/fixed/reference-curated-reference.ts",
        ],
        status: "failed" as const,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await store.update(i.id, current.revision, (i) => ({
        ...i,
        publications: [pub, { ...pub, id: randomUUID(), status: "pending" }],
      }));
      expect((await store.get(i.id))!.publications).toHaveLength(2);
    });
    it("orchestrates persisted capture through classification, review and PR receipt", async () => {
      const service = new ReferenceService(
        store,
        memoryAssets(),
        {
          async classify() {
            return classificationFixture();
          },
        },
        {
          async preview(i, r) {
            return {
              ingestId: i.id,
              revision: i.revision,
              exampleId: r.exampleId,
              kind: r.kind,
              baseSha: "sha",
              digest: "digest",
              files: [
                {
                  path: "contracts/examples/fixed/reference-parity.ts",
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
              branch: "reference/parity",
              commitSha: "commit",
              prNumber: 123,
              prUrl: "https://github.com/test/repo/pull/123",
            };
          },
          async merged() {
            return true;
          },
          async reconcile() {
            return undefined;
          },
        },
      );
      let i = await service.create(captureFixture());
      ids.push(i.id);
      i = await service.classify(i.id, i.revision);
      const baseRevision = i.revision;
      i = await service.patch(i.id, {
        baseRevision,
        fields: {
          subject: { value: "hero", source: "human" },
          traits: { value: ["media-led", "dark"], source: "human" },
        },
        notes: "Curated evidence",
        rating: 4,
      });
      expect(i.revision).toBe(baseRevision + 1);
      i = await service.decide(i.id, i.revision, "accepted");
      await service.preview(i.id, i.revision, {
        kind: "fixed",
        exampleId: "parity",
        title: { en: "Parity", es: "Paridad" },
        purpose: { en: "Show", es: "Mostrar" },
      });
      i = await service.publish(i.id, i.revision, "digest");
      const read = (await store.get(i.id))!;
      expect(read.publications[0]).toMatchObject({
        prNumber: 123,
        commitSha: "commit",
        branch: "reference/parity",
        status: "pr-open",
      });
      expect(read.classification?.subject?.source).toBe("human");
      expect(read.classification?.traits?.value).toEqual(["media-led", "dark"]);
      expect(read.review).toMatchObject({
        notes: "Curated evidence",
        rating: 4,
        decision: "accepted",
      });
      expect(read.classificationRuns).toHaveLength(1);
      await expect(
        store.update(i.id, i.revision, (current) => ({
          ...current,
          classificationRuns: [],
        })),
      ).rejects.toMatchObject({ status: 400 });
      i = await service.markMerged(i.id, i.revision, i.publications[0].id);
      expect((await store.get(i.id))!.status).toBe("published");
      expect(
        await service.assets.get(i.capture.rawCaptureAssetId),
      ).toBeDefined();
    });
    it("notifies subscribers after committed writes", async () => {
      const i = { ...ingestFixture(), id: randomUUID() };
      ids.push(i.id);
      const event = new Promise<{ id: string; revision: number | null }>(
        (resolve) => {
          const stop = store.subscribe((e) => {
            if (e.id === i.id) {
              stop();
              resolve(e);
            }
          });
        },
      );
      await store.create(i);
      expect(await event).toEqual({ id: i.id, revision: 1 });
    });
  });
}
