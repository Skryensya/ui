import type { McpServer } from "@modelcontextprotocol/server";
import {
  applySiteAll,
  describeSite,
  parseSite,
  randomId,
  resolveAgentOperations,
  type AgentSiteOperation,
  type MakerSite,
} from "@skryensya/maker-model";
import { z } from "zod";
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

const place = z.object({
  parent: z.string().describe("Id of the node whose slot receives it."),
  slot: z.string().describe('The slot: "children" almost always; a named slot like "actions" otherwise.'),
  index: z.number().int().min(0).describe("The gap among that slot's current children: 0 is before the first."),
});

const signatureRef = z.object({ contract: z.string(), signature: z.string() });
const optionValue = z.union([z.string(), z.number(), z.boolean()]);

const pageOperation = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("insert"),
    at: place,
    tree: z.record(z.string(), z.unknown()).optional().describe("A usage tree, as validate_ui takes it."),
    signature: signatureRef.optional().describe("Or a catalogue signature, inserted as its preset."),
  }),
  z.object({ type: z.literal("move"), child: z.string(), to: place }),
  z.object({ type: z.literal("remove"), child: z.string() }),
  z.object({
    type: z.literal("wrap"),
    children: z.array(z.string()).min(1).describe("Contiguous siblings of one slot, in order."),
    with: signatureRef.extend({ options: z.record(z.string(), optionValue).optional() }).describe("The container: Stack, Inline, Grid, Box, Wrapper…"),
  }),
  z.object({ type: z.literal("unwrap"), node: z.string() }),
  z.object({ type: z.literal("setOption"), node: z.string(), name: z.string(), value: optionValue.optional().describe("Omit to go back to the default.") }),
  z.object({ type: z.literal("setAttr"), node: z.string(), name: z.string(), value: z.string().optional() }),
  z.object({ type: z.literal("setText"), node: z.string(), slot: z.string().optional(), text: z.string() }),
]);

const siteOperation = z.discriminatedUnion("type", [
  z.object({ type: z.literal("page"), page: z.string().describe("Page id."), operations: z.array(pageOperation).min(1) }),
  z.object({ type: z.literal("addPage"), name: z.string(), path: z.string(), index: z.number().int().min(0).optional() }),
  z.object({ type: z.literal("removePage"), page: z.string() }),
  z.object({ type: z.literal("renamePage"), page: z.string(), name: z.string() }),
  z.object({ type: z.literal("setPagePath"), page: z.string(), path: z.string() }),
  z.object({ type: z.literal("movePage"), page: z.string(), index: z.number().int().min(0) }),
]);

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
        const resolved = resolveAgentOperations(site, operations, randomId);
        if (!resolved.ok) return answer({ ...current, refused: resolved.reason }, true);
        const applied = applySiteAll(site, resolved.value);
        if (!applied.ok) return answer({ ...current, refused: applied.reason }, true);
        const saved = await maker.save(args.project, row.revision, applied.site);
        if (!saved.ok && "current" in saved) {
          return answer({ ...current, revision: saved.current.revision, outline: describeSite(siteOf(saved.current)), refused: "Someone saved the project while this was being applied. Nothing was applied; re-read the outline below." }, true);
        }
        if (!saved.ok) return answer({ ...current, refused: saved.reason }, true);
        return answer({ ...provenance, project: args.project, revision: saved.revision, outline: describeSite(applied.site) });
      }),
  );
}
