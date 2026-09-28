import { RESERVED_NAMES, siteNameProblem } from "@skryensya/maker-server/names";
import type { Bucket } from "./bucket";

/*
 * ONE WORKER, EVERY PUBLISHED SITE (ADR-0033).
 *
 * Serving, on `<name>.skryensya.dev`: the name is the first label of the host; the publication in
 * force is the one `sites/<name>/current` points at; files are read from
 * `sites/<name>/deploys/<deployment>/…`, and the shared kit from `kit/<hash>/…` at `/_kit/<hash>/…`.
 * Every answer carries a CSP that allows no inline or foreign script: a published page runs the kit
 * and nothing else.
 *
 * Publishing, on `publish.skryensya.dev` only, behind `Authorization: Bearer <PUBLISH_TOKEN>`:
 *   PUT    /v1/kit/<hash>                   { files }          the kit, once per content hash
 *   HEAD   /v1/kit/<hash>                                      is it there?
 *   PUT    /v1/sites/<name>/<deployment>    { files }          a publication, made current at once
 *   DELETE /v1/sites/<name>                                    unpublished: nothing is served
 *   GET    /v1/sites                                           the names with a publication
 * The pointer moves only after every file of a publication is written, so a visitor sees the old
 * site or the new one and never half of each. The last few publications are kept; older ones go.
 */

export type Env = {
  readonly SITES: Bucket;
  readonly PUBLISH_TOKEN: string;
  /** `skryensya.dev` */
  readonly ROOT_DOMAIN: string;
  /** `publish.skryensya.dev` */
  readonly PUBLISH_HOST: string;
  /** More subdomains, comma-separated, that live elsewhere and must reach their own origin. */
  readonly PASSTHROUGH?: string;
  /** How a site's address is written back to the publisher; `{name}` is the site. Local runs only. */
  readonly SITE_ORIGIN?: string;
};

const KEEP_DEPLOYMENTS = 5;
const TOKEN_LIKE = /^[A-Za-z0-9-]{1,64}$/;
const HASH = /^[a-f0-9]{16,64}$/;

const SECURITY_HEADERS: Record<string, string> = {
  "content-security-policy":
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' data:; " +
    "connect-src 'self'; media-src 'self' https:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "cross-origin-opener-policy": "same-origin",
};

const TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  woff2: "font/woff2",
};

const typeOf = (path: string) => TYPES[path.split(".").pop() ?? ""] ?? "application/octet-stream";

function respond(status: number, body: string | ReadableStream | null, headers: Record<string, string> = {}): Response {
  return new Response(body, { status, headers: { ...SECURITY_HEADERS, ...headers } });
}

const notFound = (what = "Nothing is published here.") =>
  respond(404, `<!doctype html><meta charset="utf-8"><title>Not found</title><p>${what}</p>`, { "content-type": TYPES.html!, "cache-control": "no-store" });

export async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  if (host === env.PUBLISH_HOST) return publish(request, url, env);
  if (!host.endsWith(`.${env.ROOT_DOMAIN}`)) return notFound();
  const name = host.slice(0, -(env.ROOT_DOMAIN.length + 1));
  /*
   * THE ROUTE `*.skryensya.dev/*` MATCHES EVERY SUBDOMAIN, including the ones that are not sites:
   * a Worker route does not look at DNS, so `ui.skryensya.dev` would land here too. Those go on to
   * their own origin untouched. Every reserved name does, plus whatever PASSTHROUGH lists.
   */
  if (RESERVED_NAMES.has(name) || passthrough(env).has(name)) return fetch(request);
  if (siteNameProblem(name)) return notFound();
  if (request.method !== "GET" && request.method !== "HEAD") return respond(405, null, { allow: "GET, HEAD" });
  return serve(request, url, name, env);
}

function passthrough(env: Env): ReadonlySet<string> {
  return new Set((env.PASSTHROUGH ?? "").split(",").map((name) => name.trim().toLowerCase()).filter(Boolean));
}

/* ─── serving ─────────────────────────────────────────────────────────────────────────────────── */

/** The file a request path means: `/` and `/about/` are directories; anything with `..` is nothing. */
export function fileFor(pathname: string): string | undefined {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  if (path.includes("..") || path.includes("\\") || path.includes("\0")) return undefined;
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (clean === "") return "index.html";
  const last = clean.split("/").pop()!;
  return last.includes(".") ? clean : `${clean}/index.html`;
}

async function serve(request: Request, url: URL, name: string, env: Env): Promise<Response> {
  const kit = /^\/_kit\/([a-f0-9]{16,64})\/(.+)$/.exec(url.pathname);
  if (kit) {
    const file = fileFor(`/${kit[2]}`);
    const object = file ? await env.SITES.get(`kit/${kit[1]}/${file}`) : null;
    if (!object) return notFound("No such file.");
    return respond(200, request.method === "HEAD" ? null : object.body, {
      "content-type": object.httpMetadata?.contentType ?? typeOf(file!),
      "cache-control": "public, max-age=31536000, immutable",
      etag: object.httpEtag,
    });
  }

  const current = await env.SITES.get(`sites/${name}/current`);
  if (!current) return notFound();
  const deployment = (await current.text()).trim();
  const file = fileFor(url.pathname);
  if (!file || !TOKEN_LIKE.test(deployment)) return notFound("No such page.");
  const object = await env.SITES.get(`sites/${name}/deploys/${deployment}/${file}`);
  if (!object) return notFound("No such page.");
  if (request.headers.get("if-none-match") === object.httpEtag) return respond(304, null, { etag: object.httpEtag });
  return respond(200, request.method === "HEAD" ? null : object.body, {
    "content-type": object.httpMetadata?.contentType ?? typeOf(file),
    /* A minute: a new publication shows up quickly, and a visitor rarely waits for the origin. */
    "cache-control": "public, max-age=60",
    etag: object.httpEtag,
  });
}

