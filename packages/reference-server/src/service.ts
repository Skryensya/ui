import { randomUUID, createHash } from "node:crypto";
import sharp from "sharp";
import {
  captureInputSchema,
  rawCaptureSchema,
  ingestPatchSchema,
  classificationSchema,
  mergeClassification,
  transition,
  type ReferenceIngest,
  type ReferencePublisher,
  type PublicationPreview,
  type PublicationRequest,
  type ReferenceClassification,
} from "@skryensya/reference-model";
import type { ReferenceClassifier } from "@skryensya/reference-classifier";
import { StoreError, type ReferenceStore } from "./store.js";
import type { AssetStore } from "./assets.js";
const now = () => new Date().toISOString();
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, canonical(item)]),
    );
  return value;
}
const hash = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
function structure(
  node: import("@skryensya/reference-model").CapturedNode,
): unknown {
  return {
    tag: node.tag,
    role: node.role,
    display: node.styles.display,
    children: node.children.map(structure),
  };
}
export class ReferenceService {
  private previews = new Map<string, PublicationPreview>();
  constructor(
    readonly store: ReferenceStore,
    readonly assets: AssetStore,
    readonly classifier: ReferenceClassifier,
    readonly publisher: ReferencePublisher,
  ) {}
  async create(value: unknown) {
    const input = captureInputSchema.parse(value),
      id = randomUUID(),
      time = now();
    const screenshotAssetId = `${id}/screenshot.png`,
      thumbnailAssetId = `${id}/thumbnail.png`,
      rawCaptureAssetId = `${id}/capture.json`;
    const screenshot = Buffer.from(input.screenshot.split(",")[1], "base64");
    if (
      !screenshot
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      throw new StoreError(400, "Screenshot must be PNG");
    let thumbnail: Buffer;
    try {
      thumbnail = await sharp(screenshot, { limitInputPixels: 100_000_000 })
        .resize({
          width: 480,
          height: 320,
          fit: "cover",
          position: "top",
          withoutEnlargement: true,
        })
        .png()
        .toBuffer();
    } catch {
      throw new StoreError(
        400,
        "Screenshot cannot be decoded or exceeds pixel limits",
      );
    }
    await this.assets.put(thumbnailAssetId, {
      bytes: thumbnail,
      contentType: "image/png",
    });
    await this.assets.put(screenshotAssetId, {
      bytes: screenshot,
      contentType: "image/png",
    });
    await this.assets.put(rawCaptureAssetId, {
      bytes: Buffer.from(JSON.stringify(input.raw)),
      contentType: "application/json",
    });
    return this.store.create({
      id,
      source: input.source,
      status: "captured",
      capture: {
        viewport: input.raw.viewport,
        capturedAt: input.capturedAt,
        screenshotAssetId,
        thumbnailAssetId,
        rawCaptureAssetId,
        domHash: hash(input.raw.root),
        structureHash: hash(structure(input.raw.root)),
      },
      review: {
        decision: "pending",
        notes: input.notes ?? "",
        updatedAt: time,
      },
      publications: [],
      classificationRuns: [],
      revision: 1,
      createdAt: time,
      updatedAt: time,
    });
  }
  async get(id: string) {
    const i = await this.store.get(id);
    if (!i) throw new StoreError(404, "Ingest not found");
    return i;
  }
  private editable(i: ReferenceIngest) {
    if (["accepted", "publishing", "published"].includes(i.status))
      throw new StoreError(
        409,
        "Return to review before editing an accepted reference",
      );
  }
  async classify(id: string, revision: number) {
    const processing = await this.store.update(id, revision, (i) => ({
      ...transition(i, "processing"),
      processingId: randomUUID(),
    }));
    try {
      const asset = await this.assets.get(processing.capture.rawCaptureAssetId);
      if (!asset) throw new Error("Raw evidence missing");
      const proposal = await this.classifier.classify(
        processing,
        rawCaptureSchema.parse(
          JSON.parse(Buffer.from(asset.bytes).toString("utf8")),
        ),
      );
      const current = await this.get(id);
      return await this.store.update(id, current.revision, (i) => {
        if (i.processingId !== processing.processingId)
          throw new StoreError(409, "Classification job superseded");
        return {
          ...transition(i, "review"),
          processingId: undefined,
          classification: mergeClassification(i.classification, proposal),
          classificationRuns: [
            ...i.classificationRuns,
            { id: randomUUID(), ingestId: id, classification: proposal },
          ],
        };
      });
    } catch (error) {
      const current = await this.get(id);
      if (
        current.status === "processing" &&
        current.processingId === processing.processingId
      )
        await this.store.update(id, current.revision, (i) => ({
          ...transition(i, "review"),
          processingId: undefined,
        }));
      throw error;
    }
  }
  async patch(id: string, value: unknown) {
    const patch = ingestPatchSchema.parse(value);
    for (const field of Object.values(patch.fields ?? {})) {
      if (field?.source !== "human")
        throw new StoreError(400, "Manual changes must be human-owned");
    }
    return this.store.update(id, patch.baseRevision, (i) => {
      this.editable(i);
      return {
        ...i,
        classification: patch.fields
          ? classificationSchema.parse({
              classifier: i.classification?.classifier ?? "human",
              classifierVersion: i.classification?.classifierVersion ?? "1",
              ...i.classification,
              ...patch.fields,
              updatedAt: now(),
            })
          : i.classification,
        review:
          patch.notes !== undefined || patch.rating !== undefined
            ? {
                decision: i.review?.decision ?? "pending",
                notes: patch.notes ?? i.review?.notes ?? "",
                rating: patch.rating ?? i.review?.rating,
                updatedAt: now(),
              }
            : i.review,
      };
    });
  }
  async classification(id: string, revision: number, value: unknown) {
    return this.patch(id, { baseRevision: revision, fields: value });
  }
  async review(id: string, revision: number, notes: string, rating?: number) {
    return this.patch(id, { baseRevision: revision, notes, rating });
  }
  async decide(
    id: string,
    revision: number,
    decision: "accepted" | "rejected" | "review",
  ) {
    return this.store.update(id, revision, (i) => {
      let current = i;
      if (i.status === "captured" && decision === "rejected")
        current = transition(i, "review");
      return {
        ...transition(current, decision),
        processingId: undefined,
        review: {
          ...current.review,
          notes: current.review?.notes ?? "",
          decision: decision === "review" ? "pending" : decision,
          updatedAt: now(),
        },
      };
    });
  }
  async preview(id: string, revision: number, request: PublicationRequest) {
    const i = await this.get(id);
    if (i.revision !== revision) throw new StoreError(409, "Obsolete revision");
    const preview = await this.publisher.preview(i, request);
    if ((await this.get(id)).revision !== revision)
      throw new StoreError(409, "Ingest changed during preview");
    // Bounded ephemeral previews. Durable evidence and publication attempts live in the store.
    if (this.previews.size >= 100)
      this.previews.delete(this.previews.keys().next().value!);
    this.previews.set(preview.digest, structuredClone(preview));
    return preview;
  }
  async publish(id: string, revision: number, digest: string) {
    const preview = this.previews.get(digest);
    if (!preview || preview.ingestId !== id || preview.revision !== revision)
      throw new StoreError(409, "Preview expired or obsolete; preview again");
    if (!preview.validation.valid)
      throw new StoreError(422, "Preview did not pass validation");
    const attemptId = randomUUID(),
      time = now();
    const leased = await this.store.update(id, revision, (i) => ({
      ...transition(i, "publishing"),
      publications: [
        ...i.publications,
        {
          id: attemptId,
          ingestId: id,
          exampleId: preview.exampleId,
          kind: preview.kind,
          branch: `reference/${id}/${attemptId}`,
          generatedFiles: preview.files.map((f) => f.path),
          status: "pending",
          createdAt: time,
          updatedAt: time,
        },
      ],
    }));
    this.previews.delete(digest);
    try {
      const result = await this.publisher.publish(preview, leased, attemptId);
      return await this.store.update(id, leased.revision, (i) => ({
        ...i,
        publications: i.publications.map((p) =>
          p.id === attemptId
            ? { ...p, ...result, status: "pr-open", updatedAt: now() }
            : p,
        ),
      }));
    } catch (e) {
      await this.store.update(id, leased.revision, (i) => ({
        ...transition(i, "accepted"),
        publications: i.publications.map((p) =>
          p.id === attemptId
            ? {
                ...p,
                status: "failed",
                error: e instanceof Error ? e.message : String(e),
                updatedAt: now(),
              }
            : p,
        ),
      }));
      throw e;
    }
  }
  async reconcile(id: string, revision: number, publicationId: string) {
    const i = await this.get(id);
    if (i.revision !== revision) throw new StoreError(409, "Obsolete revision");
    const p = i.publications.find((p) => p.id === publicationId);
    if (
      !p ||
      !["pending", "failed", "pr-open"].includes(p.status) ||
      !["accepted", "publishing"].includes(i.status)
    )
      throw new StoreError(409, "Attempt is not recoverable in this state");
    const receipt = await this.publisher.reconcile(p);
    if (!receipt)
      throw new StoreError(
        409,
        "No pull request found on the recorded branch; inspect the attempt before retrying",
      );
    return this.store.update(id, revision, (current) => ({
      ...(current.status === "accepted"
        ? transition(current, "publishing")
        : current),
      publications: current.publications.map((p) =>
        p.id === publicationId
          ? {
              ...p,
              ...receipt,
              status: "pr-open",
              error: undefined,
              updatedAt: now(),
            }
          : p,
      ),
    }));
  }
  async markMerged(id: string, revision: number, publicationId: string) {
    const i = await this.get(id);
    if (i.revision !== revision) throw new StoreError(409, "Obsolete revision");
    const p = i.publications.find((p) => p.id === publicationId);
    if (!p || p.status !== "pr-open" || !(await this.publisher.merged(p)))
      throw new StoreError(409, "PR is not verified as merged");
    return this.store.update(id, revision, (current) =>
      transition(
        {
          ...current,
          publications: current.publications.map((p) =>
            p.id === publicationId
              ? { ...p, status: "merged", updatedAt: now() }
              : p,
          ),
        },
        "published",
      ),
    );
  }
}
