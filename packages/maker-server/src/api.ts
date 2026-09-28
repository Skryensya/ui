import type { IncomingMessage, ServerResponse } from "node:http";
import { createSite, parseSite, randomId, type MakerSite } from "@skryensya/maker-model";
import { isProjectId, type ProjectStore } from "./store.js";
import { publishSite, unpublishSite, type PublishConfig } from "./publish/client.js";
import { siteNameProblem, suggestSiteName } from "./publish/names.js";

/*
 * THE MAKER'S PROJECTS OVER HTTP, one handler both the Vite dev server and a standalone server
 * mount. Everything the Maker and an agent (through the MCP) do to a project goes through here, so
 * there is one owner of persistence and one place where a site is checked before it is stored.
 *
 *   GET    /api/projects                  the list, newest change first
 *   POST   /api/projects                  { name, site? }: a new project (an empty site by default)
 *   GET    /api/projects/:id              { id, name, revision, updatedAt, site }
 *   PUT    /api/projects/:id              { baseRevision, site }: 200 { revision }, or 409 with the
 *                                         current project when someone else wrote in between
 *   PATCH  /api/projects/:id              { name }
 *   DELETE /api/projects/:id
 *   GET    /api/projects/:id/events       server-sent events: { revision } on every change
 *   GET    /api/health                    { store: "postgres" | "memory" }
 *   GET    /api/publishing                { configured, domain }
 *   POST   /api/projects/:id/publish      { name? }: the project's site at https://<name>.<domain>/
 *   DELETE /api/projects/:id/publish      taken down; the name stays the project's
 *
 * A site is stored only if it reads as a Maker site (`parseSite`): what the database holds is always
 * something the Maker can open.
 */

const BODY_LIMIT = 5 * 1024 * 1024;

type Handler = (request: IncomingMessage, response: ServerResponse, next?: () => void) => void;

