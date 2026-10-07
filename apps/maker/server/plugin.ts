import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin, ViteDevServer } from "vite";
import type * as Api from "@skryensya/maker-server/api";
import type * as Store from "@skryensya/maker-server/store";

/*
 * THE PROJECTS API INSIDE THE DEV SERVER, so the Maker is still one command. The store is Postgres
 * at DATABASE_URL (the docker-compose database by default); MAKER_STORE=memory keeps projects in the
 * process instead, which is what the browser checks use. When Postgres cannot be reached the API
 * answers 503 and says why, and the Maker keeps working in the browser alone.
 *
 * The server package is loaded through Vite rather than imported: it reads the Maker's model from
 * TypeScript source, which the config's plain Node loader cannot resolve.
 */
export function makerApi(): Plugin {
  const index = JSON.parse(readFileSync(new URL("../../../artifacts/ai-index.json", import.meta.url), "utf8")) as { sourceHash: string };

  return {
    name: "maker-api",
    apply: "serve",
    async configureServer(server: ViteDevServer) {
      const { memoryStore, postgresStore, DEFAULT_DATABASE_URL } = (await server.ssrLoadModule("@skryensya/maker-server/store")) as typeof Store;
      const { createMakerApi } = (await server.ssrLoadModule("@skryensya/maker-server/api")) as typeof Api;
      let store: Store.ProjectStore | undefined;
      let unavailable: string | undefined;
      try {
        store = process.env.MAKER_STORE === "memory" ? memoryStore() : await postgresStore(process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL);
        server.config.logger.info(`  maker: projects in ${store.kind}`);
      } catch (error) {
        unavailable = `No database: ${error instanceof Error ? error.message : String(error)}. Start it with \`docker compose -f apps/maker/docker-compose.yml up -d\`.`;
        server.config.logger.warn(`  maker: ${unavailable}`);
      }
      const api = store ? createMakerApi(store, index.sourceHash) : undefined;
      /* The AI log (dev only): each line a client posts is appended to a git-ignored file, to be read and scored later. */
      const logDir = fileURLToPath(new URL("../.ai-logs/", import.meta.url));
      server.middlewares.use("/__maker-ai-log", (request, response) => {
        if (request.method !== "POST") { response.statusCode = 405; return void response.end(); }
        const chunks: Buffer[] = [];
        let size = 0;
        request.on("data", (chunk: Buffer) => { size += chunk.length; if (size <= 1_000_000) chunks.push(chunk); });
        request.on("end", () => {
          try {
            if (size > 1_000_000) throw new Error("too large");
            /* The browser checks set this: their conversations are not worth reading. */
            if (process.env.MAKER_AI_LOG === "off") { response.statusCode = 204; return void response.end(); }
            const entry = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
            mkdirSync(logDir, { recursive: true });
            appendFileSync(`${logDir}turns.jsonl`, `${JSON.stringify(entry)}\n`);
            response.statusCode = 204;
          } catch { response.statusCode = 400; }
          response.end();
        });
      });
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith("/api/")) return next();
        if (!api) {
          response.statusCode = 503;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify({ error: unavailable }));
          return;
        }
        api(request, response, next);
      });
      server.httpServer?.on("close", () => void store?.close());
    },
  };
}
