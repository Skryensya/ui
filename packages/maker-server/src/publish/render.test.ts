import { describe, expect, it } from "vitest";
import { createSite, randomId, type MakerSite } from "@skryensya/maker-model";
import { siteNameProblem, suggestSiteName } from "./names.js";
import { renderSite } from "./render.js";

function site(): MakerSite {
  const base = createSite("hash", randomId);
  const main = base.pages[0]!.root;
  return {
    ...base,
    pages: [
      {
        ...base.pages[0]!,
        name: "Inicio",
        root: {
          ...main,
          slots: {
            children: {
              kind: "nodes",
              children: [
                { id: "h", contract: "typography", signature: "Heading", slots: { children: { kind: "nodes", children: [{ id: "t", text: "Café <Aurora> & \"amigos\"" }] } } },
                { id: "b", contract: "button", signature: "Button.navigation", options: { href: "/about" }, slots: { children: { kind: "nodes", children: [{ id: "bt", text: "Nosotros" }] } } },
              ],
            },
          },
        },
      },
      { id: "p2", name: "About", path: "/about", root: { id: "m2", contract: "layout", signature: "Main", slots: { children: { kind: "nodes", children: [{ id: "s2", contract: "layout", signature: "Stack", slots: { children: { kind: "nodes", children: [] } } }] } } } },
    ],
  };
}

describe("rendering a site", () => {
  it("writes one document per page, at the page's path, loading the shared kit", () => {
    const rendered = renderSite(site(), { siteTitle: "Café Aurora", kitBase: "/_kit/abc123" });
    if (!rendered.ok) throw new Error(rendered.reason);
    expect(rendered.files.map((file) => file.path)).toEqual(["index.html", "about/index.html"]);
    const home = rendered.files[0]!.body;
    expect(home).toContain('<link rel="stylesheet" href="/_kit/abc123/kit.css">');
    expect(home).toContain('<script type="module" src="/_kit/abc123/kit.js"></script>');
    expect(home).toContain("<title>Café Aurora</title>");
    expect(rendered.files[1]!.body).toContain("<title>About · Café Aurora</title>");
    expect(home).toContain('href="/about"');
  });

  it("escapes the author's text: nothing they type becomes markup", () => {
    const rendered = renderSite(site(), { siteTitle: "<script>alert(1)</script>", kitBase: "/_kit/x" });
    if (!rendered.ok) throw new Error(rendered.reason);
    const home = rendered.files[0]!.body;
    expect(home).not.toContain("<Aurora>");
    expect(home).not.toContain("<script>alert(1)</script>");
    expect(home.match(/<script/g)).toHaveLength(1);
  });

  it("refuses the whole site when any page links somewhere that runs code", () => {
    const bad = site();
    const home = bad.pages[0]!;
    const unsafe: MakerSite = {
      ...bad,
      pages: [{ ...home, root: { ...home.root, slots: { children: { kind: "nodes", children: [{ id: "x", contract: "button", signature: "Button.navigation", options: { href: "javascript:alert(1)" }, slots: { children: { kind: "nodes", children: [{ id: "xt", text: "Go" }] } } }] } } } }, bad.pages[1]!],
    };
    const rendered = renderSite(unsafe, { siteTitle: "x", kitBase: "/_kit/x" });
    expect(rendered.ok).toBe(false);
  });

  it("reports what is pending without refusing", () => {
    const rendered = renderSite(site(), { siteTitle: "x", kitBase: "/_kit/x" });
    expect(rendered.ok && rendered.pending.some((problem) => problem.page === "/about")).toBe(true);
  });
});

describe("site names", () => {
  it("are DNS labels that are not reserved", () => {
    for (const name of ["cafe-aurora", "a", "site-2"]) expect(siteNameProblem(name)).toBeUndefined();
    for (const name of ["", "-a", "a-", "Café", "a.b", "ui", "www", "publish", "x".repeat(64)]) expect(siteNameProblem(name)).toBeDefined();
  });

  it("are suggested from a project's name", () => {
    expect(suggestSiteName("Café Aurora")).toBe("cafe-aurora");
    expect(suggestSiteName("UI")).toBe("site-ui");
    expect(suggestSiteName("¡¡¡")).toBe("site-new");
  });
});
