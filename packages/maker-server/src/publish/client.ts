import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { MakerSite } from "@skryensya/maker-model";
import { siteNameProblem } from "./names.js";
import { renderSite, type SiteFile } from "./render.js";

/*
 * PUBLISHING, from the Maker's server to the sites Worker (ADR-0033). The one secret is the
 * publish token: the Maker holds it, the Worker checks it, and nothing else (no Cloudflare account
 * token, no storage key) ever leaves Cloudflare. Without it configured the Maker cannot publish,
 * which is what keeps publishing to the person who runs this server.
 *
 * The kit goes up once per content hash; a publication is the site's pages, made current in one
 * step by the Worker only after all of them are stored.
 */

export type PublishConfig = {
  /** `https://publish.skryensya.dev` */
  readonly endpoint: string;
  readonly token: string;
  /** `skryensya.dev` */
  readonly domain: string;
  /** The built site kit, `kit-dist/`. */
  readonly kitDir: string;
};

export type Published = {
  readonly ok: true;
  readonly name: string;
  readonly url: string;
  readonly deployment: string;
  readonly pending: readonly { readonly page: string; readonly message: string }[];
};

export type PublishResult = Published | { readonly ok: false; readonly reason: string };

function listFiles(dir: string): string[] {
  const out: string[] = [];
  const visit = (current: string) => {
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      if (statSync(path).isDirectory()) visit(path);
      else out.push(path);
    }
  };
  visit(dir);
  return out.sort();
}

/** The kit's files and the hash of all of them together: its address, so a new kit is a new path. */
export function readKit(dir: string): { hash: string; files: SiteFile[] } | undefined {
  let paths: string[];
  try {
    paths = listFiles(dir);
  } catch {
    return undefined;
  }
  if (!paths.some((path) => path.endsWith("kit.js"))) return undefined;
  const hash = createHash("sha256");
  const files = paths.map((path) => {
    const body = readFileSync(path, "utf8");
    const name = relative(dir, path).split("\\").join("/");
    hash.update(name).update("\0").update(body).update("\0");
    return { path: name, type: "", body };
  });
  return { hash: hash.digest("hex").slice(0, 32), files };
}

async function send(config: PublishConfig, method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(new URL(path, config.endpoint), {
    method,
    headers: { authorization: `Bearer ${config.token}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function failure(response: Response, doing: string): Promise<string> {
  const detail = ((await response.json().catch(() => ({}))) as { error?: string }).error;
  if (response.status === 401) return `The sites Worker refused the publish token while ${doing}. Check SITES_PUBLISH_TOKEN.`;
  return `The sites Worker answered ${response.status} while ${doing}${detail ? `: ${detail}` : "."}`;
}

export async function publishSite(
  config: PublishConfig,
  input: { name: string; site: MakerSite; siteTitle: string; revision: number; lang?: string },
): Promise<PublishResult> {
  const nameProblem = siteNameProblem(input.name);
  if (nameProblem) return { ok: false, reason: nameProblem };
  const kit = readKit(config.kitDir);
  if (!kit) return { ok: false, reason: "The site kit is not built. Run `pnpm --filter @skryensya/maker-server build:kit`." };

  const rendered = renderSite(input.site, { siteTitle: input.siteTitle, kitBase: `/_kit/${kit.hash}`, lang: input.lang });
  if (!rendered.ok) return rendered;

  try {
    const head = await send(config, "HEAD", `/v1/kit/${kit.hash}`);
    if (head.status === 401) return { ok: false, reason: await failure(head, "checking the kit") };
    if (head.status === 404) {
      const upload = await send(config, "PUT", `/v1/kit/${kit.hash}`, { files: kit.files.map(({ path, body }) => ({ path, body })) });
      if (!upload.ok) return { ok: false, reason: await failure(upload, "uploading the kit") };
    }
    const deployment = `${String(Date.now()).padStart(13, "0")}-r${input.revision}`;
    const put = await send(config, "PUT", `/v1/sites/${input.name}/${deployment}`, { files: rendered.files });
    if (!put.ok) return { ok: false, reason: await failure(put, "publishing the pages") };
    const { url } = (await put.json()) as { url: string };
    return { ok: true, name: input.name, url, deployment, pending: rendered.pending.map((problem) => ({ page: problem.page, message: problem.message })) };
  } catch (error) {
    return { ok: false, reason: `Could not reach the sites Worker at ${config.endpoint}: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function unpublishSite(config: PublishConfig, name: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const response = await send(config, "DELETE", `/v1/sites/${name}`);
    return response.ok ? { ok: true } : { ok: false, reason: await failure(response, "unpublishing") };
  } catch (error) {
    return { ok: false, reason: `Could not reach the sites Worker at ${config.endpoint}: ${error instanceof Error ? error.message : String(error)}` };
  }
}
