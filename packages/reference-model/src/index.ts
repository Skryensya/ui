import { z } from "zod";
import {
  subjects,
  hasIntent,
  type IntentId,
} from "@skryensya/examples/taxonomy";
import { SCALES, type SubjectId } from "@skryensya/examples/types";
import type {
  UsageTree,
  SlotContent,
  ItemInput,
} from "@skryensya/core/usage-tree";

export { subjects, intents, intentTree } from "@skryensya/examples/taxonomy";
export { SCALES } from "@skryensya/examples/types";
export const statuses = [
  "captured",
  "processing",
  "review",
  "accepted",
  "rejected",
  "publishing",
  "published",
] as const;
export const statusSchema = z.enum(statuses);
export type IngestStatus = z.infer<typeof statusSchema>;
export type ClassificationSource = "classifier" | "human";
export type ClassifiedValue<T> = {
  value: T;
  source: ClassificationSource;
  confidence?: number;
};
export const densities = ["compact", "default", "comfortable"] as const;
export const traits = [
  "media-led",
  "text-led",
  "interactive",
  "data-dense",
  "bordered",
  "dark",
  "responsive",
] as const;
export const subjectSchema = z.custom<SubjectId>(
  (s) => typeof s === "string" && subjects.some((x) => x.id === s),
  "Unknown catalogue subject",
);
export const intentSchema = z.custom<IntentId>(
  (s) => typeof s === "string" && hasIntent(s),
  "Unknown catalogue intent",
);
const classified = <T extends z.ZodType>(value: T) =>
  z
    .object({
      value,
      source: z.enum(["classifier", "human"]),
      confidence: z.number().min(0).max(1).optional(),
    })
    .strict();
export const classificationFields = z
  .object({
    subject: classified(subjectSchema).optional(),
    scale: classified(
      z.enum(SCALES as ["fragment", "component", "composition", "page"]),
    ).optional(),
    intent: classified(intentSchema).optional(),
    density: classified(z.enum(densities)).optional(),
    traits: classified(z.array(z.enum(traits))).optional(),
  })
  .strict();
export const classificationSchema = classificationFields.extend({
  classifier: z.string(),
  classifierVersion: z.string(),
  updatedAt: z.iso.datetime(),
});
export type ReferenceClassification = z.infer<typeof classificationSchema>;
export type ClassificationFields = z.infer<typeof classificationFields>;
/** Explicit confirmation, including unchanged proposals, gives the selected values human ownership. */
export function confirmClassification(
  fields: ClassificationFields,
): ClassificationFields {
  return classificationFields.parse(
    Object.fromEntries(
      ["subject", "scale", "intent", "density", "traits"].flatMap((key) => {
        const value = fields[key as keyof ClassificationFields];
        return value ? [[key, { value: value.value, source: "human" }]] : [];
      }),
    ),
  );
}
export function mergeClassification(
  current: ReferenceClassification | undefined,
  proposal: ReferenceClassification,
): ReferenceClassification {
  const next = { ...current, ...proposal };
  for (const key of [
    "subject",
    "scale",
    "intent",
    "density",
    "traits",
  ] as const) {
    if (current?.[key]?.source === "human")
      Object.assign(next, { [key]: current[key] });
  }
  return classificationSchema.parse(next);
}
const rectSchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().nonnegative(),
    height: z.number().nonnegative(),
  })
  .strict();
export type CapturedNode = {
  tag: string;
  role?: string;
  attributes: Record<string, string>;
  text: string;
  styles: Record<string, string>;
  rect: z.infer<typeof rectSchema>;
  children: CapturedNode[];
};
export const nodeSchema: z.ZodType<CapturedNode> = z.lazy(() =>
  z
    .object({
      tag: z
        .string()
        .max(64)
        .refine(
          (tag) =>
            !["script", "style", "noscript", "template"].includes(
              tag.toLowerCase(),
            ),
          "Executable and stylesheet nodes are not capture evidence",
        ),
      role: z.string().optional(),
      attributes: z.record(z.string(), z.string().max(4096)),
      text: z.string().max(10000),
      styles: z.record(z.string(), z.string().max(1024)),
      rect: rectSchema,
      children: z.array(nodeSchema).max(5000),
    })
    .strict(),
);
export const sourceSchema = z
  .object({
    url: z.url().refine((s) => /^https?:/.test(s), "HTTP source required"),
    hostname: z.string(),
    title: z.string().max(500).optional(),
  })
  .strict()
  .refine(
    (s) => new URL(s.url).hostname === s.hostname,
    "Source host mismatch",
  );
export const viewportSchema = z
  .object({
    width: z.number().int().positive().max(100000),
    height: z.number().int().positive().max(100000),
    deviceScaleFactor: z.number().positive().max(10).optional(),
  })
  .strict();
