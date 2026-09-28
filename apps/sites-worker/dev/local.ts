import { createServer } from "node:http";
import { memoryBucket } from "../src/bucket";
import { handle, type Env } from "../src/handler";

/*
 * THE SITES WORKER ON THIS MACHINE, for trying a publication before (or without) Cloudflare: the
 * same handler, an in-memory bucket, and `localhost` standing in for the domain. Publishing goes to
 * http://localhost:8788, and a site answers at http://<name>.localhost:8788 (browsers resolve every
 * *.localhost to this machine). Nothing survives a restart.
 *
 *   SITES_PUBLISH_TOKEN=local-token pnpm --filter @skryensya/sites-worker dev:local
 *
 * and in apps/maker/.env.local: SITES_PUBLISH_TOKEN=local-token, SITES_PUBLISH_URL=http://localhost:8788,
 * SITES_DOMAIN=localhost:8788.
 */
const port = Number(process.env.PORT ?? 8788);
const env: Env = {
  SITES: memoryBucket(),
  PUBLISH_TOKEN: process.env.SITES_PUBLISH_TOKEN ?? "",
  ROOT_DOMAIN: "localhost",
  PUBLISH_HOST: "localhost",
  SITE_ORIGIN: `http://{name}.localhost:${port}`,
};
if (!env.PUBLISH_TOKEN) console.warn("sites-worker (local): SITES_PUBLISH_TOKEN is empty, so every publication is refused.");

createServer(async (incoming, outgoing) => {
  const chunks: Buffer[] = [];
  for await (const chunk of incoming) chunks.push(chunk as Buffer);
  const url = `http://${incoming.headers.host ?? `localhost:${port}`}${incoming.url ?? "/"}`;
  const request = new Request(url, {
    method: incoming.method,
    headers: incoming.headers as Record<string, string>,
    body: chunks.length > 0 && incoming.method !== "GET" && incoming.method !== "HEAD" ? Buffer.concat(chunks) : undefined,
  });
  const response = await handle(request, env);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, () => console.log(`sites-worker (local) on http://localhost:${port}, sites at http://<name>.localhost:${port}`));
