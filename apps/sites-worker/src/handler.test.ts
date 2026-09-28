import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { memoryBucket } from "./bucket";
import { fileFor, handle, type Env } from "./handler";

const TOKEN = "s3cret-token-for-tests";
let env: Env & { SITES: ReturnType<typeof memoryBucket> };

beforeEach(() => {
  env = { SITES: memoryBucket(), PUBLISH_TOKEN: TOKEN, ROOT_DOMAIN: "skryensya.dev", PUBLISH_HOST: "publish.skryensya.dev" };
});

const call = (url: string, init: RequestInit = {}) => handle(new Request(url, init), env);
const admin = (path: string, method: string, body?: unknown, token = TOKEN) =>
  call(`https://publish.skryensya.dev${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const site = (title: string) => ({
  files: [
    { path: "index.html", body: `<!doctype html><title>${title}</title>` },
    { path: "about/index.html", body: "<!doctype html><title>About</title>" },
  ],
});

describe("paths", () => {
  it("map a request to a file, and refuse to leave the site", () => {
    expect(fileFor("/")).toBe("index.html");
    expect(fileFor("/about")).toBe("about/index.html");
    expect(fileFor("/about/")).toBe("about/index.html");
    expect(fileFor("/a/b.css")).toBe("a/b.css");
    expect(fileFor("/../secrets")).toBeUndefined();
    expect(fileFor("/%2e%2e/secrets")).toBeUndefined();
    expect(fileFor("/%E0%A4%A")).toBeUndefined();
  });
});

describe("publishing", () => {
  it("needs the token, every time", async () => {
    expect((await admin("/v1/sites/cafe-aurora/0001", "PUT", site("x"), "wrong")).status).toBe(401);
    expect((await admin("/v1/sites/cafe-aurora/0001", "PUT", site("x"), "")).status).toBe(401);
    const unset = { ...env, PUBLISH_TOKEN: "" };
    const response = await handle(new Request("https://publish.skryensya.dev/v1/sites", { headers: { authorization: "Bearer " } }), unset);
    expect(response.status).toBe(401);
  });

  it("refuses reserved or malformed names, and files outside the site", async () => {
    expect((await admin("/v1/sites/ui/0001", "PUT", site("x"))).status).toBe(400);
    expect((await admin("/v1/sites/Bad.Name/0001", "PUT", site("x"))).status).toBe(400);
    expect((await admin("/v1/sites/ok/0001", "PUT", { files: [{ path: "../x.html", body: "" }] })).status).toBe(400);
    expect((await admin("/v1/sites/ok/0001", "PUT", { files: [{ path: "about/index.html", body: "" }] })).status).toBe(400);
  });

  it("publishes, serves, replaces atomically, and unpublishes", async () => {
    const first = await admin("/v1/sites/cafe-aurora/0001", "PUT", site("First"));
    expect(await first.json()).toMatchObject({ url: "https://cafe-aurora.skryensya.dev/" });
    expect(await (await call("https://cafe-aurora.skryensya.dev/")).text()).toContain("First");
    expect(await (await call("https://cafe-aurora.skryensya.dev/about")).text()).toContain("About");

    await admin("/v1/sites/cafe-aurora/0002", "PUT", site("Second"));
    expect(await (await call("https://cafe-aurora.skryensya.dev/")).text()).toContain("Second");
    expect(await (await admin("/v1/sites", "GET")).json()).toEqual({ sites: ["cafe-aurora"] });

    await admin("/v1/sites/cafe-aurora", "DELETE");
    expect((await call("https://cafe-aurora.skryensya.dev/")).status).toBe(404);
  });

  it("keeps the last five publications and drops older ones", async () => {
    for (let i = 1; i <= 7; i++) await admin(`/v1/sites/cafe/${String(i).padStart(4, "0")}`, "PUT", site(`v${i}`));
    const kept = new Set(env.SITES.keys().filter((key) => key.includes("/deploys/")).map((key) => key.split("/")[3]));
    expect([...kept].sort()).toEqual(["0003", "0004", "0005", "0006", "0007"]);
  });

  it("uploads the kit once, and serves it immutable", async () => {
    const hash = "0123456789abcdef";
    expect((await admin(`/v1/kit/${hash}`, "HEAD")).status).toBe(404);
    await admin(`/v1/kit/${hash}`, "PUT", { files: [{ path: "kit.js", body: "console.log(1)" }, { path: "kit.css", body: "body{}" }] });
    expect((await admin(`/v1/kit/${hash}`, "HEAD")).status).toBe(200);
    await admin("/v1/sites/cafe/0001", "PUT", site("x"));
    const js = await call(`https://cafe.skryensya.dev/_kit/${hash}/kit.js`);
    expect(js.headers.get("cache-control")).toContain("immutable");
    expect(js.headers.get("content-type")).toContain("javascript");
  });
});

describe("serving", () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(async () => {
    await admin("/v1/sites/cafe-aurora/0001", "PUT", site("Café"));
  });

  it("answers with a CSP that runs no inline or foreign script, and no framing", async () => {
    const response = await call("https://cafe-aurora.skryensya.dev/");
    const csp = response.headers.get("content-security-policy")!;
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("lets the domain's own subdomains through to their origin, untouched", async () => {
    const origin = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("the docs", { status: 200 }));
    const docs = await call("https://ui.skryensya.dev/components/button");
    expect(await docs.text()).toBe("the docs");
    expect(origin).toHaveBeenCalledOnce();
    expect((origin.mock.calls[0]![0] as Request).url).toBe("https://ui.skryensya.dev/components/button");
    env = { ...env, PASSTHROUGH: "shop, legacy" };
    await call("https://legacy.skryensya.dev/");
    expect(origin).toHaveBeenCalledTimes(2);
  });

  it("serves nothing for an unknown, malformed or foreign host", async () => {
    expect((await call("https://nobody.skryensya.dev/")).status).toBe(404);
    expect((await call("https://a.b.skryensya.dev/")).status).toBe(404);
    expect((await call("https://cafe-aurora.example.com/")).status).toBe(404);
  });

  it("does not take publications on a site's own host", async () => {
    const response = await call("https://cafe-aurora.skryensya.dev/v1/sites/cafe-aurora/0009", { method: "PUT", headers: { authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(site("hijack")) });
    expect(response.status).toBe(405);
    expect(await (await call("https://cafe-aurora.skryensya.dev/")).text()).toContain("Café");
  });

  it("answers 304 to a revalidation of an unchanged page", async () => {
    const first = await call("https://cafe-aurora.skryensya.dev/");
    const again = await call("https://cafe-aurora.skryensya.dev/", { headers: { "if-none-match": first.headers.get("etag")! } });
    expect(again.status).toBe(304);
  });
});
