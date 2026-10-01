import type { McpServer } from "@modelcontextprotocol/server";
import {
  tryAgentOperations,
  describeSite,
  makerContext,
  parseSite,
  randomId,
  type AgentSiteOperation,
  type MakerSite,
} from "@skryensya/maker-model";
import { z } from "zod";
import { siteOperation } from "@skryensya/maker-agent/schema";
import { provenance } from "./manifest.js";

/*
 * THE MAKER, OVER MCP (decision 31: a prompt speaks only in operations).
 *
 * Tools on the projects the Maker keeps (PostgreSQL, through the Maker's own API): list them, read
 * one as an outline with identities, and change it with Maker operations and nothing else. There is
 * no field anywhere in this vocabulary for a coordinate, a length or a style, so "put these two
 * buttons next to each other" can only arrive as a wrap in an Inline, and the browser decides the
 * rest. A change is saved on top of the revision it was made from, so it never overwrites the person;
 * an open Maker shows it at once, as one undoable step.
 *
 * STDIO ONLY: the local server talks to the local Maker (`MAKER_URL`, http://localhost:4200 by
 * default). The HTTP server has no Maker to talk to and does not offer these tools.
 */

const makerOutput = z.object({
  ...{ schemaVersion: z.string(), sourceHash: z.string() },
  project: z.string().optional().describe("The project this answer is about."),
  revision: z.number().describe("The project's revision this answer describes."),
  outline: z.string().describe("The site: every page, node and text run with its id, and what is pending."),
  refused: z.string().optional().describe("Why nothing was applied, when the operations were refused."),
});

const projectsOutput = z.object({
  ...{ schemaVersion: z.string(), sourceHash: z.string() },
  projects: z.array(z.object({ id: z.string(), name: z.string(), revision: z.number(), updatedAt: z.string() })),
  refused: z.string().optional(),
});

type ProjectRow = { id: string; name: string; revision: number; updatedAt: string; site: MakerSite };

class MakerUnavailable extends Error {}

