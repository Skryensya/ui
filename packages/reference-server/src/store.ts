import { readFileSync } from "node:fs";
import postgres from "postgres";
import {
  ingestSchema,
  matches,
  filterSchema,
  type ReferenceIngest,
  type IngestFilter,
} from "@skryensya/reference-model";
export type ReferenceEvent = { id: string; revision: number | null };
export class StoreError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export interface ReferenceStore {
  kind: "memory" | "postgres";
  create(ingest: ReferenceIngest): Promise<ReferenceIngest>;
  get(id: string): Promise<ReferenceIngest | undefined>;
  list(filter?: IngestFilter): Promise<ReferenceIngest[]>;
  update(
    id: string,
    revision: number,
    transform: (ingest: ReferenceIngest) => ReferenceIngest,
  ): Promise<ReferenceIngest>;
  remove(id: string, revision: number): Promise<void>;
  subscribe(listener: (event: ReferenceEvent) => void): () => void;
  close(): Promise<void>;
}
function next(
  current: ReferenceIngest,
  transform: (ingest: ReferenceIngest) => ReferenceIngest,
) {
  const candidate = transform(structuredClone(current));
  const result = ingestSchema.parse({
    ...candidate,
    id: current.id,
    source: current.source,
    capture: current.capture,
    createdAt: current.createdAt,
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
  });
  for (const run of current.classificationRuns) {
    if (
      JSON.stringify(result.classificationRuns.find((r) => r.id === run.id)) !==
      JSON.stringify(run)
    )
      throw new StoreError(400, "Classification history is immutable");
  }
  return result;
}
function check(
  current: ReferenceIngest | undefined,
  revision: number,
): asserts current is ReferenceIngest {
  if (!current) throw new StoreError(404, "Ingest not found");
  if (current.revision !== revision)
    throw new StoreError(409, "Obsolete revision; reload the ingest");
}
export function memoryStore(): ReferenceStore {
  const records = new Map<string, ReferenceIngest>();
  const listeners = new Set<(event: ReferenceEvent) => void>();
  const emit = (id: string, revision: number | null) =>
    queueMicrotask(() => listeners.forEach((fn) => fn({ id, revision })));
  return {
    kind: "memory",
    async create(input) {
      const i = ingestSchema.parse(input);
      if (records.has(i.id)) throw new StoreError(409, "Duplicate ingest");
      records.set(i.id, structuredClone(i));
      emit(i.id, i.revision);
      return structuredClone(i);
    },
    async get(id) {
      return structuredClone(records.get(id));
    },
    async list(filter = filterSchema.parse({})) {
      return [...records.values()]
        .filter((i) => matches(i, filter))
        .sort(
          (a, b) =>
            Date.parse(b.capture.capturedAt) -
              Date.parse(a.capture.capturedAt) || a.id.localeCompare(b.id),
        )
        .slice(filter.offset, filter.offset + filter.limit)
        .map((i) => structuredClone(i));
    },
    async update(id, revision, transform) {
      const current = records.get(id);
      check(current, revision);
      const i = next(current, transform);
      records.set(id, i);
      emit(id, i.revision);
      return structuredClone(i);
    },
    async remove(id, revision) {
      check(records.get(id), revision);
      records.delete(id);
      emit(id, null);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    async close() {
      listeners.clear();
    },
  };
}
export async function postgresStore(url: string): Promise<ReferenceStore> {
  const sql = postgres(url, { max: 5 });
  await sql.unsafe(
    readFileSync(new URL("./schema.sql", import.meta.url), "utf8"),
  );
  const listeners = new Set<(event: ReferenceEvent) => void>();
  await sql.listen("reference_ingests", (payload) => {
    const e = JSON.parse(payload) as ReferenceEvent;
    listeners.forEach((fn) => fn(e));
  });
  type SQL = postgres.Sql | postgres.TransactionSql;
  async function read(
    db: SQL,
    id: string,
  ): Promise<ReferenceIngest | undefined> {
    if (!/^[a-f0-9-]{36}$/i.test(id)) return undefined;
    const [r] =
      await db`select i.*, c.* from reference_ingests i join reference_captures c on c.ingest_id = i.id where i.id = ${id}`;
    if (!r) return undefined;
    const [c] =
      await db`select * from reference_classifications where ingest_id = ${id}`;
    const [review] =
      await db`select * from reference_reviews where ingest_id = ${id}`;
    const pubs =
      await db`select * from reference_publications where ingest_id = ${id} order by created_at, id`;
    const runs =
      await db`select id, result from reference_classification_runs where ingest_id = ${id} order by created_at, id`;
    const iso = (d: Date) => d.toISOString();
    return ingestSchema.parse({
      id,
      status: r.status,
      processingId: r.processing_id ?? undefined,
      source: {
        url: r.source_url,
        hostname: r.source_host,
        ...(r.source_title === null ? {} : { title: r.source_title }),
      },
      revision: r.revision,
      createdAt: iso(r.created_at),
      updatedAt: iso(r.updated_at),
      capture: {
        viewport: {
          width: r.viewport_width,
          height: r.viewport_height,
          ...(r.device_scale_factor === null
            ? {}
            : { deviceScaleFactor: r.device_scale_factor }),
        },
        capturedAt: iso(r.captured_at),
        screenshotAssetId: r.screenshot_asset_key,
        thumbnailAssetId: r.thumbnail_asset_key ?? undefined,
        rawCaptureAssetId: r.raw_capture_asset_key,
        domHash: r.dom_hash,
        structureHash: r.structure_hash,
      },
      classification: c
        ? {
            ...c.provenance,
            classifier: c.classifier,
            classifierVersion: c.classifier_version,
            updatedAt: iso(c.updated_at),
          }
        : undefined,
      classificationRuns: runs.map((r) => ({
        id: r.id,
        ingestId: id,
        classification: r.result,
      })),
      review: review
        ? {
            decision: review.decision,
            notes: review.notes,
            rating: review.rating ?? undefined,
            updatedAt: iso(review.updated_at),
          }
        : undefined,
      publications: pubs.map((p) => ({
        id: p.id,
        ingestId: id,
        exampleId: p.example_id,
        kind: p.kind,
        branch: p.branch ?? undefined,
        commitSha: p.commit_sha ?? undefined,
        prNumber: p.pr_number ?? undefined,
        prUrl: p.pr_url ?? undefined,
        generatedFiles: p.generated_files,
        status: p.status,
        error: p.error ?? undefined,
        createdAt: iso(p.created_at),
        updatedAt: iso(p.updated_at),
      })),
    });
  }
  async function children(db: SQL, i: ReferenceIngest) {
    const c = i.classification;
    if (c) {
      const { classifier, classifierVersion, updatedAt, ...provenance } = c;
      const confidence = Math.min(
        ...[c.subject, c.scale, c.intent].map((v) => v?.confidence ?? 0),
      );
      await db`insert into reference_classifications ${db({ ingest_id: i.id, subject: c.subject?.value ?? null, scale: c.scale?.value ?? null, intent: c.intent?.value ?? null, density: c.density?.value ?? null, traits: c.traits?.value ?? [], confidence, classifier, classifier_version: classifierVersion, provenance: db.json(provenance as never), updated_at: updatedAt })} on conflict (ingest_id) do update set subject=excluded.subject, scale=excluded.scale, intent=excluded.intent, density=excluded.density, traits=excluded.traits, confidence=excluded.confidence, classifier=excluded.classifier, classifier_version=excluded.classifier_version, provenance=excluded.provenance, updated_at=excluded.updated_at`;
    }
    for (const run of i.classificationRuns)
      await db`insert into reference_classification_runs ${db({ id: run.id, ingest_id: i.id, classifier: run.classification.classifier, classifier_version: run.classification.classifierVersion, result: db.json(run.classification as never), created_at: run.classification.updatedAt })} on conflict (id) do nothing`;
    if (i.review)
      await db`insert into reference_reviews ${db({ ingest_id: i.id, decision: i.review.decision, notes: i.review.notes, rating: i.review.rating ?? null, updated_at: i.review.updatedAt })} on conflict (ingest_id) do update set decision=excluded.decision, notes=excluded.notes, rating=excluded.rating, updated_at=excluded.updated_at`;
    for (const p of i.publications)
      await db`insert into reference_publications ${db({ id: p.id, ingest_id: i.id, example_id: p.exampleId, kind: p.kind, branch: p.branch ?? null, commit_sha: p.commitSha ?? null, pr_number: p.prNumber ?? null, pr_url: p.prUrl ?? null, generated_files: p.generatedFiles, status: p.status, error: p.error ?? null, created_at: p.createdAt, updated_at: p.updatedAt })} on conflict (id) do update set branch=excluded.branch, commit_sha=excluded.commit_sha, pr_number=excluded.pr_number, pr_url=excluded.pr_url, status=excluded.status, error=excluded.error, updated_at=excluded.updated_at`;
  }
  return {
    kind: "postgres",
    async create(input) {
      const i = ingestSchema.parse(input);
      await sql
        .begin(async (db) => {
          await db`insert into reference_ingests ${db({ id: i.id, source_url: i.source.url, source_host: i.source.hostname, source_title: i.source.title ?? null, status: i.status, revision: i.revision, processing_id: i.processingId ?? null, captured_at: i.capture.capturedAt, created_at: i.createdAt, updated_at: i.updatedAt })}`;
          await db`insert into reference_captures ${db({ id: i.id, ingest_id: i.id, viewport_width: i.capture.viewport.width, viewport_height: i.capture.viewport.height, device_scale_factor: i.capture.viewport.deviceScaleFactor ?? null, screenshot_asset_key: i.capture.screenshotAssetId, thumbnail_asset_key: i.capture.thumbnailAssetId ?? null, raw_capture_asset_key: i.capture.rawCaptureAssetId, dom_hash: i.capture.domHash, structure_hash: i.capture.structureHash, created_at: i.createdAt })}`;
          await children(db, i);
        })
        .catch((error: unknown) => {
          if ((error as { code?: string }).code === "23505")
            throw new StoreError(409, "Duplicate reference identifier");
          throw error;
        });
      return i;
    },
    async get(id) {
      return sql.begin("isolation level repeatable read", (db) =>
        read(db, id),
      ) as Promise<ReferenceIngest | undefined>;
    },
    async list(f = filterSchema.parse({})) {
      const rows =
        await sql`select i.id from reference_ingests i left join reference_classifications c on c.ingest_id=i.id join reference_captures cap on cap.ingest_id=i.id where (${f.status ?? null}::text is null or i.status=${f.status ?? null}) and (${f.inbox ?? null}::text is null or (i.status in ('captured','processing','review'))=${f.inbox === "true"}) and (${f.subject ?? null}::text is null or c.subject=${f.subject ?? null}) and (${f.scale ?? null}::text is null or c.scale=${f.scale ?? null}) and (${f.intent ?? null}::text is null or starts_with(c.intent, ${f.intent ?? ""})) and (${f.host ?? null}::text is null or i.source_host=${f.host ?? null}) and (${f.structureHash ?? null}::text is null or cap.structure_hash=${f.structureHash ?? null}) and (${f.from ?? null}::timestamptz is null or i.captured_at>=${f.from ?? null}) and (${f.to ?? null}::timestamptz is null or i.captured_at<=${f.to ?? null}) and (${f.minConfidence ?? null}::float is null or coalesce(c.confidence,0)>=${f.minConfidence ?? null}) and (${f.published ?? null}::text is null or (i.status='published')=${f.published === "true"}) order by i.captured_at desc, i.id limit ${f.limit} offset ${f.offset}`;
      const found = await Promise.all(rows.map((r) => read(sql, r.id)));
      return found.filter((i): i is ReferenceIngest => !!i);
    },
    async update(id, revision, transform) {
      return sql.begin(async (db) => {
        if (!/^[a-f0-9-]{36}$/i.test(id))
          throw new StoreError(404, "Ingest not found");
        await db`select id from reference_ingests where id=${id} for update`;
        const current = await read(db, id);
        check(current, revision);
        const i = next(current, transform);
        await db`update reference_ingests set status=${i.status}, processing_id=${i.processingId ?? null}, revision=${i.revision}, updated_at=${i.updatedAt} where id=${id}`;
        await children(db, i);
        return i;
      }) as Promise<ReferenceIngest>;
    },
    async remove(id, revision) {
      await sql.begin(async (db) => {
        if (!/^[a-f0-9-]{36}$/i.test(id))
          throw new StoreError(404, "Ingest not found");
        const rows =
          await db`select revision from reference_ingests where id=${id} for update`;
        if (!rows.length) throw new StoreError(404, "Ingest not found");
        if (rows[0].revision !== revision)
          throw new StoreError(409, "Obsolete revision");
        await db`delete from reference_ingests where id=${id}`;
      });
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    async close() {
      await sql.end();
    },
  };
}