function send(response: ServerResponse, status: number, body?: unknown): void {
  response.statusCode = status;
  if (body === undefined) {
    response.end();
    return;
  }
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > BODY_LIMIT) throw new Error("too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

/** The site in a request, held to the Maker's own format, or why it is not one. */
function siteOf(value: unknown, sourceHash: string): { ok: true; site: MakerSite } | { ok: false; reason: string } {
  const opened = parseSite(JSON.stringify(value), sourceHash, randomId);
  return opened.ok ? { ok: true, site: opened.site } : { ok: false, reason: opened.reason };
}

export function createMakerApi(store: ProjectStore, sourceHash: string, publishing?: PublishConfig): Handler {
  return (request, response, next) => {
    const url = new URL(request.url ?? "/", "http://maker");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "api") {
      if (next) next();
      else send(response, 404);
      return;
    }
    void route(request, response, parts.slice(1)).catch((error: unknown) => {
      if (!response.headersSent) send(response, error instanceof SyntaxError ? 400 : 500, { error: error instanceof Error ? error.message : String(error) });
    });
  };

  /*
   * Publishing, only when this server was given the publish token: whoever runs the Maker with it
   * is the one person who publishes (ADR-0033).
   */
  async function publishRoute(request: IncomingMessage, response: ServerResponse, id: string, method: string): Promise<void> {
    if (!publishing) return send(response, 503, { error: "Publishing is not configured: set SITES_PUBLISH_TOKEN (and SITES_PUBLISH_URL) for the Maker's server." });
    const project = await store.get(id);
    if (!project) return send(response, 404, { error: `No project "${id}".` });
    if (method === "DELETE") {
      const name = project.publication?.siteName;
      if (!name) return send(response, 200, { unpublished: null });
      const done = await unpublishSite(publishing, name);
      if (!done.ok) return send(response, 502, { error: done.reason });
      await store.setPublication(id, null);
      return send(response, 200, { unpublished: name });
    }
    if (method !== "POST") return send(response, 405);
    const body = (await readJson(request)) as { name?: unknown };
    const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().toLowerCase() : (project.publication?.siteName ?? suggestSiteName(project.name));
    const problem = siteNameProblem(name);
    if (problem) return send(response, 400, { error: problem });
    const taken = (await store.list()).find((other) => other.id !== id && other.publication?.siteName === name);
    if (taken) return send(response, 409, { error: `"${name}" is already the site name of "${taken.name}".` });

    const result = await publishSite(publishing, { name, site: project.site, siteTitle: project.name, revision: project.revision });
    if (!result.ok) return send(response, 502, { error: result.reason });
    const recorded = await store.setPublication(id, { siteName: name, url: result.url, revision: project.revision, at: new Date().toISOString() });
    if (!recorded.ok) return send(response, 409, { error: recorded.reason });
    /* A name this project gave up by moving to a new one is taken down, so it does not linger. */
    const previous = project.publication?.siteName;
    if (previous && previous !== name) await unpublishSite(publishing, previous);
    return send(response, 200, { name, url: result.url, revision: project.revision, pending: result.pending });
  }

  async function route(request: IncomingMessage, response: ServerResponse, parts: string[]): Promise<void> {
    const method = request.method ?? "GET";
    const [resource, id, sub] = parts;

    if (resource === "health" && parts.length === 1) return send(response, 200, { store: store.kind });
    if (resource === "publishing" && parts.length === 1) return send(response, 200, { configured: publishing !== undefined, domain: publishing?.domain ?? null });
    if (resource !== "projects") return send(response, 404);

    if (!id) {
      if (method === "GET") return send(response, 200, await store.list());
      if (method === "POST") {
        const body = (await readJson(request)) as { name?: unknown; site?: unknown };
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (!name) return send(response, 400, { error: "A project needs a name." });
        let site = createSite(sourceHash, randomId);
        if (body.site !== undefined) {
          const checked = siteOf(body.site, sourceHash);
          if (!checked.ok) return send(response, 400, { error: checked.reason });
          site = checked.site;
        }
        return send(response, 201, await store.create(name, site));
      }
      return send(response, 405);
    }

    if (!isProjectId(id) && store.kind === "postgres") return send(response, 404, { error: `No project "${id}".` });

    if (sub === "events" && method === "GET") {
      response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
      response.write(": connected\n\n");
      const stop = store.subscribe((event) => {
        if (event.id !== id) return;
        response.write(`data: ${JSON.stringify({ revision: event.revision, op: event.op })}\n\n`);
      });
      /* A comment every 25s keeps proxies from closing an idle stream. */
      const keepAlive = setInterval(() => response.write(": ping\n\n"), 25_000);
      request.on("close", () => {
        clearInterval(keepAlive);
        stop();
      });
      return;
    }
    if (sub === "publish") return publishRoute(request, response, id, method);
    if (sub) return send(response, 404);

    if (method === "GET") {
      const project = await store.get(id);
      return project ? send(response, 200, project) : send(response, 404, { error: `No project "${id}".` });
    }
    if (method === "PUT") {
      const body = (await readJson(request)) as { baseRevision?: unknown; site?: unknown };
      if (typeof body.baseRevision !== "number") return send(response, 400, { error: "baseRevision is required." });
      const checked = siteOf(body.site, sourceHash);
      if (!checked.ok) return send(response, 400, { error: checked.reason });
      const saved = await store.save(id, body.baseRevision, checked.site);
      if (saved.ok) return send(response, 200, { revision: saved.revision });
      if ("conflict" in saved) return send(response, 409, saved.conflict);
      return send(response, 404, { error: `No project "${id}".` });
    }
    if (method === "PATCH") {
      const body = (await readJson(request)) as { name?: unknown };
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) return send(response, 400, { error: "A project needs a name." });
      const renamed = await store.rename(id, name);
      return renamed ? send(response, 200, renamed) : send(response, 404, { error: `No project "${id}".` });
    }
    if (method === "DELETE") return send(response, (await store.remove(id)) ? 204 : 404);
    return send(response, 405);
  }
}