/** The Maker's API, or a sentence saying how to start it. */
function client(base: string) {
  const call = async (path: string, init?: RequestInit): Promise<Response> => {
    try {
      return await fetch(new URL(`/api${path}`, base), init);
    } catch {
      throw new MakerUnavailable(
        `The Maker is not running at ${base}. Start it with \`pnpm --filter @skryensya/maker dev\` ` +
          "(and its database with `docker compose -f apps/maker/docker-compose.yml up -d`), or point MAKER_URL at it.",
      );
    }
  };
  const failed = async (response: Response) =>
    ((await response.json().catch(() => ({}))) as { error?: string }).error ?? `The Maker answered ${response.status}.`;
  return {
    async list() {
      const response = await call("/projects");
      if (!response.ok) throw new MakerUnavailable(await failed(response));
      return (await response.json()) as Omit<ProjectRow, "site">[];
    },
    async get(id: string): Promise<ProjectRow | string> {
      const response = await call(`/projects/${encodeURIComponent(id)}`);
      if (response.status === 404) return `No project "${id}". maker_projects lists them.`;
      if (!response.ok) throw new MakerUnavailable(await failed(response));
      return (await response.json()) as ProjectRow;
    },
    async save(id: string, baseRevision: number, site: MakerSite): Promise<{ ok: true; revision: number } | { ok: false; current: ProjectRow } | { ok: false; reason: string }> {
      const response = await call(`/projects/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ baseRevision, site }),
      });
      if (response.ok) return { ok: true, revision: ((await response.json()) as { revision: number }).revision };
      if (response.status === 409) return { ok: false, current: (await response.json()) as ProjectRow };
      return { ok: false, reason: await failed(response) };
    },
  };
}

function answer(value: z.infer<typeof makerOutput>, isError = false) {
  return {
    content: [{ type: "text" as const, text: value.refused ? `${value.refused}${value.outline ? `\n\n${value.outline}` : ""}` : value.outline }],
    structuredContent: value,
    ...(isError ? { isError: true } : {}),
  };
}

const refusedAnswer = (reason: string) => answer({ ...provenance, revision: -1, outline: "", refused: reason }, true);

/** A project's site as the Maker reads it, so what an agent sees is exactly what the Maker opens. */
function siteOf(row: ProjectRow): MakerSite {
  const opened = parseSite(JSON.stringify(row.site), provenance.sourceHash, randomId);
  return opened.ok ? opened.site : row.site;
}

const publishOutput = z.object({
  ...{ schemaVersion: z.string(), sourceHash: z.string() },
  project: z.string(),
  url: z.string().optional().describe("Where the site now lives, when it was published."),
  unpublished: z.string().optional().describe("The site name taken down, when it was unpublished."),
  pending: z.array(z.object({ page: z.string(), message: z.string() })).optional(),
  refused: z.string().optional(),
});

export function registerMakerTools(server: McpServer, makerUrl: string): void {
  const maker = client(makerUrl);
  const guard = async <T,>(run: () => Promise<T>) => {
    try {
      return await run();
    } catch (error) {
      if (error instanceof MakerUnavailable) return refusedAnswer(error.message) as T;
      throw error;
    }
  };

  server.registerTool(
    "maker_projects",
    {
      title: "List the Maker's projects",
      description: "Every project the Maker keeps, newest change first: id, name and revision. Pass an id to maker_read and maker_apply.",
      inputSchema: z.object({}),
      outputSchema: projectsOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      try {
        const projects = await maker.list();
        const text = projects.length === 0 ? "No projects yet." : projects.map((p) => `${p.id} "${p.name}" revision ${p.revision}`).join("\n");
        return { content: [{ type: "text" as const, text }], structuredContent: { ...provenance, projects } };
      } catch (error) {
        if (!(error instanceof MakerUnavailable)) throw error;
        return { content: [{ type: "text" as const, text: error.message }], structuredContent: { ...provenance, projects: [], refused: error.message }, isError: true };
      }
    },
  );

  server.registerTool(
    "maker_read",
    {
      title: "Read a Maker project",
      description:
        "A project's site as an outline: each page (`page <id> \"name\" /path`), then one line per node " +
        "(`<id> contract/Signature option=value …`), text runs as `<id> \"text\"`, and what is pending with " +
        "the ids it concerns. Read it before maker_apply: operations address nodes and pages by these ids.",
      inputSchema: z.object({ project: z.string().describe("The project id, from maker_projects.") }),
      outputSchema: makerOutput,
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ project }) =>
      guard(async () => {
        const row = await maker.get(project);
        if (typeof row === "string") return refusedAnswer(row);
        return answer({ ...provenance, project, revision: row.revision, outline: describeSite(siteOf(row)) });
      }),
  );

  server.registerTool(
    "maker_context",
    {
      title: "Read a Maker working context",
      description: "Bounded semantic selection context. Selection and view are caller-supplied ephemeral evidence, not persisted project data.",
      inputSchema: z.object({ project: z.string(), page: z.string(), selected: z.string().optional(), selectedIds: z.array(z.string()).max(32).default([]) }),
      outputSchema: z.object({ schemaVersion: z.string(), sourceHash: z.string(), project: z.object({ id: z.string(), revision: z.number() }).optional(), page: z.object({ id: z.string(), name: z.string(), path: z.string() }).optional(), selection: z.record(z.string(), z.unknown()).optional(), view: z.record(z.string(), z.unknown()).optional() }).passthrough(),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ project, page, selected, selectedIds }) => guard(async () => {
      const row = await maker.get(project);
      if (typeof row === "string") return refusedAnswer(row);
      const context = makerContext(siteOf(row), { id: project, revision: row.revision }, {
        page, selected, selectedIds, width: "fit", scheme: "light", contrast: false, density: "default", mode: "edit",
      });
      return { content: [{ type: "text" as const, text: JSON.stringify(context) }], structuredContent: { ...provenance, ...context } };
    }),
  );

  server.registerTool(
    "maker_try",
    {
      title: "Try Maker operations without saving",
      description: "Resolve and validate the same closed operations as maker_apply on a temporary site. Returns the resulting outline or refusal; never saves.",
      inputSchema: z.object({ project: z.string(), revision: z.number().int().min(0), operations: z.array(siteOperation).min(1).max(100) }),
      outputSchema: makerOutput,
      annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
    },
    async ({ project, revision, operations }) => guard(async () => {
      const row = await maker.get(project);
      if (typeof row === "string") return refusedAnswer(row);
      const site = siteOf(row);
      const current = { ...provenance, project, revision: row.revision, outline: describeSite(site) };
      if (revision !== row.revision) return answer({ ...current, refused: "Revision conflict. Re-read before proposing." }, true);
      const result = tryAgentOperations(site, operations as AgentSiteOperation[], randomId);
      return result.ok ? answer({ ...current, outline: describeSite(result.site) }) : answer({ ...current, refused: result.reason }, true);
    }),
  );

  server.registerTool(
    "maker_apply",
    {
      title: "Change a Maker project, by operations",
      description:
        "Apply Maker operations to a project, all or none, as one undoable step in any Maker that has it " +
        "open. Layout is STRUCTURE: to put things side by side, wrap them in an Inline; one above another, a " +
        "Stack; in columns, a Grid (minColumn lets its own width decide how many); a width ceiling is a " +
        "Box's measure; spacing is the container's gap or a Box's padding. There is no x, y, width, " +
        "margin or style anywhere, and an operation the contract refuses (an option a signature does not " +
        "declare, a Wrapper inside a Wrapper, a block inside a heading) refuses the whole request with " +
        "the reason. Pass `revision` from maker_read so a change the person made meanwhile is not " +
        "overwritten; on a mismatch nothing is applied and the current outline comes back.",
      inputSchema: z.object({
        project: z.string().describe("The project id, from maker_projects."),
        revision: z.number().int().min(0).optional().describe("The revision maker_read returned."),
        operations: z.array(siteOperation).min(1),
      }),
      outputSchema: makerOutput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (args) =>
      guard(async () => {
        /* zod checked the shape; a `tree` is typed as a usage tree here, and the contract judges it
           when it is placed (an unknown signature has no place anywhere). */
        const operations = args.operations as unknown as AgentSiteOperation[];
        const row = await maker.get(args.project);
        if (typeof row === "string") return refusedAnswer(row);
        const site = siteOf(row);
        const current = { ...provenance, project: args.project, revision: row.revision, outline: describeSite(site) };
        if (args.revision !== undefined && args.revision !== row.revision) {
          return answer({ ...current, refused: `The project is at revision ${row.revision}, not ${args.revision}: it changed since you read it. Nothing was applied; re-read the outline below.` }, true);
        }
        const applied = tryAgentOperations(site, operations, randomId);
        if (!applied.ok) return answer({ ...current, refused: applied.reason }, true);
        const saved = await maker.save(args.project, row.revision, applied.site);
        if (!saved.ok && "current" in saved) {
          return answer({ ...current, revision: saved.current.revision, outline: describeSite(siteOf(saved.current)), refused: "Someone saved the project while this was being applied. Nothing was applied; re-read the outline below." }, true);
        }
        if (!saved.ok) return answer({ ...current, refused: saved.reason }, true);
        return answer({ ...provenance, project: args.project, revision: saved.revision, outline: describeSite(applied.site) });
      }),
  );

  server.registerTool(
    "maker_publish",
    {
      title: "Publish a Maker project to its subdomain",
      description:
        "Publish a project as a static site at https://<name>.skryensya.dev/ (the project as last saved), " +
        "or take it down with `unpublish: true`. Only works where the Maker has the publish token, which " +
        "is the one machine that publishes; elsewhere it says so. `name` defaults to the project's current " +
        "site name, or one derived from its name. A site with a link that would run code is refused. This " +
        "puts content on the public internet: publish only when the person asked for it.",
      inputSchema: z.object({
        project: z.string().describe("The project id, from maker_projects."),
        name: z.string().optional().describe("The subdomain: lowercase letters, digits and inner hyphens."),
        unpublish: z.boolean().optional().describe("Take the site down instead."),
      }),
      outputSchema: publishOutput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ project, name, unpublish }) => {
      const reply = (value: Omit<z.infer<typeof publishOutput>, "schemaVersion" | "sourceHash">, isError = false) => ({
        content: [{ type: "text" as const, text: value.refused ?? (value.url ? `Published at ${value.url}` : `Unpublished ${value.unpublished ?? "nothing"}.`) }],
        structuredContent: { ...provenance, ...value },
        ...(isError ? { isError: true } : {}),
      });
      let response: Response;
      try {
        response = await fetch(new URL(`/api/projects/${encodeURIComponent(project)}/publish`, makerUrl), {
          method: unpublish ? "DELETE" : "POST",
          headers: { "content-type": "application/json" },
          body: unpublish ? undefined : JSON.stringify(name ? { name } : {}),
        });
      } catch {
        return reply({ project, refused: `The Maker is not running at ${makerUrl}.` }, true);
      }
      const body = (await response.json().catch(() => ({}))) as { url?: string; unpublished?: string | null; pending?: { page: string; message: string }[]; error?: string };
      if (!response.ok) return reply({ project, refused: body.error ?? `The Maker answered ${response.status}.` }, true);
      return reply(unpublish ? { project, unpublished: body.unpublished ?? undefined } : { project, url: body.url, pending: body.pending });
    },
  );
}