/* ─── publishing ──────────────────────────────────────────────────────────────────────────────── */

type Upload = { files: { path: string; type?: string; body: string }[] };

async function publish(request: Request, url: URL, env: Env): Promise<Response> {
  const json = (status: number, body: unknown) => respond(status, JSON.stringify(body), { "content-type": TYPES.json!, "cache-control": "no-store" });
  if (!env.PUBLISH_TOKEN || !(await authorized(request, env.PUBLISH_TOKEN))) return json(401, { error: "Not authorized." });

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "v1") return json(404, { error: "Unknown endpoint." });

  if (parts[1] === "kit" && parts.length === 3 && HASH.test(parts[2]!)) {
    const hash = parts[2]!;
    if (request.method === "HEAD") return respond((await env.SITES.head(`kit/${hash}/kit.js`)) ? 200 : 404, null);
    if (request.method !== "PUT") return json(405, { error: "Method not allowed." });
    const upload = await readUpload(request);
    if (typeof upload === "string") return json(400, { error: upload });
    await writeFiles(env.SITES, `kit/${hash}`, upload);
    return json(200, { kit: hash, files: upload.files.length });
  }

  if (parts[1] === "sites" && parts.length === 2 && request.method === "GET") {
    const listed = await env.SITES.list({ prefix: "sites/", delimiter: "/" });
    const names = listed.delimitedPrefixes.map((prefix) => prefix.slice("sites/".length, -1));
    const live: string[] = [];
    for (const name of names) if (await env.SITES.head(`sites/${name}/current`)) live.push(name);
    return json(200, { sites: live });
  }

  const name = parts[2];
  if (parts[1] !== "sites" || !name) return json(404, { error: "Unknown endpoint." });
  const nameProblem = siteNameProblem(name);
  if (nameProblem) return json(400, { error: nameProblem });

  if (parts.length === 3 && request.method === "DELETE") {
    await env.SITES.delete(`sites/${name}/current`);
    return json(200, { unpublished: name });
  }

  const deployment = parts[3];
  if (parts.length !== 4 || !deployment || !TOKEN_LIKE.test(deployment) || request.method !== "PUT") return json(404, { error: "Unknown endpoint." });
  const upload = await readUpload(request);
  if (typeof upload === "string") return json(400, { error: upload });
  if (!upload.files.some((file) => file.path === "index.html")) return json(400, { error: "A site needs an index.html (a page at /)." });
  await writeFiles(env.SITES, `sites/${name}/deploys/${deployment}`, upload);
  await env.SITES.put(`sites/${name}/current`, deployment, { httpMetadata: { contentType: "text/plain" } });
  await prune(env.SITES, name, deployment);
  const origin = (env.SITE_ORIGIN ?? `https://{name}.${env.ROOT_DOMAIN}`).replace("{name}", name);
  return json(200, { site: name, deployment, url: `${origin}/` });
}

async function readUpload(request: Request): Promise<Upload | string> {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return "The body is not JSON.";
  }
  const files = (data as Upload | undefined)?.files;
  if (!Array.isArray(files) || files.length === 0 || files.length > 1000) return "Expected { files: [...] } with 1 to 1000 files.";
  for (const file of files) {
    if (typeof file?.path !== "string" || typeof file.body !== "string") return "Every file needs a path and a body.";
    if (fileFor(`/${file.path}`) !== file.path) return `"${file.path}" is not a file path this Worker serves.`;
  }
  return { files };
}

async function writeFiles(bucket: Bucket, prefix: string, upload: Upload): Promise<void> {
  await Promise.all(upload.files.map((file) => bucket.put(`${prefix}/${file.path}`, file.body, { httpMetadata: { contentType: file.type ?? typeOf(file.path) } })));
}

/** Keep the newest publications (deployment ids sort by time), the current one always among them. */
async function prune(bucket: Bucket, name: string, current: string): Promise<void> {
  const listed = await bucket.list({ prefix: `sites/${name}/deploys/`, delimiter: "/" });
  const deployments = listed.delimitedPrefixes.map((prefix) => prefix.slice(`sites/${name}/deploys/`.length, -1)).sort();
  const stale = deployments.slice(0, Math.max(0, deployments.length - KEEP_DEPLOYMENTS)).filter((id) => id !== current);
  for (const id of stale) {
    const files = await bucket.list({ prefix: `sites/${name}/deploys/${id}/` });
    if (files.objects.length > 0) await bucket.delete(files.objects.map((object) => object.key));
  }
}

/** Constant-time comparison of the bearer token, through a digest so lengths never leak either. */
async function authorized(request: Request, token: string): Promise<boolean> {
  const given = /^Bearer (.+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(given)), crypto.subtle.digest("SHA-256", encoder.encode(token))]);
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i]! ^ right[i]!;
  return difference === 0 && given.length > 0;
}
