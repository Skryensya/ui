import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSite, randomId, type MakerSite } from "@skryensya/maker-model";
import { publishSite, unpublishSite, type PublishConfig } from "@skryensya/maker-server/publish";
import { memoryBucket } from "./bucket";
import { handle, type Env } from "./handler";

/*
 * End to end, without Cloudflare: the Maker's publish client talks to this Worker's own handler
 * (fetch is routed to it), over the in-memory bucket, and the published site is then read back the
 * way a visitor's browser would.
 */

const TOKEN = "token-for-the-end-to-end-test";
let env: Env;
let config: PublishConfig;

beforeEach(() => {
  env = { SITES: memoryBucket(), PUBLISH_TOKEN: TOKEN, ROOT_DOMAIN: "skryensya.dev", PUBLISH_HOST: "publish.skryensya.dev" };
  const kitDir = mkdtempSync(join(tmpdir(), "kit-"));
  mkdirSync(join(kitDir, "chunks"));
  writeFileSync(join(kitDir, "kit.js"), "import('./chunks/tabs.js')");
  writeFileSync(join(kitDir, "chunks", "tabs.js"), "export const tabs = 1");
  writeFileSync(join(kitDir, "kit.css"), "body{margin:0}");
  config = { endpoint: "https://publish.skryensya.dev", token: TOKEN, domain: "skryensya.dev", kitDir };
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => handle(new Request(input as string | URL, init), env));
});
afterEach(() => vi.restoreAllMocks());

function site(): MakerSite {
  const base = createSite("hash", randomId);
  const home = base.pages[0]!;
  return {
    ...base,
    pages: [
      { ...home, root: { ...home.root, slots: { children: { kind: "nodes", children: [{ id: "h", contract: "typography", signature: "Heading", slots: { children: { kind: "nodes", children: [{ id: "t", text: "Café Aurora" }] } } }] } } } },
      { id: "about", name: "Nosotros", path: "/nosotros", root: { id: "m2", contract: "layout", signature: "Main", slots: { children: { kind: "nodes", children: [] } } } },
    ],
  };
}

const visit = (url: string) => handle(new Request(url), env);

describe("publishing a Maker site", () => {
  it("puts every page, and the kit, at the site's subdomain", async () => {
    const result = await publishSite(config, { name: "cafe-aurora", site: site(), siteTitle: "Café Aurora", revision: 3 });
    if (!result.ok) throw new Error(result.reason);
    expect(result.url).toBe("https://cafe-aurora.skryensya.dev/");

    const home = await visit("https://cafe-aurora.skryensya.dev/");
    const html = await home.text();
    expect(html).toContain("Café Aurora");
    const kitPath = /src="(\/_kit\/[a-f0-9]+\/kit\.js)"/.exec(html)![1]!;
    expect((await visit(`https://cafe-aurora.skryensya.dev${kitPath}`)).status).toBe(200);
    expect((await visit(`https://cafe-aurora.skryensya.dev${kitPath.replace("kit.js", "chunks/tabs.js")}`)).status).toBe(200);
    expect(await (await visit("https://cafe-aurora.skryensya.dev/nosotros")).text()).toContain("<title>Nosotros · Café Aurora</title>");
  });

  it("uploads the kit only once for any number of publications", async () => {
    await publishSite(config, { name: "uno", site: site(), siteTitle: "Uno", revision: 1 });
    await publishSite(config, { name: "dos", site: site(), siteTitle: "Dos", revision: 1 });
    const kitUploads = vi.mocked(globalThis.fetch).mock.calls.filter(([url, init]) => String(url).includes("/v1/kit/") && init?.method === "PUT");
    expect(kitUploads).toHaveLength(1);
  });

  it("is refused with a wrong token, and says which setting to check", async () => {
    const result = await publishSite({ ...config, token: "wrong" }, { name: "cafe", site: site(), siteTitle: "x", revision: 1 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toMatch(/SITES_PUBLISH_TOKEN/);
  });

  it("takes a site down", async () => {
    await publishSite(config, { name: "cafe", site: site(), siteTitle: "x", revision: 1 });
    expect((await unpublishSite(config, "cafe")).ok).toBe(true);
    expect((await visit("https://cafe.skryensya.dev/")).status).toBe(404);
  });
});
