import { describe, expect, it } from "vitest";
import { isPrivateAddress, snapshotSite, summarize, SnapshotError } from "./snapshot.js";

const PAGE = `<!doctype html><html lang="en"><head><title>Acme</title><meta name="description" content="Rockets for everyone"><meta name="theme-color" content="#ff5500"><script>var secret=1</script></head>
<body><header aria-label="Site"><nav><a href="/pricing">Pricing</a><a href="https://x.dev/docs">Docs</a></nav></header>
<main><section><h1>Fly higher</h1><p>The fastest way to orbit, with no paperwork at all and plenty of room for the whole crew to stretch out.</p><button>Get started</button><img src="/hero.png" alt="A rocket"></section>
<section><h2>Why Acme</h2><ul><li>Fast</li><li>Safe</li></ul><form><input type="email" placeholder="you@acme.com"><input type="hidden" name="t"></form></section></main>
<footer><p>© Acme, all the rights there are to have reserved by the crew.</p></footer></body></html>`;

describe("summarize: a page as a person would describe it", () => {
  const out = summarize(PAGE, new URL("https://acme.test/"));
  it("keeps title, description, language and brand colour, and none of the scripts", () => {
    expect(out).toMatchObject({ title: "Acme", description: "Rockets for everyone", language: "en", themeColor: "#ff5500" });
    expect(JSON.stringify(out)).not.toContain("secret");
  });
  it("lists the sections in order with headings, text, buttons, images, lists and forms", () => {
    const tags = out.sections.map((section) => section.tag);
    expect(tags).toEqual(["header", "nav", "section", "section", "footer"].filter((tag) => tags.includes(tag)));
    const all = out.sections.flatMap((section) => section.blocks);
    expect(all).toContainEqual({ kind: "heading", level: 1, text: "Fly higher" });
    expect(all).toContainEqual({ kind: "button", text: "Get started" });
    expect(all).toContainEqual({ kind: "image", alt: "A rocket", src: "https://acme.test/hero.png" });
    expect(all).toContainEqual({ kind: "link", text: "Pricing", href: "https://acme.test/pricing" });
    expect(all).toContainEqual({ kind: "list", items: ["Fast", "Safe"] });
    expect(all).toContainEqual({ kind: "form", fields: ["you@acme.com"] });
  });
  it("says when a page ships almost no text, because it draws itself with scripts", () => {
    expect(out.likelyScripted).toBe(false);
    expect(summarize('<html><body><div id="root"></div><script src="/app.js"></script></body></html>', new URL("https://a.test")).likelyScripted).toBe(true);
  });
});

describe("summarize: the page's information architecture", () => {
  const PAGE2 = `<html lang="en"><head><title>Acme</title><meta property="og:site_name" content="Acme Inc"><meta property="og:image" content="/og.png"></head><body>
  <header><nav><a href="/product">Product</a><a href="/pricing">Pricing</a><a href="/docs">Docs</a><a href="/signup">Start free</a></nav></header>
  <main>
  <section><h1>Ship rockets faster</h1><p>The orbital platform teams rely on, from prototype to launch with no paperwork.</p><a href="/signup">Start free</a></section>
  <section><h2>Why Acme</h2>
    <div><h3>Fast</h3><p>Launch in minutes, not months.</p></div>
    <div><h3>Safe</h3><p>Every launch is insured end to end.</p></div>
    <div><h3>Open</h3><p>Bring your own payload and tools.</p></div></section>
  <section><h2>Plans</h2>
    <div><h3>Starter</h3><p>$0 per month for one rocket.</p><a href="/s">Choose</a></div>
    <div><h3>Team</h3><p>$49 per month for ten rockets.</p><a href="/t">Choose</a></div>
    <div><h3>Scale</h3><p>$199 per month, unlimited.</p><a href="/c">Contact</a></div></section>
  <section><h2>Questions</h2><p>Frequently asked questions about launching.</p></section>
  </main>
  <footer><a href="/about">About</a><a href="/privacy">Privacy</a></footer></body></html>`;
  const out = summarize(PAGE2, new URL("https://acme.test/"));
  it("labels each section with what it is for, so the order of the page reads as a plan", () => {
    expect(out.structure).toEqual(["navigation", "hero", "features", "pricing", "faq", "footer"]);
  });
  it("keeps the heading hierarchy, the navigation and the actions the page leads with", () => {
    expect(out.outline.slice(0, 3)).toEqual([{ level: 1, text: "Ship rockets faster" }, { level: 2, text: "Why Acme" }, { level: 3, text: "Fast" }]);
    expect(out.navigation.primary.map((l) => l.text)).toEqual(["Product", "Pricing", "Docs", "Start free"]);
    expect(out.navigation.footer.map((l) => l.text)).toEqual(["About", "Privacy"]);
    expect(out.primaryActions).toContain("Start free");
    expect(out).toMatchObject({ siteName: "Acme Inc", image: "https://acme.test/og.png" });
  });
  it("turns three or more of the same unit into items, with their words and action", () => {
    const plans = out.sections.find((section) => section.role === "pricing")!;
    expect(plans.items?.map((item) => item.heading)).toEqual(["Starter", "Team", "Scale"]);
    expect(plans.items?.[1]).toMatchObject({ text: "$49 per month for ten rockets.", action: "Choose", href: "https://acme.test/t" });
    expect(out.sections.find((section) => section.role === "features")!.items).toHaveLength(3);
  });
});

describe("snapshotSite: only the public web is read", () => {
  it.each(["127.0.0.1", "10.1.2.3", "192.168.0.9", "172.16.0.1", "169.254.169.254", "::1", "fd00::1", "::ffff:127.0.0.1"])("%s is private", (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("%s is public", (address) => {
    expect(isPrivateAddress(address)).toBe(false);
  });
  it.each(["http://localhost:4201/", "http://127.0.0.1/", "http://169.254.169.254/latest/meta-data", "http://[::1]/", "file:///etc/passwd", "ftp://example.com/", "http://user:pw@8.8.8.8/", "not a url"])("refuses %s", async (address) => {
    await expect(snapshotSite(address, (() => { throw new Error("must not fetch"); }) as unknown as typeof fetch)).rejects.toBeInstanceOf(SnapshotError);
  });
  it("checks every redirect again: a public address cannot send the server inward", async () => {
    const fetcher = (async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1:5432/" } })) as unknown as typeof fetch;
    await expect(snapshotSite("http://8.8.8.8/", fetcher)).rejects.toThrow("not public");
  });
  it("reads a public page, and refuses what is not a web page", async () => {
    const ok = (async () => new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8" } })) as unknown as typeof fetch;
    expect((await snapshotSite("http://8.8.8.8/", ok)).title).toBe("Acme");
    const image = (async () => new Response("x", { headers: { "content-type": "image/png" } })) as unknown as typeof fetch;
    await expect(snapshotSite("http://8.8.8.8/", image)).rejects.toThrow("not a web page");
  });
});
