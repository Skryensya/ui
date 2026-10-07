import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import type { MakerSite } from "@skryensya/maker-model";

/*
 * WHERE PROJECTS LIVE. A project is a named Maker site with a revision: every write names the
 * revision it was made on top of, and a write on top of anything but the current one is refused
 * with the current project, so the person and an agent never overwrite each other silently.
 *
 * Two stores with one meaning: Postgres, the real one, and an in-memory one for runs with no
 * database (the browser checks). Every change is announced to subscribers; in Postgres through
 * LISTEN/NOTIFY, so a write from any process reaches every open Maker.
 */

export type ProjectSummary = {
  readonly id: string;
  readonly name: string;
  readonly revision: number;
  readonly updatedAt: string;
};

export type Project = ProjectSummary & { readonly site: MakerSite };

export type Saved =
  | { readonly ok: true; readonly revision: number }
  | { readonly ok: false; readonly conflict: Project }
  | { readonly ok: false; readonly missing: true };

export type ProjectEvent = { readonly id: string; readonly revision: number | null; readonly op: "insert" | "update" | "delete" };

export interface ProjectStore {
  readonly kind: "postgres" | "memory";
  list(): Promise<readonly ProjectSummary[]>;
  get(id: string): Promise<Project | undefined>;
  create(name: string, site: MakerSite): Promise<Project>;
  save(id: string, baseRevision: number, site: MakerSite): Promise<Saved>;
  rename(id: string, name: string): Promise<ProjectSummary | undefined>;
  remove(id: string): Promise<boolean>;
  subscribe(listener: (event: ProjectEvent) => void): () => void;
  close(): Promise<void>;
}

/** The docker-compose database (apps/maker/docker-compose.yml), used when DATABASE_URL is not set. */
export const DEFAULT_DATABASE_URL = "postgres://maker:maker@127.0.0.1:5433/maker";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only a well-formed id reaches the database; anything else simply is not a project. */
export const isProjectId = (id: string) => UUID.test(id);

type Row = {
  id: string;
  name: string;
  revision: number;
  updated_at: Date;
  site?: MakerSite;
};

const summary = (row: Row): ProjectSummary => ({
  id: row.id,
  name: row.name,
  revision: row.revision,
  updatedAt: row.updated_at.toISOString(),
});

const COLUMNS = "id, name, revision, updated_at";

export async function postgresStore(url: string): Promise<ProjectStore> {
  const sql = postgres(url, { max: 5, onnotice: () => {} });
  await sql.unsafe(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  const listeners = new Set<(event: ProjectEvent) => void>();
  await sql.listen("maker_projects", (payload) => {
    const event = JSON.parse(payload) as ProjectEvent;
    for (const listener of listeners) listener(event);
  });

  const store: ProjectStore = {
    kind: "postgres",
    async list() {
      const rows = await sql<Row[]>`select ${sql.unsafe(COLUMNS)} from maker_projects order by updated_at desc`;
      return rows.map(summary);
    },
    async get(id) {
      if (!isProjectId(id)) return undefined;
      const [row] = await sql<Row[]>`select ${sql.unsafe(COLUMNS)}, site from maker_projects where id = ${id}`;
      return row ? { ...summary(row), site: row.site! } : undefined;
    },
    async create(name, site) {
      const [row] = await sql<Row[]>`
        insert into maker_projects (name, site) values (${name.trim()}, ${sql.json(site as never)})
        returning ${sql.unsafe(COLUMNS)}, site`;
      return { ...summary(row!), site: row!.site! };
    },
    async save(id, baseRevision, site) {
      if (!isProjectId(id)) return { ok: false, missing: true };
      const [row] = await sql<Row[]>`
        update maker_projects set site = ${sql.json(site as never)}, revision = revision + 1, updated_at = now()
        where id = ${id} and revision = ${baseRevision}
        returning revision`;
      if (row) return { ok: true, revision: row.revision };
      const current = await store.get(id);
      return current ? { ok: false, conflict: current } : { ok: false, missing: true };
    },
    async rename(id, name) {
      if (!isProjectId(id)) return undefined;
      const [row] = await sql<Row[]>`
        update maker_projects set name = ${name.trim()}, updated_at = now() where id = ${id}
        returning ${sql.unsafe(COLUMNS)}`;
      return row ? summary(row) : undefined;
    },
    async remove(id) {
      if (!isProjectId(id)) return false;
      const result = await sql`delete from maker_projects where id = ${id}`;
      return result.count > 0;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    async close() {
      await sql.end({ timeout: 2 });
    },
  };
  return store;
}

export function memoryStore(): ProjectStore {
  const projects = new Map<string, Project>();
  const listeners = new Set<(event: ProjectEvent) => void>();
  const announce = (event: ProjectEvent) => queueMicrotask(() => listeners.forEach((listener) => listener(event)));
  const now = () => new Date().toISOString();

  return {
    kind: "memory",
    async list() {
      return [...projects.values()]
        .map(({ site: _site, ...rest }) => rest)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async get(id) {
      return projects.get(id);
    },
    async create(name, site) {
      const project: Project = { id: randomUUID(), name: name.trim(), revision: 1, updatedAt: now(), site };
      projects.set(project.id, project);
      announce({ id: project.id, revision: 1, op: "insert" });
      return project;
    },
    async save(id, baseRevision, site) {
      const current = projects.get(id);
      if (!current) return { ok: false, missing: true };
      if (current.revision !== baseRevision) return { ok: false, conflict: current };
      const next = { ...current, site, revision: current.revision + 1, updatedAt: now() };
      projects.set(id, next);
      announce({ id, revision: next.revision, op: "update" });
      return { ok: true, revision: next.revision };
    },
    async rename(id, name) {
      const current = projects.get(id);
      if (!current) return undefined;
      const next = { ...current, name: name.trim(), updatedAt: now() };
      projects.set(id, next);
      announce({ id, revision: next.revision, op: "update" });
      const { site: _site, ...rest } = next;
      return rest;
    },
    async remove(id) {
      const had = projects.delete(id);
      if (had) announce({ id, revision: null, op: "delete" });
      return had;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    async close() {},
  };
}