export const rawCaptureSchema = z
  .object({
    mode: z.enum(["page", "region", "element"]),
    pageTitle: z.string().max(500).optional(),
    viewport: viewportSchema,
    bounds: rectSchema,
    root: nodeSchema,
    truncated: z.boolean(),
  })
  .strict();
export const captureInputSchema = z
  .object({
    source: sourceSchema,
    capturedAt: z.iso.datetime(),
    raw: rawCaptureSchema,
    screenshot: z
      .string()
      .max(40_000_000)
      .regex(/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/),
    notes: z.string().max(10000).optional(),
  })
  .strict();
export type CaptureInput = z.infer<typeof captureInputSchema>;
export type RawCapture = z.infer<typeof rawCaptureSchema>;
export const reviewSchema = z
  .object({
    decision: z.enum(["pending", "accepted", "rejected"]),
    notes: z.string().max(10000),
    rating: z.number().int().min(1).max(5).optional(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type ReferenceReview = z.infer<typeof reviewSchema>;
export const generatedFileSchema = z
  .object({ path: z.string(), content: z.string() })
  .strict();
export type GeneratedFile = z.infer<typeof generatedFileSchema>;
export const publicationSchema = z
  .object({
    id: z.uuid(),
    ingestId: z.uuid(),
    exampleId: z.string(),
    kind: z.enum(["use", "pattern", "fixed"]),
    branch: z.string().optional(),
    commitSha: z.string().optional(),
    prNumber: z.number().int().positive().optional(),
    prUrl: z.url().optional(),
    generatedFiles: z.array(z.string()),
    status: z.enum(["pending", "pr-open", "failed", "merged"]),
    error: z.string().optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type ReferencePublication = z.infer<typeof publicationSchema>;
export const classificationRunSchema = z
  .object({
    id: z.uuid(),
    ingestId: z.uuid(),
    classification: classificationSchema,
  })
  .strict();
export type ReferenceClassificationRun = z.infer<
  typeof classificationRunSchema
>;
export const ingestSchema = z
  .object({
    id: z.uuid(),
    status: statusSchema,
    processingId: z.uuid().optional(),
    source: sourceSchema,
    capture: z
      .object({
        viewport: viewportSchema,
        capturedAt: z.iso.datetime(),
        screenshotAssetId: z.string(),
        thumbnailAssetId: z.string().optional(),
        rawCaptureAssetId: z.string(),
        domHash: z.string(),
        structureHash: z.string(),
      })
      .strict(),
    classification: classificationSchema.optional(),
    classificationRuns: z.array(classificationRunSchema).default([]),
    review: reviewSchema.optional(),
    publications: z.array(publicationSchema),
    revision: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict()
  .refine(
    (ingest) =>
      ingest.publications.every((p) => p.ingestId === ingest.id) &&
      new Set(ingest.publications.map((p) => p.id)).size ===
        ingest.publications.length &&
      ingest.classificationRuns.every((r) => r.ingestId === ingest.id) &&
      new Set(ingest.classificationRuns.map((r) => r.id)).size ===
        ingest.classificationRuns.length,
    "Working-record children must have unique IDs and belong to this ingest",
  );
export type ReferenceIngest = z.infer<typeof ingestSchema>;
const transitions: Record<IngestStatus, readonly IngestStatus[]> = {
  captured: ["processing", "review"],
  processing: ["review", "captured"],
  review: ["accepted", "rejected", "processing"],
  accepted: ["review", "publishing", "rejected"],
  rejected: ["review"],
  publishing: ["accepted", "published"],
  published: [],
};
export function transition(
  ingest: ReferenceIngest,
  status: IngestStatus,
): ReferenceIngest {
  if (!transitions[ingest.status].includes(status))
    throw new Error(`Invalid transition: ${ingest.status} → ${status}`);
  if (
    (status === "accepted" || status === "publishing") &&
    ![
      ingest.classification?.subject,
      ingest.classification?.scale,
      ingest.classification?.intent,
    ].every(Boolean)
  )
    throw new Error("Acceptance requires subject, scale and intent");
  if (
    status === "published" &&
    !ingest.publications.some((p) => p.status === "merged")
  )
    throw new Error("Publication requires a merged PR");
  return { ...ingest, status };
}
export const filterSchema = z
  .object({
    status: statusSchema.optional(),
    inbox: z.enum(["true", "false"]).optional(),
    subject: subjectSchema.optional(),
    scale: z.enum(["fragment", "component", "composition", "page"]).optional(),
    intent: z.string().optional(),
    host: z.string().optional(),
    structureHash: z.string().optional(),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
    minConfidence: z.coerce.number().min(0).max(1).optional(),
    published: z.enum(["true", "false"]).optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
    offset: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();
export type IngestFilter = z.infer<typeof filterSchema>;
export function matches(ingest: ReferenceIngest, f: IngestFilter): boolean {
  const c = ingest.classification;
  const confidence = Math.min(
    ...[c?.subject, c?.scale, c?.intent].map((v) => v?.confidence ?? 0),
  );
  return (
    (!f.status || ingest.status === f.status) &&
    (!f.inbox ||
      ["captured", "processing", "review"].includes(ingest.status) ===
        (f.inbox === "true")) &&
    (!f.subject || c?.subject?.value === f.subject) &&
    (!f.scale || c?.scale?.value === f.scale) &&
    (!f.intent || (c?.intent?.value.startsWith(f.intent) ?? false)) &&
    (!f.host || ingest.source.hostname === f.host) &&
    (!f.structureHash || ingest.capture.structureHash === f.structureHash) &&
    (!f.from || Date.parse(ingest.capture.capturedAt) >= Date.parse(f.from)) &&
    (!f.to || Date.parse(ingest.capture.capturedAt) <= Date.parse(f.to)) &&
    (f.minConfidence === undefined || confidence >= f.minConfidence) &&
    (!f.published ||
      (ingest.status === "published") === (f.published === "true"))
  );
}
export const revisionSchema = z.number().int().positive();
export const ingestPatchSchema = z
  .object({
    baseRevision: revisionSchema,
    fields: classificationFields.optional(),
    notes: reviewSchema.shape.notes.optional(),
    rating: reviewSchema.shape.rating,
  })
  .strict()
  .refine(
    (p) =>
      (p.fields && Object.keys(p.fields).length > 0) ||
      p.notes !== undefined ||
      p.rating !== undefined,
    "Patch requires a classification or review change",
  );
export type ReferencePatch = Omit<
  z.infer<typeof ingestPatchSchema>,
  "baseRevision"
>;
const itemSchema: z.ZodType<ItemInput> = z.lazy(() =>
  z
    .object({
      options: z
        .record(
          z.string(),
          z.union([z.string(), z.boolean(), z.number().finite()]),
        )
        .optional(),
      slots: z.record(z.string(), slotSchema),
    })
    .strict(),
);
const slotSchema: z.ZodType<SlotContent> = z.lazy(() =>
  z.union([
    z.string(),
    usageTreeSchema,
    z.array(z.union([z.string(), usageTreeSchema])),
    z.array(itemSchema),
  ]),
);
export const usageTreeSchema: z.ZodType<UsageTree> = z.lazy(() =>
  z
    .object({
      contract: z.string().min(1),
      signature: z.string().min(1),
      options: z
        .record(
          z.string(),
          z.union([z.string(), z.boolean(), z.number().finite()]),
        )
        .optional(),
      attrs: z.record(z.string(), z.string()).optional(),
      slots: z.record(z.string(), slotSchema).optional(),
      children: slotSchema.optional(),
    })
    .strict(),
);
export const publicationRequestSchema = z
  .object({
    kind: z.enum(["use", "pattern", "fixed"]),
    exampleId: z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/),
    title: z.object({ en: z.string().min(1), es: z.string().min(1) }),
    purpose: z.object({ en: z.string().min(1), es: z.string().min(1) }),
    patternId: z.string().optional(),
    content: z.record(z.string(), z.unknown()).optional(),
    tree: usageTreeSchema.optional(),
    fields: z
      .record(z.string(), z.object({ en: z.string(), es: z.string() }))
      .optional(),
    layout: z.object({ en: z.string(), es: z.string() }).optional(),
  })
  .strict();
export type PublicationRequest = z.infer<typeof publicationRequestSchema>;
export const previewSchema = z
  .object({
    ingestId: z.uuid(),
    revision: revisionSchema,
    exampleId: z.string(),
    kind: z.enum(["use", "pattern", "fixed"]),
    baseSha: z.string(),
    files: z.array(generatedFileSchema),
    digest: z.string(),
    validation: z.object({ valid: z.boolean(), output: z.string() }),
  })
  .strict();
export type PublicationPreview = z.infer<typeof previewSchema>;
export type PublicationValidation = PublicationPreview["validation"];
export type PublicationResult = {
  branch: string;
  commitSha: string;
  prNumber: number;
  prUrl: string;
};
export interface ReferencePublisher {
  preview(
    ingest: ReferenceIngest,
    request: PublicationRequest,
  ): Promise<PublicationPreview>;
  validate(preview: PublicationPreview): Promise<PublicationValidation>;
  publish(
    preview: PublicationPreview,
    ingest: ReferenceIngest,
    attemptId: string,
  ): Promise<PublicationResult>;
  merged(publication: ReferencePublication): Promise<boolean>;
  reconcile(
    publication: ReferencePublication,
  ): Promise<PublicationResult | undefined>;
}
