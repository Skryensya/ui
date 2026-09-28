import { existsSync, mkdirSync, readFileSync, renameSync, unwatchFile, watchFile, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Plugin } from "vite";

/*
 * THE SITE FILE, SERVED TO THE MAKER (dev only). The Maker keeps its site in the browser; this
 * plugin also keeps it in a file an agent can change through the MCP's `maker_apply`, and tells the
 * open Maker the moment it does.
 *
 * Each site is a file `<dir>/<name>.maker.json`; the Maker opens `?site=<name>`, `site` by default,
 * which is the file the MCP uses unless told otherwise.
 *
 *   GET  /__maker/site     the file, or 404 when there is none yet
 *   PUT  /__maker/site     { baseRevision, site }: written as baseRevision + 1, or 409 with the
 *                          current file when someone else wrote in between
 *   GET  /__maker/events   server-sent events: `revision` whenever the file changes on disk
 *
 * The file format is `@skryensya/maker-model`'s SiteFile ({ revision, site }), the same one the MCP
 * reads and writes. Written through a temporary file and a rename, so no reader sees half of it.
 */
const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function siteSync(dir: string): Plugin {
  const pathOf = (name: string) => join(dir, `${name}.maker.json`);
  const readFile = (path: string): { revision: number; text: string } | undefined => {
    if (!existsSync(path)) return undefined;
    const text = readFileSync(path, "utf8");
    try {
      return { revision: (JSON.parse(text) as { revision: number }).revision, text };
    } catch {
      return undefined;
    }
  };
  /** The site a request is about, or undefined for a name that is not one. */
  const siteOf = (url: string | undefined): string | undefined => {
    const name = new URL(url ?? "/", "http://maker").searchParams.get("site") ?? "site";
    return NAME.test(name) ? pathOf(name) : undefined;
  };

  return {
    name: "maker-site-sync",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__maker/events", (request, response) => {
        const path = siteOf(request.originalUrl);
        if (!path) {
          response.statusCode = 400;
          response.end();
          return;
        }
        response.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
        response.write(": connected\n\n");
        const notify = () => {
          const file = readFile(path);
          if (file) response.write(`data: ${JSON.stringify({ revision: file.revision })}\n\n`);
        };
        watchFile(path, { interval: 200 }, notify);
        request.on("close", () => unwatchFile(path, notify));
      });

      server.middlewares.use("/__maker/site", (request, response) => {
        const path = siteOf(request.originalUrl);
        if (!path) {
          response.statusCode = 400;
          response.end();
          return;
        }
        if (request.method === "GET") {
          const file = readFile(path);
          if (!file) {
            response.statusCode = 404;
            response.end();
            return;
          }
          response.setHeader("content-type", "application/json");
          response.end(file.text);
          return;
        }
        if (request.method === "PUT") {
          let body = "";
          request.on("data", (chunk: Buffer) => (body += chunk.toString("utf8")));
          request.on("end", () => {
            let input: { baseRevision: number; site: unknown };
            try {
              input = JSON.parse(body) as typeof input;
            } catch {
              response.statusCode = 400;
              response.end();
              return;
            }
            const current = readFile(path);
            if ((current?.revision ?? 0) !== input.baseRevision) {
              response.statusCode = 409;
              response.setHeader("content-type", "application/json");
              response.end(current?.text ?? "{}");
              return;
            }
            const revision = input.baseRevision + 1;
            mkdirSync(dirname(path), { recursive: true });
            const temporary = `${path}.maker-${process.pid}.tmp`;
            writeFileSync(temporary, `${JSON.stringify({ revision, site: input.site }, null, 2)}\n`);
            renameSync(temporary, path);
            response.setHeader("content-type", "application/json");
            response.end(JSON.stringify({ revision }));
          });
          return;
        }
        response.statusCode = 405;
        response.end();
      });
    },
  };
}
